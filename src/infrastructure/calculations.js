export const PROCUREMENT_STORAGE_VERSION = 1;
export const PROCUREMENT_STORAGE_KEY = "greenspore-infrastructure-procurement-v1";

const numeric = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function calculateAverageUnitCost(minimum, maximum) {
  const low = numeric(minimum);
  const high = numeric(maximum);
  if (low === null || high === null || low < 0 || high < low) return null;
  return (low + high) / 2;
}

export function calculateAverageTotalCost(minimum, maximum, quantity) {
  const average = calculateAverageUnitCost(minimum, maximum);
  const amount = numeric(quantity);
  if (average === null || amount === null || amount <= 0) return null;
  return average * amount;
}

export function calculateWallQuantities(input) {
  const buildingLength = numeric(input.buildingLength);
  const buildingWidth = numeric(input.buildingWidth);
  const wallHeight = numeric(input.wallHeight);
  const openingsArea = numeric(input.openingsArea);
  const partitionLength = numeric(input.partitionLength);
  const partitionHeight = numeric(input.partitionHeight);
  const partitionOpeningsArea = numeric(input.partitionOpeningsArea);
  const wallThickness = numeric(input.wallThickness);
  const partitionThickness = numeric(input.partitionThickness);
  const brickLength = numeric(input.brickLength);
  const brickWidth = numeric(input.brickWidth);
  const brickHeight = numeric(input.brickHeight);
  const jointThickness = numeric(input.jointThickness);
  const wastagePercent = numeric(input.wastagePercent);
  const cementParts = numeric(input.cementParts);
  const sandParts = numeric(input.sandParts);
  const dryFactor = numeric(input.dryFactor);
  const cementBagVolume = numeric(input.cementBagVolume);
  const externalInputs = [buildingLength, buildingWidth, wallHeight, openingsArea, brickLength,
    brickWidth, brickHeight, jointThickness, wastagePercent];
  if (externalInputs.some((value) => value === null) ||
      externalInputs.some((value) => value < 0) || buildingLength <= 0 || buildingWidth <= 0 ||
      wallHeight <= 0 || brickLength <= 0 || brickWidth <= 0 || brickHeight <= 0 || jointThickness <= 0 ||
      (wallThickness !== null && wallThickness <= 0) ||
      (partitionThickness !== null && partitionThickness <= 0)) return null;

  const externalGrossArea = 2 * (buildingLength + buildingWidth) * wallHeight;
  const externalNetArea = externalGrossArea - openingsArea;
  if (externalNetArea <= 0) return null;

  const hasPartitionInputs = [partitionLength, partitionHeight, partitionOpeningsArea].every((value) => value !== null);
  const partitionGrossArea = hasPartitionInputs ? partitionLength * partitionHeight : null;
  const partitionNetArea = hasPartitionInputs ? partitionGrossArea - partitionOpeningsArea : null;
  if (hasPartitionInputs && (partitionLength < 0 || partitionHeight <= 0 || partitionOpeningsArea < 0 ||
      partitionNetArea < 0 || (partitionLength > 0 && partitionNetArea === 0))) return null;

  const brickFaceArea = ((brickLength + jointThickness) * (brickHeight + jointThickness)) / 144;
  const externalBricks = externalNetArea / brickFaceArea;
  const wastageFactor = 1 + wastagePercent / 100;
  const externalBricksWithWastage = Math.ceil(externalBricks * wastageFactor);
  const partitionBricks = hasPartitionInputs ? partitionNetArea / brickFaceArea : null;
  const partitionBricksWithWastage = hasPartitionInputs ? Math.ceil(partitionBricks * wastageFactor) : null;
  const totalBricks = hasPartitionInputs
    ? externalBricksWithWastage + partitionBricksWithWastage
    : null;
  const wallThicknessValid = wallThickness !== null && wallThickness > 0;
  const partitionThicknessValid = partitionThickness !== null && partitionThickness > 0;
  const brickUnitVolume = brickLength * brickWidth * brickHeight / 1728;
  const externalMortarVolume = wallThicknessValid
    ? externalNetArea * wallThickness - externalBricks * brickUnitVolume
    : null;
  const partitionMortarVolume = hasPartitionInputs && partitionNetArea === 0
    ? 0
    : partitionThicknessValid && hasPartitionInputs
      ? partitionNetArea * partitionThickness - partitionBricks * brickUnitVolume
      : null;
  const mortarVolume = externalMortarVolume !== null && partitionMortarVolume !== null
    ? externalMortarVolume + partitionMortarVolume
    : null;
  if ([externalMortarVolume, partitionMortarVolume].some((value) => value !== null && value < 0)) return null;

  const ratios = [cementParts, sandParts, dryFactor, cementBagVolume];
  const mortarInputsComplete = ratios.every((value) => value !== null && value > 0);
  const materialQuantities = (volume) => {
    if (volume === null || !mortarInputsComplete) return { cementBags: null, sandVolume: null };
    const dryMortarVolume = volume * dryFactor;
    const totalParts = cementParts + sandParts;
    return {
      cementBags: (dryMortarVolume * cementParts / totalParts) / cementBagVolume,
      sandVolume: dryMortarVolume * sandParts / totalParts,
    };
  };
  const externalMaterials = materialQuantities(externalMortarVolume);
  const partitionMaterials = materialQuantities(partitionMortarVolume);
  const cementBags = externalMaterials.cementBags !== null && partitionMaterials.cementBags !== null
    ? externalMaterials.cementBags + partitionMaterials.cementBags
    : null;
  const sandVolume = externalMaterials.sandVolume !== null && partitionMaterials.sandVolume !== null
    ? externalMaterials.sandVolume + partitionMaterials.sandVolume
    : null;

  return {
    externalGrossArea,
    externalNetArea,
    partitionGrossArea,
    partitionNetArea,
    externalBricks: externalBricksWithWastage,
    partitionBricks: partitionBricksWithWastage,
    totalBricks,
    externalMortarVolume,
    partitionMortarVolume,
    mortarVolume,
    cementBags,
    sandVolume,
    externalCementBags: externalMaterials.cementBags,
    externalSandVolume: externalMaterials.sandVolume,
    partitionCementBags: partitionMaterials.cementBags,
    partitionSandVolume: partitionMaterials.sandVolume,
  };
}

export function calculateBoqItem(input) {
  const quantity = numeric(input.quantity);
  const minimumRate = numeric(input.minimumRate);
  const maximumRate = numeric(input.maximumRate);
  const minimumLaborRate = numeric(input.minimumLaborRate);
  const maximumLaborRate = numeric(input.maximumLaborRate);
  const tax = numeric(input.tax);
  const transport = numeric(input.transport);
  const installation = numeric(input.installation);
  const unitCost = calculateAverageUnitCost(minimumRate, maximumRate);
  const laborUnitCost = calculateAverageUnitCost(minimumLaborRate, maximumLaborRate);
  const materialTotal = unitCost !== null && quantity !== null && quantity > 0
    ? unitCost * quantity
    : null;
  const laborTotal = laborUnitCost !== null && quantity !== null && quantity > 0
    ? laborUnitCost * quantity
    : null;
  const finalAverageTotal = materialTotal !== null && laborTotal !== null &&
    tax !== null && tax >= 0 && transport !== null && transport >= 0 &&
    installation !== null && installation >= 0
    ? materialTotal + laborTotal + tax + transport + installation
    : null;

  return {
    minimumRate,
    maximumRate,
    unitCost,
    materialTotal,
    minimumLaborRate,
    maximumLaborRate,
    laborUnitCost,
    laborTotal,
    tax,
    transport,
    installation,
    finalAverageTotal,
  };
}

export function calculateDailyLabour(input) {
  if (input.method === "contract") {
    const contractAmount = numeric(input.contractAmount);
    if (contractAmount !== null && contractAmount >= 0) return contractAmount;
    const contractRate = numeric(input.contractRate);
    const contractQuantity = numeric(input.contractQuantity);
    return contractRate !== null && contractQuantity !== null && contractRate >= 0 && contractQuantity >= 0
      ? contractRate * contractQuantity
      : null;
  }
  const dailyRate = calculateAverageUnitCost(input.minimumRate, input.maximumRate);
  const workers = numeric(input.workers);
  const days = numeric(input.days);
  if (dailyRate === null || workers === null || days === null || workers <= 0 || days <= 0) return null;
  return dailyRate * workers * days;
}

export function isReliableQuote(quote, today = new Date()) {
  if (!quote || !["Quoted", "Selected", "Purchased"].includes(quote.status)) return false;
  if (!quote.supplier?.trim() || !quote.model?.trim() || !quote.specification?.trim()) return false;
  if (!quote.quoteDate || !quote.validUntil) return false;

  const price = numeric(quote.quotedUnitPrice);
  const quoteDate = new Date(`${quote.quoteDate}T00:00:00`);
  const validUntil = new Date(`${quote.validUntil}T23:59:59`);
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (price === null || price <= 0 || Number.isNaN(quoteDate.valueOf()) || Number.isNaN(validUntil.valueOf())) return false;
  if (quoteDate > currentDate) return false;
  if (validUntil < currentDate || validUntil < quoteDate) return false;
  return true;
}

export function getItemCostSummary(quotes, quantity, today = new Date()) {
  const reliableQuotes = Object.values(quotes || {}).filter((quote) => isReliableQuote(quote, today));
  const specifications = new Set(reliableQuotes.map((quote) => quote.specification.trim().toLocaleLowerCase()));
  if (specifications.size > 1) {
    return {
      status: "Specifications differ; compare separately",
      reliableQuoteCount: 0,
      minimum: null,
      maximum: null,
      averageUnitCost: null,
      averageTotalCost: null,
    };
  }
  const reliablePrices = reliableQuotes.map((quote) => numeric(quote.quotedUnitPrice));

  if (!reliablePrices.length) {
    return {
      status: "Quotation Required",
      reliableQuoteCount: 0,
      minimum: null,
      maximum: null,
      averageUnitCost: null,
      averageTotalCost: null,
    };
  }

  const minimum = Math.min(...reliablePrices);
  const maximum = Math.max(...reliablePrices);
  return {
    status: reliablePrices.length === 1 ? "One reliable quotation" : `${reliablePrices.length} reliable quotations`,
    reliableQuoteCount: reliablePrices.length,
    minimum,
    maximum,
    averageUnitCost: calculateAverageUnitCost(minimum, maximum),
    averageTotalCost: calculateAverageTotalCost(minimum, maximum, quantity),
  };
}

export function calculateRoofArea({ length, width, slopePercent, overhang }) {
  const roofLength = numeric(length);
  const roofWidth = numeric(width);
  const pitch = numeric(slopePercent);
  const eaveOverhang = numeric(overhang);
  if ([roofLength, roofWidth, pitch, eaveOverhang].some((value) => value === null)) return null;
  if (roofLength <= 0 || roofWidth <= 0 || pitch < 0 || eaveOverhang < 0) return null;

  const planLength = roofLength + 2 * eaveOverhang;
  const planWidth = roofWidth + 2 * eaveOverhang;
  return planLength * planWidth * Math.sqrt(1 + (pitch / 100) ** 2);
}

export function calculateRoofOptionCost(roofArea, optionInput) {
  const area = numeric(roofArea);
  if (area === null || area <= 0) return null;

  const minimumRate = numeric(optionInput?.materialMinRate);
  const maximumRate = numeric(optionInput?.materialMaxRate);
  const support = numeric(optionInput?.structuralSupport);
  const fabrication = numeric(optionInput?.fabricationLabour);
  const installation = numeric(optionInput?.installationLabour);
  const insulation = numeric(optionInput?.insulation);
  const ceiling = numeric(optionInput?.ceiling);
  const fasteners = numeric(optionInput?.fasteners);
  const flashingGutters = numeric(optionInput?.flashingGutters);
  const transport = numeric(optionInput?.transport);
  const components = [minimumRate, maximumRate, support, fabrication, installation, insulation, ceiling,
    fasteners, flashingGutters, transport];
  if (components.some((value) => value === null || value < 0) || maximumRate < minimumRate) return null;

  const averageMaterialRate = (minimumRate + maximumRate) / 2;
  const materialMinimum = area * minimumRate;
  const materialMaximum = area * maximumRate;
  const fixedCosts = support + fabrication + installation + insulation + ceiling + fasteners + flashingGutters + transport;
  return {
    materialMinimum,
    materialMaximum,
    averageMaterialRate,
    averageMaterialCost: area * averageMaterialRate,
    structuralSupport: support,
    fabricationLabour: fabrication,
    installationLabour: installation,
    insulation,
    ceiling,
    fasteners,
    flashingGutters,
    transport,
    totalMinimum: materialMinimum + fixedCosts,
    totalMaximum: materialMaximum + fixedCosts,
    totalAverage: area * averageMaterialRate + fixedCosts,
  };
}

export function isProcurementState(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    value.version === PROCUREMENT_STORAGE_VERSION &&
    value.quotes &&
    typeof value.quotes === "object" &&
    value.quantities &&
    typeof value.quantities === "object" &&
    value.roofCalculator &&
    typeof value.roofCalculator === "object",
  );
}
