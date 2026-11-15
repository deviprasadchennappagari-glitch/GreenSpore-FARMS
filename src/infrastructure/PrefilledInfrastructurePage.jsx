import { useMemo, useState } from "react";
import logo from "../../assets/greenspore-logo.png";
import layoutImage from "../../assets/facility-layout-concept.svg";
import { layoutRooms, projectDetails } from "./data.js";
import {
  constructionItems,
  PRICE_CHECKED,
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
import "./styles.css";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const unitCostFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function formatMoney(value) {
  return moneyFormatter.format(value);
}

function formatUnitCost(value) {
  return unitCostFormatter.format(value);
}

function formatNumber(value) {
  return numberFormatter.format(value);
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

function SectionNavigation() {
  const links = [
    ["room-design", "Room design"],
    ["construction", "Construction"],
    ["production-setup", "Production setup"],
    ["water-labour", "Water & labour"],
  ];
  return (
    <nav className="plan-nav" aria-label="Infrastructure plan sections">
      {links.map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}
    </nav>
  );
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

function Table({ columns, rows, caption, className = "" }) {
  return (
    <div className={`table-wrap infra-table-wrap ${className}`.trim()}>
      <table>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.room}>
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

function SourceNote({ row }) {
  const source = row.sourceId ? priceSources[row.sourceId] : null;
  return (
    <div className="budget-source">
      {source
        ? <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
        : <span className="allowance-badge">Allowance to verify</span>}
      {source && row.rateStatus !== "published" && <span className="allowance-badge">Allowance to verify</span>}
      <small>{row.sourceNote} Checked {PRICE_CHECKED}.</small>
    </div>
  );
}

function BudgetTable({ rows, title }) {
  return (
    <Table
      className="budget-table"
      caption={`${title}. Tirupati / Chittoor planning estimate; published references and local allowances are identified below. All totals are calculated from quantity × average unit cost.`}
      rows={rows}
      columns={[
        {
          key: "name",
          label: "Item",
          render: (row) => (
            <strong>
              {row.name}
              {!row.included && <small className="not-included-note">Alternative — excluded from totals</small>}
            </strong>
          ),
        },
        { key: "quantity", label: "Quantity", render: (row) => formatNumber(row.quantity) },
        { key: "unit", label: "Unit" },
        { key: "unitCost", label: "Average unit cost (₹)", render: (row) => formatUnitCost(row.unitCost) },
        {
          key: "total",
          label: "Line total",
          render: (row) => row.included
            ? <>{formatMoney(row.total)}{row.isReused && <small className="reused-note">Reused — saving {formatMoney(row.baseTotal)}</small>}</>
            : "Not included",
        },
        { key: "period", label: "Timing", render: (row) => row.period === "setup" ? "One time" : "Per crop cycle" },
        { key: "source", label: "Rate basis", render: (row) => <SourceNote row={row} /> },
      ]}
    />
  );
}

function ItemGroups({ rows, defaultOpenFirst = false }) {
  const groups = [...new Set(rows.map((row) => row.group))];
  return (
    <div className="accordion-stack budget-groups">
      {groups.map((group, index) => {
        const groupRows = rows.filter((row) => row.group === group);
        return (
          <details className="plan-accordion" key={group} open={defaultOpenFirst && index === 0}>
            <summary>
              {group}
              <span>{groupRows.filter((row) => row.included).length} budget lines</span>
            </summary>
            <BudgetTable rows={groupRows} title={group} />
          </details>
        );
      })}
    </div>
  );
}

function InvestmentSummary({ summary, productionPlan }) {
  const rows = [
    { id: "construction", category: "Construction subtotal", amount: summary.constructionSubtotal },
    { id: "production", category: "Production setup subtotal", amount: summary.productionSetupSubtotal },
    { id: "water-setup", category: "Water and labour setup subtotal", amount: summary.waterLabourSetupSubtotal },
    { id: "one-time", category: "One-time investment total", amount: summary.oneTimeInvestment, total: true },
    { id: "crop-cycle", category: "Estimated recurring cost per crop cycle", amount: summary.recurringCycleCost },
    { id: "monthly", category: "Estimated monthly operating cost", amount: null },
  ];
  return (
    <section id="budget-summary" className="investment-summary" aria-labelledby="budget-summary-title">
      <div className="planner-section-heading">
        <p className="eyebrow">Budget at a glance</p>
        <h2 id="budget-summary-title">Prefilled planning estimate — not a supplier quote</h2>
        <p className="lead">
          The 20 × 40 ft site and 60 kg Oyster + 40 kg Milky target anchor this first-pass budget.
          One-time setup and crop-cycle cash costs are separated; every total below is calculated from the item tables.
        </p>
      </div>
      <Table
        className="budget-summary-table"
        caption={`Rates reviewed ${PRICE_CHECKED}. Amounts are rounded to the nearest rupee.`}
        rows={rows}
        columns={[
          { key: "category", label: "Budget line", render: (row) => <strong className={row.total ? "summary-total-label" : ""}>{row.category}</strong> },
          {
            key: "amount",
            label: "Average estimate",
            render: (row) => row.amount === null
              ? <span className="not-supported">Not supportable yet</span>
              : <strong className={row.total ? "summary-total-value" : ""}>{formatMoney(row.amount)}</strong>,
          },
        ]}
      />
      <div className="budget-summary-footnote">
        <p>
          Monthly cost is not estimated: crop-cycle duration, metered electricity use and monthly production frequency
          have not been specified. The crop plan budgets {formatNumber(productionPlan.totalTargetKg)} kg across multiple
          flushes, not as one harvest.
        </p>
        <p>
          Published references are linked beside the relevant rows. Other rates are rounded planning allowances marked
          “Allowance to verify”; none are supplier quotations. The primary AP Government schedule is available in the
          <a href="https://irrigation.ap.gov.in/wrd/home/download-encodedDocument/MjM0Ng==" target="_blank" rel="noreferrer"> official PDF</a>.
        </p>
      </div>
    </section>
  );
}

function RoomDesignSection() {
  const area = calculateRoomAreaSummary(layoutRooms, projectDetails.plotWidth, projectDetails.plotLength);
  const roomRows = layoutRooms.map((room) => ({
    ...room,
    dimensions: `${formatNumber(room.length)} × ${formatNumber(room.width)} ft`,
  }));
  return (
    <section id="room-design" className="infra-section infra-section-muted">
      <SectionTitle eyebrow="01 · Room design plan" title="Use the current 20 × 40 ft concept layout.">
        The existing room names and arrangement are retained. The plan is conceptual; confirm dimensions, doors and
        circulation with a local designer before construction.
      </SectionTitle>
      <p className="concept-disclaimer">Conceptual layout – not an approved construction drawing</p>
      <div className="layout-grid">
        <figure className="layout-figure">
          <img src={layoutImage} alt="Conceptual GreenSpore Farms room layout with 3-foot service passage and main entry" />
          <figcaption>
            Gold marks show seven candidate room-access points, green marks ventilation candidates, and blue dots
            candidate drains. Door widths, exact access and services are assumptions for review.
          </figcaption>
        </figure>
        <aside className="layout-summary">
          <h3>Area check</h3>
          <dl className="area-metrics">
            <div><dt>Room area, excluding passage</dt><dd>{formatNumber(area.roomArea)} sq. ft.</dd></div>
            <div><dt>Service passage</dt><dd>{formatNumber(area.passageArea)} sq. ft.</dd></div>
            <div><dt>Scheduled total</dt><dd>{formatNumber(area.scheduledArea)} sq. ft.</dd></div>
            <div><dt>Plot area</dt><dd>{formatNumber(area.totalPlotArea)} sq. ft.</dd></div>
          </dl>
          <p className={area.areaMatches ? "validation-pass" : "validation-warning"}>
            {area.areaMatches
              ? "The listed room areas, passage and 20 × 40 ft plot add up."
              : "Area arithmetic does not match the stated plot; review before construction."}
          </p>
        </aside>
      </div>
      <div className="flow-map">
        <h3>Conceptual access and movement</h3>
        <div className="flow-steps" aria-label="Proposed material and product movement">
          <span>Entry → raw paddy straw storage</span>
          <span>→ substrate preparation → soak / pasteurisation</span>
          <span>→ clean inoculation → separate Oyster / Milky rooms</span>
          <span>→ packing / grading → finished product storage → dispatch</span>
        </div>
        <ul className="flow-notes">
          <li><strong>People:</strong> use the service passage and the marked access points; keep clean-zone entry controlled.</li>
          <li><strong>Waste:</strong> move spent substrate out through the passage in a separate timed trip, not while packed mushrooms move.</li>
          <li><strong>Assumption:</strong> room access and movement routes are conceptual and need a hygiene / cross-traffic review.</li>
        </ul>
      </div>
      <Table
        className="room-schedule-table"
        caption="The areas below are the existing concept dimensions; the 120 sq. ft. passage is included in the 800 sq. ft. total."
        rows={roomRows}
        columns={[
          { key: "room", label: "Room name" },
          { key: "dimensions", label: "Dimensions" },
          { key: "area", label: "Area (sq. ft.)", render: (room) => formatNumber(room.area) },
          { key: "purpose", label: "Purpose" },
        ]}
      />
    </section>
  );
}

function ResourceReuse({ availability, setAvailability, savings, productionPlan }) {
  const strawValue = availability["own-straw"]
    ? savings["own-straw"] || 0
    : 0;
  return (
    <div className="resource-reuse">
      <h3>Resource reuse and possible savings</h3>
      <p>All choices start unconfirmed. Select only a resource you have checked; savings reduce the linked budget line once.</p>
      <div className="resource-list">
        {resourceOptions.map((resource) => (
          <label className="resource-option" key={resource.id}>
            <input
              type="checkbox"
              checked={Boolean(availability[resource.id])}
              onChange={(event) => setAvailability((current) => ({ ...current, [resource.id]: event.target.checked }))}
            />
            <span>
              <strong>{resource.label}</strong>
              <small>{resource.use}</small>
              <small className="resource-saving">
                {resource.saves.length
                  ? `Estimated cash saving if confirmed: ${formatMoney(savings[resource.id] || 0)}`
                  : "Cash saving not calculated."}
              </small>
            </span>
          </label>
        ))}
      </div>
      <p className="straw-value-note">
        {availability["own-straw"]
          ? `Own-straw economic value is about ${formatMoney(strawValue)} for ${formatNumber(productionPlan.dryStrawKg)} kg at the planning replacement rate; this is not cash expenditure. Cutting, drying and transport remain budgeted.`
          : `If available, ${formatNumber(productionPlan.dryStrawKg)} kg of own dry paddy straw would have an estimated replacement value of ${formatMoney(productionPlan.dryStrawKg * 12.5)}; this is not included as cash spending.`}
      </p>
    </div>
  );
}

function InfrastructurePage() {
  const [availability, setAvailability] = useState(
    Object.fromEntries(resourceOptions.map((resource) => [resource.id, false])),
  );
  const productionPlan = useMemo(() => calculateProductionPlan(productionAssumptions), []);
  const constructionRows = useMemo(
    () => buildBudgetRows(constructionItems, productionPlan, availability),
    [productionPlan, availability],
  );
  const productionRows = useMemo(
    () => buildBudgetRows(productionItems, productionPlan, availability),
    [productionPlan, availability],
  );
  const waterLabourRows = useMemo(
    () => buildBudgetRows(waterLabourItems, productionPlan, availability),
    [productionPlan, availability],
  );
  const allRows = [...constructionRows, ...productionRows, ...waterLabourRows];
  const summary = calculateBudgetSummary(constructionRows, productionRows, waterLabourRows, productionPlan.totalTargetKg);
  const savings = calculateReuseSavings(allRows);

  return (
    <>
      <SiteHeader />
      <SectionNavigation />
      <main className="infrastructure-page investment-planner-page">
        <section className="infra-hero planner-hero">
          <div className="infra-hero-copy">
            <p className="eyebrow">GreenSpore Farms · Near Kanipakam, Chittoor</p>
            <h1>Farm Infrastructure Plan</h1>
            <p className="infra-hero-lead">
              A concise, prefilled budget for the proposed 800 sq. ft. Oyster and Milky mushroom farm.
              Estimates are planning allowances, not supplier quotations.
            </p>
            <div className="infra-hero-actions">
              <a className="button button-gold" href="#budget-summary">View budget</a>
              <button className="button button-outline" type="button" onClick={() => window.print()}>Print / Save as PDF</button>
            </div>
          </div>
          <aside className="infra-status-card" aria-label="Project overview">
            <span className="status-pill">Planning estimate · checked {PRICE_CHECKED}</span>
            <strong>20 × 40 ft</strong>
            <span>800 sq. ft. proposed site</span>
            <strong>100 kg target</strong>
            <span>60 kg Oyster + 40 kg Milky across multiple flushes.</span>
          </aside>
        </section>

        <InvestmentSummary summary={summary} productionPlan={productionPlan} />

        <RoomDesignSection />

        <section id="construction" className="infra-section">
          <SectionTitle eyebrow="02 · Construction plan" title="Budget the building and essential room systems.">
            Baseline: solid cement blocks, a Galvalume roof with separate insulation and a moisture-resistant ceiling.
            All structural quantities and installed allowances need local measurement and review; no air-conditioning is assumed.
          </SectionTitle>
          <p className="assumptions-panel">
            Block quantities are preliminary take-offs using a 9 ft wall height, 60 sq. ft. of external openings and
            about 176 linear ft of partitions with 200 sq. ft. of internal openings. Roof allowance uses about 924 sq. ft.
            including a 1 ft overhang. These are not engineer-validated dimensions. Roof alternatives and installed
            prices should be checked as complete systems; asbestos-containing sheets are excluded.
          </p>
          <ItemGroups rows={constructionRows} defaultOpenFirst />
        </section>

        <section id="production-setup" className="infra-section infra-section-muted">
          <SectionTitle eyebrow="03 · Harvesting and production setup" title="Plan crop inputs and practical handling equipment.">
            Spawn is separated by variety. The dry paddy-straw requirement is derived from the production target and
            the stated yield assumption, rather than entered as an independent guess.
          </SectionTitle>
          <div className="production-assumptions">
            <h3>Crop quantity assumptions</h3>
            <p>
              Oyster: {formatNumber(productionPlan.oysterTargetKg)} kg ÷ 60% assumed biological efficiency =
              {" "}{formatNumber(productionPlan.oysterDrySubstrateKg)} kg dry substrate. Milky:
              {" "}{formatNumber(productionPlan.milkyTargetKg)} kg ÷ 60% = {formatNumber(productionPlan.milkyDrySubstrateKg)} kg.
              The {formatNumber(productionPlan.totalDrySubstrateKg)} kg total is rounded up to {productionPlan.dryStrawKg} kg
              dry paddy straw; at 5% spawn, the model calculates {formatNumber(productionPlan.oysterSpawnKg)} kg Oyster spawn
              and {formatNumber(productionPlan.milkySpawnKg)} kg Milky spawn. One bag per 1 kg dry straw gives
              {" "}{productionPlan.bagCount} bags.
            </p>
            <p>
              The 60% efficiency is a planning assumption for both varieties: it is at the lower end of the cited
              <a href={priceSources.iihrMilky.url} target="_blank" rel="noreferrer">ICAR-IIHR Milky range</a>, but is not
              an Oyster yield guarantee. See the <a href={priceSources.iihrOyster.url} target="_blank" rel="noreferrer">Oyster cultivation reference</a>.
              The 5% spawn rate and 1 kg dry-straw-per-bag basis also need confirmation for the selected strains and process before purchasing.
            </p>
          </div>
          <div className="prep-method-note">
            <strong>Preparation approach:</strong> the budget includes a reusable manual tool set. A mechanized cutter is
            listed as an alternative and excluded from totals, so manual and mechanized costs are not counted together.
          </div>
          <ItemGroups rows={productionRows} defaultOpenFirst />
        </section>

        <section id="water-labour" className="infra-section">
          <SectionTitle eyebrow="04 · Water and labour" title="Separate utility setup from crop-cycle expenses.">
            Water availability, connection capacity and utility charges have not been assumed. Construction and
            installation labour is separate from the recurring production-labour allowance.
          </SectionTitle>
          <ItemGroups rows={waterLabourRows} defaultOpenFirst />
          <div className="operating-metrics">
            <article>
              <span>Recurring estimate per crop cycle</span>
              <strong>{formatMoney(summary.recurringCycleCost)}</strong>
              <small>{formatMoney(summary.costPerTargetKg)} per kg of the 100 kg target; planning estimate only.</small>
            </article>
            <article>
              <span>Monthly operating estimate</span>
              <strong>Not supportable yet</strong>
              <small>Cycle duration, monthly production frequency and metered utility use are not specified.</small>
            </article>
          </div>
          <ResourceReuse
            availability={availability}
            setAvailability={setAvailability}
            savings={savings}
            productionPlan={productionPlan}
          />
        </section>
      </main>
      <footer className="infra-disclaimer">
        <p className="eyebrow">Planning note</p>
        <p>
          All amounts are estimates, not supplier quotations. The AP schedule is a published state reference, the
          ICAR-IIHR spawn price is dated 2023 and subject to revision, and all unverified local prices are marked as
          allowances. Recheck prices, crop protocols, water/electricity requirements and structural details before
          construction or purchase.
        </p>
      </footer>
    </>
  );
}

export default InfrastructurePage;
