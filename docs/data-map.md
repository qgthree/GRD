# Data Map

This app currently uses local data and public JSON files, but the code is shaped so those sources can be replaced with API calls later.

## Route Query State

The map and filters are driven by URL query parameters.

- `region` stores one or more selected region names.
- `country` stores one or more selected country codes.
- `services` stores one or more selected service/sector values.

Comma-separated query values are used for multi-select filters, such as `?region=Africa,ALAC&services=Health,WASH`.

## Vendor Data

Vendor records currently come from:

- `src/features/vendors/data/vendors.ts`

They are loaded through:

- `src/features/vendors/api/vendorDataSource.ts`

The vendor store uses that data source in:

- `src/stores/vendorStore.ts`

The store keeps:

- `vendors`: the full loaded vendor list.
- `filteredVendors`: the current vendor list after applying URL filters.
- `loading` and `error`: loading state for the vendor request.
- `show`: whether the vendor side panel is visible.

Vendor filtering uses helper logic from:

- `src/features/vendors/utils/vendorCoverage.ts`

Those helpers decide whether a vendor serves a region, country, or selected service.

## Location Data

Country metadata currently comes from:

- `src/data/countries.ts`

It is loaded through:

- `src/features/locations/api/locationDataSource.ts`

The location store owns the loaded country list in:

- `src/stores/locationStore.ts`

Country metadata is used by the filters, vendor matching logic, and country-level map density legend.

## Map Boundary Data

Map geometry is stored in `public/map-data/` so it is not bundled into the main JavaScript file.

- `public/map-data/regions.json` contains parent region boundaries.
- `public/map-data/countries/index.json` maps country codes to their region chunk.
- `public/map-data/countries/*.json` contains country boundaries split by region.

The map loads these files through:

- `src/features/map/api/mapDataSource.ts`

The map data composable lives at:

- `src/features/map/composables/useMapData.ts`

The loading pattern is:

1. Load region boundaries first.
2. Load country boundaries only when the current route needs them.
3. Cache in-flight map data requests so route changes do not repeatedly fetch the same asset.
4. Clear failed request caches so a later retry can work.

## Map Display Flow

The main map view is:

- `src/views/MapView.vue`

It watches `route.query` and asks the vendor store to refresh filtered data.

The map component is:

- `src/features/map/components/Map.vue`

It reads the route query, loads the boundary layer needed for the current selection, and redraws Leaflet layers.

The legend component is:

- `src/features/map/components/WorldLegend.vue`

It shows either:

- Region color totals when no single region is selected.
- Country-level vendor density buckets when one region is selected.

## Current API Swap Points

These are the files most likely to change first when replacing local data with API data:

- `src/features/vendors/api/vendorDataSource.ts`
- `src/features/locations/api/locationDataSource.ts`
- `src/features/map/api/mapDataSource.ts`

The stores and components should ideally keep calling these adapter functions instead of importing future API client code directly.
