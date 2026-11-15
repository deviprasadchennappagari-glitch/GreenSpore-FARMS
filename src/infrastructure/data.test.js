import assert from "node:assert/strict";
import test from "node:test";
import { getBudgetSummary, layoutRooms, projectDetails } from "./data.js";
import {
  calculateRoofArea,
  calculateRoofOptionCost,
  calculateBoqItem,
  calculateDailyLabour,
  calculateWallQuantities,
  getItemCostSummary,
  isReliableQuote,
} from "./calculations.js";
import { roomEquipmentSchedule, roofingOptions } from "./detail-data.js";
import { allCostItems, constructionAssumptionsDefaults, constructionGroups } from "./construction-data.js";
import {
  calculateContingency,
  calculateCostPerKg,
  calculateGrowingBagCount,
  calculateInitialInvestment,
  calculatePlannerItem,
  calculatePaddyStrawBalance,
  calculateRoomLayout,
  calculateSpawnQuantity,
  sumPlannerItems,
} from "./investment-calculations.js";
import { allPlannerItems, planRows, resourceRows, roofOptions as plannerRoofOptions } from "./planner-data.js";

test("the conceptual room schedule fits the stated 800 sq ft plot exactly", () => {
  const scheduledArea = layoutRooms.reduce((total, room) => total + room.area, 0);

  assert.equal(scheduledArea, projectDetails.plotArea);
  assert.equal(layoutRooms.find((room) => room.room === "Service passage").area, 120);
});

test("the existing budget baseline arithmetic remains unchanged", () => {
  assert.deepEqual(getBudgetSummary(), {
    subtotalLow: 553000,
    subtotalHigh: 1064000,
    contingencyLow: 55300,
    contingencyHigh: 106400,
    totalLow: 608300,
    totalHigh: 1170400,
    planningMidpoint: 889350,
  });
});

test("no average is shown until a current, traceable written quote is complete", () => {
  assert.deepEqual(getItemCostSummary({}, "500"), {
    status: "Quotation Required",
    reliableQuoteCount: 0,
    minimum: null,
    maximum: null,
    averageUnitCost: null,
    averageTotalCost: null,
  });

  const incompleteQuote = {
    supplier: "Supplier A",
    model: "Panel X",
    specification: "50 mm panel",
    quotedUnitPrice: "165",
    quoteDate: "2026-01-01",
    validUntil: "2027-01-01",
    status: "Quoted",
  };
  assert.equal(isReliableQuote(incompleteQuote, new Date("2026-06-01T00:00:00")), true);
  assert.equal(
    isReliableQuote({ ...incompleteQuote, validUntil: "2026-05-31" }, new Date("2026-06-01T00:00:00")),
    false,
  );
  assert.equal(
    isReliableQuote({ ...incompleteQuote, quoteDate: "2026-06-02" }, new Date("2026-06-01T00:00:00")),
    false,
  );
  assert.equal(isReliableQuote({ ...incompleteQuote, specification: "" }, new Date("2026-06-01T00:00:00")), false);
});

test("average unit and total cost use the reliable low/high quotes and measured quantity", () => {
  const baseQuote = {
    supplier: "Supplier",
    model: "PUF panel",
    specification: "50 mm roof panel",
    quoteDate: "2026-01-01",
    validUntil: "2027-01-01",
    status: "Quoted",
  };
  const summary = getItemCostSummary({
    first: { ...baseQuote, quotedUnitPrice: "140" },
    second: { ...baseQuote, quotedUnitPrice: "190" },
  }, "500", new Date("2026-06-01T00:00:00"));

  assert.equal(summary.minimum, 140);
  assert.equal(summary.maximum, 190);
  assert.equal(summary.averageUnitCost, 165);
  assert.equal(summary.averageTotalCost, 82500);
  const mismatched = getItemCostSummary({
    first: { ...baseQuote, quotedUnitPrice: "140" },
    second: { ...baseQuote, quotedUnitPrice: "190", specification: "40 mm roof panel" },
  }, "500", new Date("2026-06-01T00:00:00"));
  assert.equal(mismatched.status, "Specifications differ; compare separately");
  assert.equal(mismatched.averageUnitCost, null);
});

test("roof area uses measured slope and overhang rather than assuming plot area", () => {
  assert.equal(calculateRoofArea({ length: "40", width: "20", slopePercent: "0", overhang: "1" }), 924);
  assert.equal(calculateRoofArea({ length: "", width: "20", slopePercent: "0", overhang: "1" }), null);

  const estimate = calculateRoofOptionCost(924, {
    materialMinRate: "140",
    materialMaxRate: "190",
    structuralSupport: "10000",
    fabricationLabour: "2500",
    installationLabour: "5000",
    insulation: "0",
    ceiling: "0",
    fasteners: "2000",
    flashingGutters: "2000",
    transport: "1000",
  });
  assert.equal(estimate.averageMaterialCost, 152460);
  assert.equal(estimate.totalAverage, 174960);
  assert.equal(calculateRoofOptionCost(924, {}), null);
});

test("the procurement catalog has unique cost records for every room placement", () => {
  const ids = allCostItems.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(roomEquipmentSchedule.length, 10);
  assert.equal(constructionGroups.length, 12);
  assert.deepEqual(constructionGroups.map((group) => group.title), [
    "1. Site Preparation and Foundation",
    "2. Cement Brick / Concrete Block Construction",
    "3. Shed Roof and Roofing Materials",
    "4. Roof Insulation and Ceiling",
    "5. Flooring and Drainage",
    "6. Internal Partitions and Doors",
    "7. Waterproofing and Painting",
    "8. Electrical Infrastructure",
    "9. Plumbing and Water Supply",
    "10. Temperature and Humidity Equipment",
    "11. Ventilation and Air Management",
    "12. Mushroom Racks and Interior Equipment",
  ]);
  assert.equal(roofingOptions.length, 4);
  assert.equal(roofingOptions.some((option) => /asbestos-cement/i.test(option.option)), false);
  assert.equal(roofingOptions.some((option) => option.id === "fibre-cement" && option.option.includes("Asbestos-free")), true);
  assert.equal(constructionAssumptionsDefaults.buildingLength, "");
  assert.equal(constructionAssumptionsDefaults.buildingWidth, "");
  assert.equal(constructionAssumptionsDefaults.partitionThickness, "");
  for (const room of roomEquipmentSchedule) {
    for (const equipmentId of room.equipmentIds) {
      assert.equal(ids.includes(equipmentId), true, `${equipmentId} must have one procurement record`);
    }
  }
});

test("wall quantities use entered footprint, openings, brick size and wastage", () => {
  const result = calculateWallQuantities({
    buildingLength: "40",
    buildingWidth: "20",
    wallHeight: "10",
    openingsArea: "100",
    partitionLength: "40",
    partitionHeight: "10",
    partitionOpeningsArea: "0",
    wallThickness: "0.667",
    partitionThickness: "0.5",
    brickLength: "8",
    brickWidth: "4",
    brickHeight: "2.5",
    jointThickness: "0.375",
    wastagePercent: "5",
    cementParts: "1",
    sandParts: "6",
    dryFactor: "1.33",
    cementBagVolume: "1.25",
  });
  assert.equal(result.externalGrossArea, 1200);
  assert.equal(result.externalNetArea, 1100);
  assert.equal(result.partitionNetArea, 400);
  assert.equal(result.totalBricks, result.externalBricks + result.partitionBricks);
  assert.equal(result.mortarVolume, result.externalMortarVolume + result.partitionMortarVolume);
  assert.ok(result.cementBags > 0);
  assert.ok(result.sandVolume > 0);
  assert.ok(result.externalCementBags > 0);
  assert.ok(result.partitionCementBags > 0);
  assert.equal(calculateWallQuantities({ buildingLength: "", buildingWidth: "20" }), null);
  const externalOnly = calculateWallQuantities({
    buildingLength: "40", buildingWidth: "20", wallHeight: "10", openingsArea: "100",
    wallThickness: "0.667", brickLength: "8", brickWidth: "4", brickHeight: "2.5",
    jointThickness: "0.375", wastagePercent: "5", cementParts: "1", sandParts: "6",
    dryFactor: "1.33", cementBagVolume: "1.25",
  });
  assert.ok(externalOnly.externalCementBags > 0);
  assert.equal(externalOnly.partitionCementBags, null);
  assert.equal(externalOnly.cementBags, null);
  assert.equal(calculateWallQuantities({
    buildingLength: "40", buildingWidth: "20", wallHeight: "10", openingsArea: "0",
    wallThickness: "0.5", partitionThickness: "-1",
    brickLength: "8", brickWidth: "4", brickHeight: "2.5", jointThickness: "0.375",
    wastagePercent: "5",
  }), null);
});

test("BOQ totals keep material, local labour, transport and installation separate", () => {
  const result = calculateBoqItem({
    quantity: "10",
    minimumRate: "100",
    maximumRate: "200",
    minimumLaborRate: "20",
    maximumLaborRate: "40",
    tax: "0",
    transport: "50",
    installation: "100",
  });
  assert.equal(result.unitCost, 150);
  assert.equal(result.materialTotal, 1500);
  assert.equal(result.laborTotal, 300);
  assert.equal(result.finalAverageTotal, 1950);
  assert.equal(calculateBoqItem({
    quantity: "10", minimumRate: "100", maximumRate: "200",
    minimumLaborRate: "20", maximumLaborRate: "40",
    tax: "150", transport: "50", installation: "100",
  }).finalAverageTotal, 2100);
  assert.equal(calculateBoqItem({ quantity: "10" }).finalAverageTotal, null);
});

test("labour estimation supports daily wages or an exclusive activity contract", () => {
  assert.equal(calculateDailyLabour({
    minimumRate: "600", maximumRate: "900", workers: "2", days: "3", method: "daily",
  }), 4500);
  assert.equal(calculateDailyLabour({
    minimumRate: "600", maximumRate: "900", workers: "2", days: "3",
    method: "contract", contractRate: "50", contractQuantity: "10",
  }), 500);
});

test("planner item costs and category totals use entered average rates and quantities", () => {
  assert.deepEqual(calculatePlannerItem("10", "20", "3"), {
    minimum: 30,
    average: 45,
    maximum: 60,
    minimumUnit: 10,
    averageUnit: 15,
    maximumUnit: 20,
    quantity: 3,
    complete: true,
  });
  assert.equal(calculatePlannerItem("", "", "3").average, null);
  const total = sumPlannerItems([
    { estimate: calculatePlannerItem("10", "20", "3") },
    { estimate: calculatePlannerItem("5", "5", "2") },
  ]);
  assert.deepEqual([total.minimum, total.average, total.maximum], [40, 55, 70]);
  assert.equal(total.complete, true);
});

test("initial investment adds construction, equipment, batch and contingency but excludes monthly costs", () => {
  const construction = calculatePlannerItem("100", "120", "1");
  const equipment = calculatePlannerItem("40", "60", "1");
  const production = calculatePlannerItem("20", "30", "1");
  const contingency = {
    minimum: 16,
    average: 18.5,
    maximum: 21,
    complete: true,
  };
  const initial = calculateInitialInvestment(construction, equipment, production, contingency);
  assert.deepEqual([initial.minimum, initial.average, initial.maximum], [176, 203.5, 231]);
  assert.deepEqual(calculateContingency(construction, equipment, production, "10"), {
    minimum: 16,
    average: 18.5,
    maximum: 21,
    complete: true,
  });
  assert.equal(calculateInitialInvestment(construction, equipment, production, {
    minimum: null, average: null, maximum: null, complete: false,
  }).complete, false);
});

test("spawn, bag count and purchased paddy straw are derived from editable cultivation inputs", () => {
  assert.equal(calculateSpawnQuantity("100", "5"), 5);
  assert.equal(calculateSpawnQuantity("100", ""), null);
  assert.equal(calculateGrowingBagCount("60", "40", "10"), 10);
  assert.equal(calculateGrowingBagCount("60", "", "10"), null);
  assert.deepEqual(calculatePaddyStrawBalance("120", "50", true), { ownUsed: 50, purchased: 70 });
  assert.deepEqual(calculatePaddyStrawBalance("120", "", false), { ownUsed: 0, purchased: 120 });
  assert.equal(calculatePaddyStrawBalance("120", "", true), null);
});

test("editable room layout detects area and geometry changes against the plot", () => {
  const dimensions = Object.fromEntries(layoutRooms.map((room) => [room.id, {
    length: String(room.length),
    width: String(room.width),
  }]));
  const layout = calculateRoomLayout(dimensions, "20", "40");
  assert.equal(layout.totalArea, 800);
  assert.equal(layout.passageArea, 120);
  assert.equal(layout.areaMatches, true);
  assert.equal(layout.geometryMatches, true);
  dimensions["raw-straw"].width = "7";
  const changedLayout = calculateRoomLayout(dimensions, "20", "40");
  assert.equal(changedLayout.areaMatches, false);
  assert.equal(changedLayout.geometryMatches, false);
});

test("planner catalog covers the requested options and keeps monthly costs outside initial investment", () => {
  assert.equal(new Set(allPlannerItems.map((item) => item.id)).size, allPlannerItems.length);
  assert.equal(plannerRoofOptions.length, 4);
  assert.equal(plannerRoofOptions.some((option) => /asbestos-cement/i.test(option.label)), false);
  assert.equal(plannerRoofOptions.some((option) => /asbestos-free/i.test(option.label)), true);
  assert.ok(allPlannerItems.some((item) => item.id === "oyster-spawn" && item.quantitySource === "oysterSpawn"));
  assert.ok(allPlannerItems.filter((item) => item.investmentType === "monthly").length > 0);
  assert.ok(resourceRows.some((resource) => resource.id === "water" && resource.defaultAvailable === false));
  assert.equal(planRows.flat().length, layoutRooms.length - 1);
  const monthly = sumPlannerItems([{ estimate: calculatePlannerItem("10", "20", "5") }]);
  assert.deepEqual(calculateCostPerKg(monthly, "10"), { minimum: 5, average: 7.5, maximum: 10 });
  assert.equal(calculateCostPerKg(monthly, ""), null);
});
