# Project Structure

This project is organized around app surfaces first, then feature-owned code. The goal is to keep shared pieces small and keep domain-specific logic close to the UI that uses it.

## Top-Level App Files

- `src/main.ts` creates the Vue app, installs Pinia and the router, and mounts the app.
- `src/App.vue` is the root component.
- `src/router/index.ts` owns route definitions.
- `src/views/` contains page-level views. A view should mostly compose feature components and connect route state to stores.

## Shared Folders

- `src/components/` contains reusable app components that are not owned by one feature.
- `src/assets/styles/` contains global styling, shared utility classes, and tooltip styles.
- `src/assets/images/` contains UI icons and image assets imported by Vue components.
- `src/stores/` contains Pinia stores for app state that crosses component boundaries.

## Feature Folders

Feature folders live under `src/features/`. Each feature can own its components, API/data adapters, utilities, and types.

- `src/features/map/` owns the Leaflet map, map boundary loading, map query parsing, and map-specific display helpers.
- `src/features/filters/` owns the filter modal, filter panels, and URL-query filter helpers.
- `src/features/vendors/` owns vendor data loading, vendor list UI, vendor types, and vendor matching helpers.
- `src/features/locations/` owns location metadata types and the current location data adapter.

## Data Files

- `src/data/countries.ts` is local TypeScript seed data for country metadata.
- `src/features/vendors/data/vendors.ts` is local TypeScript seed data for vendors.
- `public/map-data/` contains map boundary JSON loaded at runtime with `fetch`.

## Placement Guidelines

- Put page orchestration in `src/views/`.
- Put reusable visual components in `src/components/`.
- Put domain-specific components in the owning `src/features/<feature>/components/` folder.
- Put future API calls behind `api/*DataSource.ts` files so stores and components do not care whether data comes from local files or a backend.
- Put pure transformation or matching logic in `utils/` files when it is useful outside one component.
