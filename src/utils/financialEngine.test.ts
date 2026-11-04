import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCustomerDashboard,
  filterNamedDirectors,
  formatMn,
  formatSignedDeltaMn,
} from './financialEngine';
import {
  buildCompleteCustomerDirectory,
  INITIAL_CUSTOMERS,
} from '../data/bankData';

test('Spot check reconciliation: CIF 51012681 (Central Finance Company PLC)', () => {
  const directory = buildCompleteCustomerDirectory();
  const cfin = directory.get('51012681');
  assert.ok(cfin, 'CIF 51012681 must exist');

  const dash = computeCustomerDashboard(cfin);
  assert.equal(dash.kpis.latestAssetsMn, 5216.882344);
  assert.equal(dash.kpis.latestLiabilitiesMn, 161.334519);
  assert.equal(dash.kpis.ytdRevenueMn, 143.255945);
  assert.equal(dash.kpis.reportedLimitMn, 5700.0);
  // Unnamed placeholder director 60019991 must be hidden from visible web directors
  assert.equal(dash.directors.length, 3);
  assert.equal(
    dash.directors.some((d) => d.directorCif === '60019991'),
    false
  );
});

test('Spot check reconciliation: CIF 50688593 (Haycarb PLC)', () => {
  const directory = buildCompleteCustomerDirectory();
  const haycarb = directory.get('50688593');
  assert.ok(haycarb, 'CIF 50688593 must exist');

  const dash = computeCustomerDashboard(haycarb);
  assert.equal(dash.kpis.latestAssetsMn, 95.865908);
  assert.equal(dash.kpis.latestLiabilitiesMn, 11.708384);
  assert.equal(dash.kpis.ytdRevenueMn, 4.564138);
  assert.equal(dash.kpis.reportedLimitMn, 1458.13);
  // Non-funded and remittance measures are kept separate from funded assets
  assert.equal(dash.kpis.latestNonFundedMn, 148.5);
  assert.equal(dash.kpis.latestRemittanceMn, 118.4);
});

test('Spot check reconciliation: CIF 50100120 (L. G. Farm)', () => {
  const directory = buildCompleteCustomerDirectory();
  const lgfarm = directory.get('50100120');
  assert.ok(lgfarm, 'CIF 50100120 must exist');

  const dash = computeCustomerDashboard(lgfarm);
  assert.equal(dash.kpis.latestAssetsMn, 1.092816);
  assert.equal(dash.kpis.latestLiabilitiesMn, 56.691975);
  assert.equal(dash.kpis.ytdRevenueMn, 2.351084);
  assert.equal(dash.kpis.reportedLimitMn, 144.516819);
});

test('All linked named directors have resolvable individual CIF profiles', () => {
  const directory = buildCompleteCustomerDirectory();
  const primaries = INITIAL_CUSTOMERS.filter((c) => c.isPrimaryCustomer);
  assert.ok(primaries.length >= 14, 'Should have primary customers');

  for (const company of primaries) {
    const visibleDirs = filterNamedDirectors(company.directors);
    for (const dir of visibleDirs) {
      const dirProfile = directory.get(dir.directorCif);
      assert.ok(
        dirProfile,
        `Director CIF ${dir.directorCif} (${dir.name}) must resolve in directory`
      );
      assert.equal(dirProfile.parentCompanyCif, company.cif);
    }
  }
});

test('Formatting utilities handle numbers and nulls cleanly', () => {
  assert.equal(formatMn(5216.882344, 2), '5,216.88');
  assert.equal(formatMn(null), 'Not supplied');
  assert.equal(formatSignedDeltaMn(12.345, 2), '+12.35');
  assert.equal(formatSignedDeltaMn(-4.5, 2), '−4.50');
});
