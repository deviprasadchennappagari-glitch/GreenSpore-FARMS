import { useState } from "react";
import logo from "../../assets/greenspore-logo.png";
import layoutImage from "../../assets/facility-layout-concept.svg";
import {
  boqGroups,
  constructionOptions,
  civilWorks,
  environmentRows,
  equipmentGroups,
  existingBudget,
  getBudgetSummary,
  layoutRooms,
  maintenanceChecks,
  procurementCategories,
  projectDetails,
  referencedMaterials,
  roadmap,
  roomPlacement,
} from "./data.js";
import "./styles.css";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const budgetSummary = getBudgetSummary();
const roomArea = layoutRooms.reduce((total, room) => total + room.area, 0);
const baselineReconciliation = [
  { baseline: "Construction, partitions, floor, roof insulation and services", scope: "BOQ 1–8 · site, civil, drainage, enclosure, roof, doors, electrical and plumbing", status: "No quote reconciliation yet" },
  { baseline: "Temperature, humidity and ventilation equipment", scope: "BOQ 11–13 plus crop-room monitoring and controls", status: "Setpoints and equipment scope pending validation" },
  { baseline: "Racks and bag supports", scope: "BOQ 11–13 · incubation and separate fruiting rooms", status: "Capacity and rack dimensions pending" },
  { baseline: "Straw preparation and pasteurisation", scope: "BOQ 9 · preparation tools, vessels and installation", status: "Batch capacity and quote pending" },
  { baseline: "Milky casing tools", scope: "BOQ 13 · casing preparation and dedicated tools", status: "Protocol and quote pending" },
  { baseline: "Packing and cooling", scope: "BOQ 14 · packing and optional short-term storage", status: "Major cold room excluded from base scope" },
];

function formatCurrency(value) {
  return currency.format(value);
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

function InfrastructurePage() {
  const procurementRows = procurementCategories.flatMap((category) =>
    ["Quote 1", "Quote 2", "Quote 3"].map((slot) => ({
      category,
      slot,
      supplier: "Not requested",
      location: "Not provided",
      price: "Pending written quote",
      gst: "Pending",
      transport: "Pending",
      installation: "Pending",
      warranty: "Pending",
      maintenance: "Pending",
      landed: "Calculate after quote",
      quoteDate: "—",
      status: "Open",
    })),
  );

  const boqRows = boqGroups.flatMap((group) =>
    group.items.map((item, index) => ({
      category: group.category,
      item,
      specification: "Set from site survey, approved layout and written supplier / contractor scope.",
      unit: "To be confirmed",
      quantity: "To be measured",
      unitCost: "Quotation required",
      totalCost: "Quotation required",
      classification: index === 0 ? "Essential scope; confirm" : "Confirm in design / quote",
    })),
  );

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
          <SectionTitle eyebrow="03 · Civil and construction scope" title="Get comparable quotes from approved drawings.">
            No foundation size, reinforcement, material thickness or installed rate is assumed here. Contractors should quote the same
            measured scope after soil, drainage, climate and room requirements are reviewed.
          </SectionTitle>
          <div className="accordion-stack">
            {civilWorks.map((group) => (
              <details className="plan-accordion" key={group.title}>
                <summary>{group.title}<span>{group.items.length} work items</span></summary>
                <DataTable
                  columns={[
                    { key: "activity", label: "Activity" },
                    { key: "quantity", label: "Quantity / basis" },
                    { key: "purpose", label: "Purpose" },
                    { key: "contractor", label: "Confirm with contractor" },
                    { key: "cost", label: "Indicative cost" },
                  ]}
                  rows={group.items}
                />
              </details>
            ))}
          </div>
          <h3 className="infra-subheading">Construction system options for local quotation</h3>
          <DataTable
            columns={[
              { key: "option", label: "Option" },
              { key: "advantages", label: "Potential advantages" },
              { key: "limitations", label: "Review points" },
              { key: "cost", label: "Cost basis" },
            ]}
            rows={constructionOptions}
          />
        </section>

        <section id="equipment" className="infra-section infra-section-muted">
          <SectionTitle eyebrow="04 · Equipment and machinery" title="Specify equipment after process and room validation.">
            Counts shown are initial planning placeholders, not approved capacities. Utility loads, contact materials and equipment sizes
            must be checked against supplier data and the final design.
          </SectionTitle>
          <div className="equipment-notice">
            <strong>Cooling is not assumed as mandatory.</strong>
            <span>Decide only after choosing the Oyster strain and measuring hot-season room conditions. A major cold room is excluded from the base budget.</span>
          </div>
          <div className="accordion-stack">
            {equipmentGroups.map((group) => (
              <details className="plan-accordion" key={group.title}>
                <summary>{group.title}<span>{group.items.length} items · prices require quotes</span></summary>
                <DataTable
                  caption={`${group.title} equipment inventory. All prices require written quotations.`}
                  columns={[
                    { key: "name", label: "Equipment" },
                    { key: "purpose", label: "Purpose" },
                    { key: "material", label: "Material / construction" },
                    { key: "specification", label: "Preliminary specification" },
                    { key: "quantity", label: "Planning quantity" },
                    { key: "location", label: "Placement" },
                    { key: "utility", label: "Power / water" },
                    { key: "maintenance", label: "Maintenance" },
                    { key: "classification", label: "Priority" },
                    { key: "unitPrice", label: "Unit price" },
                    { key: "totalPrice", label: "Estimated total" },
                  ]}
                  rows={group.items}
                />
              </details>
            ))}
          </div>
          <h3 className="infra-subheading">Room-wise equipment placement</h3>
          <DataTable
            columns={[
              { key: "room", label: "Room" },
              { key: "equipment", label: "Major equipment" },
              { key: "utility", label: "Utility / placement notes" },
            ]}
            rows={roomPlacement}
          />
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
            caption="Scope mapping into the detailed BOQ; final cost reconciliation awaits measurements and quotations."
            columns={[
              { key: "baseline", label: "Existing budget category" },
              { key: "scope", label: "Detailed BOQ scope" },
              { key: "status", label: "Reconciliation status" },
            ]}
            rows={baselineReconciliation}
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
            <p>The ₹8,89,350 planning reference is only the arithmetic midpoint of the existing indicative range. It is not a quote, approved funding amount or substitute for the BOQ reconciliation.</p>
            <p><strong>Infrastructure investment is separate from working capital.</strong> Land, spawn, substrate / consumables, labor for production,
              delivery, finance, taxes and other operating needs are not confirmed within this baseline; prepare them separately before a batch.</p>
          </div>
          <h3 className="infra-subheading">Detailed bill of quantities · pricing intentionally left pending</h3>
          <p className="note">Each row needs a measured quantity, specification, supplier / contractor quote, GST, transport and installation basis. "Quotation required" is not a zero-cost estimate.</p>
          <DataTable
            caption="Itemized preliminary bill of quantities template."
            columns={[
              { key: "serial", label: "Sl. No.", render: (_row, index) => index + 1 },
              { key: "category", label: "Category" },
              { key: "item", label: "Item" },
              { key: "specification", label: "Specification / scope" },
              { key: "unit", label: "Unit" },
              { key: "quantity", label: "Quantity" },
              { key: "unitCost", label: "Unit cost" },
              { key: "totalCost", label: "Total cost" },
              { key: "classification", label: "Essential / optional" },
            ]}
            rows={boqRows}
          />
          <DataTable
            caption="Category subtotals remain pending because none of the detailed items has a written quote."
            columns={[
              { key: "category", label: "BOQ category" },
              { key: "subtotal", label: "Category subtotal" },
              { key: "status", label: "Status" },
            ]}
            rows={boqGroups.map((group) => ({
              category: group.category,
              subtotal: "Quotation required",
              status: "Do not treat as zero; reconcile against the preserved baseline after quotes.",
            }))}
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
          <SectionTitle eyebrow="09 · Procurement management" title="Compare landed cost, not headline price.">
            Use one written scope for at least three supplier comparisons per major category. No supplier, price or warranty has been invented in this template.
          </SectionTitle>
          <DataTable
            columns={[
              { key: "category", label: "Major category" },
              { key: "slot", label: "Comparison slot" },
              { key: "supplier", label: "Supplier name" },
              { key: "location", label: "Location" },
              { key: "price", label: "Quoted price" },
              { key: "gst", label: "GST" },
              { key: "transport", label: "Transport" },
              { key: "installation", label: "Installation" },
              { key: "warranty", label: "Warranty" },
              { key: "maintenance", label: "Maintenance" },
              { key: "landed", label: "Final landed cost" },
              { key: "quoteDate", label: "Quote date" },
              { key: "status", label: "Status" },
            ]}
            rows={procurementRows}
          />
          <p className="note">Record actual supplier details only after receiving a quote. Recheck availability, taxes, delivery and installation scope before ordering.</p>
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
            This is a preliminary project-planning document prepared for GreenSpore Farms. All room dimensions, construction methods,
            structural requirements, environmental controls, equipment capacities and financial estimates must be validated through a site
            inspection, qualified civil / MEP professionals, mushroom cultivation specialists and written supplier quotations before construction or procurement.
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
