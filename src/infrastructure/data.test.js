import assert from "node:assert/strict";
import test from "node:test";
import { layoutRooms, projectDetails } from "./data.js";
import {
  constructionItems,
  priceSources,
  productionAssumptions,
  productionItems,
  resourceOptions,
  waterLabourItems,
} from "./prefilled-budget-data.js";
import {
  buildBudgetRows,
  calculateBudgetSummary,
  calculateProductionPlan,
  calculateReuseSavings,
  calculateRoomAreaSummary,
} from "./prefilled-budget-calculations.js";

const sum = (rows) => rows.reduce((total, row) => total + (row.total || 0), 0);

function prepareBudget(availability = {}) {
  const plan = calculateProductionPlan(productionAssumptions);
  const construction = buildBudgetRows(constructionItems, plan, availability);
  const production = buildBudgetRows(productionItems, plan, availability);
  const waterLabour = buildBudgetRows(waterLabourItems, plan, availability);
  return {
    plan,
    construction,
    production,
    waterLabour,
    rows: [...construction, ...production, ...waterLabour],
  };
}

test("the current concept room schedule including passage matches the 800 sq ft plot", () => {
  const area = calculateRoomAreaSummary(layoutRooms, projectDetails.plotWidth, projectDetails.plotLength);

  assert.equal(area.roomArea, 680);
  assert.equal(area.passageArea, 120);
  assert.equal(area.scheduledArea, 800);
  assert.equal(area.totalPlotArea, projectDetails.plotArea);
  assert.equal(area.areaMatches, true);
});

test("the crop target derives straw, spawn and bag quantities from explicit assumptions", () => {
  const plan = calculateProductionPlan(productionAssumptions);

  assert.equal(plan.oysterTargetKg, 60);
  assert.equal(plan.milkyTargetKg, 40);
  assert.equal(plan.oysterDrySubstrateKg, 100);
  assert.equal(plan.dryStrawKg, 167);
  assert.equal(plan.bagCount, 167);
  assert.equal(plan.oysterSpawnKg, 5);
  assert.ok(Math.abs(plan.milkySpawnKg - 3.3333333333) < 0.000001);
  assert.throws(() => calculateProductionPlan({ ...productionAssumptions, oysterBiologicalEfficiency: 0 }));
});

test("summary subtotals are calculated from line totals and keep crop-cycle costs out of setup", () => {
  const budget = prepareBudget();
  const summary = calculateBudgetSummary(
    budget.construction,
    budget.production,
    budget.waterLabour,
    budget.plan.totalTargetKg,
  );
  const cycleRows = budget.rows.filter((row) => row.period === "cycle" && row.included);

  assert.equal(summary.constructionSubtotal, sum(budget.construction));
  assert.equal(summary.productionSetupSubtotal, sum(budget.production.filter((row) => row.period === "setup")));
  assert.equal(summary.waterLabourSetupSubtotal, sum(budget.waterLabour.filter((row) => row.period === "setup")));
  assert.equal(summary.oneTimeInvestment,
    summary.constructionSubtotal + summary.productionSetupSubtotal + summary.waterLabourSetupSubtotal);
  assert.equal(summary.recurringCycleCost, sum(cycleRows));
  assert.equal(summary.monthlyOperatingCost, null);
  assert.equal(summary.costPerTargetKg, summary.recurringCycleCost / 100);
  assert.ok(budget.rows.filter((row) => row.included).every((row) => row.total === Math.round(row.quantity * row.unitCost)));
});

test("confirmed reuse reduces only linked lines and does not double-count savings", () => {
  const baseline = prepareBudget();
  const confirmed = prepareBudget({
    "own-straw": true,
    "existing-structure": true,
    "existing-water-source": true,
    "existing-tank": true,
    "existing-tools": true,
    "existing-storage": true,
    "existing-electricity": true,
  });
  const baselineSummary = calculateBudgetSummary(
    baseline.construction, baseline.production, baseline.waterLabour, baseline.plan.totalTargetKg,
  );
  const confirmedSummary = calculateBudgetSummary(
    confirmed.construction, confirmed.production, confirmed.waterLabour, confirmed.plan.totalTargetKg,
  );
  const savings = calculateReuseSavings(confirmed.rows);
  const totalDifference =
    baselineSummary.oneTimeInvestment + baselineSummary.recurringCycleCost -
    confirmedSummary.oneTimeInvestment - confirmedSummary.recurringCycleCost;

  assert.equal(confirmed.production.find((row) => row.id === "purchased-straw").total, 0);
  assert.equal(confirmed.production.find((row) => row.id === "straw-cutting").total,
    baseline.production.find((row) => row.id === "straw-cutting").total);
  assert.equal(confirmed.waterLabour.find((row) => row.id === "water-tank").total, 0);
  assert.equal(Object.values(savings).reduce((total, value) => total + value, 0), totalDifference);
  assert.equal(confirmedSummary.monthlyOperatingCost, null);
});

test("budget lines are prefilled, uniquely identified and have a source or verification label", () => {
  const budget = prepareBudget();
  const ids = budget.rows.map((row) => row.id);
  const validSourceIds = new Set(Object.keys(priceSources));

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(budget.rows.every((row) => row.quantity > 0 && row.unitCost > 0));
  assert.ok(budget.rows.every((row) => !row.sourceId || validSourceIds.has(row.sourceId)));
  assert.ok(budget.rows.every((row) => row.sourceNote));
  assert.equal(budget.rows.find((row) => row.id === "mechanized-cutter").included, false);
  assert.ok(resourceOptions.every((resource) => resource.saves.every((id) => ids.includes(id))));
});
