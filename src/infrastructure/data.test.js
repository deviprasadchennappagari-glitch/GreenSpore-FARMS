import assert from "node:assert/strict";
import test from "node:test";
import { getBudgetSummary, layoutRooms, projectDetails } from "./data.js";

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
