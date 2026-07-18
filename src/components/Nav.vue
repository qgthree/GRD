<script setup lang="ts">
import { useRoute } from "vue-router";
import type { LocationQuery } from "vue-router";
import { watch, ref } from 'vue';
import { useVendorStore } from '@/stores/vendorStore';
import { useFiltersStore } from '@/stores/filtersStore';
import home0 from "@/assets/images/home_FILL0.svg";
import home1 from "@/assets/images/home_FILL1.svg";
import filters0 from "@/assets/images/filters_FILL0.svg";
import filters1 from "@/assets/images/filters_FILL1.svg";

const route = useRoute(); // Import the route
let location = ref('any location');
let sectors = ref('any sector');

// Normalize route query values before turning them into human-readable nav text.
const queryText = (value: LocationQuery[string]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(',');
  }

  return value ?? '';
}

const updateNav = async (query: LocationQuery) => {
  // no location is selected
  if (!query || query && !query.region && !query.country) { location.value = 'any location'}
  // one or more regions are selected
  else if (query.region) { location.value = queryText(query.region) }
  // one or more countries are selected
  else if (query.country) { location.value = queryText(query.country) }

  // no sector is selected
  if (!query || query && !query.services) { sectors.value = 'any sector'}
  // one or more sectors are selected
  else if (query.services) { sectors.value = queryText(query.services) }
}

watch(
  () => route.query, (newQuery) => {
  // Keep the nav summary synced with the URL filters.
  updateNav(newQuery);
  },
  { immediate: true }
);
</script>

<template>
  <div class="nav_container">
    <nav>
      <div class="nav_img" v-if="!route.query.region && !route.query.country && !route.query.services">
        <img :src="home1" />
      </div>
      <router-link class="nav_img" to="/map" v-else>
        <img data-fill="0" :src="home0" />
        <img data-fill="1" :src="home1" />
      </router-link>
      <div class="nav_details">
        <a @click="useVendorStore().toggleVendors()">Vendors</a>
        <span> serving </span>
        <a @click="useFiltersStore().toggleFiltersView('location')">{{ location.replace(/,/g, ', ').replace(/,(?=[^,]+$)/, ' or ') }}</a>
        <span> in </span>
        <a @click="useFiltersStore().toggleFiltersView('sector')">{{ sectors.replace(/,/g, ', ').replace(/,(?=[^,]+$)/, ' or ') }}</a>
      </div>
      <div class="nav_img" @click="useFiltersStore().toggleFiltersView('location')">
        <img data-fill="0" :src="filters0" />
        <img data-fill="1" :src="filters1" />
      </div>
    </nav>
  </div>
</template>

<style>
.nav_container {
  width: 100%;
  display: grid;
  grid-gap: 30px;
  justify-items: center;
  position: fixed;
  top: 30px;
  z-index: 1000;
}
nav {
  display: grid;
  grid-template-columns: 50px 1fr 50px;
  align-items: center;
  border-radius: 6px;
  max-width: calc(100% - 40px);
  background-color: #002F6C;
  color: #fff;
  font-size: 18px;
  font-weight: 400;
  z-index: 500;
  text-align: center;
  -webkit-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
  -moz-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
  box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
}
.nav_img {
  display: flex;
  justify-content: center;
  height: 52px;
  padding: 16px 0px;
  width: 50px;
}
img[data-fill="0"], .nav_img:hover > img[data-fill="1"] {
  display: block;
  cursor: pointer;
}
img[data-fill="1"], .nav_img:hover > img[data-fill="0"] {
  display: none;
  cursor: pointer;
}
.nav_details {
  display: block;
  padding: 15px 10px;
  margin: 0px;
}
.nav_details a {
  color: #fff;
  text-decoration: underline;
  cursor: pointer;
}

</style>
