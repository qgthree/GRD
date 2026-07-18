# API Migration Plan

The app is already partly prepared for API use because local data is loaded through data-source files. The migration should keep that adapter pattern and replace one source at a time.

## Goals

- Keep Vue components mostly unchanged.
- Move filtering and count calculations to the API when data grows.
- Keep URL query params as the source of truth for map/filter state.
- Avoid loading large map geometry or full vendor lists when the current view only needs a subset.

## Phase 1: Define Read Queries

Start with read-only endpoints that match the data the UI already needs.

- `regions`: returns region ids/names/colors.
- `countries`: returns country metadata.
- `countriesByRegion(regionIds)`: returns countries for selected regions.
- `countriesById(ids)`: returns selected countries directly.
- `countryRegionIndex`: returns a lightweight country-code to region mapping.
- `vendors(filters)`: returns vendors matching selected regions, countries, and services.
- `vendorCountsByRegion(filters)`: returns region totals for the legend and map labels.
- `vendorCountsByCountry(filters)`: returns country totals for selected-region density views.

The count queries matter because the UI often needs totals without needing every vendor record.

## Phase 2: Replace Vendor Loading

Update `src/features/vendors/api/vendorDataSource.ts` to call the API instead of local seed data.

Recommended shape:

- Keep `getVendors()` as the public adapter function.
- Add filter arguments when the backend can filter server-side.
- Keep vendor matching helpers until the API fully owns filtering.
- Remove duplicated frontend filtering only after the backend behavior is proven.

## Phase 3: Replace Location Loading

Update `src/features/locations/api/locationDataSource.ts`.

Recommended shape:

- Keep `getCountries()` as the public adapter function.
- Return the same `Country` shape the store already expects.
- Add new API fields only when a component actually needs them.

## Phase 4: Replace Map Boundary Loading

Map geometry can stay in public files for a while. It is large, cacheable, and does not necessarily need to come from the same API as vendor data.

When moving it to an API or object storage:

- Keep `getParentBoundaries()`.
- Keep `getChildBoundariesForRegions(regions)`.
- Keep `getChildBoundariesForCountries(countryCodes)`.
- Keep lazy loading by region chunk.
- Keep request caching in the data-source layer.

This lets `Map.vue` keep the same mental model even if the storage changes.

## Phase 5: Add Client Cache

Once requests are real network calls, add a small API client layer that handles:

- Base URL configuration.
- Request errors.
- Response typing.
- Request cancellation if needed.
- Caching for stable lookup data.

For this app, a lightweight fetch wrapper is enough at first. A larger query library can wait until the app needs pagination, cache invalidation, background refresh, or optimistic updates.

## Phase 6: Move Expensive Logic Backend-Side

These calculations should eventually live in the API:

- Vendor filtering by service, region, and country.
- Region vendor counts.
- Country vendor counts.
- Vendor density bucket source counts.

The frontend can still own presentation decisions, such as colors, labels, and whether the legend is visible.

## Phase 7: Add Pagination Or Infinite Loading

The vendor list is the first likely place to need pagination.

Recommended query parameters:

- `filters`: selected region/country/service values.
- `limit`: number of vendors to return.
- `cursor`: continuation token from the previous response.

Recommended response fields:

- `items`: vendor records.
- `nextCursor`: value for loading the next page.
- `totalCount`: total vendors matching the filters, if useful.

## Migration Rule Of Thumb

Do not let components import backend details directly. Components should ask stores/composables for data, and stores/composables should call feature data-source files. That keeps the future API migration incremental instead of turning it into one large rewrite.
