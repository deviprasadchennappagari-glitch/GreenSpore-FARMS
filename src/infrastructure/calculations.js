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
  const reliablePrices = Object.values(quotes || {})
    .filter((quote) => isReliableQuote(quote, today))
    .map((quote) => numeric(quote.quotedUnitPrice));

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
  const installation = numeric(optionInput?.installation);
  const insulation = numeric(optionInput?.insulation);
  const flashingGutters = numeric(optionInput?.flashingGutters);
  const components = [minimumRate, maximumRate, support, installation, insulation, flashingGutters];
  if (components.some((value) => value === null || value < 0) || maximumRate < minimumRate) return null;

  const averageMaterialRate = (minimumRate + maximumRate) / 2;
  const materialMinimum = area * minimumRate;
  const materialMaximum = area * maximumRate;
  const fixedCosts = support + installation + insulation + flashingGutters;
  return {
    materialMinimum,
    materialMaximum,
    averageMaterialCost: area * averageMaterialRate,
    structuralSupport: support,
    installation,
    insulation,
    flashingGutters,
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
