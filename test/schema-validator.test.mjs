import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateLocationRecordSchema,
  validateMetadataSchema,
  validateAllReleaseArtifactsSchemas
} from '../scripts/lib/schema-validator.js';

const validRecord = {
  id: '852A',
  code: '852A',
  type: 'store',
  type_name: '順豐站',
  type_name_en: 'SF Store',
  name: '灣仔軒尼詩道順豐站',
  name_en: 'Hennessy Road SF Store',
  region: '香港島',
  region_en: 'Hong Kong Island',
  district: '灣仔區',
  district_en: 'Wan Chai District',
  sub_district: '灣仔',
  sub_district_en: 'Wan Chai',
  address: '灣仔軒尼詩道1號',
  address_en: '1 Hennessy Road, Wan Chai',
  telephone: '12345678',
  business_hours: '09:00-20:00',
  business_hours_en: '09:00-20:00',
  location: { latitude: 22.28, longitude: 114.17 },
  source: 'api_tc',
  quality_flags: [],
  provenance: { name: 'api_tc', name_en: 'api_en', address: 'api_tc', address_en: 'api_en', district: 'api_tc' },
  retrieved_at: '2026-07-27 10:00 (HKT UTC+8)'
};

const validMetadata = {
  schema_version: 2,
  retrieved_at: '2026-07-27 10:00 (HKT UTC+8)',
  counts: { total: 1, stores: 1, lockers: 0, partners: 0 },
  count_deltas: {
    total: { previous: 1, current: 1, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    stores: { previous: 1, current: 1, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    lockers: { previous: 0, current: 0, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    partners: { previous: 0, current: 0, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    tcCodes: { previous: 1, current: 1, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' },
    enCodes: { previous: 1, current: 1, delta: 0, delta_pct: 0, baseline_available: true, baseline_source: 'test', gate_result: 'pass' }
  },
  source_status: {
    api_tc: { areas_total: 112, areas_success: 112, areas_failed: 0 },
    api_en: { areas_total: 112, areas_success: 112, areas_failed: 0 },
    ssr: { count: 186, errors: [] },
    partner_pdf: {
      pdf_total: 8,
      http_success_count: 8,
      parse_success_count: 8,
      semantic_success_count: 8,
      partial_quality_failure_count: 0,
      failed_count: 0,
      valid_record_count: 475,
      quarantined_record_count: 0,
      quarantine_ratio: 0,
      status: 'success',
      errors: [],
      details: [
        {
          source_key: 'OK_HK_TC',
          url: 'https://hk.sf-express.com/uploads/OK_HK_TC.pdf',
          status: 'success',
          http_ok: true,
          parse_ok: true,
          semantic_ok: true,
          attempts: 1,
          raw_code_count: 50,
          candidate_count: 50,
          valid_record_count: 50,
          quarantined_record_count: 0,
          duplicate_code_count: 0,
          duplicate_conflict_count: 0,
          quarantine_ratio: 0
        }
      ]
    }
  },
  coverage: {
    tc_record_count: 1662,
    en_record_count: 1666,
    bilingual_match_rate: 0.99,
    district_resolved_count: 1665,
    district_unresolved_count: 1
  },
  quality: {
    pipeline_blocking_errors: 0,
    pipeline_warnings: 0,
    record_flag_counts_by_severity: { info: 0, warning: 0, error: 0 },
    flag_counts_by_type: {}
  }
};

test('schema-validator: valid record passes schema', async () => {
  const res = await validateLocationRecordSchema(validRecord);
  assert.equal(res.valid, true);
  assert.equal(res.errors.length, 0);
});

test('schema-validator: rejects missing required field or wrong type', async () => {
  const invalid = { ...validRecord };
  delete invalid.code;

  const res = await validateLocationRecordSchema(invalid);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some(e => e.includes("must have required property 'code'")));
});

test('schema-validator: rejects invalid coordinate type or invalid provenance source', async () => {
  const invalidCoord = { ...validRecord, location: { latitude: 'invalid', longitude: 114.17 } };
  const res = await validateLocationRecordSchema(invalidCoord);
  assert.equal(res.valid, false);

  const invalidProv = { ...validRecord, provenance: { name: 'invalid_source' } };
  const resProv = await validateLocationRecordSchema(invalidProv);
  assert.equal(resProv.valid, false);
});

test('schema-validator: rejects metadata match rate > 1 or negative count', async () => {
  const invalidMeta = {
    ...validMetadata,
    coverage: { ...validMetadata.coverage, bilingual_match_rate: 1.5 }
  };
  const res = await validateMetadataSchema(invalidMeta);
  assert.equal(res.valid, false);
});

test('schema-validator: validates all release artifacts together', async () => {
  const artifacts = {
    records: [validRecord],
    stores: [validRecord],
    lockers: [],
    partners: [],
    byDistrict: { '灣仔區': [validRecord] },
    metadata: validMetadata
  };

  await assert.doesNotReject(validateAllReleaseArtifactsSchemas(artifacts));
});
