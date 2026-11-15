import assert from "node:assert/strict";
import test from "node:test";
import { getBudgetSummary, layoutRooms, projectDetails } from "./data.js";
import {
  calculateRoofArea,
  calculateRoofOptionCost,
  getItemCostSummary,
  isReliableQuote,
} from "./calculations.js";
import { allProcurementItems, roomEquipmentSchedule } from "./detail-data.js";

test("the conceptual room schedule fits the stated 800 sq ft plot exactly", () => {
  const scheduledArea = layoutRooms.reduce((total, room) => total + room.area, 0);

  assert.equal(scheduledArea, projectDetails.plotArea);
  assert.equal(layoutRooms.find((room) => room.room === "Internal service passage").area, 120);
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
});

test("roof area uses measured slope and overhang rather than assuming plot area", () => {
  assert.equal(calculateRoofArea({ length: "40", width: "20", slopePercent: "0", overhang: "1" }), 924);
  assert.equal(calculateRoofArea({ length: "", width: "20", slopePercent: "0", overhang: "1" }), null);

  const estimate = calculateRoofOptionCost(924, {
    materialMinRate: "140",
    materialMaxRate: "190",
    structuralSupport: "10000",
    installation: "5000",
    insulation: "0",
    flashingGutters: "2000",
  });
  assert.equal(estimate.averageMaterialCost, 152460);
  assert.equal(estimate.totalAverage, 169460);
  assert.equal(calculateRoofOptionCost(924, {}), null);
});

test("the procurement catalog has unique cost records for every room placement", () => {
  const ids = allProcurementItems.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(roomEquipmentSchedule.length, 10);
  for (const room of roomEquipmentSchedule) {
    for (const equipmentId of room.equipmentIds) {
      assert.equal(ids.includes(equipmentId), true, `${equipmentId} must have one procurement record`);
    }
  }
});
