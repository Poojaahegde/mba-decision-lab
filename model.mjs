export function analyze(input) {
  const {
    price, variableCost, fixedCost, startupCost, monthlyUnits,
    monthlyGrowth, annualDiscount, months,
  } = input;
  const values = [price, variableCost, fixedCost, startupCost, monthlyUnits, monthlyGrowth, annualDiscount, months];
  if (values.some((value) => !Number.isFinite(value))) throw new Error('Enter a valid number in every field.');
  if (price <= 0 || variableCost < 0 || fixedCost < 0 || startupCost < 0 || monthlyUnits < 0 || annualDiscount < 0) {
    throw new Error('Price must be positive; costs, volume, and discount rate cannot be negative.');
  }
  if (monthlyGrowth <= -1 || monthlyGrowth > 1) throw new Error('Monthly growth must be above -100% and at most 100%.');
  if (!Number.isInteger(months) || months < 1 || months > 120) throw new Error('Choose a horizon from 1 to 120 months.');

  const contribution = price - variableCost;
  const breakEvenUnits = contribution > 0 ? Math.ceil(fixedCost / contribution) : null;
  const monthlyDiscount = (1 + annualDiscount) ** (1 / 12) - 1;
  const cashFlows = [];
  let cumulative = -startupCost;
  let npv = -startupCost;
  let operatingProfit = 0;
  let paybackMonths = startupCost === 0 ? 0 : null;

  for (let month = 1; month <= months; month++) {
    const units = monthlyUnits * (1 + monthlyGrowth) ** (month - 1);
    const revenue = units * price;
    const variableExpense = units * variableCost;
    const profit = revenue - variableExpense - fixedCost;
    const previousCumulative = cumulative;
    cumulative += profit;
    operatingProfit += profit;
    npv += profit / (1 + monthlyDiscount) ** month;
    if (paybackMonths === null && previousCumulative < 0 && cumulative >= 0 && profit > 0) {
      paybackMonths = month - 1 + (-previousCumulative / profit);
    }
    cashFlows.push({ month, units, revenue, variableExpense, profit, cumulative });
  }

  return {
    contribution, breakEvenUnits, monthlyDiscount, npv, operatingProfit,
    netCash: cumulative, paybackMonths, cashFlows,
    firstMonthProfit: cashFlows[0].profit,
    firstMonthMargin: cashFlows[0].revenue > 0 ? cashFlows[0].profit / cashFlows[0].revenue : null,
  };
}

export function scenarioInputs(base, scenario) {
  return {
    ...base,
    price: base.price * scenario.price,
    variableCost: base.variableCost * scenario.variableCost,
    monthlyUnits: base.monthlyUnits * scenario.monthlyUnits,
  };
}
