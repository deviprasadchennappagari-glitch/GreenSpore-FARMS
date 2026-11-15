const costItem = (id, name, unit, specification, investmentType, summaryGroup, options = {}) => ({
  id,
  name,
  unit,
  specification,
  investmentType,
  summaryGroup,
  ...options,
});

const construction = (id, name, unit, specification, options = {}) =>
  costItem(id, name, unit, specification, "construction", "construction", options);
const environment = (id, name, unit, specification, options = {}) =>
  costItem(id, name, unit, specification, "equipment", "environment", options);
const harvestEquipment = (id, name, unit, specification, options = {}) =>
  costItem(id, name, unit, specification, "equipment", "harvesting", options);
const batchCost = (id, name, unit, specification, options = {}) =>
  costItem(id, name, unit, specification, "initial", "other", { period: "batch", ...options });
const monthlyCost = (id, name, unit, specification, options = {}) =>
  costItem(id, name, unit, specification, "monthly", "monthly", { period: "monthly", ...options });

export const constructionGroups = [
  {
    title: "2.1 Cement brick construction",
    items: [
      construction("solid-bricks", "Solid cement bricks", "piece", "Use supplier-measured brick dimensions; quantity is calculated from net wall area and entered brick size.", { quantitySource: "bricks" }),
      construction("masonry-cement", "Cement for masonry", "bag", "Mortar mix and bag size to be confirmed; calculated when wall thickness and mortar inputs are complete.", { quantitySource: "externalCement" }),
      construction("masonry-sand", "Masonry sand", "cu ft", "Mortar quantity from measured wall geometry and the selected mix.", { quantitySource: "externalSand" }),
      construction("masonry-aggregate", "Aggregate", "cu ft", "Engineer-approved foundation/concrete take-off only."),
      construction("foundation-materials", "Foundation materials", "work item", "Scope and quantities from soil review and engineer-approved drawings."),
      construction("reinforcement-steel", "Steel reinforcement allowance", "kg", "Do not estimate bar sizes or quantities without an approved structural schedule."),
      construction("masonry-labour", "Masonry labour", "sq ft / work item", "Local mason labour or a defined activity rate; do not duplicate the separate worker entry."),
      construction("helper-labour", "Helper labour", "worker-day / work item", "Locally negotiated rate and actual crew-days."),
      construction("plastering", "Plastering", "sq ft", "Measure finished surfaces; specify internal and external work separately if required."),
      construction("wall-waterproofing", "Waterproofing", "sq ft", "Use only on measured surfaces where the envelope design requires it."),
      construction("internal-wall-finish", "Internal washable wall finish", "sq ft", "Room-wise measured area and compatible cleaning requirements."),
      construction("external-wall-finish", "External wall finish", "sq ft", "Measure external wall elevations and subtract openings."),
      construction("internal-partitions", "Internal partition masonry labour", "sq ft", "Price labour per measured net partition area; brick, cement and sand are listed separately.", { quantitySource: "partitionArea" }),
      construction("partition-cement", "Cement for internal partitions", "bag", "Calculated separately when partition dimensions, thickness and mortar inputs are complete.", { quantitySource: "partitionCement" }),
      construction("partition-sand", "Sand for internal partitions", "cu ft", "Calculated separately when partition dimensions, thickness and mortar inputs are complete.", { quantitySource: "partitionSand" }),
    ],
  },
  {
    title: "2.2 Roof plan",
    items: [
      construction("roof-cover-galvalume", "Option 1 · Colour-coated Galvalume sheets", "sq ft", "Sheet profile, base-metal thickness, coating and fixing schedule from product data.", { quantitySource: "roofArea", roofOption: "galvalume" }),
      construction("roof-cover-insulated-galvalume", "Option 2 · Galvalume sheets with separate insulation", "sq ft", "Price the sheet separately from insulation, vapour control and ceiling.", { quantitySource: "roofArea", roofOption: "insulated-galvalume" }),
      construction("roof-cover-puf", "Option 3 · PUF sandwich panels", "sq ft", "Panel thickness, core, facings, fire/thermal data and joints from product documentation.", { quantitySource: "roofArea", roofOption: "puf" }),
      construction("roof-cover-fibre-cement", "Option 4 · Asbestos-free fibre-cement sheets", "sq ft", "Use only a product explicitly documented as asbestos-free.", { quantitySource: "roofArea", roofOption: "fibre-cement" }),
      construction("roof-trusses", "Steel trusses / structural supports", "kg / work item", "Member sizes and quantities from approved structural drawings."),
      construction("roof-purlins", "Purlins", "kg / running ft", "Member schedule coordinated with selected roof system."),
      construction("roof-fasteners", "Fasteners, screws and washers", "piece / lot", "Compatible with the selected roof covering and support material."),
      construction("roof-flashing", "Flashing", "running ft / lot", "Measure edges, abutments and penetrations from the final roof drawing."),
      construction("roof-ridge-caps", "Ridge caps", "running ft", "Quantity from the selected roof shape and ridge length."),
      construction("roof-gutters", "Gutters", "running ft", "Measure eaves and coordinate rainwater discharge."),
      construction("roof-downpipes", "Downpipes", "each / running ft", "Determine quantity and routing from roof drainage design."),
      construction("roof-fabrication", "Truss fabrication labour", "work item", "Price against approved structural members and fabrication scope."),
      construction("roof-installation", "Roof installation labour", "sq ft / work item", "Measure actual sloped area; keep labour separate from materials."),
      construction("roof-transport", "Roof transport and unloading", "trip / lot", "Local written delivery estimate for the selected roof assembly."),
      construction("roof-insulation-galvalume", "Option 1 · Separate insulation and vapour control", "sq ft", "Required for a complete crop-room envelope where design specifies; not part of sheet price.", { quantitySource: "roofArea", roofOption: "galvalume" }),
      construction("roof-ceiling-galvalume", "Option 1 · Moisture-resistant ceiling", "sq ft", "Cleanable ceiling assembly; avoid counting roof insulation twice.", { quantitySource: "roofArea", roofOption: "galvalume" }),
      construction("roof-insulation-separate", "Option 2 · Insulation and vapour-control layer", "sq ft", "Separate thermal layer; specify material, thickness, barrier, tapes and installation.", { quantitySource: "roofArea", roofOption: "insulated-galvalume" }),
      construction("roof-ceiling-separate", "Option 2 · Moisture-resistant ceiling", "sq ft", "Include ceiling panels and support framework if required.", { quantitySource: "roofArea", roofOption: "insulated-galvalume" }),
      construction("roof-insulation-fibre", "Option 4 · Separate insulation and vapour control", "sq ft", "Add only as designed; keep separate from the asbestos-free sheet rate.", { quantitySource: "roofArea", roofOption: "fibre-cement" }),
      construction("roof-ceiling-fibre", "Option 4 · Moisture-resistant ceiling", "sq ft", "Include where required by the room envelope and cleanability design.", { quantitySource: "roofArea", roofOption: "fibre-cement" }),
    ],
  },
  {
    title: "2.3 Doors and windows",
    items: [
      construction("main-entrance", "Main entrance door", "each", "Opening size, frame, threshold and weather seal to be measured."),
      construction("internal-doors", "Internal room doors", "each", "Count and clear opening from the final room layout."),
      construction("moisture-doors", "Moisture-resistant doors", "each", "Specify material and seals for humid / washdown rooms."),
      construction("vent-openings", "Ventilation openings", "each / sq ft", "Size with the cultivation and ventilation design."),
      construction("insect-mesh", "Insect mesh", "sq ft", "Measure openings; select cleanable, replaceable mesh."),
      construction("door-hardware", "Door fittings and seals", "set", "Hinges, handles, closers and replaceable seals."),
      construction("door-installation", "Door installation labour", "each / work item", "Defined installation scope; do not count twice in a labour contract."),
    ],
  },
  {
    title: "2.4 Temperature and humidity equipment",
    items: [
      environment("oyster-humidifier", "Oyster · humidifier / fogging equipment", "system", "Compare humidification methods after room-volume, water-quality and crop-load review."),
      environment("oyster-temp-sensor", "Oyster · temperature sensor", "each", "Sensor count and placement to be confirmed at commissioning."),
      environment("oyster-humidity-sensor", "Oyster · humidity sensor", "each", "Sensor count and placement to be confirmed at commissioning."),
      environment("oyster-exhaust", "Oyster · exhaust fan", "each", "Size from room volume, crop load and fresh-air requirement."),
      environment("oyster-fresh-air", "Oyster · fresh-air fan / inlet", "each", "Coordinate airflow, mesh, dampers and crop requirements."),
      environment("oyster-circulation", "Oyster · air-circulation fan", "each", "Size and place to avoid dead zones or direct crop stress."),
      environment("milky-humidifier", "Milky · humidifier / fogging equipment", "system", "Separate room system; size to Milky protocol and measured room volume."),
      environment("milky-temp-sensor", "Milky · temperature sensor", "each", "Sensor count and placement to be confirmed at commissioning."),
      environment("milky-humidity-sensor", "Milky · humidity sensor", "each", "Sensor count and placement to be confirmed at commissioning."),
      environment("milky-exhaust", "Milky · exhaust fan", "each", "Size from room volume, crop load and fresh-air requirement."),
      environment("milky-fresh-air", "Milky · fresh-air fan / inlet", "each", "Coordinate airflow, mesh, dampers and crop requirements."),
      environment("milky-circulation", "Milky · air-circulation fan", "each", "Size and place to avoid dead zones or direct crop stress."),
      environment("co2-monitor", "CO₂ monitor", "each", "Select range, calibration and room coverage for cultivation use."),
      environment("room-controllers", "Room controllers", "each / system", "Independent control where room setpoints differ."),
      environment("timers", "Timers", "each", "Only for equipment where timed operation is validated."),
      environment("cooling", "Cooling equipment, if required", "system", "Optional; decide after strain guidance and hot-season room assessment. AC is not assumed everywhere."),
      environment("environment-installation", "Environmental equipment installation", "work item", "Electrical / mechanical installation against selected equipment schedule."),
    ],
  },
  {
    title: "2.5 Other construction items",
    items: [
      construction("flooring", "Floor base and washable finish", "sq ft", "Measure floor area and specify wet / dry room finish separately."),
      construction("floor-drainage", "Floor drains, covers and wastewater piping", "lot / work item", "Design falls, traps, access and lawful discharge route."),
      construction("water-tank", "Water tank", "litre / each", "Capacity based on batch process and water-use plan."),
      construction("water-pump", "Water pump", "each", "Duty and head selected by plumbing design."),
      construction("plumbing", "Water supply plumbing and valves", "running ft / work item", "Measure routes and specify pipe class, fittings and valves."),
      construction("electrical-wiring", "Electrical wiring and conduits", "running ft / work item", "Cable size and circuit design by a qualified electrician."),
      construction("distribution-board", "Distribution board, MCB and RCCB/RCBO", "system", "Ratings and protection schedule by a qualified electrician."),
      construction("earthing", "Earthing and electrical protection", "system", "Design and test by a qualified electrician."),
      construction("lighting", "Moisture-appropriate lighting", "each / lot", "Fixture count, ingress protection and circuits by design."),
      construction("washbasins", "Washbasins and handwashing stations", "each", "Locate at the clean-zone entry and service areas as planned."),
      construction("cleaning-arrangements", "Cleaning arrangements and storage", "lot", "Dedicated washable tools and safe chemical storage."),
      construction("construction-labour", "General construction labour", "worker-day / work item", "Locally negotiated; exclude work already priced under masonry, doors or installation."),
    ],
  },
];

export const harvestGroups = [
  {
    title: "3.1 Mushroom spawn",
    kind: "production",
    items: [
      batchCost("oyster-spawn", "Oyster mushroom spawn", "kg", "Calculated from entered Oyster dry-substrate quantity × cultivation-method spawn rate.", { quantitySource: "oysterSpawn" }),
      batchCost("milky-spawn", "Milky mushroom spawn", "kg", "Calculated from entered Milky dry-substrate quantity × cultivation-method spawn rate.", { quantitySource: "milkySpawn" }),
    ],
  },
  {
    title: "3.2 Growing bags",
    kind: "production",
    items: [
      batchCost("growing-bags", "Polythene growing bags", "piece", "Bag count is calculated from total substrate ÷ entered dry substrate per bag.", { quantitySource: "bags" }),
    ],
  },
  {
    title: "3.3 Paddy straw",
    kind: "production",
    items: [
      batchCost("purchased-straw", "Purchased dry paddy straw", "kg", "Cash quantity = required dry substrate − confirmed own-farm dry straw available (minimum zero).", { quantitySource: "purchasedStraw" }),
      batchCost("straw-cutting", "Paddy straw cutting", "kg / batch", "Manual or mechanized preparation rate for the measured batch.", { quantitySource: "requiredStraw" }),
      batchCost("straw-drying-storage", "Paddy straw drying and storage", "kg / batch", "Use dry, protected storage; enter actual handling cost.", { quantitySource: "requiredStraw" }),
      batchCost("straw-transport", "Paddy straw transportation", "trip / batch", "Include only actual purchased / moved straw logistics.", { quantitySource: "purchasedStraw" }),
    ],
  },
  {
    title: "3.4 Straw preparation and pasteurisation",
    kind: "equipment",
    items: [
      harvestEquipment("manual-straw-tools", "Manual straw cutting and handling tools", "set", "Lower capital approach; record real tools and capacity.", { methodOption: "manual" }),
      harvestEquipment("straw-cutter", "Straw cutter", "each", "Compare manual and mechanized capacity; verify guarding and electrical load.", { methodOption: "mechanized" }),
      harvestEquipment("chaff-cutter", "Chaff cutter, if suitable", "each", "Optional alternative; confirm cut length and safe use for paddy straw.", { methodOption: "mechanized" }),
      harvestEquipment("soaking-containers", "Soaking containers", "each / lot", "Food/process-water suitability and batch capacity to be confirmed."),
      harvestEquipment("pasteurisation-tank", "Pasteurisation drum / tank", "each", "Capacity, material, heating and safe controls depend on process."),
      harvestEquipment("heating-arrangement", "Heating arrangement", "system", "Fuel / electrical type and load to be confirmed."),
      harvestEquipment("process-thermometer", "Process thermometer", "each", "Range and accuracy to suit the validated process."),
      harvestEquipment("drying-racks", "Drying racks", "set", "Measure quantity and material for the actual batch workflow."),
      harvestEquipment("draining-equipment", "Draining baskets and equipment", "set", "Cleanable process-contact materials."),
      harvestEquipment("handling-tools", "Substrate handling tools", "set", "Separate raw-process tools from clean inoculation tools."),
    ],
  },
  {
    title: "3.5 Harvesting and handling",
    kind: "equipment",
    items: [
      harvestEquipment("storage-buckets", "Storage buckets", "each", "Food-grade / cleanable and sized for the workflow."),
      harvestEquipment("harvesting-crates", "Harvesting crates", "each", "Reusable, washable crates; set quantity from the handling plan."),
      harvestEquipment("transport-crates", "Plastic transport crates", "each", "Select stackable, cleanable crates."),
      harvestEquipment("weighing-scale", "Digital weighing scale", "each", "Capacity and resolution for batch handling."),
      harvestEquipment("packing-table", "Packing table", "each", "Cleanable, suitable work surface."),
      harvestEquipment("sealing-machine", "Bag sealing machine", "each", "Choose only if the selected package requires sealing."),
      harvestEquipment("packaging-material", "Packaging material", "piece / batch", "Select by buyer, product and shelf-life requirements."),
      harvestEquipment("storage-containers", "Storage containers", "each", "Cleanable containers suited to short-term holding."),
    ],
  },
  {
    title: "3.6 Other consumables",
    kind: "production",
    items: [
      batchCost("gloves", "Gloves", "pair / batch", "Consumption depends on staffing and hygiene process."),
      batchCost("masks", "Masks", "piece / batch", "Consumption depends on staffing and hygiene process."),
      batchCost("sanitiser", "Sanitiser", "litre / batch", "Use product compatible with the hygiene protocol."),
      batchCost("cleaning-chemicals", "Cleaning chemicals", "litre / batch", "Use labelled products appropriate to surfaces and process."),
      batchCost("disinfectant", "Disinfectant", "litre / batch", "Follow crop-room protocol and manufacturer instructions."),
      batchCost("labels", "Batch labels", "piece / batch", "Allow for traceability by crop and production batch."),
      batchCost("misc-consumables", "Miscellaneous consumables", "lot / batch", "Enter only identified, expected batch needs."),
    ],
  },
];

export const operatingGroups = [
  {
    title: "4.1 Initial production-batch expenses",
    items: [
      batchCost("batch-water", "Water for initial batch", "litre / batch", "Enter measured or process-planned batch water use."),
      batchCost("batch-electricity", "Electricity for initial batch", "kWh / batch", "Estimate from equipment nameplates and planned run hours."),
      batchCost("batch-labour", "Production labour for initial batch", "worker-day / batch", "Keep separate from construction and equipment installation labour."),
      batchCost("batch-cleaning", "Cleaning and sanitation for initial batch", "batch", "Do not duplicate the consumables listed in Section 3.6."),
      batchCost("batch-transport", "Production transport for initial batch", "trip / batch", "For supplies, spawn or harvest as applicable; avoid duplicating straw transport."),
      batchCost("batch-waste", "Waste disposal for initial batch", "batch", "Use the locally suitable disposal / reuse approach."),
      batchCost("batch-misc", "Other initial batch expense", "batch", "Add only a defined expense not listed elsewhere."),
    ],
  },
  {
    title: "4.2 Recurring monthly operating expenses",
    items: [
      monthlyCost("monthly-water", "Water", "litre / month", "Quantity and local tariff to be entered."),
      monthlyCost("monthly-electricity", "Electricity", "kWh / month", "Use actual tariff and expected equipment run hours."),
      monthlyCost("monthly-labour", "Operating labour", "worker-day / month", "Exclude construction and installation labour."),
      monthlyCost("monthly-cleaning", "Cleaning and sanitation", "month", "Do not duplicate per-batch consumables."),
      monthlyCost("monthly-transport", "Transportation", "trip / month", "Recurring farm operations only."),
      monthlyCost("monthly-packaging", "Packaging", "piece / month", "Use expected sales volume and package specification."),
      monthlyCost("monthly-maintenance", "Maintenance", "month", "Routine servicing and replaceable parts."),
      monthlyCost("monthly-waste", "Waste disposal", "month", "Subtract only when documented reuse avoids a cash cost."),
      monthlyCost("monthly-misc", "Miscellaneous operating expenses", "month", "Add only identified recurring expenses."),
    ],
  },
];

export const roofOptions = [
  {
    id: "galvalume",
    label: "Colour-coated Galvalume sheets",
    specification: "Base-metal thickness, coating, profile and warranty from selected manufacturer.",
    heat: "Low insulation by itself; not a complete crop-room thermal envelope.",
    durability: "Depends on coating, fasteners, site exposure and installation.",
    condensation: "Elevated without coordinated insulation, vapour control and ventilation.",
    maintenance: "Inspect coating, fasteners, flashings, gutters and leaks.",
    extras: ["roof-insulation-galvalume", "roof-ceiling-galvalume"],
  },
  {
    id: "insulated-galvalume",
    label: "Galvalume sheets with separate insulation",
    specification: "Price sheets, insulation, vapour-control layer and ceiling separately.",
    heat: "Can be tailored with a designed insulation assembly.",
    durability: "Each roof, insulation and ceiling layer needs its own product data.",
    condensation: "Manage thermal bridges, vapour control and sealed penetrations together.",
    maintenance: "Inspect roof skin and accessible ceiling / vapour-control details.",
    extras: ["roof-insulation-separate", "roof-ceiling-separate"],
  },
  {
    id: "puf",
    label: "PUF sandwich panels",
    specification: "Thickness, core, facings, joints, fire and thermal data from manufacturer.",
    heat: "Use product data for the exact panel and assembly.",
    durability: "Verify coating, cut edges, fasteners, handling and repair.",
    condensation: "Joint sealing and thermal bridges require supplier/design review.",
    maintenance: "Inspect joints, skins, fasteners, flashings and penetrations.",
    extras: [],
  },
  {
    id: "fibre-cement",
    label: "Asbestos-free fibre-cement sheets",
    specification: "Accept only product documentation explicitly confirming asbestos-free composition.",
    heat: "Limited insulation from the sheet alone; a designed layer may be needed.",
    durability: "Confirm manufacturer data, support spacing and impact limits.",
    condensation: "Requires coordinated insulation / vapour control where specified.",
    maintenance: "Inspect fixings, laps, flashings and damaged sheets.",
    extras: ["roof-insulation-fibre", "roof-ceiling-fibre"],
  },
];

export const resourceRows = [
  { id: "land", label: "Own agricultural land", use: "Facility site", defaultAvailable: true },
  { id: "straw", label: "Own paddy straw after harvest", use: "Substrate; quantity and economic value entered separately", defaultAvailable: true },
  { id: "labour", label: "Existing agricultural labour contacts", use: "Discuss seasonal work; no wage saving assumed", defaultAvailable: true },
  { id: "tools", label: "Existing suitable farm tools", use: "Reuse only after suitability and safety check", defaultAvailable: false },
  { id: "water", label: "Existing water source", use: "Confirm year-round supply, quality and flow", defaultAvailable: false },
  { id: "electricity", label: "Existing electricity connection", use: "Confirm sanctioned capacity and protected circuits", defaultAvailable: false },
  { id: "shed", label: "Existing shed / building", use: "Do not include as available until inspected", defaultAvailable: false },
  { id: "storage", label: "Existing suitable storage space", use: "Confirm dry, pest-protected and adequate area", defaultAvailable: false },
  { id: "road", label: "Existing access road", use: "Confirm vehicle access and loading", defaultAvailable: false },
];

export const planRows = [
  ["raw-straw"],
  ["substrate-prep", "soak-pasteurisation"],
  ["clean-inoculation", "wash-sanitation"],
  ["oyster-incubation", "milky-incubation"],
  ["oyster-fruiting", "milky-fruiting"],
  ["casing-preparation", "utility-equipment"],
  ["packing-grading", "finished-storage"],
];

export const roomEquipment = {
  "raw-straw": "Paddy straw pallets, moisture / pest checks",
  "substrate-prep": "Straw cutter, weighing scale, prep table",
  "soak-pasteurisation": "Soaking containers, pasteurisation vessel, thermometer",
  "clean-inoculation": "Clean table, scale, spawn and bag tools",
  "wash-sanitation": "Washbasin, drainage, cleaning tools",
  "oyster-incubation": "Incubation racks, temperature / humidity monitor",
  "milky-incubation": "Incubation racks, temperature / humidity monitor",
  "oyster-fruiting": "Fruiting racks, humidification and air controls",
  "milky-fruiting": "Fruiting racks, humidification and air controls",
  "casing-preparation": "Casing preparation table, storage and tools",
  "utility-equipment": "Water / electrical services and control equipment",
  "packing-grading": "Packing table, weighing scale, sealer",
  "finished-storage": "Clean containers and short-term storage",
  "service-passage": "Access and material movement",
};

export const allPlannerItems = [
  ...constructionGroups.flatMap((group) => group.items),
  ...harvestGroups.flatMap((group) => group.items),
  ...operatingGroups.flatMap((group) => group.items),
];
