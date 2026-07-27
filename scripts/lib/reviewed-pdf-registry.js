// @ts-check
import Ajv from 'ajv';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, '../../schema/reviewed-pdf-partners.schema.json');

let validator = null;

async function getRegistryValidator() {
  if (validator) return validator;
  const ajv = new Ajv({ allErrors: true, strict: false });
  const schemaText = await readFile(SCHEMA_PATH, 'utf8');
  const schemaObj = JSON.parse(schemaText);
  validator = ajv.compile(schemaObj);
  return validator;
}

/**
 * Load and validate the reviewed PDF partner registry.
 *
 * @param {string} registryPath - Path to reviewed-pdf-partners.json
 * @returns {Promise<Array<object>>}
 */
export async function loadReviewedPdfRegistry(registryPath) {
  if (!existsSync(registryPath)) {
    throw new Error(`Reviewed PDF registry file not found at ${registryPath}`);
  }

  let rawText;
  try {
    rawText = await readFile(registryPath, 'utf8');
  } catch (e) {
    throw new Error(`Failed to read reviewed PDF registry at ${registryPath}: ${e.message}`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Reviewed PDF registry is malformed JSON: ${e.message}`);
  }

  const validate = await getRegistryValidator();
  const valid = validate(data);

  if (!valid) {
    const errorMsgs = (validate.errors || []).map(err => {
      const path = err.instancePath ? ` at '${err.instancePath}'` : '';
      return `[Reviewed PDF Schema]${path} ${err.message}`;
    });
    throw new Error(`Reviewed PDF registry schema validation failed:\n  ${errorMsgs.join('\n  ')}`);
  }

  const seenCodes = new Set();
  const records = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (item.reviewed !== true) {
      throw new Error(`Reviewed PDF registry record at index ${i} (${item.code}) must have reviewed === true`);
    }

    if (seenCodes.has(item.code)) {
      throw new Error(`Duplicate code '${item.code}' found in reviewed PDF registry at index ${i}`);
    }

    seenCodes.add(item.code);

    records.push({
      serviceCode: item.code,
      code: item.code,
      name: item.name,
      name_en: item.name_en || null,
      address: item.address,
      address_en: item.address_en || null,
      district: item.district || null,
      district_en: item.district_en || null,
      sub_district: item.sub_district || null,
      sub_district_en: item.sub_district_en || null,
      business_hours: item.business_hours || null,
      business_hours_en: item.business_hours_en || null,
      isPartner: true,
      _source: 'reviewed_pdf_partner',
      _source_key: item.source_key,
      _source_url: item.source_url,
      _reviewed: item.reviewed,
      _reviewed_at: item.reviewed_at,
      _review_note: item.review_note || null
    });
  }

  return records;
}
