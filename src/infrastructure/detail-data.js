const makeRows = (prefix, category, rows) => rows.map(([item, description, unit, quantityBasis, priority = "Essential; verify"]) => ({
  id: `${prefix}-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  category,
  item,
  description,
  unit,
  quantityBasis,
  priority,
}));

export const constructionGroups = [
  {
    title: "A. Site preparation",
    items: makeRows("site", "Site preparation", [
      ["Land clearing", "Remove vegetation and obstructions; record disposal method.", "sq ft / lot", "Site measure and disposal scope"],
      ["Site levelling", "Survey existing levels and set proposed finished levels.", "sq ft / cu yd", "Survey and design measure"],
      ["Soil inspection", "Provide site-specific information for foundation and drainage design.", "test / lot", "As advised by structural engineer"],
      ["Site marking and measurement", "Set out boundaries, building position, levels and access.", "lot", "One measured site; confirm scope"],
      ["Foundation excavation", "Excavate only to approved structural drawings and soil findings.", "cu ft / cu m", "From engineer-approved drawings"],
      ["Soil filling and compaction", "Supply, place and test suitable fill where specified.", "cu ft / cu m", "From survey and approved design"],
      ["Rainwater drainage planning", "Show roof runoff, surface falls and lawful discharge route.", "lot / running ft", "Survey and civil design measure"],
      ["Construction debris removal", "Collect, load, transport and dispose of construction waste lawfully.", "load / trip", "Contractor to measure"],
      ["Loading/unloading access preparation", "Prepare safe vehicle access and material handling area.", "sq ft / lot", "Site and vehicle measure"],
    ]),
  },
  {
    title: "B. Foundation and structural framework",
    items: makeRows("structure", "Foundation and structural framework", [
      ["Foundation work", "Foundation type, dimensions and reinforcement only as designed after site and soil assessment.", "cu ft / lot", "Approved structural drawings"],
      ["RCC footings", "Concrete footings and reinforcement, if required by the structural engineer.", "each / cu ft", "Approved structural drawings"],
      ["Plinth beams", "Plinth beams only where required by the approved structural design.", "running ft / cu ft", "Approved structural drawings"],
      ["Structural columns", "RCC or steel columns sized and detailed by the structural engineer.", "each / running ft", "Approved structural drawings"],
      ["Steel roof trusses", "Fabricate and erect trusses to the approved span, loads and connection details.", "kg / each", "Approved structural drawings"],
      ["Purlins", "Provide purlins compatible with the approved roof system and loads.", "running ft / kg", "Approved structural drawings"],
      ["Bracing", "Provide stability bracing and connections as designed.", "kg / lot", "Approved structural drawings"],
      ["Structural fasteners", "Use compatible, corrosion-resistant fasteners specified for the system.", "each / lot", "Approved design and manufacturer schedule"],
      ["Anti-corrosion treatment", "Prepare and protect steel surfaces using the specified coating system.", "sq ft / kg", "Measured steel surface; supplier specification"],
      ["Structural painting", "Apply compatible primer and finish coats where required.", "sq ft / lot", "Measured steel surface; coating data sheet"],
    ]),
  },
  {
    title: "C. Flooring",
    items: makeRows("floor", "Flooring and drainage", [
      ["PCC/RCC base", "Base slab mix, reinforcement and thickness to be set by the engineer.", "sq ft / cu ft", "Room schedule and approved drawings"],
      ["Concrete floor finish", "Durable, cleanable finish suited to each room's moisture and handling conditions.", "sq ft", "Room-by-room measured area"],
      ["Waterproof coating", "Compatible coating at designed wet areas and interfaces.", "sq ft", "Measured wet-area surfaces"],
      ["Anti-skid flooring", "Slip-resistant finish selected for wet-process and cleaning zones.", "sq ft", "Room-by-room specification"],
      ["Floor slope", "Falls toward designed drains; gradients and levels set by the civil/plumbing designer.", "sq ft / level", "Approved drainage drawings"],
      ["Floor drains", "Drain bodies and traps selected for room use and cleanability.", "each", "Drainage design"],
      ["Drain covers", "Removable, corrosion-resistant covers compatible with drain bodies.", "each", "Drain schedule"],
      ["Wall-floor junction sealing", "Provide sealed, cleanable junctions compatible with wall and floor finishes.", "running ft", "Measured room perimeter"],
      ["Wet-area interface waterproofing", "Detail and test waterproofing at floor, wall and service penetrations.", "sq ft / running ft", "Approved wet-area details"],
    ]),
  },
  {
    title: "D. External and internal walls",
    items: makeRows("wall", "Walls and partitions", [
      ["Brick/block masonry", "Locally available masonry with designed structural, moisture and cleanable finish details.", "sq ft", "Wall elevations less openings; site measured"],
      ["Cement board partitions", "Moisture-rated boards on a compatible framed system with sealed joints.", "sq ft", "Partition elevations less openings"],
      ["PUF insulated panel partitions", "Panel core, metal skins, joint details and cleanability to manufacturer specification.", "sq ft", "Partition elevations less openings"],
      ["Other moisture-resistant system", "Locally suitable wall assembly with documented moisture, fire and cleanability properties.", "sq ft", "Measured elevations and approved specification"],
      ["Washable internal finish", "Washable coating or facing suitable for the room's humidity and cleaning chemicals.", "sq ft", "Room-by-room measured surface"],
      ["Wall waterproofing", "Waterproof wet-area wall surfaces and service penetrations where required.", "sq ft", "Wet-area measured surface"],
      ["Sealed joints and junctions", "Seal panel, wall, floor and ceiling interfaces with compatible materials.", "running ft", "Measured joint schedule"],
    ]),
  },
  {
    title: "E. Roofing components",
    items: makeRows("roof", "Roofing", [
      ["Galvalume / colour-coated metal roof sheets", "Coating, base-metal thickness, profile and manufacturer data to be submitted; quote as material only.", "sq ft", "Actual sloped roof area from final design", "Alternative roof system; select one"],
      ["PUF roof panel · 30 mm", "Factory panel with documented core, skins, fire data, joint detail and support requirements.", "sq ft", "Actual sloped roof area from final design", "Alternative roof system; select one"],
      ["PUF roof panel · 40 mm", "Factory panel with documented core, skins, fire data, joint detail and support requirements.", "sq ft", "Actual sloped roof area from final design", "Alternative roof system; select one"],
      ["PUF roof panel · 50 mm", "Factory panel with documented core, skins, fire data, joint detail and support requirements.", "sq ft", "Actual sloped roof area from final design", "Alternative roof system; select one"],
      ["PUF roof panel · 60 mm", "Factory panel with documented core, skins, fire data, joint detail and support requirements.", "sq ft", "Actual sloped roof area from final design", "Alternative roof system; select one"],
      ["PUF roof panel · 80 mm", "Factory panel with documented core, skins, fire data, joint detail and support requirements.", "sq ft", "Actual sloped roof area from final design", "Alternative roof system; select one"],
      ["RCC roof slab and reinforcement", "Slab and reinforcement only to the approved structural design; quote concrete, reinforcement and formwork scope.", "sq ft / cu ft", "Measured roof plan and signed structural drawings", "Alternative roof system; select one"],
      ["Asbestos-free fibre-cement roof sheets", "Only a modern product with explicit asbestos-free documentation; never specify new asbestos-cement.", "sq ft", "Actual sloped roof area from final design", "Alternative roof system; select one"],
      ["Steel trusses and purlins", "Structural supports designed for site loads, span and selected roof system.", "kg / running ft", "Engineer schedule"],
      ["Roof screws and sealing washers", "Fasteners matched to sheet/panel and support material.", "each / lot", "Manufacturer fixing schedule"],
      ["Ridge caps", "Weatherproof ridge detail matched to the roof profile.", "running ft", "Final roof geometry"],
      ["Flashing", "Seal roof edges, abutments and penetrations with compatible flashings.", "running ft / each", "Final roof details"],
      ["Gutters", "Collect and route roof runoff without discharging against the building.", "running ft", "Final roof perimeter and drainage plan"],
      ["Downpipes", "Connect roof drainage to the approved discharge route.", "each / running ft", "Drainage design"],
      ["Separate insulation layer", "Specify one coordinated insulation system; avoid duplicating insulation in roof and ceiling totals.", "sq ft", "Final assembly and thermal design"],
      ["Ceiling arrangement", "Provide the designed cleanable interior ceiling and support system.", "sq ft", "Room schedule and final design"],
      ["Condensation prevention", "Coordinate vapour control, ventilation, thermal breaks and sealed penetrations.", "lot", "Envelope specialist detail"],
    ]),
  },
  {
    title: "F. Ceiling and insulation",
    items: makeRows("ceiling", "Ceiling and insulation", [
      ["PUF ceiling panels", "Panel thickness, facings, joints and supports per product data and thermal design.", "sq ft", "Measured ceiling area"],
      ["EPS insulation", "Use only if justified by fire, moisture, pest and thermal design review.", "sq ft", "Specified by envelope professional"],
      ["Thermal insulation blanket", "Select an insulation blanket with documented properties and protected facing.", "sq ft", "Measured roof/ceiling assembly"],
      ["Vapour barrier", "Place and seal on the designed side of the assembly to manage vapour migration.", "sq ft", "Envelope design"],
      ["Moisture-resistant ceiling finish", "Cleanable finish suitable for each room and operating conditions.", "sq ft", "Measured ceiling area"],
      ["Sealed joints", "Use compatible sealants and junction details at panels, walls and penetrations.", "running ft", "Measured joint schedule"],
      ["Condensation control", "Prevent moisture accumulation through a coordinated envelope and operating design.", "lot", "Specialist design and commissioning"],
      ["Ceiling supports", "Supports sized for the ceiling system and loads by the structural designer.", "kg / running ft", "Approved drawings"],
    ]),
  },
  {
    title: "G. Doors and windows",
    items: makeRows("opening", "Doors, windows and access", [
      ["Main entrance door", "Weather-resistant entrance with safe access and suitable clear opening.", "each", "Preliminary count: 1; dimensions to be validated"],
      ["Raw-material storage door", "Durable door and seals suited to straw handling and pest exclusion.", "each", "Preliminary count: 1; dimensions to be validated"],
      ["Incubation room doors", "Cleanable doors with seals appropriate to the room operating conditions.", "each", "One per room is a planning allowance; confirm layout"],
      ["Oyster fruiting room door", "Moisture-resistant door and perimeter seals for a humid room.", "each", "Preliminary count: 1; dimensions to be validated"],
      ["Milky fruiting room door", "Moisture-resistant door and perimeter seals for a humid room.", "each", "Preliminary count: 1; dimensions to be validated"],
      ["Packing room door", "Cleanable door and seals to protect the post-harvest area.", "each", "Preliminary count: 1; dimensions to be validated"],
      ["Insulated doors", "Insulated door only where the thermal design shows it is necessary.", "each", "Design dependent"],
      ["Insect mesh", "Removable, cleanable insect mesh at designed openings.", "sq ft / each", "Opening schedule"],
      ["Ventilation openings", "Provide designed openings with dampers, mesh and weather protection.", "each / sq ft", "MEP and architectural drawings"],
      ["Door seals", "Compatible replaceable perimeter seals and thresholds.", "running ft / set", "Door schedule"],
      ["Emergency access", "Provide unobstructed egress and hardware per applicable local requirements.", "each / lot", "Architect and safety review"],
    ]),
  },
  {
    title: "H. Plumbing and drainage",
    items: makeRows("plumbing", "Plumbing and drainage", [
      ["Water tank", "Food/process-water suitability, capacity and location based on demand and water testing.", "litre / each", "Water-use plan and site survey"],
      ["Water pump", "Pump duty and controls selected from the final system head and flow requirement.", "each", "Plumbing design"],
      ["Water supply piping", "Pipe material and sizes selected by the plumbing designer.", "running ft", "Measured route and design"],
      ["Room-wise water distribution", "Provide isolated, labelled branches to required rooms and process points.", "point / running ft", "Room service schedule"],
      ["Valves", "Isolation and control valves at designed service and maintenance points.", "each", "Plumbing drawings"],
      ["Drain traps and clean-outs", "Provide accessible traps, rodding points and clean-outs for designed room drains.", "each", "Drainage plan"],
      ["Drainage piping", "Pipe routes and gradients to be designed for cleaning and lawful discharge.", "running ft", "Survey and plumbing drawings"],
      ["Wastewater collection", "Collect and route wastewater to an approved system; no unverified discharge assumed.", "lot", "Local requirements and site plan"],
      ["Washbasin and handwashing station", "Cleanable handwashing point with accessible water, soap and drying provision.", "each", "Preliminary allowance: clean-zone entry; validate"],
      ["Hose connections", "Locate hose points to support cleaning without creating standing water.", "each", "Room cleaning plan"],
      ["Water filters", "Select filtration only after water quality testing and equipment requirements.", "each / set", "Water test and supplier data"],
    ]),
  },
  {
    title: "I. Electrical infrastructure",
    items: makeRows("electrical", "Electrical infrastructure", [
      ["Main distribution board", "Select enclosure, protection and capacity after the final connected-load schedule.", "each", "Qualified electrician's design"],
      ["Sub-distribution boards", "Locate protected sub-boards as required by the final circuit layout.", "each", "Qualified electrician's design"],
      ["MCBs", "Breaker types and ratings selected from the calculated loads and coordination study.", "each", "Do not size before final connected load"],
      ["RCCB/RCBO protection", "Select protection type and ratings based on the electrical design and local requirements.", "each", "Qualified electrician's design"],
      ["Earthing", "Design, install and test the earthing system for site conditions and equipment.", "lot / point", "Qualified electrician and test results"],
      ["Wiring", "Cable type and conductor sizes selected for calculated loads, routes and installation method.", "running ft", "Do not assume cable sizes"],
      ["Conduits", "Route and protect wiring using a system suited to damp and washdown areas.", "running ft", "Electrical drawings"],
      ["Moisture-resistant sockets", "Use sockets and enclosures rated for their actual room exposure.", "each", "Room and equipment schedule"],
      ["LED lighting", "Lighting layout and fittings selected for each room's task and moisture exposure.", "each", "Lighting design"],
      ["Emergency lighting", "Provide emergency lighting along approved egress routes.", "each", "Safety plan and electrical design"],
      ["Equipment isolation switches", "Provide labelled, accessible isolation for fixed equipment as required.", "each", "Equipment and electrical schedule"],
      ["Cable trays", "Support and route cables with separation and protection as designed.", "running ft", "Electrical drawings"],
      ["Electrical installation labour", "Installation, testing, labelling and handover by qualified personnel.", "lot", "Itemized written quotation"],
    ]),
  },
];

export const structuralOptions = [
  { option: "RCC structural framework", advantages: "Locally familiar construction route; may suit the engineer's site-specific design.", disadvantages: "Wet construction, curing and coordination affect programme; structural sizes and reinforcement must be designed.", maintenance: "Inspect for cracks, water ingress and coating/finish deterioration; follow engineer guidance.", cost: "Quotation required against approved structural drawings." },
  { option: "Galvanised steel framework", advantages: "Factory-fabricated system may reduce on-site fabrication time; galvanizing provides a defined corrosion-protection system.", disadvantages: "Connections, coating damage, fire and local repair capability require review.", maintenance: "Inspect coating, cut edges, connections and water-trapping details; repair using the specified system.", cost: "Quotation required for steel grade, galvanizing, fabrication, transport and erection." },
  { option: "Protected MS framework", advantages: "May be locally fabricated and serviceable with available trades.", disadvantages: "Performance depends on preparation, coating quality and maintenance; corrosion risk is higher if protection is damaged.", maintenance: "Regularly inspect and maintain paint/coating, especially joints, cut edges and damp zones.", cost: "Quotation required for steel, surface preparation, coating system and inspection." },
];

export const flooringRoomSpecs = [
  { room: "Oyster fruiting room", specification: "Slip-resistant, washable, moisture-tolerant finish; designed falls and accessible drains; sealed wall-floor junctions." },
  { room: "Milky fruiting room", specification: "Slip-resistant, washable, moisture-tolerant finish; coordinate drains and wet-area waterproofing with casing workflow." },
  { room: "Incubation rooms", specification: "Smooth, cleanable finish with moisture control; avoid unnecessary wet-area details unless the cleaning protocol requires them." },
  { room: "Substrate preparation", specification: "Durable anti-skid wet-process floor; designed falls, trapped drains and waterproofed interfaces." },
  { room: "Packing area", specification: "Smooth, cleanable, non-dusting finish; protect the post-harvest zone from uncontrolled wastewater." },
  { room: "Dry straw storage", specification: "Dry, raised, cleanable surface; prevent rainwater entry and keep stored straw off damp floors." },
  { room: "Utility area", specification: "Durable finish suited to installed plant; keep electrical equipment out of washdown exposure." },
];

export const wallOptions = [
  { option: "Brick/block masonry", specification: "Locally suitable masonry; structural design, damp protection, washable internal finish and sealed service penetrations.", estimatedArea: "Measure elevations; subtract openings", unitRate: "Quotation required", installation: "Separate labour and finishing quote", maintenance: "Inspect paint, damp and cracks; repair finishes as needed." },
  { option: "Cement board partitions", specification: "Moisture-rated board, compatible framing, sealed joints and protected cut edges; confirm fire and impact rating.", estimatedArea: "Measure partition elevations; subtract openings", unitRate: "Quotation required", installation: "Separate framing, jointing and installation quote", maintenance: "Inspect joints, fasteners, impact damage and wet-area sealing." },
  { option: "PUF insulated panel partitions", specification: "Panel core and skin, joint profile, fire and moisture documentation per manufacturer; seal penetrations.", estimatedArea: "Measure partition elevations; subtract openings", unitRate: "Quotation required", installation: "Separate accessories, lifting and installation quote", maintenance: "Inspect seals, skins, joints, corrosion and impact damage." },
  { option: "Other moisture-resistant system", specification: "Select a locally serviceable system with documented moisture, fire, cleanability and repair properties.", estimatedArea: "Measure approved elevations", unitRate: "Quotation required", installation: "Separate installation quote", maintenance: "Follow product instructions and inspect sealed interfaces." },
];

export const roofingOptions = [
  {
    id: "metal",
    option: "Option 1 · Galvalume / colour-coated metal roofing",
    material: "Coated steel sheets; coating, base-metal thickness and finish to supplier submittal",
    thickness: "Supplier data required",
    thermal: "Low thermal resistance without a separately designed insulation layer; condensation control is essential.",
    maintenance: "Inspect fasteners, washers, coating, cut edges, flashing, gutters and condensate-prone interfaces.",
    lifespan: "Not stated; use the selected manufacturer's supported warranty and service data.",
    suitability: "Cost-effective insulated steel candidate for straw storage and packing only after insulation, ceiling and condensation details are included. Fruiting/incubation rooms need a complete envelope design.",
    components: "Sheets, trusses/purlins, screws and sealing washers, ridge caps, flashing, gutters, downpipes, separate insulation, ceiling and condensation controls.",
  },
  {
    id: "puf",
    option: "Option 2 · PUF insulated sandwich roof panels",
    material: "Factory-made insulated panels; core, facings, joints, fire data and support requirements per manufacturer",
    thickness: "Compare 30, 40, 50, 60 and 80 mm; no thickness selected",
    thermal: "Thermal performance generally increases with a thicker core; compare certified product data and complete assembly, not thickness alone.",
    maintenance: "Inspect panel skins, fasteners, flashings, joint seals, penetrations and damaged facings.",
    lifespan: "Not stated; use the selected manufacturer's supported warranty and service data.",
    suitability: "Full insulated panel alternative for climate-sensitive rooms if engineered, sealed and installed to manufacturer details; compare installed cost with separate insulation system.",
    components: "Panels, supporting structure, compatible fasteners, ridge/edge closures, flashing, gutters, downpipes, sealants and installation.",
  },
  {
    id: "rcc",
    option: "Option 3 · RCC roof",
    material: "Reinforced concrete slab; mix, reinforcement and slab design by structural engineer",
    thickness: "Engineer-designed; not assumed",
    thermal: "Thermal behavior depends on slab, insulation, shading and finish; add designed thermal insulation where required.",
    maintenance: "Maintain waterproofing, inspect cracks and outlets, keep rainwater drainage clear.",
    lifespan: "Not stated; depends on design, workmanship and maintenance; no number assumed.",
    suitability: "Possible where structure, cost, programme and local practice support it; require full slab, waterproofing, insulation and drainage design.",
    components: "RCC slab, reinforcement, formwork, waterproofing, thermal insulation, protective screed, drainage and ceiling finish.",
  },
  {
    id: "fibre-cement",
    option: "Option 4 · Modern asbestos-free fibre-cement sheets",
    material: "Only documented modern asbestos-free fibre-cement product; verify product declaration and local compliance",
    thickness: "Selected product data required",
    thermal: "Limited thermal insulation by itself; a separate, compatible insulation and condensation design may be required.",
    maintenance: "Inspect sheets, fixings, laps, flashings and any damaged areas; follow manufacturer handling guidance.",
    lifespan: "Not stated; use manufacturer data for the exact product.",
    suitability: "May be considered for suitable dry areas only after documentation and thermal review. Never use new asbestos-cement sheets.",
    components: "Asbestos-free sheets, designed support, compatible fixings, laps, flashings, gutters, separate insulation and ceiling where required.",
  },
];

export const pufThicknesses = [30, 40, 50, 60, 80];

export const ceilingInsulationNotes = [
  { type: "Roof insulation", description: "Insulation layer directly within the roof assembly; include vapour control, thermal breaks and rain-tight detailing." },
  { type: "Wall insulation", description: "Insulation within external walls or insulated panels; coordinate joints, service penetrations and floor/roof junctions." },
  { type: "Ceiling insulation", description: "Insulation above a separate ceiling; do not count it again as roof insulation if the same material serves both layers." },
];

export const humidificationOptions = [
  { id: "ultrasonic", option: "Ultrasonic humidifier", principle: "Vibrating transducer generates fine droplets.", application: "Room-scale system where droplet behavior, water quality and maintenance are suitable.", capacity: "Size after room-volume and crop-load calculation.", water: "Supplier quote required; depends on rated output.", power: "Supplier quote required; verify nameplate.", quantity: "Room design required.", unitCost: "Quotation required", installation: "Separate quote", maintenance: "Clean reservoir/transducers; control scale and biofilm using manufacturer instructions.", advantages: "Compact equipment and controllable output may suit smaller rooms.", disadvantages: "Water quality, hygiene, droplet carryover and uniformity need close management." },
  { id: "high-pressure-fogging", option: "High-pressure fogging", principle: "Pump pressurizes filtered water through fine fog nozzles.", application: "Designed fruiting-room distribution where water treatment, drainage and controls are provided.", capacity: "Nozzle flow and pump duty sized from room volume and crop demand.", water: "Calculate from selected nozzle flow and operating schedule.", power: "Pump and controls from supplier nameplate.", quantity: "Nozzles and zones from a room plan.", unitCost: "Quotation required", installation: "Separate pump, pipe, nozzle and electrical quote", maintenance: "Filter service, nozzle cleaning and scale control; verify pressure and leaks.", advantages: "Can distribute moisture across multiple planned points.", disadvantages: "Higher design/installation complexity; poor placement can wet crops and surfaces." },
  { id: "low-pressure-fogger", option: "Low-pressure fogger", principle: "Pump or line pressure feeds larger-orifice fogging nozzles.", application: "Small or trial systems where droplet size and wetting are acceptable for the process.", capacity: "Select only after flow and room-volume calculations.", water: "Supplier quote required for operating flow.", power: "Supplier quote required for selected pump.", quantity: "Nozzle count and layout require room design.", unitCost: "Quotation required", installation: "Separate quote", maintenance: "Clean nozzles and filters; inspect line pressure and water quality.", advantages: "Potentially simpler components for a small trial.", disadvantages: "Larger droplets may cause wetting; distribution may be uneven." },
  { id: "centrifugal", option: "Centrifugal humidifier", principle: "Rotating disc or impeller disperses water droplets into air.", application: "Room-scale humidification only where placement, droplet carry and cleaning are validated.", capacity: "Select by measured volume and required operating conditions.", water: "Supplier quote required.", power: "Supplier nameplate required.", quantity: "Room design required.", unitCost: "Quotation required", installation: "Separate quote", maintenance: "Clean and inspect rotating parts, guards and water path.", advantages: "May provide broad air distribution when selected and placed correctly.", disadvantages: "Can wet nearby surfaces; sound, cleaning and control require review." },
  { id: "manual-misting", option: "Manual misting · temporary backup only", principle: "Operator applies water using a clean, dedicated hand sprayer.", application: "Temporary contingency for a small trial; not a substitute for designed controls.", capacity: "Operator-managed; no automatic capacity claim.", water: "Record actual use during trial.", power: "None for a manual sprayer.", quantity: "One dedicated sprayer per defined workflow; verify.", unitCost: "Quotation required", installation: "Not applicable", maintenance: "Clean, dry and label the dedicated sprayer.", advantages: "Low-complexity backup for short interruptions.", disadvantages: "Labour-intensive, uneven and difficult to keep consistent." },
];

export const temperatureEquipment = [
  { item: "Split air conditioner", purpose: "Cooling only if strain-specific targets and hot-season room assessment require it.", sizing: "Do not assign one unit per room. Calculate load from room dimensions/volume, insulation, roof heat gain, outdoor design temperature, air changes, occupancy and equipment.", capacity: "HVAC engineer to calculate after site and room data.", quantity: "Not selected", price: "Quotation required" },
  { item: "Commercial cooling equipment", purpose: "Consider only if load, duty cycle, humidity and serviceability justify a commercial system.", sizing: "Use a documented heat-load calculation and equipment selection.", capacity: "Supplier/engineer selection required.", quantity: "Not selected", price: "Quotation required" },
  { item: "Exhaust-based ventilation", purpose: "Manage fresh-air exchange and heat where crop protocol and room design allow.", sizing: "Calculate airflow using room volume, crop load and fresh-air requirement; not floor area alone.", capacity: "MEP and cultivation specialist to calculate.", quantity: "Not selected", price: "Quotation required" },
  { item: "Temperature controller", purpose: "Control compatible cooling/heating only after validated setpoints are defined.", sizing: "Select sensor, switching and alarm logic for each independently controlled space.", capacity: "Supplier specification required.", quantity: "As designed", price: "Quotation required" },
  { item: "Heating equipment", purpose: "Only if selected strain and local seasonal assessment demonstrate a need.", sizing: "No heater assumed; assess safety, humidity and ventilation implications.", capacity: "Not selected", quantity: "Not selected", price: "Quotation required" },
  { item: "Temperature sensors", purpose: "Monitor representative crop-zone conditions.", sizing: "Number and placement after room/rack layout; verify with reference instrument.", capacity: "Supplier specification required.", quantity: "As designed", price: "Quotation required" },
  { item: "Temperature data logger", purpose: "Record trends to support commissioning and crop decisions.", sizing: "Choose interval, storage and alarm/export needs with operators.", capacity: "Supplier specification required.", quantity: "Optional/recommended after trial", price: "Quotation required" },
];

export const ventilationEquipment = [
  { item: "Exhaust fans", function: "Extract room air at the designed location.", airflow: "Calculate from room volume, crop load and protocol.", quantity: "Not selected", power: "Supplier nameplate; electrician to verify.", installation: "Separate quote", maintenance: "Clean guards/blades and inspect shutters and bearings." },
  { item: "Fresh-air inlet fans", function: "Supply measured fresh air where passive inlets do not meet design.", airflow: "Calculate independently for each room.", quantity: "Not selected", power: "Supplier nameplate; electrician to verify.", installation: "Separate quote", maintenance: "Clean inlet screens and inspect controls." },
  { item: "Adjustable dampers", function: "Balance and isolate designed air paths.", airflow: "Set during commissioning.", quantity: "By duct/opening schedule", power: "Manual or actuator per design.", installation: "Separate quote", maintenance: "Inspect free movement and sealing." },
  { item: "Insect-proof mesh", function: "Exclude pests while preserving required free area.", airflow: "Account for mesh pressure drop in fan selection.", quantity: "By opening schedule", power: "None", installation: "Separate quote", maintenance: "Clean and inspect for tears." },
  { item: "Air distribution ducts", function: "Distribute air without harmful drafts or stagnant zones.", airflow: "Size from approved airflow calculation.", quantity: "By room design", power: "Fan power separate.", installation: "Separate quote", maintenance: "Clean and inspect joints/condensation." },
  { item: "Air circulation fans", function: "Reduce dead zones; not a replacement for fresh-air exchange.", airflow: "Set after room/rack layout and commissioning.", quantity: "Not selected", power: "Supplier nameplate.", installation: "Separate quote", maintenance: "Clean guards and verify safe mounting." },
  { item: "Air filters", function: "Use only where process risk and pressure-drop effects justify them.", airflow: "Select against required airflow and filter class.", quantity: "Design-dependent", power: "Fan selection must account for pressure drop.", installation: "Separate quote", maintenance: "Replace per measured condition/manufacturer schedule." },
  { item: "Backdraft shutters", function: "Limit reverse flow when fans are off.", airflow: "Match fan and duct.", quantity: "By fan schedule", power: "None unless actuated.", installation: "Separate quote", maintenance: "Inspect free movement and seals." },
  { item: "Fan speed controllers", function: "Adjust compatible fan speed for commissioning.", airflow: "Tune to crop response and design.", quantity: "By fan/electrical design", power: "Qualified electrician to select controller.", installation: "Separate quote", maintenance: "Inspect and test controls." },
];

export const environmentalSensors = [
  { item: "Digital temperature sensor", priority: "Essential for initial operation", averageUnitCost: "Quotation required", note: "Select range, accuracy and placement for intended room." },
  { item: "Relative humidity sensor", priority: "Essential for initial operation", averageUnitCost: "Quotation required", note: "Select operating range and verify against a reference instrument." },
  { item: "CO₂ meter", priority: "Recommended", averageUnitCost: "Quotation required", note: "Select sensor range and placement with cultivation specialist." },
  { item: "Temperature and humidity controller", priority: "Recommended after setpoints are validated", averageUnitCost: "Quotation required", note: "Do not automate unvalidated setpoints." },
  { item: "Programmable timer", priority: "Recommended", averageUnitCost: "Quotation required", note: "Check ratings and fail-safe behavior with qualified electrician." },
  { item: "Fogger controller", priority: "Recommended after system selection", averageUnitCost: "Quotation required", note: "Match to selected pump, valves and sensor/control logic." },
  { item: "Exhaust fan controller", priority: "Recommended after airflow design", averageUnitCost: "Quotation required", note: "Select for fan type and electrical load." },
  { item: "IoT monitoring", priority: "Optional future upgrade", averageUnitCost: "Quotation required", note: "Confirm connectivity, data ownership and support before buying." },
  { item: "Mobile alerts", priority: "Optional future upgrade", averageUnitCost: "Quotation required", note: "Define alert recipients, network availability and response responsibility." },
  { item: "Data logging system", priority: "Recommended for commissioning/trials", averageUnitCost: "Quotation required", note: "Choose local/cloud storage and export format." },
];

export const fogWaterEquipment = [
  { item: "Water tank", requirement: "Size from peak process/fogging water demand, refill reliability and water quality; one shared tank scope unless design proves otherwise.", quantity: "Water-use calculation required", price: "Quotation required", maintenance: "Clean and inspect tank; keep covered." },
  { item: "Water pump", requirement: "Match output and pressure to selected water uses and fogging-system design.", quantity: "Supplier selection required", price: "Quotation required", maintenance: "Service per manufacturer; check leaks and pressure." },
  { item: "Water filter", requirement: "Select from water test and equipment manufacturer requirements.", quantity: "Water test required", price: "Quotation required", maintenance: "Replace/clean media on measured schedule." },
  { item: "Pressure gauge", requirement: "Provide where required to monitor a pressurized system.", quantity: "By system design", price: "Quotation required", maintenance: "Check readings and calibration." },
  { item: "Water distribution pipes", requirement: "Use compatible materials and route to designed zones.", quantity: "Measured route", price: "Quotation required", maintenance: "Flush and inspect for leaks or deposits." },
  { item: "Fog nozzles", requirement: "Select flow and droplet characteristics after room and system calculations.", quantity: "Nozzle schedule required", price: "Quotation required", maintenance: "Clean/descale using the manufacturer-approved method." },
  { item: "Solenoid valves", requirement: "Use only if required by the selected control/zoning design.", quantity: "By system design", price: "Quotation required", maintenance: "Inspect operation, seals and filter condition." },
];

export const connectedLoadSchedule = [
  { equipment: "Lighting", room: "All rooms per lighting plan", quantity: "From fixture schedule", unitPower: "Manufacturer nameplate required", connectedLoad: "Not calculated", status: "Awaiting fitting count and electrician's design" },
  { equipment: "Exhaust and fresh-air fans", room: "Crop rooms / designed air paths", quantity: "From ventilation design", unitPower: "Manufacturer nameplate required", connectedLoad: "Not calculated", status: "Airflow and fan selection pending" },
  { equipment: "Air circulation fans", room: "Crop rooms as designed", quantity: "From room commissioning plan", unitPower: "Manufacturer nameplate required", connectedLoad: "Not calculated", status: "Room layout and fan selection pending" },
  { equipment: "Humidification pumps / devices", room: "Oyster and Milky rooms separately", quantity: "From selected humidification system", unitPower: "Manufacturer nameplate required", connectedLoad: "Not calculated", status: "Method and capacity pending" },
  { equipment: "Water pump", room: "Utility area", quantity: "From plumbing design", unitPower: "Manufacturer nameplate required", connectedLoad: "Not calculated", status: "Duty point pending" },
  { equipment: "Pasteurisation heating", room: "Substrate preparation", quantity: "From validated batch process", unitPower: "Supplier/engineer data required", connectedLoad: "Not calculated", status: "Heating method and batch size pending" },
  { equipment: "Paddy straw cutter", room: "Substrate preparation", quantity: "Quote/protocol dependent", unitPower: "Manufacturer nameplate required", connectedLoad: "Not calculated", status: "Equipment model pending" },
  { equipment: "Packing scale/sealer", room: "Packing and dispatch", quantity: "From packing workflow", unitPower: "Manufacturer nameplate required", connectedLoad: "Not calculated", status: "Packaging format pending" },
  { equipment: "Cooling equipment, if justified", room: "Crop room-specific", quantity: "No AC-per-room assumption", unitPower: "HVAC/equipment data required", connectedLoad: "Not calculated", status: "Crop targets and load calculation pending" },
];

const equipmentItem = (id, name, category, specification, purpose, unit = "each", priority = "Essential; verify") => ({
  id,
  item: name,
  category,
  description: purpose,
  unit,
  quantityBasis: "Set from validated process/room design",
  specification,
  priority,
});

export const roomEquipmentCatalog = [
  equipmentItem("raised-pallets", "Raised pallets / straw supports", "Storage and handling", "Load-rated, dry-storage support; material and clearances to be verified.", "Keep paddy straw dry and off the floor.", "each / lot"),
  equipmentItem("straw-cutter", "Paddy straw cutter", "Substrate preparation", "Cut length, capacity and guards to be selected for validated batch size.", "Prepare straw to the chosen process.", "each"),
  equipmentItem("process-scales", "Platform and precision scales", "Substrate preparation / inoculation", "Capacity and resolution selected from actual batch sizes.", "Weigh substrate and process inputs.", "each"),
  equipmentItem("soak-tanks", "Soaking tanks", "Substrate preparation", "Food/process-water suitable material and capacity from batch design.", "Soak substrate.", "each"),
  equipmentItem("pasteurisation-vessel", "Pasteurisation vessel and heating system", "Substrate preparation", "Batch capacity, heating source and safety controls require process and engineering review.", "Treat substrate using a validated protocol.", "set"),
  equipmentItem("temperature-probes", "Temperature probes", "Substrate preparation", "Range and contact suitability matched to selected process.", "Monitor substrate treatment.", "each"),
  equipmentItem("drainage-baskets", "Baskets and draining platform", "Substrate preparation", "Load and cleanability suited to batch workflow.", "Drain treated straw.", "set"),
  equipmentItem("prep-tables", "Stainless / cleanable work tables", "Preparation and inoculation", "Material and size selected for process and washdown conditions.", "Provide cleanable work surfaces.", "each"),
  equipmentItem("bag-filling-tools", "Bag-filling tools and measuring containers", "Inoculation and bag filling", "Dedicated cleanable tools; size to validated bag and batch protocol.", "Standardize bag filling and spawn measurement.", "set"),
  equipmentItem("bag-sealer", "Bag sealer", "Inoculation and bag filling", "Select only if required by chosen bag/process.", "Close bags where required.", "each", "Optional; protocol dependent"),
  equipmentItem("batch-labels", "Batch labels and log supplies", "Inoculation and bag filling", "Use readable, durable identifiers and records.", "Maintain batch traceability.", "lot"),
  equipmentItem("incubation-racks", "Incubation racks", "Oyster/Milky incubation", "Room dimensions, levels, load and aisle access to be validated.", "Hold bags for incubation.", "set"),
  equipmentItem("fruiting-racks", "Fruiting racks", "Oyster/Milky fruiting", "Room dimensions, levels, load, cleanability and airflow to be validated.", "Hold bags through fruiting.", "set"),
  equipmentItem("casing-table", "Casing preparation table", "Milky casing preparation", "Cleanable surface sized to selected casing workflow.", "Prepare casing materials hygienically.", "each"),
  equipmentItem("casing-tools", "Dedicated casing tools", "Milky casing preparation", "Dedicated, cleanable, labelled tools for Milky casing.", "Reduce cross-use and contamination risk.", "set"),
  equipmentItem("packing-table", "Packing table", "Packing and dispatch", "Food-contact appropriate, cleanable surface.", "Grade and pack harvested product.", "each"),
  equipmentItem("packing-scale", "Packing scale", "Packing and dispatch", "Capacity and accuracy selected for expected pack sizes.", "Weigh product and packs.", "each"),
  equipmentItem("packing-sealer", "Packaging sealer", "Packing and dispatch", "Select format after buyer and packaging requirements.", "Seal packs if required.", "each"),
  equipmentItem("harvest-crates", "Harvest crates and movement trolley", "Fruiting to packing", "Washable, food-suitable crates; select actual load capacity.", "Move harvest without floor contact.", "lot"),
  equipmentItem("water-filter", "Water filter", "Utility area / fogging", "Select only after water test and supplier requirements.", "Protect equipment/process where justified.", "set"),
  equipmentItem("pressure-gauge", "Pressure gauge", "Environmental control · fogging water system", "Add where the selected pressure system requires measurement.", "Monitor fogging-system pressure.", "each", "Design-dependent"),
  equipmentItem("fog-water-pipes", "Water distribution pipes", "Environmental control · fogging water system", "Pipe material and route matched to selected pump, pressure and nozzles.", "Supply water to designed fogging zones.", "running ft", "Design-dependent"),
  equipmentItem("fog-nozzles", "Fog nozzles", "Environmental control · fogging water system", "Flow, droplet characteristics and quantity from room/system calculations.", "Distribute fog to designed room zones.", "each", "Design-dependent"),
  equipmentItem("solenoid-valves", "Solenoid valves", "Environmental control · fogging water system", "Use compatible valves only where selected control/zoning design requires them.", "Control water to designed fogging zones.", "each", "Optional; design-dependent"),
  equipmentItem("wash-hoses", "Hoses, valves and wash points", "Preparation / wash area", "Locations, fittings and materials from cleaning plan.", "Support controlled cleaning.", "set"),
  equipmentItem("protected-panel", "Protected electrical distribution", "Utility area", "Final panel and protective devices by qualified electrician.", "Supply protected circuits.", "system"),
  equipmentItem("lighting", "Moisture-suitable LED lighting", "All designed rooms", "Fittings and illumination from electrical/room use design.", "Provide task and inspection lighting.", "each"),
  equipmentItem("cleaning-kit", "Cleaning and sanitation kit", "All rooms; dedicated where needed", "Products and tools compatible with materials and approved hygiene protocol.", "Maintain sanitation and room separation.", "set"),
  equipmentItem("short-term-cooling", "Short-term product refrigerator", "Finished product storage", "Optional; select capacity only after dispatch and buyer requirements.", "Temporary holding if the business case justifies it.", "each", "Optional; quote separately"),
  equipmentItem("major-cold-room", "Major cold room", "Future option", "Commercial cold storage only after a verified demand, capacity and business case.", "Exclude from the base budget unless separately justified and approved.", "system", "Optional future scope; outside baseline until approved"),
  equipmentItem("sealed-storage", "Sealed material storage", "Raw straw / clean supplies", "Pest-resistant containers and dry storage; separate chemicals from packaging.", "Protect straw, spawn and clean supplies.", "set"),
  equipmentItem("pest-monitoring", "Pest monitoring supplies", "Raw straw / facility", "Select monitoring method and placement with local pest-control guidance.", "Record and manage pest activity.", "set"),
  equipmentItem("water-testing", "Water testing and sanitation supplies", "Water management", "Test parameters and sanitation products selected from process needs and local advice.", "Check water quality and support cleaning.", "lot"),
  equipmentItem("ph-meter", "pH meter", "Substrate preparation", "Optional; buy only if the selected cultivation protocol requires pH measurement.", "Check pH where the validated process requires it.", "each", "Optional; protocol dependent"),
  equipmentItem("fire-safety", "Fire extinguishers and signage", "Entrances / egress route", "Type and locations to be set by local fire/safety professional.", "Provide specified initial fire-safety equipment.", "lot"),
  equipmentItem("first-aid-ppe", "First-aid kit and PPE", "Accessible dry location", "Contents based on task risk assessment; check expiry and fit.", "Support safe routine operation.", "lot"),
  equipmentItem("chemical-cabinet", "Cleaning-chemical storage cabinet", "Wash / sanitation area", "Labeled, secure and separated from spawn and food-contact packaging.", "Store sanitation products safely.", "each"),
];

export const roomEquipmentSchedule = [
  { room: "Raw straw storage", equipmentIds: ["raised-pallets", "sealed-storage", "pest-monitoring", "cleaning-kit"], note: "Keep storage dry and protected from pests; do not duplicate shared utility cost." },
  { room: "Substrate preparation", equipmentIds: ["straw-cutter", "process-scales", "soak-tanks", "pasteurisation-vessel", "temperature-probes", "drainage-baskets", "prep-tables", "water-testing", "ph-meter"], note: "Batch capacity, energy source, water and drainage need process and MEP validation." },
  { room: "Inoculation and bag filling", equipmentIds: ["bag-filling-tools", "bag-sealer", "prep-tables", "process-scales", "plumbing-washbasin-and-handwashing-station", "batch-labels"], note: "Use dedicated clean tools; counts refer to the central catalog, not separate duplicate purchases." },
  { room: "Oyster incubation", equipmentIds: ["incubation-racks", "temperature-probes", "lighting"], note: "Environmental sensors and ventilation are shown in the shared environmental equipment schedule." },
  { room: "Oyster fruiting", equipmentIds: ["fruiting-racks", "lighting", "cleaning-kit"], note: "Use the Oyster room's separately sized humidity and air-management system." },
  { room: "Milky incubation", equipmentIds: ["incubation-racks", "temperature-probes", "lighting"], note: "Room-specific count to be set from the final rack layout; do not count the shared catalog twice." },
  { room: "Milky fruiting", equipmentIds: ["fruiting-racks", "lighting", "cleaning-kit"], note: "Use a separate Milky room control design; casing tools stay in their designated room." },
  { room: "Casing preparation", equipmentIds: ["casing-table", "casing-tools", "process-scales", "cleaning-kit"], note: "Casing materials and protocol require cultivation-specialist confirmation." },
  { room: "Packing and dispatch", equipmentIds: ["packing-table", "packing-scale", "packing-sealer", "harvest-crates", "short-term-cooling"], note: "Packaging and cooling are buyer/dispatch dependent; optional cooling is not included by default." },
  { room: "Utility area", equipmentIds: ["plumbing-water-tank", "plumbing-water-pump", "water-filter", "wash-hoses", "protected-panel", "fire-safety", "first-aid-ppe", "chemical-cabinet"], note: "Keep electrical panels in a designed dry/protected location; store chemicals away from clean materials." },
];

export const allProcurementItems = [
  ...constructionGroups.flatMap((group) => group.items),
  ...roomEquipmentCatalog,
  ...humidificationOptions.map((option) => ({
    id: `humidifier-${option.id}`,
    category: "Environmental control · humidification",
    item: option.option,
    description: option.principle,
    unit: "system",
    quantityBasis: option.quantity,
    priority: option.id === "manual-misting" ? "Temporary backup only" : "Select after room-volume calculation",
  })),
  ...temperatureEquipment.map((equipment) => ({
    id: `temperature-${equipment.item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    category: "Environmental control · temperature",
    item: equipment.item,
    description: equipment.purpose,
    unit: "each / system",
    quantityBasis: equipment.quantity,
    priority: equipment.item === "Heating equipment" ? "Optional; strain/season dependent" : "Design-dependent",
  })),
  ...ventilationEquipment.map((equipment) => ({
    id: `ventilation-${equipment.item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    category: "Environmental control · ventilation",
    item: equipment.item,
    description: equipment.function,
    unit: "each / lot",
    quantityBasis: equipment.quantity,
    priority: "Select after room-volume and crop-load calculation",
  })),
  ...environmentalSensors.map((equipment) => ({
    id: `sensor-${equipment.item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    category: "Environmental control · sensors and automation",
    item: equipment.item,
    description: equipment.note,
    unit: "each / system",
    quantityBasis: equipment.priority,
    priority: equipment.priority,
  })),
];

export const roofInputLabels = {
  materialMinRate: "Material rate minimum (₹/sq ft)",
  materialMaxRate: "Material rate maximum (₹/sq ft)",
  structuralSupport: "Structural support quote (₹)",
  installation: "Installation quote (₹)",
  insulation: "Separate insulation quote (₹)",
  flashingGutters: "Flashing and gutters quote (₹)",
};
