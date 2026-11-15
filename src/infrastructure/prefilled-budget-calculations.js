export function calculateProductionPlan(assumptions) {
  const oysterTargetKg = Number(assumptions.oysterTargetKg);
  const milkyTargetKg = Number(assumptions.milkyTargetKg);
  const oysterEfficiency = Number(assumptions.oysterBiologicalEfficiency);
  const milkyEfficiency = Number(assumptions.milkyBiologicalEfficiency);
  const spawnRatePercent = Number(assumptions.spawnRatePercent);
  const dryStrawPerBagKg = Number(assumptions.dryStrawPerBagKg);
  const values = [oysterTargetKg, milkyTargetKg, oysterEfficiency, milkyEfficiency, spawnRatePercent, dryStrawPerBagKg];

  if (values.some((value) => !Number.isFinite(value) || value <= 0) ||
      oysterEfficiency > 1 || milkyEfficiency > 1) {
    throw new Error("Production planning assumptions must be positive, with biological efficiency no greater than 100%.");
  }

  const oysterDrySubstrateKg = oysterTargetKg / oysterEfficiency;
  const milkyDrySubstrateKg = milkyTargetKg / milkyEfficiency;
  const totalDrySubstrateKg = oysterDrySubstrateKg + milkyDrySubstrateKg;
  const dryStrawKg = Math.ceil(totalDrySubstrateKg);

  return {
    oysterTargetKg,
    milkyTargetKg,
    totalTargetKg: oysterTargetKg + milkyTargetKg,
    oysterDrySubstrateKg,
    milkyDrySubstrateKg,
    totalDrySubstrateKg,
    dryStrawKg,
    oysterSpawnKg: oysterDrySubstrateKg * spawnRatePercent / 100,
    milkySpawnKg: milkyDrySubstrateKg * spawnRatePercent / 100,
    bagCount: Math.ceil(totalDrySubstrateKg / dryStrawPerBagKg),
  };
}

export function buildBudgetRows(items, productionPlan, availability = {}) {
  return items.map((item) => {
    const quantity = item.quantitySource
      ? productionPlan[item.quantitySource]
      : item.quantity;
    const baseTotal = item.included
      ? Math.round(quantity * item.unitCost)
      : null;
    const isReused = Boolean(item.reuseId && availability[item.reuseId]);

    return {
      ...item,
      quantity,
      baseTotal,
      total: item.included ? (isReused ? 0 : baseTotal) : null,
      isReused,
    };
  });
}

function sum(rows, predicate = () => true) {
  return rows.reduce((total, row) => (
    row.included && predicate(row) ? total + row.total : total
  ), 0);
}

export function calculateBudgetSummary(constructionRows, productionRows, waterLabourRows, totalTargetKg) {
  const rows = [...constructionRows, ...productionRows, ...waterLabourRows];
  const constructionSubtotal = sum(constructionRows);
  const productionSetupSubtotal = sum(productionRows, (row) => row.period === "setup");
  const waterLabourSetupSubtotal = sum(waterLabourRows, (row) => row.period === "setup");
  const recurringCycleCost = sum(rows, (row) => row.period === "cycle");

  return {
    constructionSubtotal,
    productionSetupSubtotal,
    waterLabourSetupSubtotal,
    oneTimeInvestment: constructionSubtotal + productionSetupSubtotal + waterLabourSetupSubtotal,
    recurringCycleCost,
    monthlyOperatingCost: null,
    costPerTargetKg: recurringCycleCost > 0 && Number.isFinite(totalTargetKg) && totalTargetKg > 0
      ? recurringCycleCost / totalTargetKg
      : null,
  };
}

export function calculateReuseSavings(rows) {
  return rows.reduce((savings, row) => {
    if (!row.isReused || row.baseTotal === null) return savings;
    savings[row.reuseId] = (savings[row.reuseId] || 0) + row.baseTotal;
    return savings;
  }, {});
}

export function calculateRoomAreaSummary(roomRows, plotWidth, plotLength) {
  const totalPlotArea = plotWidth * plotLength;
  const scheduledArea = roomRows.reduce((total, room) => total + room.area, 0);
  const passageArea = roomRows.find((room) => room.id === "service-passage")?.area || 0;
  return {
    totalPlotArea,
    scheduledArea,
    passageArea,
    roomArea: scheduledArea - passageArea,
    areaMatches: Math.abs(scheduledArea - totalPlotArea) < 0.001,
  };
}
