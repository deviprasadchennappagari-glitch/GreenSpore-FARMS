import { useEffect, useRef, useState } from "react";
import logo from "../../assets/greenspore-logo.png";
import layoutImage from "../../assets/facility-layout-concept.svg";
import {
  environmentRows,
  existingBudget,
  getBudgetSummary,
  layoutRooms,
  maintenanceChecks,
  projectDetails,
  referencedMaterials,
  roadmap,
} from "./data.js";
import {
  ceilingInsulationNotes,
  environmentalSensors,
  fogWaterEquipment,
  humidificationOptions,
  pufThicknesses,
  roomEquipmentSchedule,
  roofingOptions,
  temperatureEquipment,
  ventilationEquipment,
} from "./detail-data.js";
import {
  allCostItems as allProcurementItems,
  constructionAssumptionsDefaults,
  constructionGroups,
  labourTasks,
  labourTrades,
} from "./construction-data.js";
import {
  calculateBoqItem,
  calculateDailyLabour,
  calculateRoofArea,
  calculateRoofOptionCost,
  calculateWallQuantities,
  getItemCostSummary,
  isReliableQuote,
  isProcurementState,
  PROCUREMENT_STORAGE_KEY,
  PROCUREMENT_STORAGE_VERSION,
} from "./calculations.js";
import "./styles.css";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const budgetSummary = getBudgetSummary();
const roomArea = layoutRooms.reduce((total, room) => total + room.area, 0);

function formatCurrency(value) {
  return currency.format(value);
}

const quoteSlots = ["supplier-1", "supplier-2", "supplier-3"];
const quoteStatuses = ["Not requested", "Quote requested", "Quoted", "Selected", "Purchased", "Declined"];
const quoteFields = [
  "supplier",
  "contact",
  "model",
  "specification",
  "quotedUnitPrice",
  "gst",
  "transport",
  "installation",
  "warranty",
  "deliveryTerms",
  "quoteDate",
  "validUntil",
  "selectedPrice",
  "purchasedAmount",
  "comparison",
  "status",
];
const roofCostFields = [
  "materialMinRate",
  "materialMaxRate",
  "structuralSupport",
  "fabricationLabour",
  "installationLabour",
  "insulation",
  "ceiling",
  "fasteners",
  "flashingGutters",
  "transport",
];

function createEmptyProcurementState() {
  const options = Object.fromEntries(roofingOptions.map((option) => [
    option.id,
    {
      ...Object.fromEntries(roofCostFields.map((field) => [field, ""])),
      thickness: "",
    },
  ]));
  const costInputs = Object.fromEntries(allProcurementItems.map((item) => [
    item.id,
    {
      materialSource: "not-set",
      marketMinimum: "",
      marketMaximum: "",
      laborMinimumRate: "",
      laborMaximumRate: "",
      tax: "",
      transport: "",
      installation: "",
      sourceNote: "",
    },
  ]));
  const laborRates = Object.fromEntries(labourTrades.map((trade) => [
    trade.id,
    { minimumRate: trade.minimumRate, maximumRate: trade.maximumRate },
  ]));
  const laborEntries = Object.fromEntries(labourTasks.map((task) => [
    task.id,
    { method: "daily", workers: "", days: "", contractAmount: "", contractRate: "", contractQuantity: "" },
  ]));
  const brickOptions = Object.fromEntries(["A", "B", "C"].map((option) => [
    option,
    { length: "", width: "", height: "", weight: "", strength: "" },
  ]));
  return {
    version: PROCUREMENT_STORAGE_VERSION,
    quotes: {},
    quantities: {},
    costInputs,
    constructionAssumptions: { ...constructionAssumptionsDefaults, brickOption: "A" },
    brickOptions,
    laborRates,
    laborEntries,
    roomDimensions: {
      oyster: { length: "", width: "", height: "" },
      milky: { length: "", width: "", height: "" },
    },
    roofCalculator: {
      dimensions: { length: "", width: "", slopePercent: "", overhang: "" },
      options,
    },
  };
}

function normalizeProcurementState(value) {
  if (!isProcurementState(value)) throw new Error("The file is not a supported GreenSpore quote tracker export.");

  const normalized = createEmptyProcurementState();
  for (const item of allProcurementItems) {
    const itemQuotes = value.quotes[item.id];
    if (itemQuotes && typeof itemQuotes === "object") {
      normalized.quotes[item.id] = {};
      for (const slot of quoteSlots) {
        const quote = itemQuotes[slot];
        if (!quote || typeof quote !== "object") continue;
        const cleanQuote = {};
        for (const field of quoteFields) {
          if (field === "status") {
            cleanQuote.status = quoteStatuses.includes(quote.status) ? quote.status : "Not requested";
          } else {
            const fieldValue = quote[field];
            cleanQuote[field] = typeof fieldValue === "string" || typeof fieldValue === "number" ? String(fieldValue) : "";
          }
        }
        normalized.quotes[item.id][slot] = cleanQuote;
      }
    }

    const quantity = value.quantities[item.id];
    if (typeof quantity === "string" || typeof quantity === "number") {
      normalized.quantities[item.id] = String(quantity);
    }

    const costInput = value.costInputs?.[item.id];
    if (costInput && typeof costInput === "object") {
      const current = normalized.costInputs[item.id];
      for (const field of Object.keys(current)) {
        const fieldValue = costInput[field];
        if (typeof fieldValue === "string" || typeof fieldValue === "number") current[field] = String(fieldValue);
      }
      if (!["not-set", "market", "supplier"].includes(current.materialSource)) current.materialSource = "not-set";
    }
  }

  for (const [field, defaultValue] of Object.entries(constructionAssumptionsDefaults)) {
    const fieldValue = value.constructionAssumptions?.[field];
    if (typeof fieldValue === "string" || typeof fieldValue === "number") {
      normalized.constructionAssumptions[field] = String(fieldValue);
    } else {
      normalized.constructionAssumptions[field] = defaultValue;
    }
  }
  const selectedBrickOption = value.constructionAssumptions?.brickOption;
  if (["A", "B", "C"].includes(selectedBrickOption)) normalized.constructionAssumptions.brickOption = selectedBrickOption;
  for (const option of ["A", "B", "C"]) {
    const input = value.brickOptions?.[option];
    if (!input || typeof input !== "object") continue;
    for (const field of Object.keys(normalized.brickOptions[option])) {
      const fieldValue = input[field];
      if (typeof fieldValue === "string" || typeof fieldValue === "number") {
        normalized.brickOptions[option][field] = String(fieldValue);
      }
    }
  }
  for (const trade of labourTrades) {
    const rates = value.laborRates?.[trade.id];
    if (!rates || typeof rates !== "object") continue;
    for (const field of ["minimumRate", "maximumRate"]) {
      const fieldValue = rates[field];
      if (typeof fieldValue === "string" || typeof fieldValue === "number") {
        normalized.laborRates[trade.id][field] = String(fieldValue);
      }
    }
  }
  for (const task of labourTasks) {
    const entry = value.laborEntries?.[task.id];
    if (!entry || typeof entry !== "object") continue;
    for (const field of ["workers", "days", "contractAmount", "contractRate", "contractQuantity"]) {
      const fieldValue = entry[field];
      if (typeof fieldValue === "string" || typeof fieldValue === "number") {
        normalized.laborEntries[task.id][field] = String(fieldValue);
      }
    }
    if (entry.method === "contract" || entry.method === "daily") normalized.laborEntries[task.id].method = entry.method;
  }

  for (const crop of ["oyster", "milky"]) {
    const dimensions = value.roomDimensions?.[crop];
    if (!dimensions || typeof dimensions !== "object") continue;
    for (const field of ["length", "width", "height"]) {
      const fieldValue = dimensions[field];
      if (typeof fieldValue === "string" || typeof fieldValue === "number") {
        normalized.roomDimensions[crop][field] = String(fieldValue);
      }
    }
  }

  const dimensions = value.roofCalculator.dimensions;
  if (dimensions && typeof dimensions === "object") {
    for (const field of Object.keys(normalized.roofCalculator.dimensions)) {
      const fieldValue = dimensions[field];
      if (typeof fieldValue === "string" || typeof fieldValue === "number") {
        normalized.roofCalculator.dimensions[field] = String(fieldValue);
      }
    }
  }

  const roofOptions = value.roofCalculator.options;
  if (roofOptions && typeof roofOptions === "object") {
    for (const option of roofingOptions) {
      const inputs = roofOptions[option.id];
      if (!inputs || typeof inputs !== "object") continue;
      for (const field of roofCostFields) {
        const fieldValue = field === "installationLabour" ? inputs.installationLabour ?? inputs.installation : inputs[field];
        if (typeof fieldValue === "string" || typeof fieldValue === "number") {
          normalized.roofCalculator.options[option.id][field] = String(fieldValue);
        }
      }
      if (pufThicknesses.includes(Number(inputs.thickness))) {
        normalized.roofCalculator.options[option.id].thickness = String(inputs.thickness);
      }
    }
  }
  const aliases = [
    ["lighting", "electrical-led-lighting"],
    ["protected-panel", "electrical-main-distribution-board"],
    ["roof-puf-roof-panel-30-mm", "roof-puf-panels"],
    ["roof-puf-roof-panel-40-mm", "roof-puf-panels"],
    ["roof-puf-roof-panel-50-mm", "roof-puf-panels"],
    ["roof-puf-roof-panel-60-mm", "roof-puf-panels"],
    ["roof-puf-roof-panel-80-mm", "roof-puf-panels"],
  ];
  for (const [sourceId, targetId] of aliases) {
    if (!allProcurementItems.some((item) => item.id === targetId)) continue;
    const legacyPufThickness = sourceId.match(/^roof-puf-roof-panel-(\d+)-mm$/)?.[1];
    normalized.quotes[targetId] ||= {};
    for (const slot of quoteSlots) {
      if (!normalized.quotes[targetId][slot] && value.quotes?.[sourceId]?.[slot]) {
        const migratedQuote = {
          ...getBlankQuote(),
          ...value.quotes[sourceId][slot],
        };
        if (legacyPufThickness) {
          migratedQuote.specification = `${migratedQuote.specification}${migratedQuote.specification ? " · " : ""}legacy ${legacyPufThickness} mm PUF panel`;
        }
        normalized.quotes[targetId][slot] = migratedQuote;
      }
    }
    if (!legacyPufThickness && normalized.quantities[targetId] === undefined && value.quantities?.[sourceId] !== undefined) {
      const quantity = value.quantities[sourceId];
      if (typeof quantity === "string" || typeof quantity === "number") normalized.quantities[targetId] = String(quantity);
    }
    const sourceInput = value.costInputs?.[sourceId];
    if (!legacyPufThickness && sourceInput && typeof sourceInput === "object") {
      const targetInput = normalized.costInputs[targetId];
      for (const [field, fieldValue] of Object.entries(sourceInput)) {
        if ((targetInput[field] === "" || targetInput[field] === "not-set") &&
            (typeof fieldValue === "string" || typeof fieldValue === "number")) {
          targetInput[field] = String(fieldValue);
        }
      }
    }
  }
  return normalized;
}

function getBlankQuote() {
  return Object.fromEntries(quoteFields.map((field) => [field, field === "status" ? "Not requested" : ""]));
}

function formatCost(value) {
  return value === null || value === undefined ? "Quotation Required" : formatCurrency(value);
}

function formatTotalCost(summary) {
  if (summary?.averageUnitCost === null || summary?.averageUnitCost === undefined) return "Quotation Required";
  return summary.averageTotalCost === null ? "Quantity Required" : formatCurrency(summary.averageTotalCost);
}

function getRoomVolume(dimensions) {
  const values = [dimensions.length, dimensions.width, dimensions.height].map((value) =>
    value === "" ? null : Number(value),
  );
  if (values.some((value) => value === null || !Number.isFinite(value) || value <= 0)) return null;
  return values.reduce((total, value) => total * value, 1);
}

function getWallEstimates(assumptions, brickOptions) {
  return Object.fromEntries(["A", "B", "C"].map((option) => {
    const brick = brickOptions[option];
    return [option, calculateWallQuantities({
      buildingLength: assumptions.buildingLength,
      buildingWidth: assumptions.buildingWidth,
      wallHeight: assumptions.wallHeight,
      openingsArea: assumptions.externalOpeningsArea,
      partitionLength: assumptions.partitionLength,
      partitionHeight: assumptions.partitionHeight,
      partitionOpeningsArea: assumptions.partitionOpeningsArea,
      wallThickness: assumptions.wallThickness,
      partitionThickness: assumptions.partitionThickness,
      brickLength: brick.length,
      brickWidth: brick.width,
      brickHeight: brick.height,
      jointThickness: assumptions.mortarJoint,
      wastagePercent: assumptions.brickWastagePercent,
      cementParts: assumptions.cementParts,
      sandParts: assumptions.sandParts,
      dryFactor: assumptions.mortarDryFactor,
      cementBagVolume: assumptions.cementBagVolume,
    })];
  }));
}

function getCalculatedQuantity(item, state, wallEstimates) {
  const manualValue = getInputNumber(state.quantities[item.id]);
  if (manualValue !== null) return manualValue;
  const optionMatch = item.id.match(/^brick-solid-option-([abc])$/);
  if (optionMatch) return wallEstimates[optionMatch[1].toUpperCase()]?.totalBricks ?? null;
  const selectedWall = wallEstimates[state.constructionAssumptions.brickOption];
  if (!selectedWall) return null;
  if (item.id === "masonry-cement") return selectedWall.externalCementBags;
  if (item.id === "masonry-sand") return selectedWall.externalSandVolume;
  if (item.id === "partition-masonry-cement") return selectedWall.partitionCementBags;
  if (item.id === "partition-masonry-sand") return selectedWall.partitionSandVolume;
  if (item.id === "masonry-mason-labour" || item.id === "masonry-helper-labour" || item.id === "masonry-wall-contract") {
    return selectedWall.partitionNetArea === null ? null : selectedWall.externalNetArea + selectedWall.partitionNetArea;
  }
  if (item.id === "partition-cement-block" || item.id === "partition-installation-labour") {
    return selectedWall.partitionNetArea;
  }
  return null;
}

function getReliableQuoteFieldAverage(quotes, field) {
  const reliableQuotes = Object.values(quotes || {}).filter((quote) => isReliableQuote(quote));
  if (!reliableQuotes.length) return null;
  const specifications = new Set(reliableQuotes.map((quote) => quote.specification.trim().toLocaleLowerCase()));
  if (specifications.size > 1) return null;
  const values = reliableQuotes.map((quote) => quote[field] === "" ? null : Number(quote[field]));
  if (values.some((value) => !Number.isFinite(value) || value < 0)) return null;
  return (Math.min(...values) + Math.max(...values)) / 2;
}

function getActualPurchaseTotal(quotes) {
  const values = Object.values(quotes || {})
    .filter((quote) => quote?.status === "Purchased")
    .map((quote) => quote.purchasedAmount === "" ? null : Number(quote.purchasedAmount))
    .filter((value) => Number.isFinite(value) && value >= 0);
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

function getInputNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getCostRow(item, state, quantityOverride) {
  const input = state.costInputs[item.id];
  const quotes = state.quotes[item.id] || {};
  const quantity = quantityOverride ?? getInputNumber(state.quantities[item.id]);
  const supplierSummary = getItemCostSummary(quotes, quantity);
  const hasMarketReference = Boolean(input.sourceNote?.trim());
  const minimumRate = input.materialSource === "supplier"
    ? supplierSummary.minimum
    : input.materialSource === "market" && hasMarketReference ? getInputNumber(input.marketMinimum) : null;
  const maximumRate = input.materialSource === "supplier"
    ? supplierSummary.maximum
    : input.materialSource === "market" && hasMarketReference ? getInputNumber(input.marketMaximum) : null;
  const transport = input.materialSource === "supplier"
    ? getReliableQuoteFieldAverage(quotes, "transport")
    : getInputNumber(input.transport);
  const tax = input.materialSource === "supplier"
    ? getReliableQuoteFieldAverage(quotes, "gst")
    : getInputNumber(input.tax);
  const installation = input.materialSource === "supplier"
    ? getReliableQuoteFieldAverage(quotes, "installation")
    : getInputNumber(input.installation);
  const calculation = calculateBoqItem({
    quantity,
    minimumRate,
    maximumRate,
    minimumLaborRate: input.laborMinimumRate,
    maximumLaborRate: input.laborMaximumRate,
    tax,
    transport,
    installation,
  });
  return {
    ...calculation,
    quantity,
    supplierSummary,
    actualPurchaseTotal: getActualPurchaseTotal(quotes),
    materialSource: input.materialSource,
    sourceNote: input.sourceNote,
    minimum: minimumRate,
    maximum: maximumRate,
    averageUnitCost: calculation.unitCost,
    averageTotalCost: calculation.materialTotal,
    reliableQuoteCount: input.materialSource === "supplier" ? supplierSummary.reliableQuoteCount : Number(calculation.unitCost !== null),
    status: input.materialSource === "market" ? "Estimated market price"
      : input.materialSource === "supplier" ? supplierSummary.status : "Quotation Required",
  };
}

function getQuoteLandedCost(quote, quantity) {
  if (!isReliableQuote(quote)) return null;
  const values = [quote.quotedUnitPrice, quote.gst, quote.transport, quote.installation]
    .map((value) => value === "" ? null : Number(value));
  const amount = getInputNumber(quantity);
  if (amount === null || amount <= 0 || values.some((value) => value === null || !Number.isFinite(value) || value < 0)) return null;
  return values[0] * amount + values[1] + values[2] + values[3];
}

function getBudgetParent(item) {
  const category = item.category.toLowerCase();
  const name = item.item.toLowerCase();
  if (category.includes("temperature and humidity") || category.includes("ventilation and air")) return existingBudget[1].category;
  if (name.includes("rack") || name.includes("bag support") || item.id === "raised-pallets") return existingBudget[2].category;
  if (name.includes("casing")) return existingBudget[4].category;
  if (name.includes("packing") || name.includes("harvest crate") || name.includes("refrigerator") || name.includes("cooling")) {
    return existingBudget[5].category;
  }
  if (category.includes("mushroom racks and interior") &&
      (name.includes("straw") || name.includes("pasteur") || name.includes("substrate") || name.includes("incubation"))) {
    return existingBudget[3].category;
  }
  return existingBudget[0].category;
}

function isPotentiallyOutsideBaseline(item) {
  const name = item.item.toLowerCase();
  return item.priority.toLowerCase().includes("optional") ||
    name.includes("iot") ||
    name.includes("mobile alert") ||
    name.includes("commercial cooling") ||
    name.includes("split air conditioner") ||
    name.includes("heating equipment") ||
    name.includes("cold room");
}

function getBudgetNote(item) {
  const priority = item.priority.toLowerCase();
  const name = item.item.toLowerCase();
  if (priority.includes("alternative")) return "Mutually exclusive option; price for comparison, then include only the selected system.";
  if (name.includes("insulation") || name.includes("ceiling")) return "Potential overlap with roof/wall assembly; reconcile and count the chosen insulation layer once.";
  if (name.includes("pipe") || name.includes("drain")) return "Coordinate civil/plumbing scope to avoid duplicate route, drain or installation charges.";
  if (name.includes("labour") || name.includes("labor") || name.includes("contract")) return "Choose one scoped labour allowance or activity contract; do not add overlapping rates.";
  if (isPotentiallyOutsideBaseline(item)) return "Potentially outside baseline; approve separately before including.";
  return "Mapped to existing baseline; reconcile once and do not add twice.";
}

function getRowKey(row, index) {
  const parts = [row.category, row.slot, row.item, row.name, row.activity, row.room, row.phase, row.label]
    .filter((part) => part !== undefined && part !== null && part !== "");

  return row.id || (parts.length ? parts.join("::") : index);
}

function DataTable({ columns, rows, caption, className = "" }) {
  return (
    <div className={`table-wrap infra-table-wrap ${className}`.trim()}>
      <table>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>{columns.map((column) => <th scope="col" key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={getRowKey(row, rowIndex)}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row, rowIndex) : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="infra-section-title">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {children && <p className="lead">{children}</p>}
    </div>
  );
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header infra-header">
      <a className="brand" href="index.html" aria-label="GreenSpore Farms home" onClick={closeMenu}>
        <img className="brand-logo" src={logo} alt="GreenSpore Farms emblem" />
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="infra-site-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        Menu
      </button>
      <nav id="infra-site-nav" className={`site-nav${menuOpen ? " open" : ""}`} aria-label="Primary navigation">
        <a href="index.html" onClick={closeMenu}>Home</a>
        <a href="about.html" onClick={closeMenu}>About</a>
        <a href="mushrooms.html" onClick={closeMenu}>Our Mushrooms</a>
        <a href="infrastructure.html" aria-current="page" onClick={closeMenu}>Infrastructure Plan</a>
        <a href="business-plan.html" onClick={closeMenu}>Business Plan</a>
        <a href="about.html#founders" onClick={closeMenu}>Founders</a>
      </nav>
    </header>
  );
}

function PlanNavigation() {
  const links = [
    ["overview", "Overview"],
    ["layout", "Facility layout"],
    ["construction", "Construction"],
    ["equipment", "Equipment"],
    ["investment", "Investment & BOQ"],
    ["production", "Production"],
    ["environment", "Environment"],
    ["roadmap", "Roadmap"],
    ["procurement", "Procurement"],
  ];

  return (
    <nav className="plan-nav" aria-label="Infrastructure plan sections">
      {links.map(([href, label]) => <a href={`#${href}`} key={href}>{label}</a>)}
    </nav>
  );
}

function QuantityField({ item, value, onChange }) {
  return (
    <label className="compact-input">
      <span>{item.unit}</span>
      <input
        type="number"
        min="0.01"
        step="any"
        inputMode="decimal"
        placeholder="Measure"
        aria-label={`Measured quantity for ${item.item}`}
        value={value ?? ""}
        onChange={(event) => onChange(item.id, event.target.value)}
      />
    </label>
  );
}

function RoofCalculator({ calculator, roofShape, onDimensionChange, onOptionChange }) {
  const area = calculateRoofArea(calculator.dimensions);
  const dimensionFields = [
    ["length", "Roof length (ft)"],
    ["width", "Roof width (ft)"],
    ["slopePercent", "Roof slope (%)"],
    ["overhang", "Uniform overhang on each side (ft)"],
  ];

  const comparisonRows = roofingOptions.map((option) => {
    const optionInputs = calculator.options[option.id];
    const estimate = option.id === "puf" && !optionInputs.thickness
      ? null
      : calculateRoofOptionCost(area, optionInputs);
    return {
      option: option.option,
      thickness: option.id === "puf" ? (optionInputs.thickness ? `${optionInputs.thickness} mm` : "Select thickness") : option.thickness,
      roofArea: area === null ? "Enter measured dimensions" : `${area.toFixed(1)} sq ft`,
      materialRange: estimate
        ? `${formatCurrency(estimate.materialMinimum)}–${formatCurrency(estimate.materialMaximum)}`
        : "Quotation Required",
      rate: estimate ? `${formatCurrency(estimate.averageMaterialRate)} / sq ft` : "Quotation Required",
      materialAverage: estimate ? formatCurrency(estimate.averageMaterialCost) : "Quotation Required",
      labour: estimate ? formatCurrency(estimate.fabricationLabour + estimate.installationLabour) : "Quotation Required",
      transport: estimate ? formatCurrency(estimate.transport) : "Quotation Required",
      installation: estimate ? formatCurrency(estimate.installationLabour) : "Quotation Required",
      insulation: estimate ? formatCurrency(estimate.insulation) : "Quotation Required",
      roofAreaQuantity: area === null ? "Quantity Required" : `${area.toFixed(1)} sq ft`,
      totalInstalled: estimate
        ? `${formatCurrency(estimate.totalMinimum)}–${formatCurrency(estimate.totalMaximum)} · average ${formatCurrency(estimate.totalAverage)}`
        : "Quotation Required",
    };
  });

  return (
    <div className="roof-calculator">
      <h3 className="infra-subheading">Roof option cost calculator</h3>
      <p className="note">
        Enter measured building dimensions, roof shape, overhang, slope and written quote values. The footprint is not assumed to cover
        the 800 sq ft plot. For non-rectangular roof forms, use the measured surface area from the approved drawing instead.
      </p>
      <p className="note">These roof options are mutually exclusive estimates. Calculator results are not added to the BOQ automatically; select one approved scope and reconcile its components once before revising the project budget.</p>
      <p className="note">Selected roof arrangement to compare: <strong>{roofShape}</strong>. The entered slope is rise/run for each roof plane.</p>
      <div className="roof-dimensions">
        {dimensionFields.map(([field, label]) => (
          <label key={field}>
            <span>{label}</span>
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={calculator.dimensions[field]}
              onChange={(event) => onDimensionChange(field, event.target.value)}
            />
          </label>
        ))}
      </div>
      <p className="roof-area-result">
        Calculated sloped roof area: <strong>{area === null ? "Enter all four measurements" : `${area.toFixed(1)} sq ft`}</strong>
      </p>
      <div className="roof-option-grid">
        {roofingOptions.map((option) => {
          const inputs = calculator.options[option.id];
          const estimate = option.id === "puf" && !inputs.thickness
            ? null
            : calculateRoofOptionCost(area, inputs);
          return (
            <article className="roof-option-card" key={option.id}>
              <h4>{option.option}</h4>
              {option.id === "puf" && (
                <label>
                  <span>PUF panel thickness</span>
                  <select value={inputs.thickness} onChange={(event) => onOptionChange(option.id, "thickness", event.target.value)}>
                    <option value="">Select thickness</option>
                    {pufThicknesses.map((thickness) => <option value={thickness} key={thickness}>{thickness} mm</option>)}
                  </select>
                </label>
              )}
              <div className="roof-cost-inputs">
                {roofCostFields.map((field) => (
                  <label key={field}>
                      <span>{({
                        materialMinRate: "Material rate minimum (₹ / sq ft)",
                        materialMaxRate: "Material rate maximum (₹ / sq ft)",
                        structuralSupport: "Structural supports / framing (₹)",
                        fabricationLabour: "Fabrication labour (₹)",
                        installationLabour: "Installation labour (₹)",
                        insulation: "Separate insulation (₹; enter 0 only if integrated)",
                        ceiling: "Moisture-resistant ceiling (₹)",
                        fasteners: "Fasteners and roof screws / washers (₹)",
                        flashingGutters: "Ridge, flashing, gutters and downpipes (₹)",
                        transport: "Transportation / unloading (₹)",
                      })[field]}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={inputs[field]}
                      onChange={(event) => onOptionChange(option.id, field, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              <p className="quote-cost">
                <strong>{estimate ? `${formatCurrency(estimate.totalMinimum)}–${formatCurrency(estimate.totalMaximum)}` : "Quotation Required"}</strong>
                <span>{estimate ? `Average installed total: ${formatCurrency(estimate.totalAverage)} · material: ${formatCurrency(estimate.averageMaterialCost)} · labour: ${formatCurrency(estimate.fabricationLabour + estimate.installationLabour)}` : "Complete dimensions, material rate range and every component cost to calculate."}</span>
              </p>
              {option.id === "puf" && <p className="note">Enter 0 for separate insulation only when the panel's integrated insulation is confirmed to cover the design need.</p>}
            </article>
          );
        })}
      </div>
      <DataTable
        caption="Live roof comparison from user-entered measurements and quotations; blanks are never treated as zero."
        columns={[
          { key: "option", label: "Roof option" },
          { key: "thickness", label: "Material thickness" },
          { key: "roofArea", label: "Calculated roof area" },
          { key: "rate", label: "Material average rate / sq ft" },
          { key: "materialRange", label: "Material cost range" },
          { key: "materialAverage", label: "Average material cost" },
          { key: "roofAreaQuantity", label: "Material quantity" },
          { key: "labour", label: "Fabrication + installation labour" },
          { key: "transport", label: "Transportation" },
          { key: "installation", label: "Installation" },
          { key: "insulation", label: "Insulation" },
          { key: "totalInstalled", label: "Total installed cost" },
        ]}
        rows={comparisonRows}
      />
    </div>
  );
}

function QuoteSlotForm({ item, slot, quote, onChange, quantity }) {
  const fields = [
    ["supplier", "Supplier name", "text"],
    ["contact", "Supplier contact", "text"],
    ["model", "Product model", "text"],
    ["specification", "Quoted specification", "text"],
    ["quotedUnitPrice", "Quoted unit price (₹ / unit)", "number"],
    ["gst", "GST amount (₹)", "number"],
    ["transport", "Transport (₹)", "number"],
    ["installation", "Installation (₹)", "number"],
    ["warranty", "Warranty", "text"],
    ["deliveryTerms", "Delivery terms", "text"],
    ["quoteDate", "Quote date", "date"],
    ["validUntil", "Quote valid until", "date"],
    ["selectedPrice", "Final selected price (₹)", "number"],
    ["purchasedAmount", "Actual purchased amount (₹)", "number"],
  ];

  return (
    <fieldset className="quote-slot">
      <legend>{slot.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</legend>
      <label>
        <span>Quote status</span>
        <select value={quote.status} onChange={(event) => onChange(item.id, slot, "status", event.target.value)}>
          {quoteStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
        </select>
      </label>
      <div className="quote-fields">
        {fields.map(([field, label, type]) => (
          <label key={field}>
            <span>{label}</span>
            <input
              type={type}
              min={type === "number" ? "0" : undefined}
              step={type === "number" ? "any" : undefined}
              inputMode={type === "number" ? "decimal" : undefined}
              value={quote[field]}
              onChange={(event) => onChange(item.id, slot, field, event.target.value)}
            />
          </label>
        ))}
      </div>
      <label>
        <span>Supplier comparison / notes</span>
        <textarea value={quote.comparison} rows="2" onChange={(event) => onChange(item.id, slot, "comparison", event.target.value)} />
      </label>
      <p className="quote-cost">
        <strong>Landed quote total: {formatCost(getQuoteLandedCost(quote, quantity))}</strong>
        <span>Requires a reliable quote, measured quantity, GST amount, transport and installation. Delivery terms are recorded separately.</span>
      </p>
    </fieldset>
  );
}

function InlineNumberField({ value, label, onChange, min = "0", step = "any" }) {
  return (
    <label className="compact-input">
      <span>{label}</span>
      <input type="number" min={min} step={step} inputMode="decimal" aria-label={label}
        value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ConstructionAssumptionsPanel({ assumptions, brickOptions, wallResults, onAssumptionChange, onBrickChange }) {
  const dimensionFields = [
    ["plotWidth", "Plot width (ft)"], ["plotLength", "Plot length (ft)"],
    ["frontSetback", "Front setback (ft)"], ["rearSetback", "Rear setback (ft)"],
    ["leftSetback", "Left setback (ft)"], ["rightSetback", "Right setback (ft)"],
    ["buildingWidth", "Building width (ft)"], ["buildingLength", "Building length (ft)"],
    ["wallHeight", "Proposed wall height (ft)"], ["wallThickness", "External wall thickness (ft)"],
    ["partitionThickness", "Internal partition thickness (ft)"],
  ];
  const wallFields = [
    ["externalOpeningsArea", "External door/window openings (sq ft)"],
    ["partitionLength", "Total internal partition length (ft)"],
    ["partitionHeight", "Internal partition height (ft)"],
    ["partitionOpeningsArea", "Internal partition openings (sq ft)"],
    ["brickWastagePercent", "Brick wastage allowance (%)"],
    ["mortarJoint", "Mortar joint thickness (in)"],
    ["cementParts", "Cement parts in mortar mix"],
    ["sandParts", "Sand parts in mortar mix"],
    ["mortarDryFactor", "Mortar dry-volume factor"],
    ["cementBagVolume", "Cement bag volume (cu ft / bag)"],
  ];
  return (
    <div className="assumptions-panel">
      <h3 className="infra-subheading">Editable construction assumptions</h3>
      <p className="note">
        Plot defaults reflect the stated 20 ft × 40 ft site; the building footprint and setbacks are separate and intentionally blank.
        No wall, roof or material quantity is inferred from plot area.
      </p>
      <div className="assumption-grid">
        {dimensionFields.map(([field, label]) => (
          <label key={field}><span>{label}</span><input type="number" min="0" step="any"
            value={assumptions[field]} onChange={(event) => onAssumptionChange(field, event.target.value)} /></label>
        ))}
        <label>
          <span>Preferred wall type</span>
          <select value={assumptions.wallType} onChange={(event) => onAssumptionChange("wallType", event.target.value)}>
            {["Solid cement bricks", "Hollow concrete blocks", "Other locally suitable blocks"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Preferred roof option</span>
          <select value={assumptions.roofSelection} onChange={(event) => onAssumptionChange("roofSelection", event.target.value)}>
            {["Undecided", ...roofingOptions.map((option) => option.option)].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Roof shape to compare</span>
          <select value={assumptions.roofShape} onChange={(event) => onAssumptionChange("roofShape", event.target.value)}>
            {["Undecided", "Gable", "Single-slope"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <h4>Wall quantity inputs · external walls and partitions are calculated separately</h4>
      <div className="assumption-grid">
        {wallFields.map(([field, label]) => (
          <label key={field}><span>{label}</span><input type="number" min="0" step="any"
            value={assumptions[field]} onChange={(event) => onAssumptionChange(field, event.target.value)} /></label>
        ))}
      </div>
      <div className="brick-options">
        {["A", "B", "C"].map((option) => {
          const brick = brickOptions[option];
          const result = wallResults[option];
          const length = getInputNumber(brick.length);
          const height = getInputNumber(brick.height);
          const joint = getInputNumber(assumptions.mortarJoint);
          const piecesPerSqFt = length && height && joint !== null
            ? 144 / ((length + joint) * (height + joint))
            : null;
          return (
            <article className="brick-option-card" key={option}>
              <h4>Solid cement brick · local option {option}</h4>
              <label className="brick-option-select">
                <input type="radio" name="brickOption" checked={assumptions.brickOption === option}
                  onChange={() => onAssumptionChange("brickOption", option)} />
                Use as selected wall option
              </label>
              <div className="assumption-grid">
                {[
                  ["length", "Length (in)"], ["width", "Width (in)"], ["height", "Height (in)"],
                  ["weight", "Weight (kg / piece, if supplied)"], ["strength", "Manufacturer strength specification"],
                ].map(([field, label]) => (
                  <label key={field}><span>{label}</span><input type={field === "strength" ? "text" : "number"}
                    min={field === "strength" ? undefined : "0"} step="any" value={brick[field]}
                    onChange={(event) => onBrickChange(option, field, event.target.value)} /></label>
                ))}
              </div>
              <p>Pieces / sq ft: <strong>{piecesPerSqFt === null ? "Enter size and joint" : piecesPerSqFt.toFixed(2)}</strong></p>
              <p>External bricks: <strong>{result?.externalBricks ?? "Enter dimensions and openings"}</strong></p>
              <p>Internal partition bricks: <strong>{result?.partitionBricks ?? "Enter partition dimensions"}</strong></p>
              <p>Total bricks with entered wastage: <strong>{result?.totalBricks ?? "Quotation Required"}</strong></p>
              <p>External wall mortar: <strong>{!result || result.externalMortarVolume === null ? "Quotation Required" : `${result.externalMortarVolume.toFixed(2)} cu ft`}</strong></p>
              <p>Partition mortar: <strong>{!result || result.partitionMortarVolume === null ? "Quotation Required" : `${result.partitionMortarVolume.toFixed(2)} cu ft`}</strong></p>
              <p>Total mortar: <strong>{!result || result.mortarVolume === null ? "Quotation Required" : `${result.mortarVolume.toFixed(2)} cu ft`}</strong></p>
            </article>
          );
        })}
      </div>
      <p className="note">
        Brick size, weight, strength, wastage, openings, mortar joint and mix are user-entered. External-wall and partition cement/sand
        quantities are calculated independently; each remains unavailable until its own dimensions, thickness and mortar inputs are complete.
      </p>
    </div>
  );
}

function CostExplorerTable({ items, state, quantityForItem, onQuantityChange, onCostInputChange }) {
  const rows = items.map((item) => {
    const quantity = quantityForItem(item);
    const summary = getCostRow(item, state, quantity);
    const input = state.costInputs[item.id];
    return {
      ...item,
      quantityValue: quantity,
      summary,
      marketInput: (
        <div className="range-inputs">
          <InlineNumberField value={input.marketMinimum} label={`${item.item} estimated market minimum per ${item.unit}`}
            onChange={(value) => onCostInputChange(item.id, "marketMinimum", value)} />
          <InlineNumberField value={input.marketMaximum} label={`${item.item} estimated market maximum per ${item.unit}`}
            onChange={(value) => onCostInputChange(item.id, "marketMaximum", value)} />
        </div>
      ),
      labourInput: (
        <div className="range-inputs">
          <InlineNumberField value={input.laborMinimumRate} label={`${item.item} local worker minimum labour rate per ${item.unit}`}
            onChange={(value) => onCostInputChange(item.id, "laborMinimumRate", value)} />
          <InlineNumberField value={input.laborMaximumRate} label={`${item.item} local worker maximum labour rate per ${item.unit}`}
            onChange={(value) => onCostInputChange(item.id, "laborMaximumRate", value)} />
        </div>
      ),
      sourceInput: (
        <label className="compact-input">
          <span>Price source</span>
          <select value={input.materialSource} onChange={(event) => onCostInputChange(item.id, "materialSource", event.target.value)}>
            <option value="not-set">Not set</option>
            <option value="market">Estimated market price</option>
            <option value="supplier">Supplier quotation</option>
          </select>
        </label>
      ),
      taxInput: input.materialSource === "supplier"
        ? formatCost(summary.tax)
        : <InlineNumberField value={input.tax} label={`${item.item} tax / GST amount`}
          onChange={(value) => onCostInputChange(item.id, "tax", value)} />,
      transportInput: input.materialSource === "supplier"
        ? formatCost(summary.transport)
        : <InlineNumberField value={input.transport} label={`${item.item} transportation cost`}
          onChange={(value) => onCostInputChange(item.id, "transport", value)} />,
      installationInput: input.materialSource === "supplier"
        ? formatCost(summary.installation)
        : <InlineNumberField value={input.installation} label={`${item.item} installation cost`}
          onChange={(value) => onCostInputChange(item.id, "installation", value)} />,
      sourceNoteInput: (
        <label className="compact-input">
          <span>Rate / quote reference</span>
          <input value={input.sourceNote} onChange={(event) => onCostInputChange(item.id, "sourceNote", event.target.value)} />
        </label>
      ),
    };
  });

  return (
    <DataTable
      caption="Blank values remain Quotation Required. Enter 0 only when a quote confirms a component is not applicable or included elsewhere."
      className="cost-explorer-table"
      rows={rows}
      columns={[
        { key: "item", label: "Item" },
        { key: "specification", label: "Specification" },
        { key: "unit", label: "Unit" },
        { key: "quantityValue", label: "Quantity", render: (item) => (
          <div>
            <QuantityField item={item} value={item.quantityValue ?? ""} onChange={onQuantityChange} />
            <small>{item.quantityBasis}</small>
          </div>
        ) },
        { key: "sourceInput", label: "Rate source" },
        { key: "minimumRate", label: "Minimum unit cost", render: (item) => formatCost(item.summary.minimumRate) },
        { key: "maximumRate", label: "Maximum unit cost", render: (item) => formatCost(item.summary.maximumRate) },
        { key: "unitCost", label: "Average unit cost", render: (item) => formatCost(item.summary.unitCost) },
        { key: "marketInput", label: "Editable estimated market range" },
        { key: "supplier", label: "Supplier quote range / average", render: (item) => item.summary.supplierSummary.reliableQuoteCount
          ? `${formatCurrency(item.summary.supplierSummary.minimum)}–${formatCurrency(item.summary.supplierSummary.maximum)} · avg ${formatCurrency(item.summary.supplierSummary.averageUnitCost)}`
          : item.summary.supplierSummary.status },
        { key: "materialTotal", label: "Material total / average total", render: (item) => formatCost(item.summary.materialTotal) },
        { key: "labourInput", label: "Editable local worker rate range" },
        { key: "laborTotal", label: "Labour total", render: (item) => formatCost(item.summary.laborTotal) },
        { key: "taxInput", label: "Tax / GST" },
        { key: "transportInput", label: "Transportation" },
        { key: "installationInput", label: "Installation" },
        { key: "finalAverageTotal", label: "Final average total", render: (item) => formatCost(item.summary.finalAverageTotal) },
        { key: "actualPurchaseTotal", label: "Actual purchase cost", render: (item) => formatCost(item.summary.actualPurchaseTotal) },
        { key: "sourceNoteInput", label: "Source / worker / supplier notes" },
        { key: "priority", label: "Scope / selection status" },
      ]}
    />
  );
}

function LocalLabourEstimator({ rates, entries, onRateChange, onEntryChange }) {
  const taskAmounts = labourTasks.map((task) => {
    const entry = entries[task.id];
    const rate = rates[task.trade];
    return calculateDailyLabour({
      ...entry,
      minimumRate: rate.minimumRate,
      maximumRate: rate.maximumRate,
    });
  });
  const complete = taskAmounts.every((amount) => amount !== null);
  const total = complete ? taskAmounts.reduce((sum, amount) => sum + amount, 0) : null;

  return (
    <div className="labor-estimator">
      <h3 className="infra-subheading">Local labour cost estimator</h3>
      <p className="note">
        Preliminary regional reference ranges supplied for planning only; not confirmed Kanipakam wages. Edit to negotiated local rates.
        The daily-wage or contract method is exclusive for each task.
      </p>
      <DataTable
        caption="Editable reference wages (₹ per worker per day)"
        rows={labourTrades.map((trade) => ({ ...trade, rateFields: (
          <div className="range-inputs">
            <InlineNumberField value={rates[trade.id].minimumRate} label={`${trade.label} minimum daily wage`}
              onChange={(value) => onRateChange(trade.id, "minimumRate", value)} />
            <InlineNumberField value={rates[trade.id].maximumRate} label={`${trade.label} maximum daily wage`}
              onChange={(value) => onRateChange(trade.id, "maximumRate", value)} />
          </div>
        ) }))}
        columns={[
          { key: "label", label: "Trade" },
          { key: "rateFields", label: "Editable reference range (₹ / day)" },
        ]}
      />
      <DataTable
        caption="Daily wage total = average rate × workers × working days. Contract mode uses the fixed total or contract rate × quantity instead."
        rows={labourTasks.map((task, index) => {
          const entry = entries[task.id];
          return {
            ...task,
            methodInput: (
              <label className="compact-input">
                <span>Cost method</span>
                <select value={entry.method} onChange={(event) => onEntryChange(task.id, "method", event.target.value)}>
                  <option value="daily">Daily wages</option>
                  <option value="contract">Activity / sq ft contract</option>
                </select>
              </label>
            ),
            dailyInputs: entry.method === "daily" ? (
              <div className="range-inputs">
                <InlineNumberField value={entry.workers} label={`${task.label} worker count`}
                  onChange={(value) => onEntryChange(task.id, "workers", value)} />
                <InlineNumberField value={entry.days} label={`${task.label} working days`}
                  onChange={(value) => onEntryChange(task.id, "days", value)} />
              </div>
            ) : "Not used for contract method",
            contractInputs: entry.method === "contract" ? (
              <div className="range-inputs">
                <InlineNumberField value={entry.contractRate} label={`${task.label} contract rate per unit`}
                  onChange={(value) => onEntryChange(task.id, "contractRate", value)} />
                <InlineNumberField value={entry.contractQuantity} label={`${task.label} contracted quantity`}
                  onChange={(value) => onEntryChange(task.id, "contractQuantity", value)} />
                <InlineNumberField value={entry.contractAmount} label={`${task.label} fixed activity contract total`}
                  onChange={(value) => onEntryChange(task.id, "contractAmount", value)} />
              </div>
            ) : "Not used for daily method",
            total: taskAmounts[index] === null ? "Quotation Required" : formatCurrency(taskAmounts[index]),
          };
        })}
        columns={[
          { key: "label", label: "Work activity" },
          { key: "methodInput", label: "Pricing method" },
          { key: "dailyInputs", label: "Daily wage inputs" },
          { key: "contractInputs", label: "Contract inputs" },
          { key: "total", label: "Calculated labour cost" },
        ]}
      />
      <p className="labor-total">
        Complete labour task estimate: <strong>{total === null ? "Quotation Required" : formatCurrency(total)}</strong>
        {!complete && <span> · {taskAmounts.filter((amount) => amount !== null).length} of {taskAmounts.length} activities entered</span>}
      </p>
    </div>
  );
}

function InfrastructurePage() {
  const [procurementState, setProcurementState] = useState(createEmptyProcurementState);
  const [storageReady, setStorageReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState("Loading locally saved quote data…");
  const [fileMessage, setFileMessage] = useState("");
  const [selectedProcurementId, setSelectedProcurementId] = useState(allProcurementItems[0].id);
  const importFileRef = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PROCUREMENT_STORAGE_KEY);
      if (saved) setProcurementState(normalizeProcurementState(JSON.parse(saved)));
      setStorageReady(true);
      setStorageMessage(saved ? "Saved in this browser." : "No local quote data saved yet.");
    } catch (error) {
      setStorageMessage(`Local quote data could not be loaded: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(PROCUREMENT_STORAGE_KEY, JSON.stringify(procurementState));
      setStorageMessage("Saved in this browser.");
    } catch (error) {
      setStorageReady(false);
      setStorageMessage(`Changes could not be saved in this browser: ${error.message}`);
    }
  }, [procurementState, storageReady]);

  const updateQuantity = (itemId, value) => {
    setProcurementState((current) => ({
      ...current,
      quantities: { ...current.quantities, [itemId]: value },
    }));
  };
  const updateCostInput = (itemId, field, value) => {
    setProcurementState((current) => ({
      ...current,
      costInputs: {
        ...current.costInputs,
        [itemId]: { ...current.costInputs[itemId], [field]: value },
      },
    }));
  };
  const updateConstructionAssumption = (field, value) => {
    setProcurementState((current) => ({
      ...current,
      constructionAssumptions: { ...current.constructionAssumptions, [field]: value },
    }));
  };
  const updateBrickOption = (option, field, value) => {
    setProcurementState((current) => ({
      ...current,
      brickOptions: {
        ...current.brickOptions,
        [option]: { ...current.brickOptions[option], [field]: value },
      },
    }));
  };
  const updateLaborRate = (trade, field, value) => {
    setProcurementState((current) => ({
      ...current,
      laborRates: {
        ...current.laborRates,
        [trade]: { ...current.laborRates[trade], [field]: value },
      },
    }));
  };
  const updateLaborEntry = (taskId, field, value) => {
    setProcurementState((current) => ({
      ...current,
      laborEntries: {
        ...current.laborEntries,
        [taskId]: { ...current.laborEntries[taskId], [field]: value },
      },
    }));
  };
  const updateQuote = (itemId, slot, field, value) => {
    setProcurementState((current) => ({
      ...current,
      quotes: {
        ...current.quotes,
        [itemId]: {
          ...current.quotes[itemId],
          [slot]: { ...getBlankQuote(), ...current.quotes[itemId]?.[slot], [field]: value },
        },
      },
    }));
  };
  const updateRoofDimension = (field, value) => {
    setProcurementState((current) => ({
      ...current,
      roofCalculator: {
        ...current.roofCalculator,
        dimensions: { ...current.roofCalculator.dimensions, [field]: value },
      },
    }));
  };
  const updateRoofOption = (optionId, field, value) => {
    setProcurementState((current) => ({
      ...current,
      roofCalculator: {
        ...current.roofCalculator,
        options: {
          ...current.roofCalculator.options,
          [optionId]: { ...current.roofCalculator.options[optionId], [field]: value },
        },
      },
    }));
  };
  const updateRoomDimension = (crop, field, value) => {
    setProcurementState((current) => ({
      ...current,
      roomDimensions: {
        ...current.roomDimensions,
        [crop]: { ...current.roomDimensions[crop], [field]: value },
      },
    }));
  };
  const exportQuoteFile = () => {
    const file = new Blob([JSON.stringify(procurementState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "greenspore-procurement-quotes.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFileMessage("Quote tracker exported. Share this JSON file with the other founders.");
  };
  const importQuoteFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = normalizeProcurementState(JSON.parse(await file.text()));
      setProcurementState(imported);
      setStorageReady(true);
      setStorageMessage("Imported quote file and saved it in this browser.");
      setFileMessage("Quote tracker imported. Existing local tracker data has been replaced by this file.");
    } catch (error) {
      setFileMessage(`Import failed: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };

  const selectedProcurementItem = allProcurementItems.find((item) => item.id === selectedProcurementId) || allProcurementItems[0];
  const selectedQuotes = procurementState.quotes[selectedProcurementItem.id] || {};
  const selectedCost = getCostRow(
    selectedProcurementItem,
    procurementState,
    getInputNumber(procurementState.quantities[selectedProcurementItem.id]),
  );
  const costSummaryFor = (itemId) => getItemCostSummary(procurementState.quotes[itemId], procurementState.quantities[itemId]);
  const wallEstimates = getWallEstimates(procurementState.constructionAssumptions, procurementState.brickOptions);
  const quantityForItem = (item) => getCalculatedQuantity(item, procurementState, wallEstimates);
  const boqRows = allProcurementItems.map((item) => {
    const quantity = quantityForItem(item);
    const cost = getCostRow(item, procurementState, quantity);
    return {
      ...item,
      cost,
      summary: {
        ...cost.supplierSummary,
        minimum: cost.minimumRate,
        maximum: cost.maximumRate,
        averageUnitCost: cost.unitCost,
        averageTotalCost: cost.finalAverageTotal,
      },
      priced: cost.finalAverageTotal !== null,
      budgetParent: getBudgetParent(item),
      budgetNote: getBudgetNote(item),
    };
  });
  const baselineReconciliationRows = existingBudget.map((budget) => {
    const items = boqRows.filter((item) => item.budgetParent === budget.category);
    const priced = items.filter((item) => item.priced);
    return {
      category: budget.category,
      baseline: `${formatCurrency(budget.low)}–${formatCurrency(budget.high)}`,
      itemizedRows: `${priced.length} of ${items.length} have complete quantities, source-backed rates and cost components`,
      status: "Mapped to preserved baseline; select alternatives and reconcile overlaps before any revised total.",
    };
  });
  const outsideBaselineRows = boqRows.filter(isPotentiallyOutsideBaseline).map((item) => ({
    item: item.item,
    category: item.category,
    status: "Potentially outside current budget; separately approve scope and funding.",
  }));
  const procurementByCategory = allProcurementItems.reduce((groups, item) => {
    groups[item.category] ||= [];
    groups[item.category].push(item);
    return groups;
  }, {});
  const actualExpenditure = boqRows.reduce((total, item) => total + (item.cost.actualPurchaseTotal ?? 0), 0);
  const actualPurchaseCount = boqRows.filter((item) => item.cost.actualPurchaseTotal !== null).length;
  const constructionSummaryRows = constructionGroups.map((group) => {
    const items = boqRows.filter((item) => item.category === group.title);
    const actualItems = items.filter((item) => item.cost.actualPurchaseTotal !== null);
    const completeEstimates = items.filter((item) => item.cost.finalAverageTotal !== null);
    const categoryActual = actualItems.reduce((total, item) => total + item.cost.actualPurchaseTotal, 0);
    return {
      category: group.title,
      itemizedProgress: `${completeEstimates.length} of ${items.length} line items have complete cost inputs`,
      estimate: "Quotation Required",
      actual: actualItems.length ? formatCurrency(categoryActual) : "No purchases recorded",
      actualItems: `${actualItems.length} purchased line items recorded`,
    };
  });
  const roofArea = calculateRoofArea(procurementState.roofCalculator.dimensions);
  const roofComparisonRows = roofingOptions.map((option) => {
    const optionInputs = procurementState.roofCalculator.options[option.id];
    const estimate = option.id === "puf" && !optionInputs.thickness
      ? null
      : calculateRoofOptionCost(roofArea, optionInputs);
    return {
      ...option,
      initialCost: estimate ? `${formatCurrency(estimate.totalMinimum)}–${formatCurrency(estimate.totalMaximum)} · avg ${formatCurrency(estimate.totalAverage)}` : "Quotation Required",
    };
  });
  const scheduleWeeks = Math.max(...roadmap.slice(0, 8).map((phase) => phase.start + phase.span));

  return (
    <>
      <SiteHeader />
      <PlanNavigation />

      <main className="infrastructure-page">
        <section className="infra-hero">
          <div className="infra-hero-copy">
            <p className="eyebrow">GreenSpore Farms · Preliminary project plan</p>
            <h1>Infrastructure &amp; Facility Development Plan</h1>
            <p className="infra-hero-lead">
              A review-ready concept for a proposed Oyster and Milky mushroom pilot near Kanipakam.
              Scope, costs and technical decisions remain subject to site checks, professional review and written quotes.
            </p>
            <div className="infra-hero-actions">
              <a className="button button-gold" href="#investment">Review investment baseline</a>
              <button className="button button-outline" type="button" onClick={() => window.print()}>Print / Save as PDF</button>
            </div>
          </div>
          <aside className="infra-status-card" aria-label="Planning status">
            <span className="status-pill">Concept · Not for construction</span>
            <strong>800 sq ft</strong>
            <span>20 ft × 40 ft plot · room plan requires specialist review</span>
            <strong>100 kg</strong>
            <span>Proposed target across multiple flushes, not a single harvest</span>
          </aside>
        </section>

        <section id="overview" className="infra-section">
          <SectionTitle eyebrow="01 · Project overview" title="Validate the facility before committing capital.">
            The plan separates operational zones and provides a structured checklist for design, procurement and commissioning.
            Bag capacity, room controls and construction details are not yet verified.
          </SectionTitle>
          <div className="infra-fact-grid">
            <article className="infra-fact-card"><span>Location</span><strong>{projectDetails.location}</strong></article>
            <article className="infra-fact-card"><span>Plot</span><strong>20 ft × 40 ft · 800 sq ft</strong></article>
            <article className="infra-fact-card"><span>Initial varieties</span><strong>Oyster + Milky</strong></article>
            <article className="infra-fact-card"><span>Primary substrate</span><strong>Paddy straw</strong></article>
          </div>
          <div className="status-legend">
            <div><span className="legend-dot proposed"></span><strong>Proposed design</strong><span>Room zoning and workflow for discussion.</span></div>
            <div><span className="legend-dot assumption"></span><strong>Planning assumption</strong><span>Unverified estimate; confirm locally.</span></div>
            <div><span className="legend-dot pending"></span><strong>Pending validation</strong><span>Requires a site visit, specialist review or written quote.</span></div>
          </div>
        </section>

        <section id="layout" className="infra-section infra-section-muted">
          <SectionTitle eyebrow="02 · Site layout" title="A 20 ft × 40 ft concept with clean and raw zones.">
            The area schedule below totals exactly 800 sq ft including the service passage. Dimensions are preliminary allocations,
            not certified internal dimensions or a construction drawing.
          </SectionTitle>
          <div className="layout-grid">
            <figure className="layout-figure">
              <img src={layoutImage} alt="Conceptual 20 by 40 foot facility plan showing separate straw, preparation, incubation, fruiting, casing, utility, packing and passage zones" />
              <figcaption>
                Access ticks and ventilation candidates are indicative. Door swings, drain locations, discharge route and final room dimensions
                must be coordinated with a civil engineer, MEP professional and mushroom specialist.
              </figcaption>
            </figure>
            <div className="layout-summary">
              <div className="layout-total"><span>Scheduled area</span><strong>{roomArea} / {projectDetails.plotArea} sq ft</strong></div>
              <p className={roomArea === projectDetails.plotArea ? "validation-pass" : "validation-warning"}>
                {roomArea === projectDetails.plotArea
                  ? "Room and passage allocations add up to the stated plot area."
                  : "Area schedule does not match the stated plot. Revise before design review."}
              </p>
              <p className="note">
                Proposed flow: dry straw store → substrate preparation / pasteurisation → clean inoculation →
                separate crop incubation and fruiting → harvest → packing and dispatch. Avoid cross-traffic between raw and clean zones.
              </p>
              <div className="layout-checks">
                <h3>Before layout sign-off</h3>
                <ul>
                  <li>Confirm door positions, swing, emergency access and loading route.</li>
                  <li>Coordinate ventilation openings with separate crop-room controls.</li>
                  <li>Have a qualified professional locate drains, falls and wastewater discharge.</li>
                  <li>Verify washable finishes and moisture separation at every room junction.</li>
                </ul>
              </div>
            </div>
          </div>
          <DataTable
            caption="Preliminary room-wise area schedule; verify all dimensions on site."
            columns={[
              { key: "room", label: "Room / zone" },
              { key: "length", label: "Length (ft)" },
              { key: "width", label: "Width (ft)" },
              { key: "area", label: "Area (sq ft)" },
              { key: "flow", label: "Workflow zone" },
            ]}
            rows={layoutRooms}
          />
          <p className="note">
            Drainage is essential for cleaning and avoiding standing water, but exact slopes, drain count, traps and wastewater discharge
            are site- and code-dependent. Obtain local civil / plumbing design review before construction.
          </p>
        </section>

        <section id="construction" className="infra-section">
          <SectionTitle eyebrow="03 · Civil and construction scope" title="ECONOMICAL SHED CONSTRUCTION &amp; MUSHROOM-FARM INFRASTRUCTURE">
            A 20 ft × 40 ft Kanipakam-area plot with locally available cement-brick masonry and negotiated local labour as the starting
            approach. Building footprint, openings, roof geometry, material quantities and prices stay editable and unassumed until measured.
          </SectionTitle>
          <p className="note">All twelve cost categories are collapsed by default. Market rates, supplier quotations, local worker estimates and actual purchases are kept distinct. The existing ₹6.08–₹11.70 lakh baseline is preserved and detailed rows are not added to it automatically.</p>
          <div className="accordion-stack">
            {constructionGroups.map((group, index) => (
              <details className="plan-accordion" key={group.title}>
                <summary>{group.title}<span>{group.items.length} itemized lines · rates and unmeasured quantities remain pending</span></summary>
                {index === 1 && (
                  <ConstructionAssumptionsPanel
                    assumptions={procurementState.constructionAssumptions}
                    brickOptions={procurementState.brickOptions}
                    wallResults={wallEstimates}
                    onAssumptionChange={updateConstructionAssumption}
                    onBrickChange={updateBrickOption}
                  />
                )}
                {index === 2 && (
                  <>
                    <RoofCalculator
                      calculator={procurementState.roofCalculator}
                      roofShape={procurementState.constructionAssumptions.roofShape}
                      onDimensionChange={updateRoofDimension}
                      onOptionChange={updateRoofOption}
                    />
                    <DataTable
                      caption="Four roof systems only. Service life is not estimated; use manufacturer evidence for the selected product."
                      rows={roofComparisonRows}
                      columns={[
                        { key: "option", label: "Roof system / initial installed cost" },
                        { key: "initialCost", label: "Calculated installed range / average" },
                        { key: "thermal", label: "Heat resistance" },
                        { key: "condensation", label: "Condensation control" },
                        { key: "leakage", label: "Rainwater leakage risk" },
                        { key: "corrosion", label: "Corrosion protection" },
                        { key: "noise", label: "Rain noise" },
                        { key: "maintenance", label: "Maintenance" },
                        { key: "lifespan", label: "Expected service life evidence" },
                      ]}
                    />
                    <div className="reconciliation-note">
                      <h3>Economical comparison starting point · not a cost claim</h3>
                      <p>First price Option 2—coated Galvalume sheets with one coordinated insulation and moisture-resistant ceiling assembly—against Option 3 PUF panels. The separate-layer approach is a practical local-construction candidate, not an asserted lowest-cost choice. Select only after comparable delivered and installed quotations, thermal/condensation review and product documentation.</p>
                    </div>
                    <p className="note">Roof systems are mutually exclusive. The roof calculator is a comparison aid and is not included in BOQ totals until one option and its components are reconciled. Never specify asbestos-containing roofing.</p>
                  </>
                )}
                {index === 3 && (
                  <>
                    <DataTable
                      caption="Compare performance and cost separately by room; do not count roof insulation again as ceiling insulation."
                      rows={[
                        { room: "Dry straw storage", requirement: "Prioritize dry protection, condensation control and ventilation; add insulation only if site heat/moisture assessment justifies it." },
                        { room: "Incubation rooms", requirement: "Coordinate insulated roof/walls, sealed penetrations and temperature stability to the selected strain protocol." },
                        { room: "Oyster fruiting room", requirement: "Design insulation, vapour control and washable surfaces around humidity, fresh-air and condensation loads." },
                        { room: "Milky fruiting room", requirement: "Assess independently from Oyster; confirm casing and washdown implications with the cultivation specialist." },
                        { room: "Packing area", requirement: "Use a cleanable moisture-resistant ceiling; size thermal insulation only for verified comfort/product needs." },
                      ]}
                      columns={[
                        { key: "room", label: "Room" },
                        { key: "requirement", label: "Performance / costing requirement" },
                      ]}
                    />
                    <DataTable
                      rows={ceilingInsulationNotes}
                      columns={[
                        { key: "type", label: "Insulation location" },
                        { key: "description", label: "Coordination rule" },
                      ]}
                    />
                  </>
                )}
                <CostExplorerTable
                  items={group.items}
                  state={procurementState}
                  quantityForItem={quantityForItem}
                  onQuantityChange={updateQuantity}
                  onCostInputChange={updateCostInput}
                />
              </details>
            ))}
          </div>
          <LocalLabourEstimator
            rates={procurementState.laborRates}
            entries={procurementState.laborEntries}
            onRateChange={updateLaborRate}
            onEntryChange={updateLaborEntry}
          />
          <p className="note">Do not calculate footing dimensions, reinforcement quantities, electrical ratings or cable sizes here. Use measured site data, approved drawings and qualified engineering / electrician review.</p>
        </section>

        <section id="equipment" className="infra-section infra-section-muted">
          <SectionTitle eyebrow="04 · Equipment and machinery" title="Specify equipment after process and room validation.">
            The former broad equipment entries are expanded into environmental-system comparisons and a room-by-room equipment schedule
            below. Counts, capacities, unit prices and installation charges remain design- or quotation-required until validated.
          </SectionTitle>
          <div className="equipment-notice">
            <strong>Cooling is not assumed as mandatory.</strong>
            <span>Decide only after choosing the Oyster strain and measuring hot-season room conditions. A major cold room is excluded from the base budget.</span>
          </div>
          <h2 className="infra-subheading">Mushroom Room Temperature, Humidity &amp; Air Management System</h2>
          <p className="note">
            Oyster and Milky rooms are treated separately. Equipment capacities, counts, unit costs and installation charges remain
            quotation/design required until room volume, crop load, strain guidance, water quality and electrical loads are confirmed.
          </p>
          <div className="room-volume-grid">
            {[
              ["oyster", "Oyster fruiting room"],
              ["milky", "Milky fruiting room"],
            ].map(([crop, label]) => {
              const dimensions = procurementState.roomDimensions[crop];
              const volume = getRoomVolume(dimensions);
              return (
                <article className="room-volume-card" key={crop}>
                  <h3>{label} · preliminary volume input</h3>
                  <div className="roof-dimensions">
                    {["length", "width", "height"].map((field) => (
                      <label key={field}>
                        <span>{field[0].toUpperCase() + field.slice(1)} (ft)</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          value={dimensions[field]}
                          onChange={(event) => updateRoomDimension(crop, field, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                  <p>Room volume: <strong>{volume === null ? "Enter measured dimensions" : `${volume.toFixed(1)} cu ft`}</strong></p>
                  <p className="note">Volume alone is not a cooling or ventilation calculation; insulation, roof heat gain, outdoor design temperature, fresh air, occupancy/equipment heat and crop targets are still required.</p>
                </article>
              );
            })}
          </div>
          <h3 className="infra-subheading">A. Humidification equipment · Oyster fruiting room</h3>
          <DataTable
            columns={[
              { key: "option", label: "Option" },
              { key: "principle", label: "Operating principle" },
              { key: "application", label: "Application" },
              { key: "capacity", label: "Capacity" },
              { key: "water", label: "Water consumption" },
              { key: "power", label: "Power consumption" },
              { key: "quantity", label: "Units / count" },
              { key: "unitCost", label: "Average unit cost" },
              { key: "averageTotal", label: "Average total" },
              { key: "installation", label: "Installation" },
              { key: "maintenance", label: "Maintenance" },
              { key: "advantages", label: "Advantages" },
              { key: "disadvantages", label: "Disadvantages" },
            ]}
            rows={humidificationOptions.map((option) => {
              const summary = costSummaryFor(`humidifier-${option.id}`);
              return { ...option, unitCost: formatCost(summary.averageUnitCost), averageTotal: formatTotalCost(summary) };
            })}
            caption="Compare options; do not buy until Oyster room volume, water quality and crop guidance are validated."
          />
          <h3 className="infra-subheading">Humidification equipment · Milky fruiting room</h3>
          <DataTable
            columns={[
              { key: "option", label: "Option" },
              { key: "principle", label: "Operating principle" },
              { key: "application", label: "Application" },
              { key: "capacity", label: "Capacity" },
              { key: "water", label: "Water consumption" },
              { key: "power", label: "Power consumption" },
              { key: "quantity", label: "Units / count" },
              { key: "unitCost", label: "Unit cost" },
              { key: "installation", label: "Installation" },
              { key: "maintenance", label: "Maintenance" },
              { key: "advantages", label: "Advantages" },
              { key: "disadvantages", label: "Disadvantages" },
            ]}
            rows={humidificationOptions.map((option) => {
              const summary = costSummaryFor(`humidifier-${option.id}`);
              return { ...option, unitCost: formatCost(summary.averageUnitCost), averageTotal: formatTotalCost(summary) };
            })}
            caption="Milky room equipment must be separately sized and commissioned; these rows compare methods, not a selected system."
          />
          <h3 className="infra-subheading">B. Temperature control</h3>
          <p className="note">Cooling decisions depend on the selected Oyster and Milky strains, their separate target conditions and local seasonal temperatures. One AC per room is not assumed.</p>
          <DataTable
            columns={[
              { key: "item", label: "Equipment" },
              { key: "purpose", label: "Use" },
              { key: "sizing", label: "Sizing factors / method" },
              { key: "capacity", label: "Capacity" },
              { key: "quantity", label: "Quantity" },
              { key: "price", label: "Average unit cost" },
              { key: "averageTotal", label: "Average total" },
            ]}
            rows={temperatureEquipment.map((row) => {
              const item = allProcurementItems.find((candidate) => candidate.item === row.item);
              const summary = item ? getItemCostSummary(procurementState.quotes[item.id], procurementState.quantities[item.id]) : null;
              return {
                ...row,
                price: formatCost(summary?.averageUnitCost ?? null),
                averageTotal: summary ? formatTotalCost(summary) : "Quotation Required",
              };
            })}
          />
          <h3 className="infra-subheading">C. Ventilation and fresh-air equipment</h3>
          <DataTable
            columns={[
              { key: "item", label: "Equipment" },
              { key: "function", label: "Purpose" },
              { key: "airflow", label: "Airflow rating" },
              { key: "quantity", label: "Quantity" },
              { key: "averageUnitCost", label: "Average unit cost" },
              { key: "averageTotal", label: "Average total" },
              { key: "power", label: "Power consumption" },
              { key: "installation", label: "Installation" },
              { key: "maintenance", label: "Maintenance" },
            ]}
            rows={ventilationEquipment.map((row) => {
              const item = allProcurementItems.find((candidate) => candidate.item === row.item);
              const summary = item ? getItemCostSummary(procurementState.quotes[item.id], procurementState.quantities[item.id]) : null;
              return {
                ...row,
                averageUnitCost: formatCost(summary?.averageUnitCost ?? null),
                averageTotal: summary ? formatTotalCost(summary) : "Quotation Required",
              };
            })}
          />
          <p className="note">Fan capacities must be calculated from room volume, crop load and fresh-air requirements—not floor area alone. Include mesh pressure drop, ducts, dampers and backdraft control in supplier scope.</p>
          <h3 className="infra-subheading">D. Environmental sensors and automation</h3>
          <DataTable
            columns={[
              { key: "item", label: "Sensor / control" },
              { key: "priority", label: "Priority" },
              { key: "averageUnitCost", label: "Average unit cost" },
              { key: "averageTotal", label: "Average total" },
              { key: "note", label: "Selection / validation" },
            ]}
            rows={environmentalSensors.map((row) => {
              const item = allProcurementItems.find((candidate) => candidate.item === row.item);
              const summary = item ? getItemCostSummary(procurementState.quotes[item.id], procurementState.quantities[item.id]) : null;
              return {
                ...row,
                averageUnitCost: formatCost(summary?.averageUnitCost ?? null),
                averageTotal: summary ? formatTotalCost(summary) : "Quotation Required",
              };
            })}
          />
          <h3 className="infra-subheading">E. Water management for fogging</h3>
          <DataTable
            columns={[
              { key: "item", label: "Item" },
              { key: "requirement", label: "Requirement" },
              { key: "quantity", label: "Quantity / basis" },
              { key: "price", label: "Average unit cost" },
              { key: "averageTotal", label: "Average total" },
              { key: "maintenance", label: "Maintenance" },
            ]}
            rows={fogWaterEquipment.map((row) => {
              const item = allProcurementItems.find((candidate) => candidate.item === row.item);
              const summary = item ? getItemCostSummary(procurementState.quotes[item.id], procurementState.quantities[item.id]) : null;
              return {
                ...row,
                price: formatCost(summary?.averageUnitCost ?? null),
                averageTotal: summary ? formatTotalCost(summary) : "Quotation Required",
              };
            })}
          />
          <p className="note">Use water-test results and equipment instructions to set filtration and cleaning/descaling procedures. Do not invent water use, pump size, pressure or nozzle count.</p>
          <h3 className="infra-subheading">Room-wise equipment schedule</h3>
          <p className="note">Each equipment item has one shared procurement record below. Where it serves more than one room, record and price the combined validated quantity once to avoid double-counting.</p>
          <div className="accordion-stack">
            {roomEquipmentSchedule.map((room) => (
              <details className="plan-accordion" key={room.room}>
                <summary>{room.room}<span>{room.equipmentIds.length} equipment placements</span></summary>
                <p className="note">{room.note}</p>
                <DataTable
                  columns={[
                    { key: "item", label: "Equipment" },
                    { key: "quantityBasis", label: "Quantity / basis" },
                    { key: "specification", label: "Specification" },
                    { key: "unitCost", label: "Average unit cost" },
                    { key: "averageTotal", label: "Average total" },
                    { key: "description", label: "Purpose / installation room" },
                  ]}
                  rows={room.equipmentIds.map((id) => {
                    const item = allProcurementItems.find((equipment) => equipment.id === id);
                    const summary = getItemCostSummary(procurementState.quotes[id], procurementState.quantities[id]);
                    return {
                      ...item,
                      unitCost: formatCost(summary.averageUnitCost),
                      averageTotal: formatTotalCost(summary),
                    };
                  })}
                />
              </details>
            ))}
          </div>
        </section>

        <section id="investment" className="infra-section">
          <SectionTitle eyebrow="05 · Investment and BOQ" title="Preserve the current budget until quotes are reconciled.">
            Existing figures remain the preliminary baseline. The detailed BOQ below is a quotation template; it does not invent supplier prices
            or silently replace the approved range.
          </SectionTitle>
          <div className="budget-cards">
            <article><span>Existing low estimate incl. contingency</span><strong>{formatCurrency(budgetSummary.totalLow)}</strong></article>
            <article><span>Existing high estimate incl. contingency</span><strong>{formatCurrency(budgetSummary.totalHigh)}</strong></article>
            <article><span>Rounded baseline shown on current site</span><strong>₹6.08–₹11.70 lakh</strong></article>
            <article><span>Provisional planning allowance · mathematical midpoint only</span><strong>{formatCurrency(budgetSummary.planningMidpoint)}</strong></article>
          </div>
          <DataTable
            caption="Existing infrastructure budget baseline. Values are retained from the current business plan."
            columns={[
              { key: "category", label: "Existing budget category" },
              { key: "low", label: "Low estimate" , render: (row) => formatCurrency(row.low) },
              { key: "high", label: "High estimate", render: (row) => formatCurrency(row.high) },
            ]}
            rows={existingBudget}
          />
          <h3 className="infra-subheading">Construction cost summary · estimates are not yet reconciled</h3>
          <p className="note">
            Category estimates stay unavailable until comparable quotations, measured quantities and mutually exclusive options are reconciled
            against the original budget. Actual purchases below are recorded separately and are not an estimate of remaining project cost.
          </p>
          <DataTable
            caption="Twelve-category construction summary. No partial category subtotals are presented as complete estimates."
            columns={[
              { key: "category", label: "Construction category" },
              { key: "itemizedProgress", label: "Complete cost inputs" },
              { key: "minimumEstimate", label: "Minimum estimate", render: () => "Quotation Required" },
              { key: "averageEstimate", label: "Average estimate", render: () => "Quotation Required" },
              { key: "maximumEstimate", label: "Maximum estimate", render: () => "Quotation Required" },
              { key: "actual", label: "Actual purchase amount recorded" },
              { key: "actualItems", label: "Purchase record coverage" },
            ]}
            rows={constructionSummaryRows}
          />
          <p className="note">
            Actual expenditure recorded across {actualPurchaseCount} line items: <strong>
              {actualPurchaseCount ? formatCurrency(actualExpenditure) : "No purchases recorded"}
            </strong>. Budget variance is unavailable until the selected scope and complete actual expenditure are reconciled.
          </p>
          <DataTable
            caption="Itemized quote reconciliation against the preserved budget. Partial subtotals are not a revised project estimate."
            columns={[
              { key: "category", label: "Existing budget category" },
              { key: "baseline", label: "Preserved range" },
              { key: "itemizedRows", label: "Priced itemized rows" },
              { key: "status", label: "Reconciliation status" },
            ]}
            rows={baselineReconciliationRows}
          />
          <DataTable
            caption="Baseline arithmetic check."
            columns={[
              { key: "label", label: "Calculation" },
              { key: "low", label: "Low" , render: (row) => formatCurrency(row.low) },
              { key: "high", label: "High", render: (row) => formatCurrency(row.high) },
            ]}
            rows={[
              { label: "Subtotal before contingency", low: budgetSummary.subtotalLow, high: budgetSummary.subtotalHigh },
              { label: "Contingency (10%)", low: budgetSummary.contingencyLow, high: budgetSummary.contingencyHigh },
              { label: "Total including contingency", low: budgetSummary.totalLow, high: budgetSummary.totalHigh },
            ]}
          />
          <div className="reconciliation-note">
            <h3>BOQ reconciliation status: pending written quotations</h3>
            <p>
              The itemized scopes map to the existing categories, but prices and measured quantities are not available to independently re-total them.
              Keep the ₹5.53–₹10.64 lakh pre-contingency subtotal and the 10% contingency baseline until comparable quotes identify omissions,
              overlaps or scope changes.
            </p>
            <p>Roof/wall systems and environmental methods are alternatives, not additive purchases. Shared room equipment is listed once. No new subtotal or revised project total is calculated until the founders approve the scope and reconcile options, installation, GST, transport and overlaps.</p>
            <p>The ₹8,89,350 planning reference is only the arithmetic midpoint of the existing indicative range. It is not a quote, approved funding amount or substitute for the BOQ reconciliation.</p>
            <p><strong>Infrastructure investment is separate from working capital.</strong> Land, spawn, substrate / consumables, labor for production,
              delivery, finance, taxes and other operating needs are not confirmed within this baseline; prepare them separately before a batch.</p>
          </div>
          <h3 className="infra-subheading">Detailed itemized bill of quantities</h3>
          <p className="note">
            Enter measured quantities here and add supplier quotes in Procurement. A price average is shown only when at least one current,
            dated, specification-backed supplier quote is recorded. GST, transport, installation and actual purchased amount remain separate
            quote fields. Unpriced entries stay “Quotation Required”; they are never treated as zero.
          </p>
          <DataTable
            caption="Construction and equipment line items. The same shared equipment is priced once, even when placed in more than one room."
            columns={[
              { key: "category", label: "Category" },
              { key: "item", label: "Item" },
              { key: "description", label: "Description / specification" },
              { key: "unit", label: "Unit" },
              { key: "quantity", label: "Measured quantity", render: (item) => <QuantityField item={item} value={procurementState.quantities[item.id]} onChange={updateQuantity} /> },
              { key: "quantityBasis", label: "Quantity basis" },
              { key: "minimum", label: "Minimum unit quote", render: (item) => formatCost(item.summary.minimum) },
              { key: "maximum", label: "Maximum unit quote", render: (item) => formatCost(item.summary.maximum) },
              { key: "averageUnit", label: "Average unit cost", render: (item) => formatCost(item.summary.averageUnitCost) },
              { key: "averageTotal", label: "Final average total", render: (item) => formatCost(item.cost.finalAverageTotal) },
              { key: "budgetParent", label: "Existing budget parent" },
              { key: "budgetNote", label: "Reconciliation / scope note" },
              { key: "priority", label: "Essential / optional" },
            ]}
            rows={boqRows}
          />
          <DataTable
            caption="Potential additional costs; confirm whether these are already covered before increasing the project total."
            columns={[
              { key: "item", label: "Item" },
              { key: "category", label: "BOQ category" },
              { key: "status", label: "Budget treatment" },
            ]}
            rows={outsideBaselineRows}
          />
          <div className="exclusions">
            <strong>Quote comparison exclusions / assumptions to document:</strong>
            <span>GST, transport, unloading, installation, commissioning, warranties, maintenance, civil interfaces and any optional cooling or cold room must be itemized. Do not double-count items across the existing budget categories.</span>
          </div>
        </section>

        <section id="production" className="infra-section infra-section-muted">
          <SectionTitle eyebrow="06 · Production capacity" title="Plan the racks before claiming a bag capacity.">
            The production targets below are inherited planning assumptions. They do not prove that the proposed rooms can hold the bags.
          </SectionTitle>
          <DataTable
            columns={[
              { key: "crop", label: "Crop" },
              { key: "target", label: "Target harvest across flushes" },
              { key: "yield", label: "Planning yield assumption" },
              { key: "bags", label: "Preliminary bags" },
              { key: "validation", label: "Capacity status" },
            ]}
            rows={[
              { crop: "Oyster", target: "60 kg", yield: "500 g per kg dry straw", bags: "About 120", validation: "Unvalidated planning figure; no room-capacity claim." },
              { crop: "Milky", target: "40 kg", yield: "600 g per kg dry straw", bags: "About 67", validation: "Unvalidated planning figure; no room-capacity claim." },
              { crop: "Total", target: "100 kg across multiple flushes", yield: "Validate in trial", bags: "About 187", validation: "Do not load until a dimensioned rack plan is approved." },
            ]}
          />
          <div className="capacity-checklist">
            <h3>Required before confirming capacity</h3>
            <ul>
              <li>Choose the strain, protocol and bag dimensions with the spawn supplier / specialist.</li>
              <li>Measure rack footprint, levels, load rating and bag spacing for each room.</li>
              <li>Show aisle width, door access, cleaning access, room volume and crop-cycle overlap.</li>
              <li>Recalculate viable batch size; reduce or stagger the first trial if the layout does not fit.</li>
            </ul>
          </div>
        </section>

        <section id="environment" className="infra-section">
          <SectionTitle eyebrow="07 · Environment, hygiene and biosecurity" title="Keep crop controls separate and validate each setpoint.">
            Temperature and humidity targets depend on strain, substrate and local season. Do not apply a single setting to both crops or purchase controls before a specialist confirms the protocol.
          </SectionTitle>
          <DataTable
            columns={[
              { key: "parameter", label: "Control / stage" },
              { key: "oyster", label: "Oyster" },
              { key: "milky", label: "Milky" },
            ]}
            rows={environmentRows}
          />
          <div className="biosecurity-grid">
            <article>
              <h3>Clean / dirty separation</h3>
              <ul>
                <li>Keep raw straw handling away from inoculation, packing and clean supplies.</li>
                <li>Use dedicated or cleaned tools for substrate, casing and post-harvest work.</li>
                <li>Protect dry straw and packaging from moisture, pests and contamination.</li>
              </ul>
            </article>
            <article>
              <h3>Waste and wastewater</h3>
              <ul>
                <li>Isolate suspect bags and follow a locally approved disposal process.</li>
                <li>Reuse spent substrate as compost only when contamination and local practice allow.</li>
                <li>Plan lawful wastewater discharge and avoid uncontrolled standing water.</li>
              </ul>
            </article>
            <article>
              <h3>Pest and staff hygiene</h3>
              <ul>
                <li>Use insect-proof openings, maintain seals and record pest observations.</li>
                <li>Provide handwashing, clean footwear and task-appropriate PPE.</li>
                <li>Store cleaning chemicals safely, labeled and away from packaging.</li>
              </ul>
            </article>
          </div>
          <h3 className="infra-subheading">Routine maintenance checklist</h3>
          <DataTable
            columns={[
              { key: "frequency", label: "Frequency" },
              { key: "tasks", label: "Checks and records" },
            ]}
            rows={maintenanceChecks}
          />
        </section>

        <section id="roadmap" className="infra-section infra-section-muted">
          <SectionTitle eyebrow="08 · Implementation roadmap" title="Proceed through evidence-based decision gates.">
            Durations for early planning and construction are indicative scheduling assumptions only. Trial and production timing depends on the selected strain, successful commissioning and buyer validation.
          </SectionTitle>
          <div className="gantt-scroll" role="region" aria-label="Illustrative phase sequence chart" tabIndex="0">
            <div className="gantt-header">
              <strong>Planning phase</strong>
              <div className="gantt-track">
                {Array.from({ length: scheduleWeeks }, (_, index) => <span key={index}>W{index + 1}</span>)}
              </div>
            </div>
            {roadmap.slice(0, 8).map((phase) => (
              <div className="gantt-row" key={phase.phase}>
                <span>{String(phase.phase).padStart(2, "0")} · {phase.title}</span>
                <div className="gantt-track">
                  <div className="gantt-bar" style={{ gridColumn: `${phase.start + 1} / span ${phase.span}` }}>
                    {phase.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="note">The chart is a planning sequence, not a dated commitment. Phases 9–10 are intentionally not plotted to a fixed duration; set them after protocol validation and trial results.</p>
          <DataTable
            columns={[
              { key: "phase", label: "Phase" },
              { key: "title", label: "Activities / milestone" },
              { key: "duration", label: "Planning duration" },
              { key: "dependency", label: "Dependency" },
              { key: "responsible", label: "Responsible" },
              { key: "completion", label: "Completion criteria" },
              { key: "deliverable", label: "Deliverable" },
            ]}
            rows={roadmap}
          />
        </section>

        <section id="procurement" className="infra-section">
          <SectionTitle eyebrow="09 · Procurement management" title="Three quotes per item, with shareable records.">
            Add supplier offers against the itemized scope. Data is saved in this browser; export the JSON file to share with the other
            founders. Importing a file replaces the current local tracker, so export your current data first. This static site does not sync live between devices.
          </SectionTitle>
          <div className="tracker-actions">
            <button type="button" className="button button-gold" onClick={exportQuoteFile}>Export tracker JSON</button>
            <button type="button" className="button button-outline" onClick={() => importFileRef.current?.click()}>Import tracker JSON</button>
            <input ref={importFileRef} type="file" accept=".json,application/json" hidden onChange={importQuoteFile} />
            <span role="status">{storageMessage}</span>
          </div>
          {fileMessage && <p className="tracker-message" role="status">{fileMessage}</p>}
          <p className="note">
            Supplier prices contribute only when supplier, matching product specification, positive unit price, quote date and validity are
            complete and status is Quoted, Selected or Purchased. The quoted average uses the midpoint of the reliable minimum and maximum.
            Market estimates and local worker ranges are entered separately in the expanded cost categories; actual purchases remain separate.
          </p>
          <div className="tracker-picker">
            <label>
              <span>Choose an item to enter up to three supplier quotations</span>
              <select value={selectedProcurementItem.id} onChange={(event) => setSelectedProcurementId(event.target.value)}>
                {Object.entries(procurementByCategory).map(([category, items]) => (
                  <optgroup label={category} key={category}>
                    {items.map((item) => <option value={item.id} key={item.id}>{item.item}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <div className="tracker-item-summary">
              <strong>{selectedProcurementItem.item}</strong>
              <span>{selectedProcurementItem.description}</span>
              <span>Unit: {selectedProcurementItem.unit} · {selectedProcurementItem.priority}</span>
              <label>
                <span>Measured quantity ({selectedProcurementItem.unit})</span>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  inputMode="decimal"
                  placeholder="Not yet measured"
                  value={procurementState.quantities[selectedProcurementItem.id] ?? quantityForItem(selectedProcurementItem) ?? ""}
                  onChange={(event) => updateQuantity(selectedProcurementItem.id, event.target.value)}
                />
              </label>
              <p className={selectedCost.averageUnitCost !== null ? "quote-cost" : "quote-cost quote-cost-pending"}>
                <strong>Average unit cost: {formatCost(selectedCost.averageUnitCost)}</strong>
                <span>Minimum: {formatCost(selectedCost.minimum)} · Maximum: {formatCost(selectedCost.maximum)}</span>
                <span>Average material total: {formatTotalCost(selectedCost)} · {selectedCost.status}</span>
                <span>Average local labour total: {formatCost(selectedCost.laborTotal)} · Tax/GST: {formatCost(selectedCost.tax)} · Transportation: {formatCost(selectedCost.transport)} · Installation: {formatCost(selectedCost.installation)}</span>
                <span>Final average total: {formatCost(selectedCost.finalAverageTotal)} · Actual purchase: {formatCost(selectedCost.actualPurchaseTotal)}</span>
              </p>
            </div>
          </div>
          <div className="quote-slots">
            {quoteSlots.map((slot) => (
              <QuoteSlotForm
                key={`${selectedProcurementItem.id}-${slot}`}
                item={selectedProcurementItem}
                slot={slot}
                quote={selectedQuotes[slot] || getBlankQuote()}
                onChange={updateQuote}
                quantity={quantityForItem(selectedProcurementItem)}
              />
            ))}
          </div>
          <p className="note">GST, transport, installation, warranty, quote validity, selected price and actual purchased amount are captured separately. A new import replaces this browser's tracker; export first if you need to preserve it.</p>
        </section>

        <section className="infra-section infra-references">
          <SectionTitle eyebrow="Reference notes" title="Use external examples as leads, not specifications.">
            Links shared with the project brief are provided for background only. They are not endorsements, validated designs or quotations.
          </SectionTitle>
          <ul>
            {referencedMaterials.map((reference) => (
              <li key={reference.url}>
                <a href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a>
                <span>{reference.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="infra-disclaimer">
          <p className="eyebrow">Important planning disclaimer</p>
          <p>
            All construction dimensions, structural specifications, electrical ratings, environmental equipment capacities and prices are preliminary planning inputs. Final specifications must be validated by qualified local engineers, mushroom cultivation specialists and written supplier quotations before procurement or construction.
          </p>
          <p>No production or return is guaranteed. This plan is not a certified construction drawing, bankable DPR, electrical design or supplier quote.</p>
        </section>
      </main>

      <footer className="infra-footer">
        <a className="brand" href="index.html" aria-label="GreenSpore Farms home">
          <img className="brand-logo" src={logo} alt="GreenSpore Farms emblem" />
        </a>
        <p>© <span>{new Date().getFullYear()}</span> GreenSpore Farms. Preliminary planning information only.</p>
      </footer>
    </>
  );
}

export default InfrastructurePage;
