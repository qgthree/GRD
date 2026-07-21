import { defineStore } from 'pinia';

// Central place for Leaflet styling, viewport, and interaction settings.
export const useMapSettingsStore = defineStore('mapSettingsStore', {
    state: () => ({
        namespaced: true,
        componentSettings: {
            showVendors: true,
            showLegend: true,
            showFilters: false
        },
        leafSettings: {
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
            mapCenter: [39, -98],
            mapZoom: 4,
            minZoom: 2.5,
            maxZoom: 15,
            features: {
                weight: 0.8,
                mediumOpacity: 0.5,
                lightOpacity: 0.3
            },
            boundaryStyles: [],
            // https://leafletjs.com/reference.html#map-option
            mapOptions: {
                zoomSnap: 0.01, // Zoom level multiplier
                zoomControl: false,
                scrollWheelZoom: true,
                wheelPxPerZoomLevel: 100,
                zoomDelta: 100,
                doubleClickZoom: false,
                preferCanvas: true,
                worldCopyJump: true,
                noWrap: true,
                updateWhenIdle: true,
                markerZoomAnimation: false,
            }
        }
    })
});
