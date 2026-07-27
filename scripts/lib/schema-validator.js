// @ts-check
import Ajv from 'ajv';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = resolve(__dirname, '../../schema');

let ajvInstance = null;
let validators = null;

async function getValidators() {
  if (validators) return validators;

  const ajv = new Ajv({ allErrors: true, strict: false });

  const locationSchema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'location.schema.json'), 'utf8'));
  const locationsArraySchema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'locations-array.schema.json'), 'utf8'));
  const locationsByDistrictSchema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'locations-by-district.schema.json'), 'utf8'));
  const metadataSchema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'metadata.schema.json'), 'utf8'));

  ajv.addSchema(locationSchema, 'location.schema.json');
  ajv.addSchema(locationsArraySchema, 'locations-array.schema.json');

  validators = {
    location: ajv.compile(locationSchema),
    locationsArray: ajv.compile(locationsArraySchema),
    locationsByDistrict: ajv.compile(locationsByDistrictSchema),
    metadata: ajv.compile(metadataSchema)
  };

  ajvInstance = ajv;
  return validators;
}

/**
 * Format Ajv errors into human readable strings with context.
 * @param {import('ajv').ErrorObject[]} errors
 * @param {string} [contextPrefix]
 * @returns {string[]}
 */
function formatAjvErrors(errors, contextPrefix = '') {
  if (!errors || errors.length === 0) return [];
  return errors.map(err => {
    const path = err.instancePath ? ` at '${err.instancePath}'` : '';
    const message = err.message || 'unknown schema violation';
    return `${contextPrefix}${path} ${message}`.trim();
  });
}

/**
 * Validate a single location record against location.schema.json.
 * @param {object} record
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateLocationRecordSchema(record) {
  const { location } = await getValidators();
  const valid = location(record);
  return {
    valid: Boolean(valid),
    errors: valid ? [] : formatAjvErrors(location.errors, `[Code: ${record?.code || 'unknown'}]`)
  };
}

/**
 * Validate an array of location records against locations-array.schema.json.
 * @param {Array} records
 * @param {string} [name='locations']
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateLocationsArraySchema(records, name = 'locations') {
  const { locationsArray } = await getValidators();
  const valid = locationsArray(records);
  return {
    valid: Boolean(valid),
    errors: valid ? [] : formatAjvErrors(locationsArray.errors, `[Array '${name}']`)
  };
}

/**
 * Validate dataset metadata against metadata.schema.json.
 * @param {object} metadata
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateMetadataSchema(metadata) {
  const { metadata: valMetadata } = await getValidators();
  const valid = valMetadata(metadata);
  return {
    valid: Boolean(valid),
    errors: valid ? [] : formatAjvErrors(valMetadata.errors, '[Metadata Schema]')
  };
}

/**
 * Validate by-district object against locations-by-district.schema.json.
 * @param {object} byDistrict
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateLocationsByDistrictSchema(byDistrict) {
  const { locationsByDistrict } = await getValidators();
  const valid = locationsByDistrict(byDistrict);
  return {
    valid: Boolean(valid),
    errors: valid ? [] : formatAjvErrors(locationsByDistrict.errors, '[By-District Schema]')
  };
}

/**
 * Validate all generated release artifacts against official JSON Schemas before publishing.
 * Throws a detailed Error if any artifact fails schema validation.
 *
 * @param {object} params
 * @param {Array} params.records
 * @param {Array} params.stores
 * @param {Array} params.lockers
 * @param {Array} params.partners
 * @param {object} params.byDistrict
 * @param {object} params.metadata
 * @returns {Promise<void>}
 */
export async function validateAllReleaseArtifactsSchemas({
  records,
  stores,
  lockers,
  partners,
  byDistrict,
  metadata
}) {
  const allErrors = [];

  const locationsRes = await validateLocationsArraySchema(records, 'locations.json');
  if (!locationsRes.valid) allErrors.push(...locationsRes.errors);

  const storesRes = await validateLocationsArraySchema(stores, 'stores.json');
  if (!storesRes.valid) allErrors.push(...storesRes.errors);

  const lockersRes = await validateLocationsArraySchema(lockers, 'lockers.json');
  if (!lockersRes.valid) allErrors.push(...lockersRes.errors);

  const partnersRes = await validateLocationsArraySchema(partners, 'partners.json');
  if (!partnersRes.valid) allErrors.push(...partnersRes.errors);

  const districtRes = await validateLocationsByDistrictSchema(byDistrict);
  if (!districtRes.valid) allErrors.push(...districtRes.errors);

  const metadataRes = await validateMetadataSchema(metadata);
  if (!metadataRes.valid) allErrors.push(...metadataRes.errors);

  if (allErrors.length > 0) {
    throw new Error(`JSON Schema validation failed for release artifacts:\n${allErrors.slice(0, 15).join('\n')}`);
  }
}
