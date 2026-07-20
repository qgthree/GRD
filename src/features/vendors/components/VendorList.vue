<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useVendorStore } from '@/stores/vendorStore';
import { useLocationStore } from '@/stores/locationStore';
import AppLink from '@/components/AppLink.vue'
import ResizeTransition from '@/components/ResizeTransition.vue'
import { formatServiceName } from '@/features/vendors/utils/vendorFormatters'
import { sortDistricts } from '@/features/locations/utils/districtSorting'
import { getNaicsLabel } from '@/features/naics/utils/naicsCodes'
import close from "@/assets/images/close.svg";

// The store owns URL-level filtering; this component adds only local text search
// and expanded/collapsed display state.
const vendorStore = useVendorStore();
const { filteredVendors } = storeToRefs(vendorStore);
const districts = useLocationStore().districts;

const formatVendorDistricts = (districtIds: string[]) => {
  const requestedDistricts = new Set(districtIds)
  const sortedKnownDistricts = sortDistricts(
    districts.filter((district) => requestedDistricts.has(district.geoid))
  )
  const knownDistrictIds = new Set(sortedKnownDistricts.map((district) => district.geoid))
  const unknownDistrictIds = districtIds.filter((districtId) => !knownDistrictIds.has(districtId))

  return [
    ...sortedKnownDistricts.map((district) => district.name),
    ...unknownDistrictIds
  ].join(', ')
}

// This model is local to the input below and narrows the already route-filtered
// vendor results.
let vendorSearch = defineModel<string>({ default: '' });
let searchFilteredVendors = computed(() => {
  if (!vendorSearch.value) {
    return filteredVendors.value;
  }
  return filteredVendors.value.filter(vendor => {
    let search = vendorSearch.value.toLowerCase();
    return (
      vendor.company_name.toLowerCase().includes(search) ||
      vendor.subsectors && vendor.subsectors.map(getNaicsLabel).join(',').toLowerCase().includes(search) ||
      vendor.email && vendor.email.toLowerCase().includes(search) ||
      vendor['primary_contact(s)'] && vendor['primary_contact(s)'].toLowerCase().includes(search) ||
      vendor.phone && vendor.phone.toLowerCase().includes(search) ||
      vendor.state && vendor.state.some((state) => state.toLowerCase().includes(search))
    )
  });
});

// Reset the scroll position when the visible list changes so search results
// start at the top of the panel.
const vendorScroll = ref<HTMLElement | null>(null);
const scrollVendorListToTop = () => {
  vendorScroll.value?.scrollTo({ top: 0 });
};

watch(searchFilteredVendors, () => {
  scrollVendorListToTop();
}, { flush: 'post' });

// Text selection inside a card should not also toggle the card open/closed.
const toggleVisibility = (key: number, e: MouseEvent) => {
  const vendor = filteredVendors.value.find((item) => item.id === key);
  if (document.getSelection()?.type === 'Range') {
    e.stopPropagation();
  }
  else if (vendor) {
    vendor.isVisible = !vendor.isVisible;
  }
}

</script>

<template>
  <div id="vlist">
    <ResizeTransition>
      <div class="component_header">
        <span class="header-left">{{ filteredVendors.length }} Vendor<span v-if="filteredVendors.length !== 1">s</span></span>
        <button class="header-right icon-button" type="button" aria-label="Close vendor list" @click="vendorStore.toggleVendors()">
          <img :src="close" alt="" />
        </button>
      </div>
      <div class="component_body">
        <input v-model="vendorSearch" type="text" placeholder="search for a vendor" />
      </div>
      <div ref="vendorScroll" class="component_body vendor-scroll">
        <div class="searchResultsDetails" v-if="vendorSearch"><strong>{{ searchFilteredVendors.length }}</strong> <span v-if="searchFilteredVendors.length === 1"><strong>vendor</strong> contains</span><span v-else><strong>vendors</strong> contain</span> details that include your search.</div>
        <transition-group name="list-card" tag="div">
          <div class="list-card" v-for="vendor in searchFilteredVendors" :key="vendor.id" @click="toggleVisibility(vendor.id, $event)">
            <div class="list-data list-data_title-wrapper">
              <span class="list-data_title">{{ vendor.company_name }}</span><div class="utilized list-data_item" v-if="vendor.previously_used">utilized</div><div v-if="vendor.state.includes('Global')" class="global list-data_item">global</div>
            </div>
            <div v-show="vendor.isVisible" class="list-data_details">
              <div class="list-data">
                <span class="list-data_label">
                  Services:
                </span>
                <div class="list-data_item" v-for="(service, index) in vendor.subsectors" :key="index">{{ formatServiceName(service) }}</div>
              </div>
              <div class="list-data">
                <span class="list-data_label">
                  Congressional Districts:
                </span>
                <span v-if="!vendor.district_location.length">All districts</span>
                <span v-else>{{ formatVendorDistricts(vendor.district_location) }}</span>
              </div>
              <div class="list-data">
                <span class="list-data_label">
                  HQ Location:
                </span>
                <span>{{ vendor['city_/_subsidiary_location'] }}</span>
              </div>
              <div class="list-data" v-if="vendor['primary_contact(s)']">
                <span class="list-data_label">
                  Primary Contact:
                </span>
                <span>{{ vendor['primary_contact(s)'] }}</span>
              </div>
              <div class="list-data" v-if="vendor.phone">
                <span class="list-data_label">
                  Phone:
                </span>
                <span>{{ vendor.phone }}</span>
              </div>
              <div class="list-data" v-if="vendor.url">
                <span class="list-data_label">
                  URL:
                </span>
                <AppLink :to="vendor.url">{{ vendor.url }}</AppLink>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </ResizeTransition>
  </div>
</template>

<style scoped>
  #vlist {
    border-radius: 10px;
    width: 400px;
    max-height: calc(100vh - 160px);
    position: fixed;
    top: 110px;
    left: 50px;
    background-color: #fff;
    color: #000;
    z-index: 600;
    -webkit-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    -moz-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    overflow: hidden;
  }
  .component_body {
    max-height: calc(100vh - 279.5px);
    padding: 0px;
    width: 100%;
    background-color: #f2f2f2;
  }
  #vlist input {
    width: calc(100% - 40px);
    margin: 20px;
  }
  #vlist input::placeholder {
    font-weight: 300;
    font-family: Source Sans 3;
  }

  .searchResultsDetails {
    margin: 20px;
    font-style: italic;
    font-size: 14px;
    color: #651D32;
  }

  .vendor-scroll {
    overflow-y: auto;
    background-color: #fff;
  }

  @media screen and (max-width: 800px) {
    #vlist {
      left: 30px;
      width: calc(100% - 60px);
    }
  }

  .list-card {
    text-align: left;
    margin: 20px;
    border: 1px solid #e6e6e6;
    border-left: 3px solid #BA0C2F;
    border-radius: 4px;
    padding: 20px;
    transition: all 0.3s;
    cursor: pointer;
  }
  .list-card:hover {
    margin: 20px 15px;
    padding: 20px 25px;
  }
  .list-data {
    text-align: left;
    margin: 5px 0px;
  }
  .list-data_title-wrapper {
    display: flex;
    align-items: center;
  }
  .list-data_title {
    font-weight: 400;
    color: #651D32;
    margin-right: 10px;
  }
  .list-data_details {
    margin-top: 15px;
  }
  .list-data_label {
    font-style: italic;
    text-transform: uppercase;
    font-weight: 400;
    font-size: 14px;
    margin-right: 5px;
  }
  .list-data_link:hover, .list-data_link:active {
    text-decoration: underline;
  }
  .list-data_item {
    display: inline-flex;
    margin: 0px 5px 5px 0px;
    border-radius: 12px;
    background-color: #f2f2f2;
    padding: 3px 10px;
    text-transform: capitalize;
  }
  .global, .utilized {
    color: #fff;
    font-size: 12px;
    font-weight: 400;
    margin: 0px;
    border-radius: 10px;
    padding: 3px 8px;
  }
  .global {
    background-color: #8C8985;
  }
  .utilized {
    background-color: #0067B9;
    margin-right: 5px;
  }
  .list-data a {
    color: #0067B9;
    /* These are technically the same, but use both */
    overflow-wrap: break-word;
    word-wrap: break-word;

    -ms-word-break: break-all;
    /* This is the dangerous one in WebKit, as it breaks things wherever */
    word-break: break-all;
    /* Instead use this non-standard one: */
    word-break: break-word;

    /* Adds a hyphen where the word breaks, if supported (No Blink) */
    -ms-hyphens: auto;
    -moz-hyphens: auto;
    -webkit-hyphens: auto;
    hyphens: auto;
  }

  .list-data a:hover {
    text-decoration: underline;
  }

  .list-card-enter, .list-card-leave-to
  /* .list-complete-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(-50%);
  }
  .list-card-leave-active {
    position: absolute;
  }
</style>
