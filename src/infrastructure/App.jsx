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
  allProcurementItems,
  ceilingInsulationNotes,
  constructionGroups,
  connectedLoadSchedule,
  environmentalSensors,
  fogWaterEquipment,
  flooringRoomSpecs,
  humidificationOptions,
  pufThicknesses,
  roomEquipmentSchedule,
  roofingOptions,
  structuralOptions,
  temperatureEquipment,
  ventilationEquipment,
  wallOptions,
} from "./detail-data.js";
import {
  calculateRoofArea,
  calculateRoofOptionCost,
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
  "model",
  "specification",
  "quotedUnitPrice",
  "gst",
  "transport",
  "installation",
  "warranty",
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
  "installation",
  "insulation",
  "flashingGutters",
];

function createEmptyProcurementState() {
  const options = Object.fromEntries(roofingOptions.map((option) => [
    option.id,
    {
      materialMinRate: "",
      materialMaxRate: "",
      structuralSupport: "",
      installation: "",
      insulation: "",
      flashingGutters: "",
      thickness: "50",
    },
  ]));
  return {
    version: PROCUREMENT_STORAGE_VERSION,
    quotes: {},
    quantities: {},
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
        const fieldValue = inputs[field];
        if (typeof fieldValue === "string" || typeof fieldValue === "number") {
          normalized.roofCalculator.options[option.id][field] = String(fieldValue);
        }
      }
      if (pufThicknesses.includes(Number(inputs.thickness))) {
        normalized.roofCalculator.options[option.id].thickness = String(inputs.thickness);
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
  if (!summary?.reliableQuoteCount) return "Quotation Required";
  return summary.averageTotalCost === null ? "Quantity Required" : formatCurrency(summary.averageTotalCost);
}

function getRoomVolume(dimensions) {
  const values = [dimensions.length, dimensions.width, dimensions.height].map((value) =>
    value === "" ? null : Number(value),
  );
  if (values.some((value) => value === null || !Number.isFinite(value) || value <= 0)) return null;
  return values.reduce((total, value) => total * value, 1);
}

function getReliableQuoteFieldAverage(quotes, field) {
  const values = Object.values(quotes || {})
    .filter((quote) => isReliableQuote(quote))
    .map((quote) => quote[field] === "" ? null : Number(quote[field]))
    .filter((value) => Number.isFinite(value) && value >= 0);
  if (!values.length) return null;
  return (Math.min(...values) + Math.max(...values)) / 2;
}

function getBudgetParent(item) {
  const category = item.category.toLowerCase();
  const name = item.item.toLowerCase();
  if (category.startsWith("environmental control")) return existingBudget[1].category;
  if (name.includes("rack") || name.includes("bag support") || item.id === "raised-pallets") return existingBudget[2].category;
  if (name.includes("casing")) return existingBudget[4].category;
  if (name.includes("packing") || name.includes("harvest crate") || name.includes("refrigerator") || name.includes("cooling")) {
    return existingBudget[5].category;
  }
  if (category.includes("substrate preparation") || category.includes("storage and handling") || category.includes("inoculation")) {
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
  if (isPotentiallyOutsideBaseline(item)) return "Potentially outside baseline; approve separately before including.";
  return "Mapped to existing baseline; reconcile once and do not add twice.";
}

function getRowKey(row, index) {
  const parts = [row.category, row.slot, row.item, row.name, row.activity, row.room, row.phase, row.label]
    .filter((part) => part !== undefined && part !== null && part !== "");

  return row.id || (parts.length ? parts.join("::") : index);
}

function DataTable({ columns, rows, caption }) {
  return (
    <div className="table-wrap infra-table-wrap">
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

function RoofCalculator({ calculator, onDimensionChange, onOptionChange }) {
  const area = calculateRoofArea(calculator.dimensions);
  const dimensionFields = [
    ["length", "Roof length (ft)"],
    ["width", "Roof width (ft)"],
    ["slopePercent", "Roof slope (%)"],
    ["overhang", "Uniform overhang on each side (ft)"],
  ];

  const comparisonRows = roofingOptions.map((option) => {
    const optionInputs = calculator.options[option.id];
    const estimate = calculateRoofOptionCost(area, optionInputs);
    return {
      option: option.option,
      thickness: option.id === "puf" ? `${optionInputs.thickness} mm` : option.thickness,
      roofArea: area === null ? "Enter measured dimensions" : `${area.toFixed(1)} sq ft`,
      materialRange: estimate
        ? `${formatCurrency(estimate.materialMinimum)}–${formatCurrency(estimate.materialMaximum)}`
        : "Quotation Required",
      structuralSupport: estimate ? formatCurrency(estimate.structuralSupport) : "Quotation Required",
      installation: estimate ? formatCurrency(estimate.installation) : "Quotation Required",
      insulation: estimate ? formatCurrency(estimate.insulation) : "Quotation Required",
      flashingGutters: estimate ? formatCurrency(estimate.flashingGutters) : "Quotation Required",
      totalInstalled: estimate
        ? `${formatCurrency(estimate.totalMinimum)}–${formatCurrency(estimate.totalMaximum)} · average ${formatCurrency(estimate.totalAverage)}`
        : "Quotation Required",
    };
  });

  return (
    <div className="roof-calculator">
      <h3 className="infra-subheading">Roof option cost calculator</h3>
      <p className="note">
        Enter measured building dimensions and written quote values. Roof area includes the entered uniform overhang on all sides and
        slope as rise/run percent across the roof width; it is not assumed to be 800 sq ft. For non-symmetric roof forms, use a measured
        surface area from the final drawing instead.
      </p>
      <p className="note">These roof options are mutually exclusive estimates. Calculator results are not added to the BOQ automatically; select one approved scope and reconcile its components once before revising the project budget.</p>
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
          const estimate = calculateRoofOptionCost(area, inputs);
          return (
            <article className="roof-option-card" key={option.id}>
              <h4>{option.option}</h4>
              {option.id === "puf" && (
                <label>
                  <span>PUF panel thickness</span>
                  <select value={inputs.thickness} onChange={(event) => onOptionChange(option.id, "thickness", event.target.value)}>
                    {pufThicknesses.map((thickness) => <option value={thickness} key={thickness}>{thickness} mm</option>)}
                  </select>
                </label>
              )}
              <div className="roof-cost-inputs">
                {roofCostFields.map((field) => (
                  <label key={field}>
                    <span>{field === "materialMinRate" ? "Material quote minimum (₹/sq ft)"
                      : field === "materialMaxRate" ? "Material quote maximum (₹/sq ft)"
                        : field === "structuralSupport" ? "Structural support (₹)"
                          : field === "installation" ? "Installation (₹)"
                            : field === "insulation" ? "Separate insulation (₹)"
                              : "Flashing and gutters (₹)"}</span>
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
                <span>{estimate ? `Installed average: ${formatCurrency(estimate.totalAverage)}` : "Complete dimensions and all component quote fields to calculate."}</span>
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
          { key: "materialRange", label: "Material cost range" },
          { key: "structuralSupport", label: "Structural support" },
          { key: "installation", label: "Installation" },
          { key: "insulation", label: "Insulation" },
          { key: "flashingGutters", label: "Flashing and gutters" },
          { key: "totalInstalled", label: "Total installed cost" },
        ]}
        rows={comparisonRows}
      />
    </div>
  );
}

function QuoteSlotForm({ item, slot, quote, onChange }) {
  const fields = [
    ["supplier", "Supplier name", "text"],
    ["model", "Product model", "text"],
    ["specification", "Quoted specification", "text"],
    ["quotedUnitPrice", "Quoted unit price (₹)", "number"],
    ["gst", "GST (₹ / %; specify basis)", "text"],
    ["transport", "Transport (₹)", "number"],
    ["installation", "Installation (₹)", "number"],
    ["warranty", "Warranty", "text"],
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
    </fieldset>
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
    URL.revokeObjectURL(url);
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
  const selectedCost = getItemCostSummary(selectedQuotes, procurementState.quantities[selectedProcurementItem.id]);
  const costSummaryFor = (itemId) => getItemCostSummary(procurementState.quotes[itemId], procurementState.quantities[itemId]);
  const boqRows = allProcurementItems.map((item) => {
    const summary = getItemCostSummary(procurementState.quotes[item.id], procurementState.quantities[item.id]);
    return {
      ...item,
      summary,
      budgetParent: getBudgetParent(item),
      budgetNote: getBudgetNote(item),
    };
  });
  const baselineReconciliationRows = existingBudget.map((budget) => {
    const items = boqRows.filter((item) => item.budgetParent === budget.category);
    const priced = items.filter((item) => item.summary.averageTotalCost !== null);
    return {
      category: budget.category,
      baseline: `${formatCurrency(budget.low)}–${formatCurrency(budget.high)}`,
      itemizedRows: `${priced.length} of ${items.length} have both quantity and reliable quote`,
      status: "No new subtotal: choose alternatives and reconcile overlaps before any revised total.",
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
          <SectionTitle eyebrow="03 · Civil and construction scope" title="SHED CONSTRUCTION &amp; CIVIL INFRASTRUCTURE">
            Itemized planning scope for the 20 ft × 40 ft plot. Quantities remain measurement-based and structural dimensions are left
            to site assessment and signed engineering drawings. Averages appear only after reliable current written quotations are entered.
          </SectionTitle>
          <div className="accordion-stack">
            {constructionGroups.map((group) => (
              <details className="plan-accordion" key={group.title}>
                <summary>{group.title}<span>{group.items.length} work items · rates require reliable written quotes</span></summary>
                <DataTable
                  rows={group.items.map((item) => ({
                    ...item,
                    summary: getItemCostSummary(procurementState.quotes[item.id], procurementState.quantities[item.id]),
                  }))}
                  caption={`${group.title}. Quantities are planning bases until measured; no unverified prices are shown.`}
                  columns={[
                    { key: "item", label: "Work item" },
                    { key: "description", label: "Description / specification" },
                    { key: "unit", label: "Measurement unit" },
                    { key: "quantity", label: "Estimated quantity", render: (item) => (
                      <div><QuantityField item={item} value={procurementState.quantities[item.id]} onChange={updateQuantity} /><small>{item.quantityBasis}</small></div>
                    ) },
                    { key: "minimum", label: "Minimum unit rate", render: (item) => formatCost(item.summary.minimum) },
                    { key: "maximum", label: "Maximum unit rate", render: (item) => formatCost(item.summary.maximum) },
                    { key: "average", label: "Average unit rate", render: (item) => formatCost(item.summary.averageUnitCost) },
                    { key: "total", label: "Average total amount", render: (item) => formatTotalCost(item.summary) },
                    { key: "priority", label: "Essential / optional" },
                  ]}
                />
              </details>
            ))}
          </div>
          <h3 className="infra-subheading">Structural framework comparison</h3>
          <DataTable
            columns={[
              { key: "option", label: "Structural system" },
              { key: "advantages", label: "Advantages" },
              { key: "disadvantages", label: "Disadvantages / design checks" },
              { key: "maintenance", label: "Maintenance" },
              { key: "cost", label: "Cost basis" },
            ]}
            rows={structuralOptions}
          />
          <p className="note">Do not infer foundation, column, truss or purlin sizes from this page. Soil assessment and a qualified structural engineer are required.</p>
          <h3 className="infra-subheading">Floor finish by room</h3>
          <DataTable
            columns={[
              { key: "room", label: "Room" },
              { key: "specification", label: "Preliminary flooring specification" },
            ]}
            rows={flooringRoomSpecs}
          />
          <h3 className="infra-subheading">Wall system comparison</h3>
          <DataTable
            caption="All wall areas require a measured elevation schedule; rates and installation costs require written quotations."
            columns={[
              { key: "option", label: "Wall option" },
              { key: "specification", label: "Material specification" },
              { key: "estimatedArea", label: "Estimated area basis" },
              { key: "unitRate", label: "Rate / sq ft" },
              { key: "minimum", label: "Minimum cost" },
              { key: "maximum", label: "Maximum cost" },
              { key: "average", label: "Average cost" },
              { key: "installation", label: "Installation cost" },
              { key: "maintenance", label: "Maintenance" },
            ]}
            rows={wallOptions.map((option) => {
              const item = allProcurementItems.find((candidate) => candidate.item === option.option);
              const quantity = Number(procurementState.quantities[item?.id]);
              const summary = item ? costSummaryFor(item.id) : null;
              return {
                ...option,
                unitRate: formatCost(summary?.averageUnitCost ?? null),
                minimum: Number.isFinite(quantity) && quantity > 0 && summary?.minimum !== null
                  ? formatCurrency(quantity * summary.minimum)
                  : summary?.reliableQuoteCount ? "Quantity Required" : "Quotation Required",
                maximum: Number.isFinite(quantity) && quantity > 0 && summary?.maximum !== null
                  ? formatCurrency(quantity * summary.maximum)
                  : summary?.reliableQuoteCount ? "Quantity Required" : "Quotation Required",
                average: formatTotalCost(summary),
                installation: formatCost(item ? getReliableQuoteFieldAverage(procurementState.quotes[item.id], "installation") : null),
              };
            })}
          />
          <h3 className="infra-subheading">Roofing Options – Comparison for GreenSpore Farms</h3>
          <DataTable
            columns={[
              { key: "option", label: "Option" },
              { key: "material", label: "Roof material" },
              { key: "thickness", label: "Thickness" },
              { key: "thermal", label: "Thermal performance" },
              { key: "suitability", label: "Planning suitability" },
              { key: "components", label: "Included system components to quote" },
              { key: "maintenance", label: "Maintenance" },
              { key: "lifespan", label: "Lifespan evidence" },
            ]}
            rows={roofingOptions}
          />
          <div className="equipment-notice">
            <strong>PUF panel thickness comparison: {pufThicknesses.map((thickness) => `${thickness} mm`).join(", ")}.</strong>
            <span>Compare manufacturer-certified thermal data, fire documentation, panel joins, installation and the whole installed assembly. Panel-only rates are not installed roof costs.</span>
          </div>
          <p className="note">
            Never specify new asbestos-cement roofing. Fibre-cement may only be compared when the exact product is documented as asbestos-free.
            No lifespan is asserted without manufacturer data for the selected product.
          </p>
          <RoofCalculator
            calculator={procurementState.roofCalculator}
            onDimensionChange={updateRoofDimension}
            onOptionChange={updateRoofOption}
          />
          <h3 className="infra-subheading">Preliminary roof candidates by room</h3>
          <DataTable
            columns={[
              { key: "room", label: "Room" },
              { key: "candidate", label: "Option to compare first" },
              { key: "validation", label: "Decision required before selection" },
            ]}
            rows={[
              { room: "Oyster fruiting room", candidate: "Compare complete PUF roof assembly against coated steel roof with separate designed insulation and ceiling.", validation: "Validate strain conditions, heat load, vapour control, condensation and installed quotes." },
              { room: "Milky fruiting room", candidate: "Compare complete PUF roof assembly against coated steel roof with separate designed insulation and ceiling.", validation: "Validate Milky strain/protocol and room conditions independently from Oyster." },
              { room: "Incubation rooms", candidate: "Cost a coated steel roof with one coordinated insulation/ceiling assembly; compare PUF if thermal review warrants it.", validation: "Confirm crop-specific temperature, wall insulation, ceiling and any cooling need." },
              { room: "Raw straw storage", candidate: "Compare coated steel roofing with appropriate condensation and rainwater control; insulation only if justified.", validation: "Keep storage dry; assess solar gain, ventilation, pests and roof-water discharge." },
              { room: "Packing area", candidate: "Compare coated steel roofing with a cleanable ceiling/insulation assembly; compare PUF installed cost.", validation: "Confirm hygiene, thermal comfort and product-handling requirements." },
            ]}
          />
          <h3 className="infra-subheading">Ceiling and insulation coordination</h3>
          <DataTable
            columns={[
              { key: "type", label: "Insulation location" },
              { key: "description", label: "Design distinction" },
            ]}
            rows={ceilingInsulationNotes}
          />
          <div className="reconciliation-note">
            <h3>Recommended preliminary design · for costing only, not for construction</h3>
            <p>Prepare comparable quotes for (1) a coated steel roof with a separately designed vapour/insulation/ceiling assembly and (2) a complete PUF panel roof. Keep any selected insulation layer visible in the BOQ once only. Choose after thermal review, room-specific humidity/condensation checks and landed installed-cost comparison.</p>
          </div>
          <h3 className="infra-subheading">Recommended preliminary shed configuration · subject to engineering and supplier validation</h3>
          <DataTable
            columns={[
              { key: "system", label: "System" },
              { key: "preliminary", label: "Preliminary costing configuration" },
              { key: "validation", label: "Required before procurement/construction" },
            ]}
            rows={[
              { system: "Structure", preliminary: "Obtain comparable galvanized-steel and properly protected MS frame quotes; do not choose a member size here.", validation: "Soil report, loads, wind/site conditions, connections, corrosion and signed structural design." },
              { system: "Roof", preliminary: "Price a coated-steel roof with one coordinated insulation/ceiling assembly against a complete PUF roof assembly.", validation: "Measured sloped area, supplier data, condensation/vapour design, fire documentation and installed quotes." },
              { system: "Walls", preliminary: "Use a locally serviceable external wall with washable finishes and sealed internal partitions; compare insulated panels for crop rooms.", validation: "Measured wall schedule, moisture/fire performance, thermal design, sealed joints and installation quotes." },
              { system: "Floor", preliminary: "Specify a durable cleanable base, room-specific anti-skid finish and planned wet-area drainage.", validation: "Subgrade, structural loading, falls, drain locations, waterproofing and wastewater route." },
              { system: "Insulation", preliminary: "Select one continuous, coordinated roof/wall/ceiling strategy; avoid counting the same insulation twice.", validation: "Envelope/thermal review and product data for the exact assembly." },
              { system: "Doors", preliminary: "Use cleanable, moisture-resistant sealed doors where room conditions require them; opening sizes remain unselected.", validation: "Architectural door schedule, clear access, emergency egress and hardware." },
              { system: "Drainage", preliminary: "Provide designed falls, trapped floor drains, clean-outs and controlled wastewater collection in wet zones.", validation: "Civil/plumbing drawings and local discharge requirements." },
              { system: "Environmental controls", preliminary: "Separate Oyster and Milky monitoring, air and humidification systems; defer cooling until each crop room is assessed.", validation: "Strain protocol, dimensions/volume, thermal load, airflow, water quality and commissioning." },
              { system: "Electrical", preliminary: "Install only from the connected-load schedule with protected equipment circuits.", validation: "Qualified electrician's final load calculation, cable/breaker selection, earthing and testing." },
            ]}
          />
          <h3 className="infra-subheading">Preliminary connected-load schedule · ratings pending nameplates</h3>
          <DataTable
            caption="No cable sizes or breaker ratings are assumed. A qualified electrician must calculate final loads and protections."
            columns={[
              { key: "equipment", label: "Equipment group" },
              { key: "room", label: "Room / location" },
              { key: "quantity", label: "Quantity basis" },
              { key: "unitPower", label: "Unit power" },
              { key: "connectedLoad", label: "Connected load" },
              { key: "status", label: "Status / dependency" },
            ]}
            rows={connectedLoadSchedule}
          />
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
              { key: "averageTotal", label: "Average total cost", render: (item) => formatTotalCost(item.summary) },
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
            Reliability rule for averages: a supplier, model, specification, positive quoted unit price, quote date and unexpired validity
            must be recorded, and status must be Quoted, Selected or Purchased. Average unit cost is (lowest + highest reliable quote) / 2.
            Average total is that average multiplied by the measured quantity. Expired, incomplete and unverified offers do not contribute.
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
                  value={procurementState.quantities[selectedProcurementItem.id] ?? ""}
                  onChange={(event) => updateQuantity(selectedProcurementItem.id, event.target.value)}
                />
              </label>
              <p className={selectedCost.reliableQuoteCount ? "quote-cost" : "quote-cost quote-cost-pending"}>
                <strong>Average unit cost: {formatCost(selectedCost.averageUnitCost)}</strong>
                <span>Minimum: {formatCost(selectedCost.minimum)} · Maximum: {formatCost(selectedCost.maximum)}</span>
                <span>Average total: {formatTotalCost(selectedCost)} · {selectedCost.status}</span>
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
