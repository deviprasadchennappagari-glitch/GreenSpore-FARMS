# GreenSpore Farms

A responsive website for the proposed GreenSpore Farms mushroom-cultivation pilot near Kanipakam, Andhra Pradesh. Existing pages remain static HTML; the new Infrastructure Plan is built with React and Vite.

## Run locally

```bash
npm start
```

This starts the Vite development server. Open the infrastructure plan at the address shown in the terminal plus `/GreenSpore-FARMS/infrastructure.html`.

## Build

```bash
npm run build
```

The Vite build outputs the React infrastructure page and the existing static pages to `dist/`. GitHub Pages deploys this generated folder from the `main` branch.

## Validate

```bash
npm test
```

The infrastructure plan presents a prefilled, itemized budget for a proposed 20 × 40 ft mushroom farm. Construction and production setup are separated from crop-cycle expenses; all totals are calculated from the displayed quantities and average unit costs. Published AP schedule and ICAR-IIHR references are linked beside applicable items. Other rates are clearly marked as planning allowances to verify, not supplier quotations. Optional resource-reuse checkboxes start unconfirmed and reduce only their linked cost lines.

## Site pages and assets

- `index.html` — home, facility concept, and roadmap
- `home.html` — compatibility redirect to the home page
- `about.html` — project overview
- `mushrooms.html` — Oyster and Milky crop profiles
- `business-plan.html` — first-harvest and infrastructure estimates
- `infrastructure.html` — React-powered, prefilled farm infrastructure budget
- `assets/greenspore-logo.png` — supplied GreenSpore Farms badge
- `assets/facility-layout-concept.svg` — preliminary 20 × 40 ft area schedule and concept layout

## Deployment

The GitHub Actions workflow runs `npm ci`, `npm test` and `npm run build`, then deploys `dist/` to GitHub Pages when changes are pushed to `main`. Vite is configured for the repository Pages path.

The site remains static after the Vite build; no application server or database is required. Prices were reviewed on 15 November 2026; some cited schedule rates are not local delivered prices, and the published ICAR-IIHR spawn rate is dated 2023 and subject to revision. The Oyster yield, spawn-rate, bag-size and construction quantities are explicit planning assumptions, not certified design guidance. Confirm current local rates, crop protocol, resource availability and structural details before construction or purchase. Monthly operating costs are not estimated until cycle duration and measured utility use are known.
