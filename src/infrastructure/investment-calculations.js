import { calculateRoofArea, calculateWallQuantities } from "./calculations.js";
import { layoutRooms, projectDetails } from "./data.js";
import { allPlannerItems, planRows } from "./planner-data.js";

const numeric = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function calculatePlannerItem(minimum, maximum, quantity) {
  const low = numeric(minimum);
  const high = numeric(maximum);
  const amount = numeric(quantity);
  if (amount === 0) return { minimum: 0, average: 0, maximum: 0, quantity: 0, complete: true };
  if (low === null || high === null || amount === null || amount < 0 || low < 0 || high < low) {
    return { minimum: null, average: null, maximum: null, quantity: amount, complete: false };
  }
  const average = (low + high) / 2;
  return {
    minimum: low * amount,
    average: average * amount,
    maximum: high * amount,
    minimumUnit: low,
    averageUnit: average,
    maximumUnit: high,
    quantity: amount,
    complete: true,
  };
}

export function sumPlannerItems(items) {
  if (!items.length) return { minimum: 0, average: 0, maximum: 0, complete: true, items: 0 };
  const estimates = items.map((item) => item.estimate);
  const complete = estimates.every((estimate) => estimate.complete);
  return {
    minimum: complete ? estimates.reduce((total, estimate) => total + estimate.minimum, 0) : null,
    average: complete ? estimates.reduce((total, estimate) => total + estimate.average, 0) : null,
    maximum: complete ? estimates.reduce((total, estimate) => total + estimate.maximum, 0) : null,
    complete,
    items: items.length,
    completeItems: estimates.filter((estimate) => estimate.complete).length,
  };
}

export function calculateInitialInvestment(construction, equipment, production, contingency) {
  return sumPlannerItems([construction, equipment, production, contingency].map((estimate) => ({ estimate })));
}

export function calculateSpawnQuantity(substrateKg, spawnRatePercent) {
  const substrate = numeric(substrateKg);
  const rate = numeric(spawnRatePercent);
  if (substrate === null || rate === null || substrate <= 0 || rate <= 0) return null;
  return substrate * rate / 100;
}

export function calculateGrowingBagCount(oysterSubstrateKg, milkySubstrateKg, drySubstratePerBagKg) {
  const oyster = numeric(oysterSubstrateKg);
  const milky = numeric(milkySubstrateKg);
  const perBag = numeric(drySubstratePerBagKg);
  if (oyster === null || milky === null || perBag === null || oyster < 0 || milky < 0 || perBag <= 0) return null;
  return Math.ceil((oyster + milky) / perBag);
}

export function calculatePaddyStrawBalance(requiredKg, ownAvailableKg, ownStrawConfirmed) {
  const required = numeric(requiredKg);
  if (required === null || required < 0) return null;
  if (!ownStrawConfirmed) return { ownUsed: 0, purchased: required };
  const ownAvailable = numeric(ownAvailableKg);
  if (ownAvailable === null || ownAvailable < 0) return null;
  const ownUsed = Math.min(required, ownAvailable);
  return { ownUsed, purchased: Math.max(0, required - ownUsed) };
}

export function calculateRoomLayout(dimensions, plotWidth, plotLength) {
  const rooms = layoutRooms.map((room) => {
    const length = numeric(dimensions[room.id]?.length);
    const width = numeric(dimensions[room.id]?.width);
    return {
      ...room,
      length,
      width,
      area: length !== null && width !== null && length > 0 && width > 0 ? length * width : null,
    };
  });
  const allAreasKnown = rooms.every((room) => room.area !== null);
  const totalArea = allAreasKnown ? rooms.reduce((total, room) => total + room.area, 0) : null;
  const passage = rooms.find((room) => room.id === "service-passage");
  const passageArea = passage?.area ?? null;
  const rowDepths = planRows.map((row) => rooms.find((room) => room.id === row[0])?.width);
  const rowsDepth = rowDepths.every((width) => width !== null && width !== undefined)
    ? rowDepths.reduce((total, width) => total + width, 0)
    : null;
  const rowWidthsMatch = planRows.every((row) => {
    const rowRooms = row.map((id) => rooms.find((room) => room.id === id));
    if (rowRooms.some((room) => room.length === null || room.width === null)) return false;
    return rowRooms.every((room) => Math.abs(room.width - rowRooms[0].width) < 0.001);
  });
  const plotW = numeric(plotWidth);
  const plotL = numeric(plotLength);
  const passageWidth = passage?.width;
  const maxRoomWidth = Math.max(...planRows.map((row) => row.reduce((sum, id) =>
    sum + (rooms.find((room) => room.id === id)?.length || 0), 0)));
  const geometryMatches = rowsDepth !== null && passageWidth !== null && plotW !== null && plotL !== null &&
    Math.abs(rowsDepth - plotL) < 0.001 && Math.abs(maxRoomWidth + passageWidth - plotW) < 0.001;
  const calculatedPlotArea = plotW !== null && plotL !== null ? plotW * plotL : null;
  const areaMatches = totalArea !== null && calculatedPlotArea !== null && Math.abs(totalArea - calculatedPlotArea) < 0.001;
  return {
    rooms,
    totalArea,
    passageArea,
    calculatedPlotArea,
    areaMatches,
    geometryMatches: geometryMatches && rowWidthsMatch,
    maxRoomWidth,
    rowsDepth,
  };
}

export function getPlannerQuantities(state) {
  const assumptions = state.assumptions;
  const wall = calculateWallQuantities({
    buildingLength: assumptions.buildingLength,
    buildingWidth: assumptions.buildingWidth,
    wallHeight: assumptions.wallHeight,
    openingsArea: assumptions.externalOpeningsArea,
    partitionLength: assumptions.partitionLength,
    partitionHeight: assumptions.partitionHeight,
    partitionOpeningsArea: assumptions.partitionOpeningsArea,
    wallThickness: assumptions.wallThickness,
    partitionThickness: assumptions.partitionThickness,
    brickLength: assumptions.brickLength,
    brickWidth: assumptions.brickWidth,
    brickHeight: assumptions.brickHeight,
    jointThickness: assumptions.mortarJoint,
    wastagePercent: assumptions.brickWastagePercent,
    cementParts: assumptions.cementParts,
    sandParts: assumptions.sandParts,
    dryFactor: assumptions.mortarDryFactor,
    cementBagVolume: assumptions.cementBagVolume,
  });
  const roofArea = calculateRoofArea(state.roof);
  const production = state.production;
  const requiredStraw = numeric(production.oysterSubstrateKg) !== null && numeric(production.milkySubstrateKg) !== null
    ? Number(production.oysterSubstrateKg) + Number(production.milkySubstrateKg)
    : null;
  const strawBalance = calculatePaddyStrawBalance(
    requiredStraw,
    production.ownPaddyStrawKg,
    state.reuse.straw,
  );
  const calculated = {
    bricks: wall?.totalBricks ?? null,
    externalCement: wall?.externalCementBags ?? null,
    externalSand: wall?.externalSandVolume ?? null,
    partitionArea: wall?.partitionNetArea ?? null,
    partitionCement: wall?.partitionCementBags ?? null,
    partitionSand: wall?.partitionSandVolume ?? null,
    roofArea,
    oysterSpawn: calculateSpawnQuantity(production.oysterSubstrateKg, production.oysterSpawnRate),
    milkySpawn: calculateSpawnQuantity(production.milkySubstrateKg, production.milkySpawnRate),
    bags: calculateGrowingBagCount(production.oysterSubstrateKg, production.milkySubstrateKg, production.drySubstratePerBagKg),
    requiredStraw,
    purchasedStraw: strawBalance?.purchased ?? null,
  };

  const quantities = Object.fromEntries(allPlannerItems.map((item) => [
    item.id,
    item.quantitySource ? calculated[item.quantitySource] ?? null : numeric(state.quantities[item.id]),
  ]));
  return { wall, roofArea, requiredStraw, strawBalance, quantities };
}

export function calculateContingency(construction, equipment, initialProduction, ratePercent) {
  const rate = numeric(ratePercent);
  if (!construction.complete || !equipment.complete || !initialProduction.complete || rate === null || rate < 0) {
    return { minimum: null, average: null, maximum: null, complete: false };
  }
  return {
    minimum: (construction.minimum + equipment.minimum + initialProduction.minimum) * rate / 100,
    average: (construction.average + equipment.average + initialProduction.average) * rate / 100,
    maximum: (construction.maximum + equipment.maximum + initialProduction.maximum) * rate / 100,
    complete: true,
  };
}

export function calculateCostPerKg(monthlyOperating, monthlyHarvestKg) {
  const kg = numeric(monthlyHarvestKg);
  if (!monthlyOperating.complete || kg === null || kg <= 0) return null;
  return {
    minimum: monthlyOperating.minimum / kg,
    average: monthlyOperating.average / kg,
    maximum: monthlyOperating.maximum / kg,
  };
}

export function getPlotDefaults() {
  return { width: String(projectDetails.plotWidth), length: String(projectDetails.plotLength) };
}
