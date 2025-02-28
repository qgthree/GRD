import { defineStore } from 'pinia';

// Storing configurations for the map
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
            mapCenter: [25, 10],
            mapZoom: 1,
            minZoom: 2.5,
            maxZoom: 15,
            features: {
                weight: 0.8,
                heavyOpacity: 0.7,
                mediumOpacity: 0.5,
                lightOpacity: 0.3
            },
            region: [
                {
                    name: "Africa",
                    color: '#82204A',
                    center: [-3, 17],
                    zoom: 3.5
                },
                {
                    name: "ALAC",
                    color: '#558C8C',
                    center: [0, 17],
                    zoom: 2.8
                },
                {
                    name: "MENAE",
                    color: '#D48D00',
                    center: [46.5, 10],
                    zoom: 3
                }
            ],
            // https://leafletjs.com/reference.html#map-option
            mapOptions: {
                zoomSnap: 0.01, // Zoom level multiplier
                zoomControl: false,
                scrollWheelZoom: false,
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