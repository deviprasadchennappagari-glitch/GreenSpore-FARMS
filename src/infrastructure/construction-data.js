import {
  constructionGroups as legacyConstructionGroups,
  environmentalSensors,
  humidificationOptions,
  roomEquipmentCatalog,
  temperatureEquipment,
  ventilationEquipment,
} from "./detail-data.js";

const categoryTitles = [
  "1. Site Preparation and Foundation",
  "2. Cement Brick / Concrete Block Construction",
  "3. Shed Roof and Roofing Materials",
  "4. Roof Insulation and Ceiling",
  "5. Flooring and Drainage",
  "6. Internal Partitions and Doors",
  "7. Waterproofing and Painting",
  "8. Electrical Infrastructure",
  "9. Plumbing and Water Supply",
  "10. Temperature and Humidity Equipment",
  "11. Ventilation and Air Management",
  "12. Mushroom Racks and Interior Equipment",
];

const groupsByTitle = Object.fromEntries(legacyConstructionGroups.map((group) => [group.title, group.items]));
const assignedLegacyIds = new Set();

function take(groupTitle, predicate = () => true) {
  return (groupsByTitle[groupTitle] || [])
    .filter((item) => predicate(item))
    .map((item) => {
      if (assignedLegacyIds.has(item.id)) throw new Error(`Construction item assigned more than once: ${item.id}`);
      assignedLegacyIds.add(item.id);
      return item;
    });
}

function relabel(item, itemName, category, extra = {}) {
  return {
    ...item,
    item: itemName,
    category,
    specification: item.specification || item.description,
    ...extra,
  };
}

function newItem(id, item, category, specification, unit = "each", quantityBasis = "Measure or quote; not yet confirmed", priority = "Scope to validate") {
  return {
    id,
    item,
    category,
    description: specification,
    specification,
    unit,
    quantityBasis,
    priority,
  };
}

const [siteTitle, masonryTitle, roofTitle, insulationTitle, floorTitle, partitionsTitle, finishesTitle,
  electricalTitle, plumbingTitle, humidityTitle, ventilationTitle, interiorTitle] = categoryTitles;

const siteItems = take("A. Site preparation", (item) => item.id !== "site-soil-filling-and-compaction")
  .map((item) => item.id === "site-foundation-excavation"
    ? relabel(item, "Excavation", siteTitle)
    : item);
siteItems.push(
  ...take("B. Foundation and structural framework", (item) =>
    ["structure-foundation-work", "structure-rcc-footings", "structure-plinth-beams"].includes(item.id))
    .map((item) => relabel(item, item.id === "structure-foundation-work" ? "Foundation preparation" :
      item.id === "structure-plinth-beams" ? "Plinth work and beams" : "RCC footing work", siteTitle)),
  newItem("foundation-cement", "Cement for foundation concrete", siteTitle, "Grade and quantity from approved foundation drawings; price per bag.", "bag", "Engineer-approved mix and measured take-off"),
  newItem("foundation-sand", "Sand for foundation concrete", siteTitle, "Source, grading and quantity to be confirmed for the approved mix.", "cu ft", "Engineer-approved mix and measured take-off"),
  newItem("foundation-aggregate", "Aggregate for foundation concrete", siteTitle, "Size, grading and quantity from approved concrete specification.", "cu ft", "Engineer-approved mix and measured take-off"),
  newItem("foundation-reinforcement", "Reinforcement steel", siteTitle, "Grade, bar schedule and quantity only from engineer-approved drawings.", "kg", "Approved bar-bending schedule"),
  newItem("foundation-shuttering", "Shuttering and formwork", siteTitle, "Formwork scope, reuse and contact area to be measured against approved drawings.", "sq ft", "Approved drawings and measured form-contact area"),
  newItem("foundation-concrete-work", "Concrete work", siteTitle, "Mix, placement, compaction and curing per approved structural specification.", "cu ft", "Approved mix design and measured volume"),
  newItem("foundation-labour", "Foundation labour", siteTitle, "Locally negotiated crew rate or an itemized activity contract.", "work item", "Workers × days or quoted activity"),
  newItem("foundation-backfill", "Backfilling", siteTitle, "Approved fill material and compacted layer thickness; measure after setting out.", "cu ft", "Site levels and approved drawings"),
  newItem("foundation-compaction", "Compaction", siteTitle, "Method and testing requirements from the civil/structural designer.", "sq ft / lot", "Approved specification and measured area"),
  newItem("foundation-dpc", "Damp-proof course at plinth", siteTitle, "Compatible damp-proof course at the designed location and width.", "running ft", "Approved wall and foundation details"),
);
const oldFill = legacyConstructionGroups.find((group) => group.title === "A. Site preparation")
  .items.find((item) => item.id === "site-soil-filling-and-compaction");
assignedLegacyIds.add(oldFill.id);

const masonryLegacy = take("D. External and internal walls", (item) => item.id === "wall-brick-block-masonry");
const masonryItems = [
  newItem("brick-solid-option-a", "Solid cement brick · local option A", masonryTitle, "Enter supplier's actual length × width × height, weight, strength specification and delivered price.", "piece", "Supplier dimensions and measured net wall area", "Mutually exclusive brick-size option"),
  newItem("brick-solid-option-b", "Solid cement brick · local option B", masonryTitle, "Enter supplier's actual length × width × height, weight, strength specification and delivered price.", "piece", "Supplier dimensions and measured net wall area", "Mutually exclusive brick-size option"),
  newItem("brick-solid-option-c", "Solid cement brick · local option C", masonryTitle, "Enter supplier's actual length × width × height, weight, strength specification and delivered price.", "piece", "Supplier dimensions and measured net wall area", "Mutually exclusive brick-size option"),
  newItem("brick-hollow-block-option", "Hollow concrete block", masonryTitle, "Compare dimensions, wall thickness, weight, strength and delivered price from a local manufacturer.", "piece", "Supplier dimensions and measured net wall area", "Alternative wall system; select one"),
  relabel(masonryLegacy[0], "Other locally available suitable masonry block", masonryTitle, {
    priority: "Alternative wall system; confirm structural, moisture and cleanability suitability",
  }),
  newItem("masonry-cement", "Cement for external masonry mortar", masonryTitle, "Mortar mix and bag quantity from the selected brick specification and measured external walls.", "bag", "Calculated independently from external wall dimensions and openings"),
  newItem("masonry-sand", "Masonry sand for external wall mortar", masonryTitle, "Sand grading and mortar volume from the selected external wall specification.", "cu ft", "Calculated independently from external wall dimensions and openings"),
  newItem("masonry-mortar-preparation", "Mortar preparation and mixing labour", masonryTitle, "Record an itemized local worker estimate or quoted mixing contract.", "work item", "Measured wall scope / negotiated local rates"),
  newItem("masonry-mason-labour", "Mason labour for brickwork", masonryTitle, "Enter local mason unit rate or daily wage, crew size and working days.", "sq ft / work item", "Net wall area or labour estimator"),
  newItem("masonry-helper-labour", "Helper labour for brickwork", masonryTitle, "Enter local helper unit rate or daily wage, crew size and working days.", "sq ft / work item", "Net wall area or labour estimator"),
  newItem("masonry-lintels", "Lintels and opening supports", masonryTitle, "Span, reinforcement and bearing only from approved structural details.", "each / running ft", "Door/window schedule and approved drawings"),
  newItem("masonry-wall-contract", "Wall construction activity contract", masonryTitle, "Alternative to separately counting overlapping masonry labour; use a documented scope.", "sq ft / work item", "Measured net wall area or contractor quote", "Alternative labour scope; do not add twice"),
];

const foundationStructure = take("B. Foundation and structural framework", (item) =>
  !["structure-foundation-work", "structure-rcc-footings", "structure-plinth-beams"].includes(item.id));
const roofingLegacy = take("E. Roofing components", (item) =>
  !["roof-separate-insulation-layer", "roof-ceiling-arrangement", "roof-condensation-prevention",
    "roof-rcc-roof-slab-and-reinforcement"].includes(item.id) &&
  !item.id.startsWith("roof-puf-roof-panel-") &&
  !["roof-steel-trusses-and-purlins"].includes(item.id));
const roofItems = [
  ...foundationStructure.map((item) => relabel(item, item.item, roofTitle)),
  ...roofingLegacy.map((item) => relabel(item, item.item.includes("Galvalume")
    ? "Option 1 · Colour-coated Galvalume sheets"
    : item.item, roofTitle)),
  newItem("roof-insulated-galvalume", "Option 2 · Galvalume sheets with separate insulation", roofTitle, "Colour-coated sheets; quote sheets separately from designed insulation and moisture-resistant ceiling.", "sq ft", "Calculated sloped roof area"),
  newItem("roof-puf-panels", "Option 3 · PUF insulated sandwich panels", roofTitle, "Enter selected panel thickness, core, facings, joint, fire and thermal performance from supplier documentation.", "sq ft", "Calculated sloped roof area"),
  newItem("roof-asbestos-free-fibre-cement", "Option 4 · Asbestos-free fibre-cement sheets", roofTitle, "Accept only product documentation explicitly confirming asbestos-free composition.", "sq ft", "Calculated sloped roof area"),
  newItem("roof-transport", "Roofing material transport", roofTitle, "Enter supplier delivery charge, unloading and delivery distance basis.", "lot / trip", "Supplier quote for measured roof scope"),
  newItem("roof-fabrication-labour", "Roof truss fabrication labour", roofTitle, "Quote fabrication separately from steel material and site installation.", "kg / work item", "Engineer-approved member schedule"),
  newItem("roof-installation-labour", "Roof installation labour", roofTitle, "Quote erection and fixing separately from material and transport.", "sq ft / work item", "Calculated roof area and installation scope"),
  newItem("roof-vapour-control", "Roof vapour-control layer", roofTitle, "Specify location, continuity, laps and sealed penetrations with the envelope designer.", "sq ft", "Measured roof assembly"),
  newItem("roof-ceiling-panels", "Moisture-resistant ceiling panels", roofTitle, "Specify panel type, joints, supports, cleanability and moisture performance.", "sq ft", "Measured ceiling area"),
];

const roofInsulationRows = take("E. Roofing components", (item) =>
  ["roof-separate-insulation-layer", "roof-ceiling-arrangement", "roof-condensation-prevention"].includes(item.id));
const insulationItems = [
  ...take("F. Ceiling and insulation").map((item) => relabel(item, item.item, insulationTitle)),
  ...roofInsulationRows.map((item) => relabel(item, item.item, insulationTitle)),
  newItem("insulation-reflective-system", "Reflective insulation system", insulationTitle, "Record layers, air gap, facing, installation details and manufacturer thermal data.", "sq ft", "Room-specific measured envelope area"),
  newItem("insulation-blanket", "Suitable thermal insulation blanket", insulationTitle, "Record material, thickness, declared thermal resistance, facing and moisture/fire data.", "sq ft", "Room-specific measured envelope area"),
  newItem("insulation-eps", "EPS insulation, where suitable", insulationTitle, "Use only after fire, moisture, pest, thermal and local code review.", "sq ft", "Room-specific measured envelope area"),
  newItem("insulation-puf-panels", "PUF panels / integrated insulation", insulationTitle, "Use manufacturer-certified thickness, facings, joints and thermal/fire data.", "sq ft", "Measured roof or wall panel area"),
  newItem("insulation-vapour-barrier", "Vapour-control materials", insulationTitle, "Specify position, continuity, sealing tape and compatible penetrations.", "sq ft / roll", "Envelope designer's measured schedule"),
  newItem("insulation-sealing-tape", "Insulation sealing tape", insulationTitle, "Compatible tape for specified vapour-control layer and panel joints.", "roll", "Manufacturer's installation schedule"),
  newItem("insulation-framework", "Insulation supporting framework", insulationTitle, "Quote support members and fixings only where the assembly requires them.", "sq ft / running ft", "Approved assembly detail"),
];
const floorItems = take("C. Flooring", (item) => true)
  .map((item) => relabel(item, item.item, floorTitle));

const partitionWallItems = take("D. External and internal walls", (item) =>
  !["wall-brick-block-masonry", "wall-washable-internal-finish", "wall-wall-waterproofing", "wall-sealed-joints-and-junctions"].includes(item.id));
const openingItems = take("G. Doors and windows").map((item) => relabel(item, item.item, partitionsTitle));
const partitionItems = [
  ...partitionWallItems.map((item) => relabel(item, item.item, partitionsTitle)),
  ...openingItems,
  newItem("partition-masonry-cement", "Cement for internal partition mortar", partitionsTitle, "Mortar mix and bag quantity from independently measured partition walls.", "bag", "Calculated only after partition dimensions and thickness are entered"),
  newItem("partition-masonry-sand", "Masonry sand for internal partition mortar", partitionsTitle, "Sand grading and mortar volume from the selected partition specification.", "cu ft", "Calculated only after partition dimensions and thickness are entered"),
  newItem("partition-cement-block", "Cement block internal partitions", partitionsTitle, "Measure independently from the room layout; specify block size and wall thickness.", "sq ft", "Measured partition length × height less openings"),
  newItem("partition-installation-labour", "Partition installation labour", partitionsTitle, "Record a local worker estimate or a scoped activity contract, not both.", "sq ft / work item", "Measured partition schedule"),
  newItem("partition-door-installation", "Door and opening installation labour", partitionsTitle, "Quote fitting, frames, hardware and seal installation as a defined scope.", "each / work item", "Final door and opening schedule"),
];

const finishWallItems = take("D. External and internal walls", (item) =>
  ["wall-washable-internal-finish", "wall-wall-waterproofing", "wall-sealed-joints-and-junctions"].includes(item.id))
  .map((item) => relabel(item, item.item, finishesTitle));
const finishItems = [
  ...finishWallItems,
  newItem("finish-roof-waterproofing", "Roof waterproofing", finishesTitle, "Select system and details for the chosen roof; do not apply automatically to metal/PUF systems.", "sq ft / lot", "Selected roof assembly and measured area"),
  newItem("finish-floor-waterproofing", "Floor coating / waterproofing", finishesTitle, "System compatible with floor substrate, wet rooms, drain details and cleaning.", "sq ft", "Room-by-room measured wet area"),
  newItem("finish-washable-paint", "Washable paint", finishesTitle, "Record product, preparation, number of coats and area; supplier specifies coverage.", "sq ft / litre", "Measured room surface and product data"),
  newItem("finish-moisture-paint", "Moisture-resistant paint", finishesTitle, "Specify surface preparation and product suitable to the room's exposure.", "sq ft / litre", "Measured room surface and product data"),
  newItem("finish-surface-preparation", "Surface preparation labour", finishesTitle, "Quote cleaning, patching, priming and preparation separately.", "sq ft / work item", "Measured surface and written scope"),
  newItem("finish-waterproofing-labour", "Waterproofing and painting labour", finishesTitle, "Record itemized local labour or a defined contract; avoid overlapping labour entries.", "sq ft / work item", "Measured surfaces and work scope"),
  newItem("finish-wall-floor-sealing", "Wall-floor joint sealing", finishesTitle, "Compatible, cleanable sealant at the measured room perimeter.", "running ft", "Final room layout and product data"),
];

const electricalRows = take("I. Electrical infrastructure").map((item) => relabel(item, item.item, electricalTitle));
const electricalEquipment = [];
const electricalItems = [
  ...electricalRows,
  ...electricalEquipment.map((item) => relabel(item, item.item, electricalTitle)),
  newItem("electrical-equipment-isolation", "Equipment isolation switches", electricalTitle, "Number and ratings from the equipment schedule and qualified electrician's design.", "each", "Final equipment and electrical schedule"),
];

const plumbingRows = take("H. Plumbing and drainage", (item) =>
  item.id !== "plumbing-water-filters" && item.id !== "plumbing-drainage-piping")
  .map((item) => relabel(item, item.item, plumbingTitle));
const plumbingEquipment = roomEquipmentCatalog.filter((item) => ["wash-hoses", "water-filter"].includes(item.id));
const plumbingItems = [
  ...plumbingRows,
  ...plumbingEquipment.map((item) => relabel(item, item.item, plumbingTitle)),
  ...take("H. Plumbing and drainage", (item) => item.id === "plumbing-drainage-piping")
    .map((item) => relabel(item, "Wastewater and room drainage pipes", floorTitle)),
  newItem("plumbing-installation-labour", "Plumbing installation labour", plumbingTitle, "Record local plumber daily/area rates or a complete activity contract.", "work item", "Measured plumbing and drainage routes"),
];

const roomSpecialItems = roomEquipmentCatalog.filter((item) =>
  ["pressure-gauge", "fog-water-pipes", "fog-nozzles", "solenoid-valves"].includes(item.id))
  .map((item) => relabel(item, item.item, humidityTitle));
const humidityItems = [
  ...humidificationOptions.map((option) => newItem(
    `humidifier-${option.id}`, option.option, humidityTitle, option.principle, "system", option.quantity,
    option.id === "manual-misting" ? "Temporary backup only" : "Compare after room-volume and crop-load calculation",
  )),
  ...temperatureEquipment.filter((item) => item.item !== "Exhaust-based ventilation" &&
    item.item !== "Temperature sensors").map((item) => newItem(
    `temperature-${item.item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    item.item, humidityTitle, item.sizing, "each / system", item.quantity,
    item.item === "Heating equipment" ? "Optional; strain/season dependent" : "Design-dependent",
  )),
  ...environmentalSensors.map((item) => newItem(
    `sensor-${item.item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    item.item, humidityTitle, item.note, "each / system", item.priority, item.priority,
  )),
  ...roomSpecialItems,
];

const ventilationItems = ventilationEquipment.map((item) => newItem(
  `ventilation-${item.item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  item.item, ventilationTitle, `${item.function} ${item.airflow}`, "each / lot", item.quantity,
  "Size from measured room volume, crop load and environmental requirements",
));

const allocatedRoomItems = new Set([
  ...electricalEquipment.map((item) => item.id),
  "protected-panel",
  "lighting",
  ...plumbingEquipment.map((item) => item.id),
  ...roomSpecialItems.map((item) => item.id),
]);
const interiorItems = roomEquipmentCatalog
  .filter((item) => !allocatedRoomItems.has(item.id))
  .map((item) => relabel(item, item.item, interiorTitle));
interiorItems.push(
  newItem("interior-rack-supports", "Mushroom rack supports", interiorTitle, "Support spacing, finish, load and corrosion resistance to the approved rack layout.", "set", "Measured rack schedule and supplier load data"),
  newItem("interior-growing-bags", "Growing bags", interiorTitle, "Specify material, size, thickness, closure and crop protocol with the cultivation specialist.", "piece", "Validated trial batch and bag specification"),
);

export const constructionGroups = [
  { title: siteTitle, items: siteItems },
  { title: masonryTitle, items: masonryItems },
  { title: roofTitle, items: roofItems },
  { title: insulationTitle, items: insulationItems },
  { title: floorTitle, items: [...floorItems, ...plumbingItems.filter((item) => item.id === "plumbing-drainage-piping")] },
  { title: partitionsTitle, items: partitionItems },
  { title: finishesTitle, items: finishItems },
  { title: electricalTitle, items: electricalItems },
  { title: plumbingTitle, items: plumbingItems.filter((item) => item.id !== "plumbing-drainage-piping") },
  { title: humidityTitle, items: humidityItems },
  { title: ventilationTitle, items: ventilationItems },
  { title: interiorTitle, items: interiorItems },
];

export const allCostItems = constructionGroups.flatMap((group) => group.items);

export const labourTrades = [
  { id: "mason", label: "Mason", minimumRate: "600", maximumRate: "900" },
  { id: "helper", label: "Helper", minimumRate: "450", maximumRate: "700" },
  { id: "electrician", label: "Electrician", minimumRate: "600", maximumRate: "950" },
  { id: "plumber", label: "Plumber", minimumRate: "600", maximumRate: "900" },
  { id: "carpenter", label: "Carpenter", minimumRate: "650", maximumRate: "950" },
];

export const labourTasks = [
  { id: "foundation", label: "Foundation", trade: "helper", category: siteTitle },
  { id: "brickwork", label: "Brickwork", trade: "mason", category: masonryTitle },
  { id: "plastering", label: "Plastering", trade: "mason", category: finishesTitle },
  { id: "roof-fabrication", label: "Roofing fabrication", trade: "carpenter", category: roofTitle },
  { id: "roof-installation", label: "Roofing installation", trade: "carpenter", category: roofTitle },
  { id: "flooring", label: "Flooring", trade: "helper", category: floorTitle },
  { id: "waterproofing", label: "Waterproofing", trade: "helper", category: finishesTitle },
  { id: "electrical", label: "Electrical work", trade: "electrician", category: electricalTitle },
  { id: "plumbing", label: "Plumbing", trade: "plumber", category: plumbingTitle },
  { id: "painting", label: "Painting", trade: "helper", category: finishesTitle },
];

export const constructionAssumptionsDefaults = {
  plotWidth: "20",
  plotLength: "40",
  frontSetback: "",
  rearSetback: "",
  leftSetback: "",
  rightSetback: "",
  buildingWidth: "",
  buildingLength: "",
  wallHeight: "10",
  wallThickness: "",
  partitionThickness: "",
  wallType: "Solid cement bricks",
  roofSelection: "Undecided",
  roofShape: "Undecided",
  externalOpeningsArea: "",
  partitionLength: "",
  partitionHeight: "",
  partitionOpeningsArea: "",
  brickWastagePercent: "",
  brickLength: "",
  brickWidth: "",
  brickHeight: "",
  mortarJoint: "",
  cementParts: "",
  sandParts: "",
  mortarDryFactor: "",
  cementBagVolume: "",
};
