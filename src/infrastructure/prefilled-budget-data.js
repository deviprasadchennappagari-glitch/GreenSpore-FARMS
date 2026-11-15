export const PRICE_CHECKED = "15 November 2026";

const apSorPdf = "https://irrigation.ap.gov.in/wrd/home/download-encodedDocument/MjM0Ng==";

export const priceSources = {
  apSorBlocks: {
    label: "AP SOR 2026-27: solid block rates",
    detail: "Published state schedule; effective 1 June 2026. A 290 x 150 x 140 mm solid fly-ash cement block is listed at ₹26 each.",
    url: "https://arched.ai/resources/sor/andhra-pradesh-sor-2026-27/bricks-and-building-blocks",
    officialUrl: apSorPdf,
  },
  apSorRoofing: {
    label: "AP SOR 2026-27: roofing materials",
    detail: "The schedule lists galvanized sheet at ₹79/kg; used only as a material benchmark, not a Galvalume quotation.",
    url: "https://arched.ai/resources/sor/andhra-pradesh-sor-2026-27/timber-and-roofing-materials",
    officialUrl: apSorPdf,
  },
  apSorFans: {
    label: "AP SOR 2026-27: fans",
    detail: "Published supply rates include a 12-inch exhaust fan at ₹1,744 and an 18-inch air circulator at ₹6,950.",
    url: "https://arched.ai/resources/sor/andhra-pradesh-sor-2026-27/fans",
    officialUrl: apSorPdf,
  },
  apSorPump: {
    label: "AP SOR 2026-27: pump sets",
    detail: "A 0.75 HP submersible pump is listed at ₹20,717; the source and duty must be confirmed before selection.",
    url: "https://arched.ai/resources/sor/andhra-pradesh-sor-2026-27/pumpsets",
    officialUrl: apSorPdf,
  },
  apSorFloor: {
    label: "AP SOR 2026-27: flooring tiles",
    detail: "Non-skid 600 mm ceramic floor tile supply is listed at ₹520/sq. m; the displayed per-sq.-ft. rate is rounded, supply only.",
    url: "https://arched.ai/resources/sor/andhra-pradesh-sor-2026-27/wall-and-floor-tiles",
    officialUrl: apSorPdf,
  },
  iihrSpawn: {
    label: "ICAR-IIHR mushroom spawn rates",
    detail: "The published schedule lists Oyster and Milky spawn at ₹90/kg, effective 1 June 2023 and subject to revision. Collection is in person at Bengaluru; transport is not provided.",
    url: "https://www.iihr.res.in/revised-rates-mushroom-spawn-rtf-bags-and-fresh-mushroom-icar-iihr-wef-01092021",
  },
  iihrMilky: {
    label: "ICAR-IIHR Milky mushroom cultivation technology",
    detail: "Describes paddy/wheat straw and casing soil, and gives a 60–90% biological-efficiency range.",
    url: "https://www.iihr.res.in/cultivation-technology-milky-mushroom",
  },
  iihrOyster: {
    label: "ICAR-IIHR Oyster mushroom cultivation technology",
    detail: "Cultivation reference; the Oyster yield used here is an explicit planning assumption, not a value taken from this page.",
    url: "https://www.iihr.res.in/cultivation-technology-oyster-mushroom",
  },
};

const setup = "setup";
const cycle = "cycle";

function item(id, name, quantity, unit, unitCost, period, group, options = {}) {
  return {
    id,
    name,
    quantity,
    unit,
    unitCost,
    period,
    group,
    sourceId: null,
    sourceNote: "Planning allowance — local price verification required.",
    rateStatus: "allowance",
    included: true,
    reuseId: null,
    ...options,
  };
}

export const constructionItems = [
  item("outer-blocks", "Solid cement blocks — external walls", 2400, "piece", 26, setup, "Walls & foundation", {
    sourceId: "apSorBlocks",
    sourceNote: "AP SOR published block benchmark; external quantity is a preliminary take-off.",
    rateStatus: "published",
    reuseId: "existing-structure",
  }),
  item("partition-blocks", "Solid cement blocks — internal partitions", 3400, "piece", 26, setup, "Walls & foundation", {
    sourceId: "apSorBlocks",
    sourceNote: "AP SOR published block benchmark; partition quantity is a preliminary take-off.",
    rateStatus: "published",
  }),
  item("outer-cement", "Cement — external masonry and foundation", 35, "50 kg bag", 360, setup, "Walls & foundation", {
    sourceNote: "Planning allowance; bag rate and mix to be checked locally.",
    reuseId: "existing-structure",
  }),
  item("partition-cement", "Cement — partitions and internal masonry", 50, "50 kg bag", 360, setup, "Walls & foundation"),
  item("outer-sand", "Sand — external masonry and foundation", 180, "cu. ft.", 58, setup, "Walls & foundation", {
    reuseId: "existing-structure",
  }),
  item("partition-sand", "Sand — internal partitions", 320, "cu. ft.", 58, setup, "Walls & foundation"),
  item("foundation-aggregate", "Aggregate", 80, "cu. ft.", 43, setup, "Walls & foundation", {
    reuseId: "existing-structure",
  }),
  item("foundation-work", "Foundation materials and work", 1, "lot", 75000, setup, "Walls & foundation", {
    reuseId: "existing-structure",
  }),
  item("reinforcement", "Steel reinforcement allowance", 800, "kg", 70, setup, "Walls & foundation", {
    sourceNote: "Quantity and grade need a structural design; allowance to verify.",
    reuseId: "existing-structure",
  }),
  item("external-masonry-labour", "External masonry labour", 1, "lot", 45000, setup, "Walls & foundation", {
    reuseId: "existing-structure",
  }),
  item("partition-masonry-labour", "Internal partition masonry labour", 1, "lot", 55000, setup, "Walls & foundation"),
  item("external-plaster", "External plaster and finish", 1080, "sq. ft.", 28, setup, "Walls & foundation", {
    reuseId: "existing-structure",
  }),
  item("internal-plaster", "Internal plaster", 2600, "sq. ft.", 30, setup, "Walls & foundation"),
  item("washable-wall-finish", "Washable internal wall finish", 2600, "sq. ft.", 45, setup, "Walls & foundation"),
  item("wall-waterproofing", "Waterproofing at wet zones and junctions", 500, "sq. ft.", 40, setup, "Walls & foundation"),

  item("roof-cover", "Colour-coated Galvalume roof-sheet allowance", 320, "kg", 79, setup, "Roof", {
    sourceId: "apSorRoofing",
    sourceNote: "AP SOR galvanized-sheet benchmark only; coating, gauge, profile and delivered rate need local verification.",
    reuseId: "existing-structure",
  }),
  item("roof-trusses", "Roof trusses and purlins", 924, "sq. ft. roof", 90, setup, "Roof", {
    sourceNote: "Structural sizes and installed rate require an approved design.",
    reuseId: "existing-structure",
  }),
  item("roof-accessories", "Fasteners, flashing, ridge caps and gutters", 1, "lot", 18000, setup, "Roof", {
    reuseId: "existing-structure",
  }),
  item("roof-insulation", "Separate roof insulation and vapour-control layer", 924, "sq. ft.", 35, setup, "Roof", {
    sourceNote: "Assembly and condensation details require a roof-system review.",
    reuseId: "existing-structure",
  }),
  item("roof-ceiling", "Moisture-resistant ceiling", 800, "sq. ft.", 45, setup, "Roof", {
    reuseId: "existing-structure",
  }),
  item("roof-labour", "Roof fabrication and installation labour", 924, "sq. ft. roof", 35, setup, "Roof", {
    reuseId: "existing-structure",
  }),

  item("main-door", "Main entrance door", 1, "each", 18000, setup, "Doors & ventilation"),
  item("passage-doors", "Internal doors at concept passage access points", 7, "each", 9000, setup, "Doors & ventilation"),
  item("vent-mesh", "Ventilation openings with insect mesh", 3, "set", 4500, setup, "Doors & ventilation"),
  item("door-fittings", "Door fittings and installation", 8, "set", 2500, setup, "Doors & ventilation"),

  item("oyster-humidity", "Oyster humidifier / fogging system", 1, "system", 25000, setup, "Temperature, humidity & ventilation"),
  item("milky-humidity", "Milky humidifier / fogging system", 1, "system", 25000, setup, "Temperature, humidity & ventilation"),
  item("room-sensors", "Temperature and humidity sensor sets", 2, "set", 6000, setup, "Temperature, humidity & ventilation"),
  item("co2-monitor", "CO₂ monitor", 1, "each", 12000, setup, "Temperature, humidity & ventilation"),
  item("exhaust-fans", "Exhaust / fresh-air fans", 4, "12-inch fan", 1744, setup, "Temperature, humidity & ventilation", {
    sourceId: "apSorFans",
    sourceNote: "AP SOR 12-inch exhaust-fan supply rate; quantity and airflow require room review.",
    rateStatus: "published",
  }),
  item("circulation-fans", "Air-circulation fans", 2, "18-inch air circulator", 6950, setup, "Temperature, humidity & ventilation", {
    sourceId: "apSorFans",
    sourceNote: "AP SOR supply rate; final type and placement to be confirmed.",
    rateStatus: "published",
  }),
  item("room-controls", "Room controllers and timers", 2, "set", 10000, setup, "Temperature, humidity & ventilation"),

  item("floor-tiles", "Non-skid floor finish — tile supply benchmark", 800, "sq. ft.", 48, setup, "Other construction & services", {
    sourceId: "apSorFloor",
    sourceNote: "Rounded AP SOR tile-supply benchmark; installation is a separate allowance.",
    rateStatus: "published",
  }),
  item("floor-installation", "Floor preparation and tile installation", 800, "sq. ft.", 30, setup, "Other construction & services"),
  item("drainage", "Floor drainage and wastewater routing", 1, "system", 25000, setup, "Other construction & services"),
  item("plumbing", "Internal plumbing, valves and fittings", 1, "lot", 25000, setup, "Other construction & services"),
  item("electrical-wiring", "Electrical wiring and protected circuits", 1, "lot", 45000, setup, "Other construction & services"),
  item("electrical-service", "Electrical service connection allowance", 1, "lot", 15000, setup, "Other construction & services", {
    reuseId: "existing-electricity",
  }),
  item("distribution-board", "Distribution board and circuit protection", 1, "system", 25000, setup, "Other construction & services"),
  item("earthing", "Earthing and electrical protection", 1, "system", 12000, setup, "Other construction & services"),
  item("lighting", "Moisture-appropriate lighting", 8, "fixture", 1500, setup, "Other construction & services"),
  item("washbasins", "Washbasins / handwashing points", 2, "each", 4000, setup, "Other construction & services"),
  item("cultivation-racks", "Oyster and Milky cultivation-room racks", 4, "set", 20000, setup, "Other construction & services", {
    reuseId: "existing-storage",
  }),
  item("cleaning-arrangements", "Cleaning tools and chemical storage", 1, "lot", 6000, setup, "Other construction & services"),
  item("installation-labour", "General equipment installation labour", 1, "lot", 30000, setup, "Other construction & services"),
];

export const productionItems = [
  item("oyster-spawn", "Oyster mushroom spawn", 0, "kg", 90, cycle, "Crop inputs", {
    quantitySource: "oysterSpawnKg",
    sourceId: "iihrSpawn",
    sourceNote: "Published IIHR rate effective 1 June 2023; subject to revision and collection in Bengaluru.",
  }),
  item("milky-spawn", "Milky mushroom spawn", 0, "kg", 90, cycle, "Crop inputs", {
    quantitySource: "milkySpawnKg",
    sourceId: "iihrSpawn",
    sourceNote: "Published IIHR rate effective 1 June 2023; subject to revision and collection in Bengaluru.",
  }),
  item("growing-bags", "Growing polythene bags", 0, "piece", 5, cycle, "Crop inputs", {
    quantitySource: "bagCount",
    sourceNote: "Quantity assumes 1 kg dry paddy straw per bag; size and thickness are allowance to verify.",
  }),
  item("purchased-straw", "Dry paddy straw — cash purchase if own straw is unavailable", 0, "kg", 12.5, cycle, "Crop inputs", {
    quantitySource: "dryStrawKg",
    sourceId: "iihrMilky",
    sourceNote: "Midpoint of ICAR-IIHR's ₹10–15/kg place-dependent range; not a Tirupati quotation.",
    reuseId: "own-straw",
  }),
  item("casing-material", "Milky casing material", 1, "crop-cycle lot", 2500, cycle, "Crop inputs", {
    sourceId: "iihrMilky",
    sourceNote: "Casing is part of the cited Milky process; quantity and local cost are allowance to verify.",
  }),
  item("straw-cutting", "Paddy straw cutting", 0, "kg / crop cycle", 8, cycle, "Crop inputs", {
    quantitySource: "dryStrawKg",
  }),
  item("straw-drying-storage", "Drying and handling of paddy straw", 0, "kg / crop cycle", 5, cycle, "Crop inputs", {
    quantitySource: "dryStrawKg",
  }),
  item("straw-transport", "Local paddy straw transport", 1, "trip / crop cycle", 1000, cycle, "Crop inputs"),

  item("manual-tools", "Manual straw-cutting and handling tools", 1, "set", 8000, setup, "Substrate preparation equipment", {
    reuseId: "existing-tools",
  }),
  item("mechanized-cutter", "Mechanized paddy straw cutter — alternative", 1, "machine", 25000, setup, "Substrate preparation equipment", {
    included: false,
    sourceNote: "Alternative to manual tools; not included in totals. Capacity and safety guard specification need verification.",
  }),
  item("soaking-containers", "Soaking containers", 2, "each", 4000, setup, "Substrate preparation equipment"),
  item("pasteurisation-drum", "Pasteurisation drum / tank", 1, "each", 10000, setup, "Substrate preparation equipment"),
  item("heating-arrangement", "Heating arrangement", 1, "system", 12000, setup, "Substrate preparation equipment"),
  item("process-thermometer", "Process thermometer", 1, "each", 1500, setup, "Substrate preparation equipment"),
  item("drying-racks", "Drying and draining racks", 2, "each", 5000, setup, "Substrate preparation equipment", {
    reuseId: "existing-storage",
  }),
  item("draining-equipment", "Draining baskets and equipment", 1, "set", 5000, setup, "Substrate preparation equipment"),
  item("handling-tools", "Substrate handling tools", 1, "set", 3000, setup, "Substrate preparation equipment"),

  item("storage-buckets", "Cleanable storage buckets", 4, "each", 700, setup, "Harvesting & packing"),
  item("harvest-crates", "Harvesting crates", 8, "each", 600, setup, "Harvesting & packing"),
  item("transport-crates", "Plastic transport crates", 8, "each", 600, setup, "Harvesting & packing"),
  item("weighing-scale", "Weighing scale", 1, "each", 2500, setup, "Harvesting & packing"),
  item("packing-table", "Packing table", 1, "each", 10000, setup, "Harvesting & packing"),
  item("sealing-machine", "Bag sealing machine", 1, "each", 5000, setup, "Harvesting & packing"),
  item("packaging-material", "Packaging material", 100, "pack / crop cycle", 10, cycle, "Harvesting & packing"),
  item("storage-containers", "Short-term storage containers", 4, "each", 1000, setup, "Harvesting & packing"),

  item("gloves", "Gloves", 20, "pair / crop cycle", 12, cycle, "Consumables"),
  item("masks", "Masks", 10, "piece / crop cycle", 10, cycle, "Consumables"),
  item("sanitiser", "Sanitiser", 1, "litre / crop cycle", 250, cycle, "Consumables"),
  item("cleaning-chemicals", "Cleaning chemicals", 1, "litre / crop cycle", 250, cycle, "Consumables"),
  item("disinfectant", "Disinfectant", 1, "litre / crop cycle", 300, cycle, "Consumables"),
  item("batch-labels", "Batch labels", 100, "piece / crop cycle", 2, cycle, "Consumables"),
  item("misc-consumables", "Other identified consumables", 1, "lot / crop cycle", 500, cycle, "Consumables"),
];

export const waterLabourItems = [
  item("water-tank", "Water storage tank", 1, "2,000 litre tank", 18000, setup, "Water supply & storage setup", {
    reuseId: "existing-tank",
  }),
  item("water-pump", "Water pump, if required by the confirmed source", 1, "unit", 20717, setup, "Water supply & storage setup", {
    sourceId: "apSorPump",
    sourceNote: "AP SOR 0.75 HP submersible-pump benchmark; not a recommendation to drill a borewell.",
    reuseId: "existing-water-source",
  }),
  item("water-connection", "Water-source connection and installation allowance", 1, "lot", 15000, setup, "Water supply & storage setup", {
    reuseId: "existing-water-source",
  }),
  item("cycle-water", "Water use", 3, "m³ / crop cycle", 60, cycle, "Recurring crop-cycle costs", {
    sourceNote: "Quantity and charge are planning allowances; confirm source, measured use and local tariff.",
  }),
  item("cycle-electricity", "Electricity for fans, controls and process equipment", 1, "crop-cycle allowance", 2500, cycle, "Recurring crop-cycle costs", {
    sourceNote: "No cooling system assumed. Metered kWh and tariff are not yet available; allowance to verify.",
  }),
  item("cycle-labour", "Production labour", 5, "worker-day / crop cycle", 575, cycle, "Recurring crop-cycle costs", {
    sourceNote: "Five worker-days is a planning allowance; confirm local wage and actual schedule.",
  }),
  item("cycle-cleaning", "Additional cleaning and sanitation", 1, "crop-cycle allowance", 1200, cycle, "Recurring crop-cycle costs", {
    sourceNote: "Excludes the cleaning consumables listed in the production section to avoid double counting.",
  }),
  item("cycle-transport", "Local operating and harvest transport", 1, "trip / crop cycle", 1500, cycle, "Recurring crop-cycle costs"),
  item("cycle-waste", "Spent-substrate and waste handling", 1, "crop-cycle allowance", 500, cycle, "Recurring crop-cycle costs", {
    sourceNote: "Reuse or disposal route and any charge need local confirmation.",
  }),
];

export const resourceOptions = [
  {
    id: "land",
    label: "Suitable farm site / land is available",
    use: "The site is not priced as purchased or rented land; no saving is calculated.",
    saves: [],
  },
  {
    id: "own-straw",
    label: "Enough dry paddy straw for one planned crop cycle is available",
    use: "Offsets the purchased-straw line only. Cutting, drying, storage and transport remain in the budget.",
    saves: ["purchased-straw"],
  },
  {
    id: "existing-water-source",
    label: "A usable water source, pump and connection are available",
    use: "Offsets the pump and source-connection setup lines; water use and tank remain separate.",
    saves: ["water-pump", "water-connection"],
  },
  {
    id: "existing-tank",
    label: "A suitable water storage tank is available",
    use: "Offsets only the new tank line.",
    saves: ["water-tank"],
  },
  {
    id: "existing-tools",
    label: "Suitable farm tools for manual straw preparation are available",
    use: "Offsets the manual tool set only; do not select the mechanized alternative as well.",
    saves: ["manual-tools"],
  },
  {
    id: "existing-storage",
    label: "Dry, pest-protected storage and suitable racks are available",
    use: "Offsets only the listed drying / draining and cultivation racks.",
    saves: ["drying-racks", "cultivation-racks"],
  },
  {
    id: "existing-electricity",
    label: "A suitable electricity service connection is already available",
    use: "Offsets the service-connection allowance only; internal wiring and protection remain.",
    saves: ["electrical-service"],
  },
  {
    id: "existing-structure",
    label: "A sound 20 × 40 ft building shell and roof are confirmed reusable",
    use: "Offsets only listed shell / roof work. Verify dimensions, structure, moisture and cleanability before relying on it.",
    saves: [
      "outer-blocks", "outer-cement", "outer-sand", "foundation-work", "reinforcement",
      "external-masonry-labour", "external-plaster", "roof-cover", "roof-trusses",
      "roof-accessories", "roof-insulation", "roof-ceiling", "roof-labour",
    ],
  },
  {
    id: "existing-road",
    label: "Vehicle access road is available",
    use: "Access-road construction is not included in this estimate, so no saving is calculated.",
    saves: [],
  },
];

export const productionAssumptions = {
  oysterTargetKg: 60,
  milkyTargetKg: 40,
  oysterBiologicalEfficiency: 0.6,
  milkyBiologicalEfficiency: 0.6,
  spawnRatePercent: 5,
  dryStrawPerBagKg: 1,
  cropCycleCountPerMonth: null,
};
