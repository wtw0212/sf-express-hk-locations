// @ts-check
import {
  calculateApiSnapshotHashes,
  canonicalizeApiRecords,
  sha256,
  stableStringify
} from './source-hashes.js';

function verifyApiSource(name, source) {
  const errors = [];
  if (!source || !Array.isArray(source.results)) {
    return [`${name}: results missing`];
  }

  for (let index = 0; index < source.results.length; index++) {
    const result = source.results[index];
    const label = `${name} result ${index}`;
    if (typeof result.raw_response_text !== 'string') {
      errors.push(`${label}: exact raw response text missing`);
      continue;
    }

    const rawHash = sha256(result.raw_response_text);
    if (rawHash !== result.raw_sha256) {
      errors.push(`${label}: raw hash mismatch`);
    }

    const semantic = canonicalizeApiRecords(result.records || []);
    if ((result.records || []).length !== result.record_count) {
      errors.push(`${label}: area record count mismatch`);
    }
    if (semantic.semantic_sha256 !== result.semantic_sha256) {
      errors.push(`${label}: area semantic hash mismatch`);
    }

    if (result.ok) {
      try {
        const payload = JSON.parse(result.raw_response_text);
        const rawRecords = Array.isArray(payload?.result) ? payload.result : null;
        if (!rawRecords) {
          errors.push(`${label}: raw payload result array missing`);
        } else {
          const fromRaw = canonicalizeApiRecords(rawRecords);
          if (stableStringify(fromRaw.records) !== stableStringify(semantic.records)) {
            errors.push(`${label}: raw payload records mismatch`);
          }
        }
      } catch (err) {
        errors.push(`${label}: raw response is invalid JSON (${err.message})`);
      }
    }
  }

  const recalculated = calculateApiSnapshotHashes(source.results);
  if (source.area_count !== source.results.length) {
    errors.push(`${name}: area count mismatch`);
  }
  if (source.success_count !== source.results.filter(result => result.ok).length) {
    errors.push(`${name}: success count mismatch`);
  }
  if (source.failure_count !== source.results.filter(result => !result.ok).length) {
    errors.push(`${name}: failure count mismatch`);
  }
  if (recalculated.raw_snapshot_sha256 !== source.raw_snapshot_sha256) {
    errors.push(`${name}: global raw snapshot hash mismatch`);
  }
  if (recalculated.semantic_sha256 !== source.semantic_sha256) {
    errors.push(`${name}: global semantic hash mismatch`);
  }
  if (recalculated.record_count !== source.record_count) {
    errors.push(`${name}: record count mismatch`);
  }
  if (stableStringify(recalculated.record_hashes) !== stableStringify(source.record_hashes)) {
    errors.push(`${name}: record hashes mismatch`);
  }
  if (stableStringify(recalculated.duplicate_codes) !== stableStringify(source.duplicate_codes)) {
    errors.push(`${name}: duplicate-code evidence mismatch`);
  }
  const summarizedRecords = canonicalizeApiRecords(source.records || []);
  if (
    summarizedRecords.semantic_sha256 !== recalculated.semantic_sha256 ||
    stableStringify(summarizedRecords.record_hashes) !== stableStringify(recalculated.record_hashes)
  ) {
    errors.push(`${name}: source summary records mismatch`);
  }
  return errors;
}

/**
 * Independently recalculate committed snapshot hashes from stored source
 * content. Stored hashes are never compared only to other stored hashes.
 */
export function verifySourceHashes(snapshot, metadata = null) {
  const errors = [
    ...verifyApiSource('api_tc', snapshot?.sources?.api_tc),
    ...verifyApiSource('api_en', snapshot?.sources?.api_en)
  ];
  for (const [index, document] of (snapshot?.sources?.partner_pdf?.documents || []).entries()) {
    if (typeof document.text === 'string') {
      if (sha256(document.text) !== document.extracted_text_sha256) {
        errors.push(`partner_pdf document ${index}: extracted text hash mismatch`);
      }
    } else if (document.extracted_text_sha256 !== null) {
      errors.push(`partner_pdf document ${index}: extracted text hash must be null without text`);
    }
    if (
      document.http_ok &&
      (typeof document.document_binary_sha256 !== 'string' ||
        !/^[a-f0-9]{64}$/.test(document.document_binary_sha256))
    ) {
      errors.push(`partner_pdf document ${index}: document binary hash missing or invalid`);
    }
    if (
      document.document_binary_sha256 &&
      document.document_binary_sha256 === document.extracted_text_sha256
    ) {
      errors.push(`partner_pdf document ${index}: extracted text hash cannot substitute for binary hash`);
    }
  }
  if (metadata) {
    for (const sourceName of ['api_tc', 'api_en']) {
      const snapshotSource = snapshot?.sources?.[sourceName];
      const metadataSource = metadata?.source_integrity?.[sourceName];
      if (!metadataSource) {
        errors.push(`${sourceName}: metadata source_integrity missing`);
        continue;
      }
      for (const field of ['raw_snapshot_sha256', 'semantic_sha256', 'record_count']) {
        if (snapshotSource?.[field] !== metadataSource[field]) {
          errors.push(`${sourceName}: metadata ${field} mismatch`);
        }
      }
      if (stableStringify(snapshotSource?.record_hashes || {}) !==
          stableStringify(metadataSource.record_hashes || {})) {
        errors.push(`${sourceName}: metadata record hashes mismatch`);
      }
    }
  }
  if (errors.length > 0) {
    throw new Error(`Source hash verification failed:\n${errors.join('\n')}`);
  }
  return true;
}
