export const projectDetails = {
  location: "Near Kanipakam, Andhra Pradesh",
  plotLength: 40,
  plotWidth: 20,
  plotArea: 800,
  varieties: ["Oyster", "Milky"],
  targetKg: 100,
};

export const layoutRooms = [
  { id: "raw-straw", room: "Raw straw storage", length: 17, width: 6, area: 102, flow: "Raw / dry zone", purpose: "Keep paddy straw dry, raised and pest protected." },
  { id: "substrate-prep", room: "Substrate preparation", length: 10, width: 6, area: 60, flow: "Raw / wet zone", purpose: "Cut, weigh and stage paddy straw for processing." },
  { id: "soak-pasteurisation", room: "Soak / pasteurisation", length: 7, width: 6, area: 42, flow: "Raw / wet zone", purpose: "Soak and treat substrate using the validated process." },
  { id: "clean-inoculation", room: "Clean inoculation", length: 10, width: 4, area: 40, flow: "Clean zone", purpose: "Inoculate and fill bags with clean tools and workflow." },
  { id: "wash-sanitation", room: "Wash / sanitation", length: 7, width: 4, area: 28, flow: "Wet service zone", purpose: "Wash equipment and support hygiene without wetting clean zones." },
  { id: "oyster-incubation", room: "Oyster incubation", length: 8.5, width: 6, area: 51, flow: "Crop-specific clean zone", purpose: "Incubate Oyster bags under the selected strain protocol." },
  { id: "milky-incubation", room: "Milky incubation", length: 8.5, width: 6, area: 51, flow: "Crop-specific clean zone", purpose: "Incubate Milky bags under a separate crop protocol." },
  { id: "oyster-fruiting", room: "Oyster fruiting", length: 8.5, width: 7, area: 59.5, flow: "Crop-specific humid zone", purpose: "Manage Oyster fruiting, fresh air and humidity." },
  { id: "milky-fruiting", room: "Milky fruiting", length: 8.5, width: 7, area: 59.5, flow: "Crop-specific humid zone", purpose: "Manage Milky fruiting and casing workflow separately." },
  { id: "casing-preparation", room: "Casing preparation / storage", length: 8.5, width: 6, area: 51, flow: "Crop-specific clean zone", purpose: "Prepare and store casing materials for the Milky process." },
  { id: "utility-equipment", room: "Utility / equipment", length: 8.5, width: 6, area: 51, flow: "Service zone", purpose: "Locate service equipment in a protected, serviceable space." },
  { id: "packing-grading", room: "Packing / grading", length: 10, width: 5, area: 50, flow: "Clean post-harvest zone", purpose: "Grade, weigh and pack harvested mushrooms." },
  { id: "finished-storage", room: "Finished product storage", length: 7, width: 5, area: 35, flow: "Clean post-harvest zone", purpose: "Short-term clean holding before dispatch." },
  { id: "service-passage", room: "Service passage", length: 40, width: 3, area: 120, flow: "Access / circulation", purpose: "Provide access and controlled movement through the facility." },
];

export const existingBudget = [
  { category: "Construction, partitions, floor, roof insulation and services", low: 395000, high: 685000 },
  { category: "Temperature, humidity and ventilation equipment", low: 45000, high: 120000 },
  { category: "Racks and bag supports", low: 35000, high: 70000 },
  { category: "Straw preparation and pasteurisation", low: 39000, high: 97000 },
  { category: "Milky casing tools", low: 5000, high: 13500 },
  { category: "Packing and cooling", low: 34000, high: 78500 },
];

export function getBudgetSummary(rows = existingBudget, contingencyRate = 0.1) {
  const subtotalLow = rows.reduce((total, row) => total + row.low, 0);
  const subtotalHigh = rows.reduce((total, row) => total + row.high, 0);
  const contingencyLow = Math.round(subtotalLow * contingencyRate);
  const contingencyHigh = Math.round(subtotalHigh * contingencyRate);

  return {
    subtotalLow,
    subtotalHigh,
    contingencyLow,
    contingencyHigh,
    totalLow: subtotalLow + contingencyLow,
    totalHigh: subtotalHigh + contingencyHigh,
    planningMidpoint: (subtotalLow + contingencyLow + subtotalHigh + contingencyHigh) / 2,
  };
}

const equipmentItem = (name, purpose, specification, quantity, location, utility, maintenance, essential = true) => ({
  name,
  purpose,
  specification,
  material: "Supplier to specify; verify construction and suitability for the intended room and use.",
  quantity,
  location,
  utility,
  maintenance,
  classification: essential ? "Essential for pilot (verify)" : "Optional / defer until justified",
  unitPrice: "Quotation required",
  totalPrice: "Quotation required",
});

export const civilWorks = [
  {
    title: "A. Site preparation",
    items: [
      { activity: "Land clearing and debris removal", quantity: "Site survey", purpose: "Prepare a safe, accessible work area.", contractor: "Confirm disposal method and access constraints.", cost: "Quotation required" },
      { activity: "Level survey and setting out", quantity: "800 sq ft plot", purpose: "Confirm boundaries, levels and proposed building position.", contractor: "Provide measured survey and written set-out.", cost: "Quotation required" },
      { activity: "Soil inspection", quantity: "As advised by engineer", purpose: "Inform foundation design and drainage decisions.", contractor: "Provide soil information required by the engineer.", cost: "Quotation required" },
      { activity: "Foundation preparation", quantity: "From approved drawings", purpose: "Support the structure using site-specific design.", contractor: "Submit engineer-approved scope; no assumed depth or reinforcement.", cost: "Quotation required" },
      { activity: "Surface water and access planning", quantity: "Site measured", purpose: "Manage rainwater and loading access without ponding.", contractor: "Show falls, discharge point and access route on drawings.", cost: "Quotation required" },
    ],
  },
  {
    title: "B. Foundation and flooring",
    items: [
      { activity: "Foundation and plinth", quantity: "Engineer to specify", purpose: "Provide a stable base for the selected building system.", contractor: "Price only against approved structural drawings.", cost: "Quotation required" },
      { activity: "Concrete floor and washable finish", quantity: "Up to 800 sq ft footprint", purpose: "Provide a durable surface for cleaning and movement.", contractor: "Confirm build-up, finish, curing and compatibility with cleaning protocol.", cost: "Quotation required" },
      { activity: "Waterproofing and sealed floor-wall junctions", quantity: "Room-wise measure", purpose: "Reduce water ingress and moisture migration.", contractor: "Describe system, preparation, warranty and repair method.", cost: "Quotation required" },
      { activity: "Floor falls, drains and removable covers", quantity: "Engineer / MEP design", purpose: "Move wash water to an approved discharge point and reduce standing water.", contractor: "Show levels, drain locations, clean-out access and wastewater route.", cost: "Quotation required" },
      { activity: "Anti-slip finish and rodent-resistant junction detailing", quantity: "Room-wise measure", purpose: "Support safe cleaning and pest exclusion.", contractor: "Submit product data and junction details for review.", cost: "Quotation required" },
    ],
  },
  {
    title: "C. Walls and partitions",
    items: [
      { activity: "External wall system", quantity: "Site measured", purpose: "Enclose and protect the growing facility.", contractor: "Compare local blockwork and insulated-panel quotations.", cost: "Quotation required" },
      { activity: "Internal room partitions", quantity: "From approved layout", purpose: "Separate dry, wet, clean and crop-specific rooms.", contractor: "Include washable finish, sealed joints and door interfaces.", cost: "Quotation required" },
      { activity: "Moisture-resistant internal finish", quantity: "Room-wise measure", purpose: "Allow routine cleaning in humid or wet zones.", contractor: "Confirm substrate, coating, cure time and maintenance instructions.", cost: "Quotation required" },
      { activity: "Insect-proof and rodent-resistant detailing", quantity: "Opening / junction schedule", purpose: "Limit pest entry and protect stored materials.", contractor: "Include mesh, seals and replaceable components.", cost: "Quotation required" },
    ],
  },
  {
    title: "D. Roofing and ceiling",
    items: [
      { activity: "Roof structure and weatherproofing", quantity: "Up to 800 sq ft footprint", purpose: "Protect the facility from rain and weather.", contractor: "Engineer to specify structure, drainage and wind considerations.", cost: "Quotation required" },
      { activity: "Heat insulation and moisture-resistant ceiling", quantity: "Design measured", purpose: "Reduce heat gain and allow cleanable internal surfaces.", contractor: "Compare suitable local systems; include joints and condensation details.", cost: "Quotation required" },
      { activity: "Rainwater management and roof ventilation", quantity: "Design measured", purpose: "Route rainwater and address ventilation where appropriate.", contractor: "Coordinate with crop-room environmental design.", cost: "Quotation required" },
    ],
  },
  {
    title: "E. Doors and windows",
    items: [
      { activity: "Main entrance and loading access", quantity: "Layout dependent", purpose: "Provide controlled access for people and materials.", contractor: "Confirm clear opening, weather seal and emergency access.", cost: "Quotation required" },
      { activity: "Room doors and moisture seals", quantity: "Layout dependent", purpose: "Separate room environments and support cleaning.", contractor: "Specify material, seals, hardware and cleanability.", cost: "Quotation required" },
      { activity: "Insect mesh and ventilation openings", quantity: "MEP / layout design", purpose: "Protect openings while supporting designed air paths.", contractor: "Provide mesh grade, access for cleaning and replacement details.", cost: "Quotation required" },
    ],
  },
];

export const constructionOptions = [
  { option: "Brick / block construction", advantages: "Locally familiar and potentially serviceable by local contractors.", limitations: "Thermal performance, moisture protection and cleanable finishes need explicit design.", cost: "Obtain local, drawing-based quotation." },
  { option: "Insulated panel partitions", advantages: "Can provide an insulated, smooth internal surface with faster partition installation.", limitations: "Panel joints, impact resistance, moisture suitability and repair support require review.", cost: "Obtain panel, accessory and installation quotation." },
  { option: "Hybrid locally available system", advantages: "May balance local construction practices with insulated crop-room enclosures.", limitations: "Interfaces between systems need coordinated waterproofing and thermal detailing.", cost: "Compare complete installed scope, not panel-only rates." },
];

export const equipmentGroups = [
  {
    title: "A. Substrate preparation",
    items: [
      equipmentItem("Paddy straw cutter / chopper", "Cut straw to the protocol-required size.", "Capacity and cut length to be confirmed with the cultivation specialist.", "1; size to be validated", "Raw preparation area", "Electrical load per nameplate; electrician to verify.", "Clean after use; inspect blades and guards."),
      equipmentItem("Platform and small weighing scales", "Measure straw and batch inputs.", "Suitable capacity and resolution to be selected for actual batch sizes.", "1 each; verify", "Preparation / clean filling", "Electrical or manual, per selected model.", "Calibrate and keep dry."),
      equipmentItem("Soaking tanks and water storage", "Soak substrate and supply process water.", "Food-contact suitability, capacity and drain arrangement to be specified.", "Capacity to be validated", "Wet preparation / utility", "Water supply and drain; pump only if required.", "Clean, inspect for leaks and maintain water quality."),
      equipmentItem("Pasteurisation vessel and heating system", "Apply the validated substrate treatment.", "Batch capacity, heating source and controls require process and safety review.", "Capacity to be validated", "Pasteurisation area", "Utility requirement and safe installation by qualified trades.", "Inspect vessel, controls and safety devices."),
      equipmentItem("Temperature probes, baskets and draining platform", "Monitor treatment and drain treated straw.", "Probe range and contact materials to match the selected protocol.", "As process requires", "Wet preparation area", "Water / manual handling.", "Clean and verify probe readings."),
      equipmentItem("Stainless work tables, hoses and sanitation kit", "Support cleanable substrate handling and area cleaning.", "Washable, corrosion-resistant contact surfaces selected for the process.", "1 lot; verify", "Preparation and wash area", "Water point and suitable storage.", "Clean after each batch; store off wet floors."),
      equipmentItem("pH meter", "Measure pH only if the selected protocol requires it.", "Confirm method, calibration solution and recording practice first.", "Optional; protocol dependent", "Clean preparation area", "Battery / calibration supplies.", "Calibrate per manufacturer and store correctly.", false),
    ],
  },
  {
    title: "B. Bag filling and inoculation",
    items: [
      equipmentItem("Growing bags and batch labels", "Contain substrate and identify each production batch.", "Bag material, dimensions and count depend on validated crop protocol.", "120 Oyster + 67 Milky are preliminary only", "Clean filling area", "No fixed utility.", "Store clean and dry; keep traceable batch records."),
      equipmentItem("Bag filling tools and measuring containers", "Standardize filling and spawn measurement.", "Dedicated cleanable tools; keep separate from raw straw tools.", "1 lot; validate", "Clean inoculation area", "Manual.", "Clean and sanitize between batches."),
      equipmentItem("Bag sealer", "Close bags where required by the selected process.", "Seal type compatible with selected bag material.", "1; optional pending protocol", "Clean filling area", "Electrical load per nameplate.", "Inspect seals and clean contact surfaces.", false),
      equipmentItem("Clean work table and digital scale", "Support inoculation and accurate batch measurement.", "Smooth, cleanable surface; scale capacity to be confirmed.", "1 each; verify", "Clean inoculation area", "Electrical / battery.", "Clean between batches; verify scale."),
      equipmentItem("Spawn storage arrangement", "Hold spawn under supplier-directed conditions before use.", "Storage temperature and duration only as directed by spawn supplier.", "As supplier advises", "Clean zone / dedicated storage", "May require refrigeration; confirm supplier guidance.", "Log receipt, lot and storage conditions."),
      equipmentItem("Handwashing, PPE and sanitation supplies", "Support hygiene during clean handling.", "Handwash station, gloves, masks and approved supplies selected locally.", "1 station + consumables", "Clean-zone entry", "Water, drainage and replenishment.", "Restock and record cleaning."),
    ],
  },
  {
    title: "C. Incubation rooms",
    items: [
      equipmentItem("Moisture-resistant incubation racks", "Hold bags with access for inspection and cleaning.", "Dimensions, levels, load and finish require a room and bag-layout check.", "Capacity not yet established", "Oyster and Milky incubation rooms", "No fixed utility; protect from wet cleaning.", "Inspect corrosion, loading and cleanability."),
      equipmentItem("Temperature / humidity monitoring", "Record crop-room conditions.", "Sensor placement and number to be confirmed during commissioning.", "At least one monitoring point per room; validate", "Each incubation room", "Battery / protected low-voltage supply as selected.", "Compare readings with a reference instrument."),
      equipmentItem("Ventilation and lighting arrangement", "Provide the protocol-required air and light environment.", "Setpoints and operation depend on strain and process.", "Design required", "Each incubation room", "MEP design and qualified electrical installation.", "Clean screens; record operating checks."),
      equipmentItem("Cleaning tools and batch log", "Maintain sanitation and traceability.", "Dedicated room tools and written batch records.", "1 set per workflow", "Each incubation room", "No fixed utility.", "Clean, dry and store separately."),
    ],
  },
  {
    title: "D. Oyster fruiting room",
    items: [
      equipmentItem("Multi-tier growing racks", "Hold Oyster bags with serviceable access.", "Rack size, levels, aisle and load are unverified until measured layout is reviewed.", "Capacity not yet established", "Oyster fruiting room", "No fixed utility.", "Check stability, corrosion and clearances."),
      equipmentItem("Humidifier / fogger and distribution", "Maintain the strain-specific fruiting humidity.", "Output, water quality and control method to be sized after room-volume assessment.", "1 system; design required", "Oyster fruiting room", "Water and electrical load to be verified.", "Clean nozzles and follow water maintenance schedule."),
      equipmentItem("Exhaust, fresh-air inlet and insect mesh", "Provide the validated fresh-air exchange while excluding pests.", "Airflow and openings require cultivation and MEP design.", "Design required", "Oyster fruiting room", "Electrical load and protected openings.", "Clean mesh and inspect fan operation."),
      equipmentItem("Air circulation fans and sensors", "Reduce stagnant zones and monitor conditions.", "Positioning based on room and rack trial; avoid unvalidated airflow targets.", "Design required", "Oyster fruiting room", "Protected electrical supply.", "Clean fan guards and verify sensors."),
      equipmentItem("Diffused lighting and drainage", "Support crop observation and manage wash water.", "Light and drain details to be confirmed for chosen room finish and protocol.", "Design required", "Oyster fruiting room", "Electrical / plumbing design.", "Inspect fittings, covers and drain flow."),
      equipmentItem("Cooling system", "Control heat only if the chosen strain and measured seasonal room conditions require it.", "Do not procure until strain guidance and hot-season assessment justify it.", "Optional; decision deferred", "Oyster fruiting room", "Load and condensate management by MEP professional.", "Per selected system and manufacturer.", false),
    ],
  },
  {
    title: "E. Milky fruiting and casing",
    items: [
      equipmentItem("Milky fruiting racks", "Hold bags and support access for casing and harvest.", "Dimensions and capacity require validated bag and rack layout.", "Capacity not yet established", "Milky fruiting room", "No fixed utility.", "Inspect stability, cleanability and corrosion."),
      equipmentItem("Humidification, ventilation and monitoring", "Manage separate Milky room conditions.", "Setpoints and airflow to follow selected strain / protocol guidance.", "Design required", "Milky fruiting room", "Water and electrical design to be verified.", "Clean equipment and record room conditions."),
      equipmentItem("Casing material storage and preparation table", "Store and prepare casing material hygienically.", "Material and treatment method to be approved for chosen protocol.", "1 storage area + table", "Casing preparation / storage room", "Water if process requires; keep dry storage separate.", "Clean between preparations and control pests."),
      equipmentItem("Water spraying and sanitation tools", "Apply water and maintain room hygiene.", "Dedicated, cleanable tools; avoid cross-use between rooms.", "1 set per room", "Milky fruiting room", "Water supply.", "Clean, dry and store separately."),
    ],
  },
  {
    title: "F. Environmental monitoring and control",
    items: [
      equipmentItem("Thermo-hygrometers and digital sensors", "Monitor room conditions for decisions and records.", "Number, range and placement set during room commissioning.", "Per room; validate", "All crop rooms", "Battery or protected low-voltage supply.", "Check against reference and replace failed sensors."),
      equipmentItem("Temperature / humidity controllers and timers", "Automate selected equipment only after setpoints are validated.", "Separate room control where crop requirements differ.", "As control design requires", "Dry control location", "Qualified electrician; compatible load ratings.", "Test alarms and switching during commissioning."),
      equipmentItem("Fogger and exhaust controls", "Schedule or control humidification and air exchange.", "Setpoint logic to be tuned during environmental testing.", "As control design requires", "Protected control location", "Electrical and water design.", "Clean, inspect and log operation."),
      equipmentItem("Protected distribution panel and optional data logger", "Distribute protected power and record trends.", "Panel design, protection and earthing by qualified electrician.", "1 designed system; logger optional", "Dry utility area", "Electrical design and approval required.", "Periodic inspection by qualified electrician.", false),
      equipmentItem("Alarm / notification system", "Alert operators when monitored values exceed approved limits.", "Select only after deciding who monitors and responds.", "Optional", "Operator access point", "Network / power as selected.", "Test alert path and backup.", false),
    ],
  },
  {
    title: "G. Packing and post-harvest",
    items: [
      equipmentItem("Stainless packing table, scale and sorting trays", "Grade, weigh and stage harvest hygienically.", "Food-contact surfaces and scale range to match batch handling.", "1 each; verify", "Packing and grading area", "Power for scale as selected.", "Clean and sanitize after use."),
      equipmentItem("Food-grade packaging, sealer and labels", "Package product and preserve batch identification.", "Packaging format must be confirmed with buyer and applicable rules.", "Quote per batch / market", "Packing area", "Electrical load per sealer nameplate.", "Keep packaging dry and traceable."),
      equipmentItem("Harvest crates and movement trolley", "Move harvest without placing produce on floors.", "Washable, food-suitable crates; size to be selected.", "As harvest workflow requires", "Fruiting to packing route", "Manual handling.", "Wash, dry and inspect."),
      equipmentItem("Refrigerator / short-term storage", "Temporarily hold harvested product if justified by dispatch interval.", "Capacity and temperature guidance to be validated with buyers and food-safety advice.", "Optional; quote separately", "Finished product storage", "Electrical load and ventilation per selected unit.", "Clean and log temperature.", false),
      equipmentItem("Major cold room", "Commercial cold storage only if a verified business case supports it.", "Exclude from base budget unless separately justified and quoted.", "Not included in base", "Future option", "Professional design required.", "Supplier maintenance plan.", false),
    ],
  },
  {
    title: "H. Water and sanitation",
    items: [
      equipmentItem("Water tank, pump, filters and distribution", "Provide water to process and cleaning points.", "Capacity, quality and filter selection require usage plan and water test.", "Capacity to be determined", "Utility area", "Water and electrical load to be verified.", "Clean tank and service pump / filters."),
      equipmentItem("Washbasin, hoses, valves and floor drains", "Support handwashing and controlled cleaning.", "Locations and drain flow coordinated with civil / MEP design.", "From room layout", "Wash and clean-zone entries", "Water and wastewater connection.", "Clean traps and inspect leaks."),
      equipmentItem("Water testing and sanitation supplies", "Check process water and carry out cleaning.", "Use local lab / supplier guidance and approved product labels.", "Recurring consumables", "Wash area / dry chemical storage", "Water and safe storage.", "Record checks and replenish safely."),
    ],
  },
  {
    title: "I. Electrical and safety",
    items: [
      equipmentItem("Distribution board, MCBs and RCCB / RCBO protection", "Protect circuits serving selected equipment.", "Final ratings and coordination by qualified electrician after load schedule.", "Engineer / electrician to design", "Dry protected utility area", "Electrical installation.", "Inspection and testing by qualified electrician."),
      equipmentItem("Earthing, wiring and moisture-protected enclosures", "Protect people and equipment in damp environments.", "Select ratings and routes for actual wet-area classification.", "Engineer / electrician to design", "Throughout site", "Electrical installation.", "Periodic inspection by qualified electrician."),
      equipmentItem("Emergency lighting, fire extinguishers and signage", "Support safe egress and response.", "Select locations and ratings with local safety professionals.", "As approved plan", "Entrances / access routes", "Electrical for lighting; extinguisher type by fire professional.", "Inspect and service to supplier schedule."),
      equipmentItem("First-aid kit and personal protective equipment", "Support safe work and routine hygiene.", "Contents and PPE based on task risk assessment.", "1 initial set; verify", "Accessible dry location", "No fixed utility.", "Inspect expiry and replenish."),
    ],
  },
  {
    title: "J. Storage and material handling",
    items: [
      equipmentItem("Raised pallets / straw storage supports", "Keep dry straw protected from floors and moisture.", "Load rating, clearance and pest control to be checked.", "As measured", "Raw straw store", "No fixed utility.", "Keep dry; inspect for pests and damage."),
      equipmentItem("Sealed storage containers and material trolley", "Separate supplies and move materials through the service route.", "Material and load capacity to suit actual workflow.", "1 lot; verify", "Store / passage", "Manual handling.", "Clean and inspect wheels / closures."),
      equipmentItem("Dedicated cleaning and packaging storage", "Keep chemicals and clean packaging separate.", "Labeled, pest-resistant, dry storage.", "Separate shelves / cabinets", "Wash area and clean packing area", "No fixed utility.", "Maintain separation and inventory."),
    ],
  },
];

export const roomPlacement = [
  { room: "Raw straw store", equipment: "Raised pallets / supports; sealed straw containers; pest monitoring", utility: "Dry access; no wet-process drains in storage." },
  { room: "Substrate preparation", equipment: "Cutter, scales, soaking tanks, pasteurisation vessel, work table, probes", utility: "Water, drainage and professionally assessed power / heating." },
  { room: "Clean inoculation / filling", equipment: "Clean table, scale, bag tools, labels, handwash and PPE", utility: "Handwash water; protected power if selected." },
  { room: "Oyster incubation", equipment: "Rack, temperature / humidity monitoring, designed ventilation and light", utility: "Protected electrical points as designed." },
  { room: "Milky incubation", equipment: "Dedicated rack, temperature / humidity monitoring, designed ventilation and light", utility: "Separate room monitoring and protected electrical points." },
  { room: "Oyster fruiting", equipment: "Racks, humidifier, air inlet / exhaust, mesh, circulation, sensors, light", utility: "Water, drainage and qualified electrical installation." },
  { room: "Milky fruiting", equipment: "Racks, humidification, ventilation, sensors, light and dedicated spray tools", utility: "Separate environment; water and drainage." },
  { room: "Casing preparation / storage", equipment: "Casing table, dedicated tools and protected material storage", utility: "Water only if protocol requires; keep materials protected." },
  { room: "Packing / grading", equipment: "Food-contact table, scale, trays, sealer, packaging and labels", utility: "Protected power and cleanable surfaces." },
  { room: "Finished product storage", equipment: "Crates and optional short-term refrigerator with monitoring", utility: "Power only if a refrigerator is selected." },
  { room: "Wash / sanitation", equipment: "Washbasin, hoses, cleaning kit, water testing and sanitation supplies", utility: "Water, drain and wastewater route." },
  { room: "Utility / equipment", equipment: "Water tank / pump as sized; protected electrical panel in dry area", utility: "Water and electrical services designed by qualified professionals." },
];

export const boqGroups = [
  { category: "1. Site preparation", items: ["Clearing and disposal", "Level survey and set-out", "Soil inspection", "Access and rainwater plan"] },
  { category: "2. Civil construction", items: ["Foundation and plinth to approved design", "External enclosure", "Installation and labour"] },
  { category: "3. Flooring and drainage", items: ["Floor build-up and washable finish", "Waterproofing", "Falls, drains and covers"] },
  { category: "4. Walls and partitions", items: ["External wall / panel scope", "Internal room partitions", "Sealed, washable finishes"] },
  { category: "5. Roofing and insulation", items: ["Roof and waterproofing", "Insulation and ceiling", "Rainwater management"] },
  { category: "6. Doors and windows", items: ["Main and room doors", "Seals and hardware", "Mesh and ventilation openings"] },
  { category: "7. Electrical works", items: ["Load schedule and distribution", "Protective devices and earthing", "Wiring, points and emergency lighting"] },
  { category: "8. Plumbing works", items: ["Tank, pump and distribution", "Wash points and valves", "Floor drainage and wastewater"] },
  { category: "9. Substrate preparation", items: ["Straw cutter, scales and tanks", "Pasteurisation vessel and heating", "Baskets, tables and probes"] },
  { category: "10. Inoculation equipment", items: ["Clean table and weighing", "Bag filling / sealing tools", "Handwash, PPE and labels"] },
  { category: "11. Incubation equipment", items: ["Moisture-resistant racks", "Room monitoring", "Designed ventilation and lighting"] },
  { category: "12. Oyster fruiting equipment", items: ["Racks and humidity distribution", "Fresh-air / exhaust and mesh", "Sensors, lighting and drainage"] },
  { category: "13. Milky fruiting equipment", items: ["Dedicated racks and humidification", "Ventilation and monitoring", "Casing table and dedicated tools"] },
  { category: "14. Packing equipment", items: ["Packing table, scale and trays", "Sealer, packaging and labels", "Optional short-term refrigerator"] },
  { category: "15. Storage equipment", items: ["Pallets and sealed containers", "Packaging and chemical cabinets", "Crates and trolley"] },
  { category: "16. Safety equipment", items: ["Electrical safety design / tests", "Emergency lighting and signage", "Fire equipment and first aid"] },
  { category: "17. Installation and commissioning", items: ["Trade installation", "Environmental testing", "Operator handover and records"] },
  { category: "18. Contingency", items: ["Existing baseline allowance: approximately 10%", "Recalculate only after quotations and scope reconciliation"] },
];

export const environmentRows = [
  { parameter: "Spawn-running temperature", oyster: "Confirm selected strain and spawn-supplier protocol before setting.", milky: "Confirm selected strain and spawn-supplier protocol before setting." },
  { parameter: "Fruiting temperature", oyster: "Strain- and season-dependent; verify in trial and hot-season room assessment.", milky: "Strain- and protocol-dependent; confirm with specialist." },
  { parameter: "Relative humidity", oyster: "Set from validated strain guidance and room trial; monitor at crop level.", milky: "Set from validated strain guidance and room trial; monitor at crop level." },
  { parameter: "Fresh-air exchange", oyster: "Size and tune with crop response and qualified room design; do not assume a rate.", milky: "Size and tune separately; do not share an assumed rate with Oyster." },
  { parameter: "Light", oyster: "Confirm diffuse-light guidance for chosen strain and room.", milky: "Confirm diffuse-light guidance for chosen strain and room." },
  { parameter: "Watering / humidification", oyster: "Select method, water quality and schedule from protocol; avoid unvalidated wetting.", milky: "Select method and schedule for the crop; coordinate with casing stage." },
  { parameter: "Casing", oyster: "Not assumed in this preliminary plan; confirm protocol.", milky: "Required stage per selected plan; material and handling protocol need validation." },
  { parameter: "Contamination prevention", oyster: "Separate clean inoculation from raw straw; batch logs and cleaning checks.", milky: "Separate clean inoculation and dedicated casing tools; batch logs and cleaning checks." },
  { parameter: "Cleaning frequency", oyster: "Define and record daily / between-batch cleaning during commissioning.", milky: "Define and record daily / between-batch cleaning during commissioning." },
];

export const maintenanceChecks = [
  { frequency: "Daily", tasks: "Record room readings and alarms; inspect crop and isolate suspect bags; check water, drains, mesh and doors; clean work surfaces; record harvest and batch movement." },
  { frequency: "Weekly", tasks: "Clean reusable tools and drains; inspect fans, fogger nozzles and sensors; check straw and packaging storage for moisture or pests; review batch and maintenance logs." },
  { frequency: "Monthly / between cycles", tasks: "Deep-clean and inspect rooms; verify instruments against a reference; inspect rack condition and electrical enclosures with qualified staff; review waste and wastewater handling." },
];

export const roadmap = [
  { phase: 1, title: "Site inspection and technical validation", duration: "1–2 weeks (planning assumption)", start: 0, span: 2, dependency: "None", responsible: "Founders + cultivation specialist + civil / MEP professionals", completion: "Measured site, soil / water checks scoped, process assumptions recorded.", deliverable: "Site validation note and open-issues list." },
  { phase: 2, title: "Final layout and contractor quotations", duration: "2–3 weeks (planning assumption)", start: 2, span: 3, dependency: "Phase 1", responsible: "Founders + designer + contractors / suppliers", completion: "Reviewed room plan, scope and comparable written quotations.", deliverable: "Approved-for-quotation drawings and quote register." },
  { phase: 3, title: "Civil construction", duration: "4–8 weeks (planning assumption)", start: 5, span: 8, dependency: "Approved design, approvals and contractor appointment", responsible: "Qualified civil contractor under professional review", completion: "Enclosure, floor and partitions inspected against approved drawings.", deliverable: "Civil work records and inspection sign-off." },
  { phase: 4, title: "Waterproofing and insulation", duration: "1–2 weeks (planning assumption)", start: 13, span: 2, dependency: "Phase 3 areas ready", responsible: "Civil / envelope contractor", completion: "Curing, seals, roof drainage and moisture checks documented.", deliverable: "Product details, warranties and inspection record." },
  { phase: 5, title: "Electrical and plumbing", duration: "1–2 weeks (planning assumption)", start: 15, span: 2, dependency: "Approved MEP design and enclosure readiness", responsible: "Qualified electrician and plumber", completion: "Testing and drainage / leak checks passed.", deliverable: "Test certificates, as-built notes and maintenance guidance." },
  { phase: 6, title: "Equipment procurement", duration: "2–4 weeks (planning assumption)", start: 17, span: 4, dependency: "Validated specifications and approved quotations", responsible: "Founders + selected suppliers", completion: "Goods received, checked and recorded against orders.", deliverable: "Purchase and warranty register." },
  { phase: 7, title: "Equipment installation", duration: "1–2 weeks (planning assumption)", start: 21, span: 2, dependency: "Phases 4–6", responsible: "Suppliers and qualified trades", completion: "Equipment installed, protected and operator instructions received.", deliverable: "Installation / handover checklist." },
  { phase: 8, title: "Environmental testing", duration: "1–2 weeks (planning assumption)", start: 23, span: 2, dependency: "Phase 7", responsible: "Founders + cultivation specialist + MEP trades", completion: "Room readings logged; alarms, airflow and water systems reviewed.", deliverable: "Commissioning log and corrective-action list." },
  { phase: 9, title: "Trial cultivation", duration: "Protocol-dependent; schedule after validation", start: null, span: null, dependency: "Phase 8 and verified spawn / protocol", responsible: "Trained cultivation operators", completion: "Small-batch results, contamination, yield and cost records reviewed.", deliverable: "Trial report and go / no-go review." },
  { phase: 10, title: "First commercial production batch", duration: "Set only after successful trial", start: null, span: null, dependency: "Trial review, buyer checks and approved capacity", responsible: "Founders + production team", completion: "Batch size, buyers, operating plan and working capital approved.", deliverable: "First-batch plan and traceable production records." },
];

export const procurementCategories = [
  "Civil / insulated enclosure",
  "Substrate preparation and pasteurisation",
  "Racks and bag supports",
  "Humidity, ventilation and controls",
  "Electrical and plumbing works",
  "Packing and short-term storage",
];

export const referencedMaterials = [
  { label: "Draft small / medium-scale production layout", url: "https://www.shroomery.org/forums/showflat.php/Number/24114817", note: "Community discussion; use as an idea reference, not an engineering specification." },
];
