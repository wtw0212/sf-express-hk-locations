import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMarkdownReport } from '../scripts/lib/report.js';

test('report includes all required sections', () => {
  const report = generateMarkdownReport({
    hktDateStr: '2024-01-01 12:00 (HKT UTC+8)',
    diff: {
      added: [{ code: '852NEW', type_name: '順豐站', name: 'New Store', address: 'Addr' }],
      removed: [{ code: '852OLD', type_name: '順豐站', name: 'Old Store', address: 'Addr' }],
      updated: [{
        code: '852UPD',
        changes: { name: { old: 'Old Name', new: 'New Name' } },
        prev: { name: 'Old Name' },
        next: { name: 'New Name' }
      }],
      unchanged: 100
    },
    stats: { total: 103, stores: 50, lockers: 30, partners: 23, with_english: 90, missing_english: 13, district_resolved: 95, district_unresolved: 8 },
    metrics: { tc_areas_total: 85, tc_areas_success: 85, tc_areas_failed: 0, en_areas_total: 80, en_areas_success: 80, en_areas_failed: 0, tc_unique_codes: 100, en_unique_codes: 95, en_match_rate: 0.95, previous_count: 102 },
    records: [
      { quality_flags: [{ type: 'MISSING_ENGLISH_RECORD' }] },
      { quality_flags: [{ type: 'MISSING_ENGLISH_RECORD' }, { type: 'ADMIN_DISTRICT_ALIAS_APPLIED' }] }
    ],
    gateErrors: [],
    gateWarnings: ['Test warning']
  });

  assert.ok(report.includes('Summary'), 'Report should have Summary');
  assert.ok(report.includes('Source Coverage'), 'Report should have Source Coverage');
  assert.ok(report.includes('Quality Flags'), 'Report should have Quality Flags');
  assert.ok(report.includes('Added Locations'), 'Report should have Added Locations');
  assert.ok(report.includes('Removed Locations'), 'Report should have Removed Locations');
  assert.ok(report.includes('Updated Locations'), 'Report should have Updated Locations');
  assert.ok(report.includes('852NEW'), 'Report should list added record');
  assert.ok(report.includes('852OLD'), 'Report should list removed record');
  assert.ok(report.includes('852UPD'), 'Report should list updated record');
  assert.ok(report.includes('MISSING_ENGLISH_RECORD'), 'Report should show quality flag counts');
  assert.ok(report.includes('95.0%'), 'Report should show bilingual match rate');
  assert.ok(report.includes('Old Name'), 'Report should show old value');
  assert.ok(report.includes('New Name'), 'Report should show new value');
});

test('report shows field-level changes for updated records', () => {
  const report = generateMarkdownReport({
    hktDateStr: '2024-01-01',
    diff: {
      added: [], removed: [],
      updated: [{
        code: '852TEST',
        changes: {
          address: { old: 'Old Addr', new: 'New Addr' },
          business_hours: { old: '09:00', new: '10:00' }
        },
        prev: { name: 'Store' },
        next: { name: 'Store' }
      }],
      unchanged: 0
    },
    stats: { total: 1, stores: 1, lockers: 0, partners: 0, with_english: 0, missing_english: 1, district_resolved: 0, district_unresolved: 1 },
    metrics: null,
    records: [{ quality_flags: [] }],
    gateErrors: [],
    gateWarnings: []
  });

  assert.ok(report.includes('address'), 'Should show address field name');
  assert.ok(report.includes('Old Addr'), 'Should show old address');
  assert.ok(report.includes('New Addr'), 'Should show new address');
});
