<script setup>
import Map from '../components/Map.vue'
import Nav from '../components/Nav.vue'
import Filters from '../components/FiltersModal.vue'
import WorldLegend from "@/components/WorldLegend.vue";
import VendorList from '../components/VendorList.vue';
import { useVendorStore } from '@/stores/vendorStore';
import { useFiltersStore } from '@/stores/filtersStore';
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import spinner from "@/assets/images/infinite-spinner.svg";

const route = useRoute();

// load vendor data and update per url params
const loadVendorData = async () => {
  await useVendorStore().fetchVendors();
  useVendorStore().updateVendors([route.query]);
};

// check if vendors were loaded
const vendorsLoaded = () => {
  return useVendorStore().filteredVendors && !useVendorStore().loading;
}

// Perform when component is first mounted
onMounted(() => {
  loadVendorData();
});

// Perform when route changes
watch(() => route.query, (newQuery, oldQuery) => {
  useVendorStore().updateVendors([newQuery]);
  useFiltersStore().toggleFiltersView('hidden');
});
</script>

<template>
  <div id="mapview">
    <Nav />
    <Transition name="fade">
      <Filters v-if="useFiltersStore().status !== 'hidden'" />
    </Transition>
    <Transition name="slide-fade-left">
      <VendorList v-if="useVendorStore().show && vendorsLoaded()"/>
    </Transition>
    <Map v-if="vendorsLoaded()"/>
    <div v-else class="loading-map">
      <img style="width: 200px; height: auto;" :src="spinner"/>
    </div>
    <Transition name="slide-fade">
      <WorldLegend v-if="!route.query.region && !route.query.country && vendorsLoaded()"/>
    </Transition>
  </div>
</template>

<style>
#mapview {
  width: 100%;
  height: 100%;
}

.loading-map {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

/* transitions */

.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(50px);
  opacity: 0;
}

.slide-fade-left-enter-active {
  transition: all 0.2s ease-out;
}
.slide-fade-left-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-left-enter-from,
.slide-fade-left-leave-to {
  transform: translateX(-50px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>