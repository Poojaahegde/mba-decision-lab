import assert from 'node:assert/strict';
import { analyze, scenarioInputs } from './model.mjs';

const base = { price: 100, variableCost: 40, fixedCost: 300, startupCost: 500,
  monthlyUnits: 10, monthlyGrowth: 0, annualDiscount: 0, months: 3 };
const result = analyze(base);
assert.equal(result.contribution, 60);
assert.equal(result.breakEvenUnits, 5);
assert.equal(result.firstMonthProfit, 300);
assert.equal(result.operatingProfit, 900);
assert.equal(result.npv, 400);
assert.equal(result.netCash, 400);
assert.ok(Math.abs(result.paybackMonths - 1.6666666667) < 1e-8);
assert.equal(result.cashFlows[2].cumulative, 400);
assert.equal(analyze({ ...base, price: 30 }).breakEvenUnits, null);
assert.equal(analyze({ ...base, startupCost: 0 }).paybackMonths, 0);
assert.equal(analyze({ ...base, monthlyUnits: 0 }).paybackMonths, null);
assert.equal(scenarioInputs(base, { price: .9, variableCost: 1.1, monthlyUnits: .8 }).price, 90);
assert.ok(analyze({ ...base, annualDiscount: .12 }).npv < result.npv);
assert.throws(() => analyze({ ...base, price: 0 }), /Price must be positive/);
console.log('All financial model checks passed.');
