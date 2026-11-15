import { useEffect, useMemo, useState } from "react";
import logo from "../../assets/greenspore-logo.png";
import {
  layoutRooms,
  projectDetails,
} from "./data.js";
import {
  allPlannerItems,
  constructionGroups,
  harvestGroups,
  operatingGroups,
  planRows,
  resourceRows,
  roomEquipment,
  roofOptions,
} from "./planner-data.js";
import {
  calculateContingency,
  calculateCostPerKg,
  calculateInitialInvestment,
  calculatePlannerItem,
  calculateRoomLayout,
  getPlannerQuantities,
  getPlotDefaults,
  sumPlannerItems,
} from "./investment-calculations.js";
import "./styles.css";

const plannerStorageKey = "greenspore-investment-planner-v1";
const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const roomColorByFlow = {
  "Raw / dry zone": "#eee3ce",
  "Raw / wet zone": "#dbe5cd",
  "Clean zone": "#f8f3e8",
  "Wet service zone": "#dbe5cd",
  "Crop-specific clean zone": "#e9eadb",
  "Crop-specific humid zone": "#f0dba9",
  "Service zone": "#eee3ce",
  "Clean post-harvest zone": "#f8f3e8",
  "Access / circulation": "#e9eadb",
};

function createInitialState() {
  const plot = getPlotDefaults();
  return {
    rooms: Object.fromEntries(layoutRooms.map((room) => [room.id, {
      length: String(room.length),
      width: String(room.width),
    }])),
    plot,
    assumptions: {
      buildingLength: "40",
      buildingWidth: "20",
      wallHeight: "",
      wallThickness: "",
      partitionThickness: "",
      externalOpeningsArea: "",
      partitionLength: "",
      partitionHeight: "",
      partitionOpeningsArea: "",
      brickLength: "",
      brickWidth: "",
      brickHeight: "",
      brickWastagePercent: "",
      mortarJoint: "",
      cementParts: "",
      sandParts: "",
      mortarDryFactor: "",
      cementBagVolume: "",
    },
    roof: { length: "40", width: "20", slopePercent: "", overhang: "" },
    selectedRoof: "",
    contingencyRate: "10",
    quantities: Object.fromEntries(allPlannerItems.map((item) => [item.id, ""])),
    prices: Object.fromEntries(allPlannerItems.map((item) => [item.id, { minimum: "", maximum: "" }])),
    production: {
      oysterTargetKg: "60",
      milkyTargetKg: "40",
      oysterSubstrateKg: "",
      milkySubstrateKg: "",
      oysterSpawnRate: "",
      milkySpawnRate: "",
      drySubstratePerBagKg: "",
      bagLengthIn: "",
      bagWidthIn: "",
      bagThicknessMicron: "",
      ownPaddyStrawKg: "",
      ownPaddyStrawValueMin: "",
      ownPaddyStrawValueMax: "",
      monthlyHarvestKg: "",
      preparationMethod: "",
    },
    reuse: Object.fromEntries(resourceRows.map((resource) => [resource.id, resource.defaultAvailable])),
    savings: Object.fromEntries(resourceRows.map((resource) => [resource.id, {
      minimum: "",
      maximum: "",
      handlingMinimum: "",
      handlingMaximum: "",
    }])),
  };
}

function mergeSavedState(saved) {
  const defaults = createInitialState();
  if (!saved || saved.version !== 1) return defaults;
  return {
    ...defaults,
    ...saved,
    rooms: Object.fromEntries(layoutRooms.map((room) => [room.id, {
      ...defaults.rooms[room.id],
      ...saved.rooms?.[room.id],
    }])),
    plot: { ...defaults.plot, ...saved.plot },
    assumptions: { ...defaults.assumptions, ...saved.assumptions },
    roof: { ...defaults.roof, ...saved.roof },
    selectedRoof: roofOptions.some((option) => option.id === saved.selectedRoof) ? saved.selectedRoof : "",
    quantities: { ...defaults.quantities, ...saved.quantities },
    prices: Object.fromEntries(allPlannerItems.map((item) => [item.id, {
      ...defaults.prices[item.id],
      ...saved.prices?.[item.id],
    }])),
    production: {
      ...defaults.production,
      ...saved.production,
      preparationMethod: ["manual", "mechanized"].includes(saved.production?.preparationMethod)
        ? saved.production.preparationMethod
        : "",
    },
    reuse: { ...defaults.reuse, ...saved.reuse },
    savings: Object.fromEntries(resourceRows.map((resource) => [resource.id, {
      ...defaults.savings[resource.id],
      ...saved.savings?.[resource.id],
    }])),
  };
}

function formatMoney(value) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? "Price to be confirmed"
    : moneyFormatter.format(value);
}

function formatValue(value, digits = 2) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? "To confirm"
    : numberFormatter.format(Number(value.toFixed(digits)));
}

function numericValue(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getRoomDisplayName(id, roomName) {
  const shortNames = {
    "raw-straw": "RAW STRAW",
    "substrate-prep": "SUBSTRATE PREP",
    "soak-pasteurisation": "SOAK / PASTEURISATION",
    "clean-inoculation": "CLEAN INOCULATION",
    "wash-sanitation": "WASH / SANITATION",
    "oyster-incubation": "OYSTER INCUBATION",
    "milky-incubation": "MILKY INCUBATION",
    "oyster-fruiting": "OYSTER FRUITING",
    "milky-fruiting": "MILKY FRUITING",
    "casing-preparation": "CASING PREP / STORAGE",
    "utility-equipment": "UTILITY / EQUIPMENT",
    "packing-grading": "PACKING / GRADING",
    "finished-storage": "FINISHED PRODUCT",
  };
  return shortNames[id] || roomName.toUpperCase();
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="infra-section-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="lead">{children}</p>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="site-header infra-header">
      <a className="brand" href="index.html" aria-label="GreenSpore Farms home">
        <img className="brand-logo" src={logo} alt="GreenSpore Farms emblem" />
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="mushrooms.html">Our Mushrooms</a>
        <a href="infrastructure.html" aria-current="page">Infrastructure Plan</a>
        <a href="business-plan.html">Business Plan</a>
        <a href="about.html#founders">Founders</a>
      </nav>
    </header>
  );
}

function PlanNavigation() {
  return (
    <nav className="plan-nav" aria-label="Farm investment planner sections">
      {[
        ["room-design", "Room design"],
        ["construction", "Construction"],
        ["harvesting-setup", "Harvesting setup"],
        ["operating-expenses", "Operating expenses"],
      ].map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}
    </nav>
  );
}

function InlineInput({ label, value, onChange, unit, min = "0", step = "any" }) {
  return (
    <label className="planner-input">
      <span>{label}{unit ? ` (${unit})` : ""}</span>
      <input
        type="number"
        min={min}
        step={step}
        inputMode="decimal"
        value={value ?? ""}
        placeholder="To confirm"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function EstimateTable({ columns, rows, caption, className = "" }) {
  return (
    <div className={`table-wrap infra-table-wrap planner-table-wrap ${className}`.trim()}>
      <table>
        {caption && <caption>{caption}</caption>}
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.name}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoomPlanSvg({ layout, plotWidth, plotLength }) {
  const scale = 24;
  const passage = layout.rooms.find((room) => room.id === "service-passage");
  const passageWidth = passage?.width || 0;
  const plotW = numericValue(plotWidth) || 20;
  const plotL = numericValue(plotLength) || 40;
  const displayedWidth = Math.max(plotW, layout.maxRoomWidth + passageWidth);
  const displayedLength = Math.max(plotL, layout.rowsDepth || 0);
  let y = 0;
  const roomShapes = planRows.flatMap((row) => {
    const rowRooms = row.map((id) => layout.rooms.find((room) => room.id === id));
    const rowHeight = rowRooms[0]?.width || 0;
    let x = 0;
    const shapes = rowRooms.map((room) => {
      const shape = { ...room, x, y, drawWidth: room.length || 0, drawHeight: room.width || 0 };
      x += room.length || 0;
      return shape;
    });
    y += rowHeight;
    return shapes;
  });
  const passageShape = passage
    ? { ...passage, x: layout.maxRoomWidth, y: 0, drawWidth: passage.width || 0, drawHeight: passage.length || 0 }
    : null;

  return (
    <svg
      className="concept-plan-svg"
      viewBox={`0 0 ${displayedWidth * scale} ${displayedLength * scale}`}
      role="img"
      aria-label="Editable conceptual room plan for the GreenSpore mushroom farm"
    >
      <rect
        x="1"
        y="1"
        width={plotW * scale - 2}
        height={plotL * scale - 2}
        fill="#fffdf8"
        stroke="#143d2b"
        strokeWidth="3"
        strokeDasharray="8 5"
      />
      {roomShapes.map((room) => (
        <g key={room.id}>
          <title>{`${room.room}: ${formatValue(room.length)} ft × ${formatValue(room.width)} ft`}</title>
          <rect
            x={room.x * scale}
            y={room.y * scale}
            width={room.drawWidth * scale}
            height={room.drawHeight * scale}
            fill={roomColorByFlow[room.flow] || "#f8f3e8"}
            stroke="#143d2b"
            strokeWidth="2"
          />
          <text
            x={(room.x + room.drawWidth / 2) * scale}
            y={(room.y + room.drawHeight / 2) * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            className="concept-plan-label"
          >
            {getRoomDisplayName(room.id, room.room)}
          </text>
          <text
            x={(room.x + room.drawWidth / 2) * scale}
            y={(room.y + room.drawHeight / 2) * scale + 15}
            textAnchor="middle"
            className="concept-plan-size"
          >
            {`${formatValue(room.length)} × ${formatValue(room.width)} ft`}
          </text>
        </g>
      ))}
      {passageShape && (
        <g>
          <title>{`Service passage: ${formatValue(passageShape.width)} ft × ${formatValue(passageShape.length)} ft`}</title>
          <rect
            x={passageShape.x * scale}
            y="0"
            width={passageShape.drawWidth * scale}
            height={passageShape.drawHeight * scale}
            fill={roomColorByFlow[passageShape.flow]}
            stroke="#143d2b"
            strokeWidth="2"
          />
          <text
            x={(passageShape.x + passageShape.drawWidth / 2) * scale}
            y={(passageShape.drawHeight / 2) * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(-90 ${(passageShape.x + passageShape.drawWidth / 2) * scale} ${(passageShape.drawHeight / 2) * scale})`}
            className="concept-plan-label"
          >
            {`SERVICE PASSAGE · ${formatValue(passageShape.width)} × ${formatValue(passageShape.length)} ft`}
          </text>
        </g>
      )}
    </svg>
  );
}

function PlannerItemTable({ items, state, quantities, updateQuantity, updatePrice }) {
  const rows = items.map((item) => {
    const quantity = quantities[item.id];
    const prices = state.prices[item.id];
    const estimate = calculatePlannerItem(prices.minimum, prices.maximum, quantity);
    const averageRate = prices.minimum !== "" && prices.maximum !== "" &&
      Number(prices.maximum) >= Number(prices.minimum)
      ? (Number(prices.minimum) + Number(prices.maximum)) / 2
      : null;
    return { ...item, quantity, prices, estimate, averageRate };
  });
  return (
    <EstimateTable
      className="planner-cost-table"
      caption="Planning estimate – local price verification required where a reliable Tirupati / Chittoor rate is not available. Blank costs mean Price to be confirmed."
      columns={[
        { key: "name", label: "Item", render: (row) => <><strong>{row.name}</strong><small>{row.specification}</small></> },
        { key: "quantity", label: "Quantity", render: (row) => row.quantitySource
          ? <strong>{formatValue(row.quantity)}</strong>
          : <input className="table-input" aria-label={`${row.name} quantity`} type="number" min="0" step="any"
            placeholder="To confirm" value={state.quantities[row.id]}
            onChange={(event) => updateQuantity(row.id, event.target.value)} /> },
        { key: "unit", label: "Unit" },
        { key: "minimum", label: "Minimum unit cost", render: (row) => (
          <input className="table-input" aria-label={`${row.name} minimum unit cost`} type="number" min="0" step="any"
            placeholder="Price to be confirmed" value={row.prices.minimum}
            onChange={(event) => updatePrice(row.id, "minimum", event.target.value)} />
        ) },
        { key: "averageUnit", label: "Average unit cost", render: (row) => formatMoney(row.averageRate) },
        { key: "maximum", label: "Maximum unit cost", render: (row) => (
          <input className="table-input" aria-label={`${row.name} maximum unit cost`} type="number" min="0" step="any"
            placeholder="Price to be confirmed" value={row.prices.maximum}
            onChange={(event) => updatePrice(row.id, "maximum", event.target.value)} />
        ) },
        { key: "minimumTotal", label: "Minimum item total", render: (row) => formatMoney(row.estimate.minimum) },
        { key: "averageTotal", label: "Average item total", render: (row) => formatMoney(row.estimate.average) },
        { key: "maximumTotal", label: "Maximum item total", render: (row) => formatMoney(row.estimate.maximum) },
      ]}
      rows={rows}
    />
  );
}

function TotalCards({ estimates }) {
  const cards = [
    ["One-time construction investment", estimates.construction],
    ["One-time equipment investment", estimates.equipment],
    ["Initial mushroom production expenses", estimates.initial],
    ["Recurring monthly operating expenses", estimates.monthly],
  ];
  return (
    <div className="budget-cards planner-budget-cards">
      {cards.map(([label, estimate]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{estimate.complete ? formatMoney(estimate.average) : "Complete item prices"}</strong>
          <small>{estimate.complete
            ? `${formatMoney(estimate.minimum)}–${formatMoney(estimate.maximum)}`
            : `${estimate.completeItems || 0} / ${estimate.items || 0} priced and measured`}</small>
        </article>
      ))}
    </div>
  );
}

function InvestmentSummary({ estimates, updateContingency, contingencyRate }) {
  const rows = [
    { id: "construction", category: "Room design and construction", estimate: estimates.construction },
    { id: "environment", category: "Temperature and humidity equipment", estimate: estimates.environment },
    { id: "harvesting", category: "Mushroom harvesting setup", estimate: estimates.harvesting },
    { id: "initial", category: "Other operating expenses · initial batch", estimate: estimates.initial },
    { id: "contingency", category: `Contingency · ${contingencyRate}%`, estimate: estimates.contingency },
    { id: "total", category: "Total estimated initial investment", estimate: estimates.total },
  ];
  return (
    <section id="investment-summary" className="investment-summary" aria-labelledby="investment-summary-title">
      <div className="planner-section-heading">
        <p className="eyebrow">Investment overview</p>
        <h2 id="investment-summary-title">Plan from item-level costs, not a guessed total.</h2>
        <p className="lead">
          Only complete quantities and user-entered minimum / maximum rates contribute. Current inputs are saved in this browser.
          No supplier quotation workflow or unverified market price is included.
        </p>
      </div>
      <TotalCards estimates={estimates} />
      <EstimateTable
        className="summary-table"
        caption="Initial investment totals are calculated from the detailed item tables. Monthly operating costs are shown separately."
        columns={[
          { key: "category", label: "Budget category" },
          { key: "minimum", label: "Minimum estimate", render: (row) => row.estimate.complete ? formatMoney(row.estimate.minimum) : "Complete item inputs" },
          { key: "average", label: "Average estimate", render: (row) => row.estimate.complete ? formatMoney(row.estimate.average) : "Complete item inputs" },
          { key: "maximum", label: "Maximum estimate", render: (row) => row.estimate.complete ? formatMoney(row.estimate.maximum) : "Complete item inputs" },
        ]}
        rows={rows}
      />
      <div className="planner-summary-controls">
        <InlineInput label="Contingency rate (existing budget convention)" unit="%" value={contingencyRate} onChange={updateContingency} />
        <p>Contingency applies to construction, equipment and the initial production batch. Monthly costs are excluded from initial investment.</p>
      </div>
    </section>
  );
}

function InfrastructurePage() {
  const [state, setState] = useState(createInitialState);
  const [storageReady, setStorageReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState("Planner values are stored locally in this browser.");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(plannerStorageKey);
      if (saved) setState(mergeSavedState(JSON.parse(saved)));
    } catch (error) {
      setStorageMessage(`Could not load saved planner values: ${error.message}`);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(plannerStorageKey, JSON.stringify({ ...state, version: 1 }));
      setStorageMessage("Planner values saved in this browser.");
    } catch (error) {
      setStorageMessage(`Could not save planner values: ${error.message}`);
    }
  }, [state, storageReady]);

  const updateMap = (map, key, value) => setState((current) => ({
    ...current,
    [map]: { ...current[map], [key]: value },
  }));
  const updateFlat = (map, key, value) => setState((current) => ({
    ...current,
    [map]: { ...current[map], [key]: value },
  }));
  const updateNested = (map, key, field, value) => setState((current) => ({
    ...current,
    [map]: {
      ...current[map],
      [key]: { ...current[map][key], [field]: value },
    },
  }));
  const updateRoom = (id, field, value) => updateNested("rooms", id, field, value);
  const updateAssumption = (field, value) => updateFlat("assumptions", field, value);
  const updateRoof = (field, value) => updateFlat("roof", field, value);
  const updateProduction = (field, value) => updateFlat("production", field, value);
  const updatePrice = (id, field, value) => updateNested("prices", id, field, value);
  const updateSavings = (id, field, value) => updateNested("savings", id, field, value);

  const quantities = useMemo(() => getPlannerQuantities(state), [state]);
  const layout = useMemo(
    () => calculateRoomLayout(state.rooms, state.plot.width, state.plot.length),
    [state.rooms, state.plot],
  );
  const rowEstimates = useMemo(() => Object.fromEntries(allPlannerItems.map((item) => {
    const estimate = calculatePlannerItem(
      state.prices[item.id].minimum,
      state.prices[item.id].maximum,
      quantities.quantities[item.id],
    );
    return [item.id, estimate];
  })), [state.prices, quantities.quantities]);

  const buildGroupEstimate = (items, needsRoofSelection = false, needsPrepMethod = false) => {
    const selected = items.filter((item) => !item.roofOption || item.roofOption === state.selectedRoof)
      .map((item) => ({ ...item, estimate: rowEstimates[item.id] }));
    if (needsRoofSelection && !state.selectedRoof) {
      selected.push({ id: "roof-choice-required", estimate: { complete: false } });
    }
    if (needsPrepMethod && !state.production.preparationMethod) {
      selected.push({ id: "prep-method-required", estimate: { complete: false } });
    }
    return sumPlannerItems(selected);
  };
  const constructionItems = allPlannerItems.filter((item) => item.investmentType === "construction");
  const environmentItems = allPlannerItems.filter((item) => item.summaryGroup === "environment");
  const harvestEquipmentItems = allPlannerItems.filter((item) =>
    item.summaryGroup === "harvesting" &&
    (!item.methodOption || item.methodOption === state.production.preparationMethod));
  const initialItems = allPlannerItems.filter((item) => item.investmentType === "initial");
  const monthlyItems = allPlannerItems.filter((item) => item.investmentType === "monthly");
  const constructionEstimate = buildGroupEstimate(constructionItems, true);
  const environmentEstimate = buildGroupEstimate(environmentItems);
  const harvestingEstimate = buildGroupEstimate(harvestEquipmentItems, false, true);
  const initialEstimate = buildGroupEstimate(initialItems);
  const equipmentEstimate = sumPlannerItems([
    ...environmentItems.map((item) => ({ ...item, estimate: rowEstimates[item.id] })),
    ...harvestEquipmentItems.map((item) => ({ ...item, estimate: rowEstimates[item.id] })),
    ...(!state.production.preparationMethod ? [{ estimate: { complete: false } }] : []),
  ]);
  const monthlyEstimate = buildGroupEstimate(monthlyItems);
  const contingency = calculateContingency(
    constructionEstimate,
    equipmentEstimate,
    initialEstimate,
    state.contingencyRate,
  );
  const totalEstimate = calculateInitialInvestment(
    constructionEstimate,
    equipmentEstimate,
    initialEstimate,
    contingency,
  );
  const estimates = {
    construction: constructionEstimate,
    environment: environmentEstimate,
    harvesting: harvestingEstimate,
    equipment: equipmentEstimate,
    initial: initialEstimate,
    monthly: monthlyEstimate,
    contingency,
    total: totalEstimate,
  };
  const costPerKg = calculateCostPerKg(monthlyEstimate, state.production.monthlyHarvestKg);
  const totalRequiredSubstrate = numericValue(state.production.oysterSubstrateKg) !== null &&
    numericValue(state.production.milkySubstrateKg) !== null
    ? Number(state.production.oysterSubstrateKg) + Number(state.production.milkySubstrateKg)
    : null;
  const ownStrawUsed = quantities.strawBalance?.ownUsed ?? null;
  const ownStrawValueRate = calculatePlannerItem(
    state.production.ownPaddyStrawValueMin,
    state.production.ownPaddyStrawValueMax,
    ownStrawUsed,
  );
  const roofArea = quantities.roofArea;
  const roofEstimateFor = (option) => {
    const items = constructionGroups[1].items.filter((item) =>
      !item.roofOption || item.roofOption === option.id);
    if (!roofArea) return { complete: false, average: null, minimum: null, maximum: null };
    return sumPlannerItems(items.map((item) => ({ ...item, estimate: rowEstimates[item.id] })));
  };
  const suitableRoofEstimates = roofOptions
    .filter((option) => option.id !== "galvalume")
    .map((option) => ({ option, estimate: roofEstimateFor(option) }))
    .filter(({ estimate }) => estimate.complete);
  const recommendedRoof = suitableRoofEstimates.length
    ? suitableRoofEstimates.reduce((best, current) =>
      current.estimate.average < best.estimate.average ? current : best)
    : null;
  const renderGroup = (group, { methodPicker = false } = {}) => (
    <details className="plan-accordion" key={group.title}>
      <summary>{group.title}<span>Expand to enter quantities and local price ranges</span></summary>
      {methodPicker && (
        <div className="prep-method-control">
          <label>
            <span>Preparation approach</span>
            <select
              value={state.production.preparationMethod}
              onChange={(event) => updateProduction("preparationMethod", event.target.value)}
            >
              <option value="">Select manual or mechanised</option>
              <option value="manual">Manual tools</option>
              <option value="mechanized">Mechanised equipment</option>
            </select>
          </label>
          <p>Compare the selected approach before including its equipment in the investment summary. Do not count manual and mechanised alternatives together.</p>
        </div>
      )}
      <PlannerItemTable
        items={group.items}
        state={state}
        quantities={quantities.quantities}
        updateQuantity={(id, value) => updateMap("quantities", id, value)}
        updatePrice={updatePrice}
      />
    </details>
  );

  return (
    <>
      <SiteHeader />
      <PlanNavigation />
      <main className="infrastructure-page investment-planner-page">
        <section className="infra-hero planner-hero">
          <div className="infra-hero-copy">
            <p className="eyebrow">GreenSpore Farms · Kanipakam, Chittoor</p>
            <h1>Complete Farm Investment Planner</h1>
            <p className="infra-hero-lead">
              A practical room, construction, Oyster and Milky cultivation, and operating-cost planner for the proposed 100 kg pilot across multiple flushes.
            </p>
            <div className="infra-hero-actions">
              <a className="button button-gold" href="#investment-summary">View investment summary</a>
              <button className="button button-outline" type="button" onClick={() => window.print()}>Print / Save as PDF</button>
            </div>
          </div>
          <aside className="infra-status-card" aria-label="Project overview">
            <span className="status-pill">Editable planning estimate</span>
            <strong>20 × 40 ft</strong>
            <span>800 sq. ft. site · near Kanipakam</span>
            <strong>60 kg Oyster + 40 kg Milky</strong>
            <span>Initial target across multiple flushes; not a single harvest.</span>
          </aside>
        </section>

        <InvestmentSummary
          estimates={estimates}
          contingencyRate={state.contingencyRate}
          updateContingency={(value) => setState((current) => ({ ...current, contingencyRate: value }))}
        />
        <p className="planner-save-status" role="status">{storageMessage}</p>

        <section id="room-design" className="infra-section infra-section-muted">
          <SectionTitle eyebrow="01 · Room design plan" title="Review and adjust the concept room schedule.">
            The proposed layout retains all fourteen named spaces from the current concept. Room dimensions are editable and are not engineer-validated.
          </SectionTitle>
          <p className="concept-disclaimer">Conceptual layout – not an approved construction drawing</p>
          <div className="layout-grid planner-layout-grid">
            <figure className="layout-figure planner-layout-figure">
              <RoomPlanSvg layout={layout} plotWidth={state.plot.width} plotLength={state.plot.length} />
              <figcaption>Room blocks resize from the editable dimension schedule. The dashed boundary represents the entered plot dimensions.</figcaption>
            </figure>
            <aside className="layout-summary planner-layout-summary">
              <h3>Area check</h3>
              <div className="assumption-grid">
                <InlineInput label="Plot width" unit="ft" value={state.plot.width}
                  onChange={(value) => updateFlat("plot", "width", value)} />
                <InlineInput label="Plot length" unit="ft" value={state.plot.length}
                  onChange={(value) => updateFlat("plot", "length", value)} />
              </div>
              <dl className="area-metrics">
                <div><dt>Total room area (excluding passage)</dt><dd>{formatValue(layout.totalArea === null ? null : layout.totalArea - (layout.passageArea || 0))} sq. ft.</dd></div>
                <div><dt>Service passage area</dt><dd>{formatValue(layout.passageArea)} sq. ft.</dd></div>
                <div><dt>Total scheduled area</dt><dd>{formatValue(layout.totalArea)} sq. ft.</dd></div>
                <div><dt>Total plot area</dt><dd>{formatValue(layout.calculatedPlotArea)} sq. ft.</dd></div>
              </dl>
              <p className={layout.areaMatches && layout.geometryMatches ? "validation-pass" : "validation-warning"}>
                {!layout.areaMatches
                  ? "Area schedule does not match the entered plot. Review the dimensions; the planner does not change them automatically."
                  : !layout.geometryMatches
                    ? "The room row widths / passage or total room depth do not align with the plot dimensions."
                    : "Room and passage areas and layout dimensions match the entered plot."}
              </p>
            </aside>
          </div>
          <EstimateTable
            className="room-schedule-table"
            caption="Editable proposed dimensions, area, purpose and suggested equipment."
            columns={[
              { key: "room", label: "Room name" },
              { key: "length", label: "Length (ft)", render: (room) => (
                <input className="table-input" aria-label={`${room.room} length in feet`} type="number" min="0.1" step="any"
                  value={state.rooms[room.id].length}
                  onChange={(event) => updateRoom(room.id, "length", event.target.value)} />
              ) },
              { key: "width", label: "Width (ft)", render: (room) => (
                <input className="table-input" aria-label={`${room.room} width in feet`} type="number" min="0.1" step="any"
                  value={state.rooms[room.id].width}
                  onChange={(event) => updateRoom(room.id, "width", event.target.value)} />
              ) },
              { key: "area", label: "Area (sq. ft.)", render: (room) => formatValue(room.area) },
              { key: "purpose", label: "Room purpose" },
              { key: "equipment", label: "Suggested equipment", render: (room) => roomEquipment[room.id] },
            ]}
            rows={layout.rooms}
          />
        </section>

        <section id="construction" className="infra-section">
          <SectionTitle eyebrow="02 · Construction plan" title="Price the complete building scope, item by item.">
            Enter measured quantities and local Tirupati / Chittoor price ranges. No structural sizes, roof area or market rate is invented.
          </SectionTitle>
          <div className="accordion-stack">
            <details className="plan-accordion">
              <summary>2.1 Cement brick construction<span>Brick quantity calculator and masonry cost schedule</span></summary>
              <div className="assumptions-panel planner-assumptions">
                <h3>Wall measurement inputs</h3>
                <p>External and partition masonry are calculated separately. Enter actual openings, brick size and mortar assumptions; structural and reinforcement quantities need engineer-approved drawings.</p>
                <div className="assumption-grid">
                  {[
                    ["buildingLength", "Building length", "ft"],
                    ["buildingWidth", "Building width", "ft"],
                    ["wallHeight", "Proposed wall height", "ft"],
                    ["externalOpeningsArea", "External openings", "sq. ft."],
                    ["wallThickness", "External wall thickness", "ft"],
                    ["partitionLength", "Internal partition length", "ft"],
                    ["partitionHeight", "Internal partition height", "ft"],
                    ["partitionOpeningsArea", "Partition openings", "sq. ft."],
                    ["partitionThickness", "Partition thickness", "ft"],
                    ["brickLength", "Brick length", "in"],
                    ["brickWidth", "Brick width", "in"],
                    ["brickHeight", "Brick height", "in"],
                    ["mortarJoint", "Mortar joint", "in"],
                    ["brickWastagePercent", "Brick wastage", "%"],
                    ["cementParts", "Cement mix parts", "ratio"],
                    ["sandParts", "Sand mix parts", "ratio"],
                    ["mortarDryFactor", "Dry mortar factor", "ratio"],
                    ["cementBagVolume", "Cement bag volume", "cu. ft."],
                  ].map(([field, label, unit]) => (
                    <InlineInput key={field} label={label} unit={unit} value={state.assumptions[field]}
                      onChange={(value) => updateAssumption(field, value)} />
                  ))}
                </div>
                <p>External gross wall area: <strong>{formatValue(quantities.wall?.externalGrossArea)} sq. ft.</strong> · net external wall area: <strong>{formatValue(quantities.wall?.externalNetArea)} sq. ft.</strong></p>
                <p>External bricks: <strong>{formatValue(quantities.wall?.externalBricks)}</strong> · internal partition bricks: <strong>{formatValue(quantities.wall?.partitionBricks)}</strong> · total bricks: <strong>{formatValue(quantities.wall?.totalBricks)}</strong></p>
                <p>External mortar: <strong>{formatValue(quantities.wall?.externalMortarVolume)} cu. ft.</strong> · partitions: <strong>{formatValue(quantities.wall?.partitionMortarVolume)} cu. ft.</strong></p>
              </div>
              <PlannerItemTable items={constructionGroups[0].items} state={state} quantities={quantities.quantities}
                updateQuantity={(id, value) => updateMap("quantities", id, value)} updatePrice={updatePrice} />
            </details>

            <details className="plan-accordion">
              <summary>2.2 Roof plan<span>Four roof alternatives · one selected system is included in totals</span></summary>
              <div className="roof-calculator">
                <p>Roof area is calculated from entered roof length, width, slope and overhang; the 800 sq. ft. plot area is not used as roof area.</p>
                <div className="roof-dimensions">
                  {[
                    ["length", "Roof length", "ft"],
                    ["width", "Roof width", "ft"],
                    ["slopePercent", "Roof slope", "%"],
                    ["overhang", "Overhang on each side", "ft"],
                  ].map(([field, label, unit]) => (
                    <InlineInput key={field} label={label} unit={unit} value={state.roof[field]}
                      onChange={(value) => updateRoof(field, value)} />
                  ))}
                </div>
                <p className="roof-area-result">Calculated sloped roof area: <strong>{formatValue(roofArea)} sq. ft.</strong></p>
                <label className="planner-input roof-select-input">
                  <span>Roof option included in investment summary</span>
                  <select value={state.selectedRoof} onChange={(event) => setState((current) => ({ ...current, selectedRoof: event.target.value }))}>
                    <option value="">Select after comparison</option>
                    {roofOptions.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
                  </select>
                </label>
              </div>
              <EstimateTable
                className="roof-comparison-table"
                caption="Compare complete installed costs only after entering the roof area, all common components and option-specific layers."
                columns={[
                  { key: "label", label: "Roof option" },
                  { key: "specification", label: "Thickness / specification" },
                  { key: "heat", label: "Heat control" },
                  { key: "durability", label: "Durability" },
                  { key: "condensation", label: "Condensation" },
                  { key: "maintenance", label: "Maintenance" },
                  { key: "installed", label: "Average installed total", render: (option) => {
                    const estimate = roofEstimateFor(option);
                    return estimate.complete ? formatMoney(estimate.average) : "Price / quantity to be confirmed";
                  } },
                  { key: "rate", label: "Average installed cost / sq. ft.", render: (option) => {
                    const estimate = roofEstimateFor(option);
                    return estimate.complete && roofArea > 0 ? formatMoney(estimate.average / roofArea) : "Price / area to be confirmed";
                  } },
                ]}
                rows={roofOptions}
              />
              <div className="reconciliation-note">
                {recommendedRoof ? (
                  <>
                    <h3>Lowest priced insulated option in the current complete comparison: {recommendedRoof.option.label}</h3>
                    <p>Average installed estimate: {formatMoney(recommendedRoof.estimate.average)} ({formatMoney(recommendedRoof.estimate.average / roofArea)} per sq. ft.). Confirm site suitability, product documentation and local service before choosing.</p>
                  </>
                ) : (
                  <>
                    <h3>Roof recommendation pending comparable local prices</h3>
                    <p>Complete measured area, common structural / installation costs, and each insulated alternative before comparing installed cost. Uninsulated Galvalume is not treated as a complete crop-room envelope. PUF integrated insulation is not costed again as a separate layer. Asbestos-containing roofing is excluded.</p>
                  </>
                )}
              </div>
              <PlannerItemTable
                items={constructionGroups[1].items}
                state={state}
                quantities={quantities.quantities}
                updateQuantity={(id, value) => updateMap("quantities", id, value)}
                updatePrice={updatePrice}
              />
              <p className="note">Shared trusses, purlins, fasteners, flashing, ridge caps, gutters, downpipes, fabrication, installation and transport appear once in the total. Option-only insulation and ceiling rows are included only for the selected roof.</p>
            </details>

            {constructionGroups.slice(2).map((group) => renderGroup(group))}
          </div>
          <p className="note">Electrical ratings, cable sizes, foundation dimensions, steel and structural details require qualified local professionals. Do not count labour again when included in another work contract.</p>
        </section>

        <section id="harvesting-setup" className="infra-section infra-section-muted">
          <SectionTitle eyebrow="03 · Mushroom harvesting setup" title="Build Oyster and Milky inputs from the cultivation method.">
            Spawn, bag and dry paddy straw quantities are calculated only after substrate batch sizes and method-specific inputs are entered.
          </SectionTitle>
          <p className="note">
            Recommended spawn price assumption: <strong>Planning estimate – local price verification required.</strong> No comparable published Tirupati / Chittoor spawn rate has been entered; add a locally checked minimum and maximum rate in the spawn table.
          </p>
          <div className="production-assumptions">
            <h3>Crop and batch assumptions</h3>
            <div className="assumption-grid">
              <InlineInput label="Oyster target across flushes" unit="kg" value={state.production.oysterTargetKg}
                onChange={(value) => updateProduction("oysterTargetKg", value)} />
              <InlineInput label="Milky target across flushes" unit="kg" value={state.production.milkyTargetKg}
                onChange={(value) => updateProduction("milkyTargetKg", value)} />
              <InlineInput label="Oyster dry substrate requirement" unit="kg" value={state.production.oysterSubstrateKg}
                onChange={(value) => updateProduction("oysterSubstrateKg", value)} />
              <InlineInput label="Milky dry substrate requirement" unit="kg" value={state.production.milkySubstrateKg}
                onChange={(value) => updateProduction("milkySubstrateKg", value)} />
              <InlineInput label="Oyster spawn rate" unit="% of dry substrate" value={state.production.oysterSpawnRate}
                onChange={(value) => updateProduction("oysterSpawnRate", value)} />
              <InlineInput label="Milky spawn rate" unit="% of dry substrate" value={state.production.milkySpawnRate}
                onChange={(value) => updateProduction("milkySpawnRate", value)} />
              <InlineInput label="Dry substrate per bag" unit="kg" value={state.production.drySubstratePerBagKg}
                onChange={(value) => updateProduction("drySubstratePerBagKg", value)} />
              <InlineInput label="Bag length" unit="in" value={state.production.bagLengthIn}
                onChange={(value) => updateProduction("bagLengthIn", value)} />
              <InlineInput label="Bag width" unit="in" value={state.production.bagWidthIn}
                onChange={(value) => updateProduction("bagWidthIn", value)} />
              <InlineInput label="Bag thickness" unit="micron" value={state.production.bagThicknessMicron}
                onChange={(value) => updateProduction("bagThicknessMicron", value)} />
            </div>
            <p>Initial target: <strong>{formatValue(numericValue(state.production.oysterTargetKg) + numericValue(state.production.milkyTargetKg))} kg across multiple flushes.</strong> Dry paddy straw required: <strong>{formatValue(totalRequiredSubstrate)} kg</strong>. Bag count: <strong>{formatValue(quantities.quantities.bags)}</strong>.</p>
          </div>
          <div className="accordion-stack">
            {harvestGroups.map((group) => renderGroup(group, { methodPicker: group.title === "3.4 Straw preparation and pasteurisation" }))}
          </div>
          <div className="straw-valuation">
            <h3>Own-farm paddy straw · economic value versus cash cost</h3>
            <div className="assumption-grid">
              <InlineInput label="Confirmed own dry paddy straw available" unit="kg" value={state.production.ownPaddyStrawKg}
                onChange={(value) => updateProduction("ownPaddyStrawKg", value)} />
              <InlineInput label="Own straw minimum economic value" unit="₹ / kg" value={state.production.ownPaddyStrawValueMin}
                onChange={(value) => updateProduction("ownPaddyStrawValueMin", value)} />
              <InlineInput label="Own straw maximum economic value" unit="₹ / kg" value={state.production.ownPaddyStrawValueMax}
                onChange={(value) => updateProduction("ownPaddyStrawValueMax", value)} />
            </div>
            <p>Own straw used: <strong>{formatValue(ownStrawUsed)} kg</strong> · Estimated economic value: <strong>{formatMoney(ownStrawValueRate.average)}</strong> · This value is not cash expenditure. Purchased quantity is based on available dry paddy straw and total substrate requirement.</p>
            {!state.reuse.straw && <p className="validation-warning">Own-straw reuse is not confirmed, so the planner treats dry substrate as purchased straw.</p>}
          </div>
        </section>

        <section id="operating-expenses" className="infra-section">
          <SectionTitle eyebrow="04 · Other / operating expenses" title="Separate first-batch costs from recurring monthly spending.">
            Construction and equipment installation labour belong to Section 02. Recurring production labour here is separate to prevent double counting.
          </SectionTitle>
          <div className="accordion-stack">
            {operatingGroups.map((group) => renderGroup(group))}
            <details className="plan-accordion">
              <summary>Agricultural resource reuse and savings<span>Confirm each asset; no savings are assumed in the investment total</span></summary>
              <EstimateTable
                className="resource-table"
                caption="Savings and handling values are optional planning inputs. Savings are shown separately and are not deducted from capital estimates."
                columns={[
                  { key: "label", label: "Resource" },
                  { key: "available", label: "Confirmed available", render: (resource) => (
                    <input type="checkbox" aria-label={`${resource.label} confirmed available`}
                      checked={state.reuse[resource.id]}
                      onChange={(event) => updateMap("reuse", resource.id, event.target.checked)} />
                  ) },
                  { key: "use", label: "Planned use" },
                  { key: "saving", label: "Estimated cash saving (min–max)", render: (resource) => (
                    <div className="range-edit">
                      <input className="table-input" type="number" min="0" placeholder="To confirm" aria-label={`${resource.label} minimum cash saving`}
                        value={state.savings[resource.id].minimum} onChange={(event) => updateSavings(resource.id, "minimum", event.target.value)} />
                      <input className="table-input" type="number" min="0" placeholder="To confirm" aria-label={`${resource.label} maximum cash saving`}
                        value={state.savings[resource.id].maximum} onChange={(event) => updateSavings(resource.id, "maximum", event.target.value)} />
                    </div>
                  ) },
                  { key: "handling", label: "Additional handling cost (min–max)", render: (resource) => (
                    <div className="range-edit">
                      <input className="table-input" type="number" min="0" placeholder="To confirm" aria-label={`${resource.label} minimum handling cost`}
                        value={state.savings[resource.id].handlingMinimum} onChange={(event) => updateSavings(resource.id, "handlingMinimum", event.target.value)} />
                      <input className="table-input" type="number" min="0" placeholder="To confirm" aria-label={`${resource.label} maximum handling cost`}
                        value={state.savings[resource.id].handlingMaximum} onChange={(event) => updateSavings(resource.id, "handlingMaximum", event.target.value)} />
                    </div>
                  ) },
                ]}
                rows={resourceRows}
              />
            </details>
          </div>
          <div className="operating-metrics">
            <article>
              <span>Initial batch expenses</span>
              <strong>{initialEstimate.complete ? formatMoney(initialEstimate.average) : "Complete item prices"}</strong>
              <small>Average estimate calculated from Section 03 consumables and Section 04 initial batch entries.</small>
            </article>
            <article>
              <span>Recurring monthly operating expenses</span>
              <strong>{monthlyEstimate.complete ? formatMoney(monthlyEstimate.average) : "Complete monthly inputs"}</strong>
              <small>Not included in initial investment.</small>
            </article>
            <article>
              <span>Monthly operating cost per kg harvested</span>
              <strong>{costPerKg ? formatMoney(costPerKg.average) : "Enter monthly cost and harvest"}</strong>
              <small>{costPerKg
                ? `Range: ${formatMoney(costPerKg.minimum)}–${formatMoney(costPerKg.maximum)} per kg.`
                : "Uses monthly operating estimate ÷ entered monthly kilograms harvested."}</small>
            </article>
          </div>
          <div className="assumptions-panel monthly-harvest-input">
            <InlineInput label="Expected monthly harvested mushrooms" unit="kg / month" value={state.production.monthlyHarvestKg}
              onChange={(value) => updateProduction("monthlyHarvestKg", value)} />
            <p>Production yield and monthly volume are editable assumptions; they are not extrapolated from the 100 kg multi-flush target.</p>
          </div>
        </section>

        <section className="infra-disclaimer">
          <p className="eyebrow">Planning and safety note</p>
          <p>
            Prices are not confirmed supplier quotations. For a reliable local estimate, enter comparable Tirupati / Chittoor planning ranges after checking local published rates and written market prices. Where no reliable published local rate is available, the planner leaves the price as “Price to be confirmed.”
          </p>
          <p>
            Final room dimensions, masonry quantities, foundation and roof design, equipment capacity, electrical ratings, water quality, crop protocol and installation requirements must be checked by qualified local professionals before construction or production. No water, electricity, shed or other infrastructure is assumed to exist unless confirmed in the reuse section.
          </p>
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
