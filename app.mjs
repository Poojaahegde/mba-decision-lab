import { analyze, scenarioInputs } from './model.mjs';

const form = document.querySelector('#assumptions');
const error = document.querySelector('#error');
const fields = ['price', 'variableCost', 'fixedCost', 'startupCost', 'monthlyUnits', 'monthlyGrowth', 'annualDiscount', 'months'];
const initial = Object.fromEntries(fields.map((name) => [name, form.elements[name].value]));
const scenarioInitial = [...document.querySelectorAll('tr[data-scenario] input')].map((input) => input.value);
let latest = null;

function money(value) {
  const sign = value < 0 ? '−' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
function months(value) { return value === null ? 'Not reached' : `${value.toFixed(1)} mo`; }
function getInput() {
  const input = Object.fromEntries(fields.map((name) => [name, Number(form.elements[name].value)]));
  for (const name of fields) if (form.elements[name].value.trim() === '') throw new Error('Enter a number in every field.');
  input.monthlyGrowth /= 100;
  input.annualDiscount /= 100;
  return input;
}
function getFactors(row) {
  const factors = {};
  for (const input of row.querySelectorAll('input')) {
    if (input.value.trim() === '') throw new Error('Enter every scenario percentage.');
    const value = Number(input.value);
    if (!Number.isFinite(value) || value < 0 || (input.dataset.factor === 'price' && value === 0)) throw new Error('Scenario percentages must be valid and nonnegative; price must exceed zero.');
    factors[input.dataset.factor] = value / 100;
  }
  return factors;
}
function renderChart(result) {
  const points = [{ month: 0, cumulative: -latest.input.startupCost }, ...result.cashFlows];
  const values = points.map((point) => point.cumulative);
  const low = Math.min(0, ...values), high = Math.max(0, ...values);
  const spread = high - low || 1, left = 42, right = 690, top = 16, bottom = 190;
  const x = (month) => left + (month / latest.input.months) * (right - left);
  const y = (value) => bottom - ((value - low) / spread) * (bottom - top);
  const polyline = points.map((point) => `${x(point.month).toFixed(1)},${y(point.cumulative).toFixed(1)}`).join(' ');
  const zero = y(0).toFixed(1);
  const chart = document.querySelector('#chart');
  chart.innerHTML = `<svg viewBox="0 0 720 220" preserveAspectRatio="none" aria-hidden="true"><line x1="${left}" y1="${zero}" x2="${right}" y2="${zero}" stroke="#b7c6be" stroke-dasharray="4 5"/><polyline points="${polyline}" fill="none" stroke="#2f8d70" stroke-width="3" vector-effect="non-scaling-stroke"/><circle cx="${x(latest.input.months)}" cy="${y(values.at(-1))}" r="5" fill="#185c51"/><text x="4" y="${top + 5}" fill="#83958d" font-size="11">${money(high)}</text><text x="4" y="${bottom}" fill="#83958d" font-size="11">${money(low)}</text><text x="${left}" y="212" fill="#83958d" font-size="11">Month 0</text><text x="${right - 55}" y="212" fill="#83958d" font-size="11">Month ${latest.input.months}</text></svg>`;
  chart.setAttribute('aria-label', `Cumulative cash flow starts at ${money(-latest.input.startupCost)} and ends at ${money(result.netCash)} after ${latest.input.months} months.`);
}
function render() {
  try {
    const input = getInput();
    const base = analyze(input);
    const cases = {};
    for (const row of document.querySelectorAll('tr[data-scenario]')) {
      const label = row.dataset.scenario;
      const result = label === 'base' ? base : analyze(scenarioInputs(input, getFactors(row)));
      cases[label] = result;
      row.querySelector('.scenario-npv').textContent = money(result.npv);
      row.querySelector('.scenario-payback').textContent = months(result.paybackMonths);
    }
    latest = { input, base, cases };
    document.querySelector('#breakeven').textContent = base.breakEvenUnits === null ? 'Not possible' : base.breakEvenUnits.toLocaleString('en-US');
    document.querySelector('#profit').textContent = money(base.firstMonthProfit);
    document.querySelector('#npv').textContent = money(base.npv);
    document.querySelector('#payback').textContent = months(base.paybackMonths);
    document.querySelector('#horizon-label').textContent = `${input.months}-month view`;
    const positive = Object.values(cases).filter((result) => result.npv > 0).length;
    document.querySelector('#interpretation').textContent = `${positive} of 3 scenarios have positive NPV. The base case ${base.npv > 0 ? 'clears' : 'does not clear'} the entered discount rate. Use the scenario spread to identify which assumptions need better evidence before making a decision.`;
    renderChart(base);
    error.hidden = true;
  } catch (cause) {
    latest = null;
    error.textContent = cause.message;
    error.hidden = false;
  }
}
form.addEventListener('submit', (event) => { event.preventDefault(); render(); });
document.querySelectorAll('tr[data-scenario] input').forEach((input) => input.addEventListener('change', render));
document.querySelector('#reset').addEventListener('click', () => {
  for (const [name, value] of Object.entries(initial)) form.elements[name].value = value;
  document.querySelectorAll('tr[data-scenario] input').forEach((input, index) => { input.value = scenarioInitial[index]; });
  render();
});
document.querySelector('#download').addEventListener('click', () => {
  if (!latest) return;
  const rows = [['month', 'units', 'revenue', 'variable_cost', 'operating_profit', 'cumulative_cash_flow'],
    ...latest.base.cashFlows.map((row) => [row.month, row.units, row.revenue, row.variableExpense, row.profit, row.cumulative])];
  const csv = rows.map((row) => row.join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'mba-decision-lab-base-case.csv'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render();
