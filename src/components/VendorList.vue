<script setup>
import { storeToRefs } from 'pinia';
import { ref, computed, watch } from 'vue';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useVendorStore } from '@/stores/vendorStore';
import { useLocationStore } from '@/stores/locationStore';
import Applink from '@/components/Applink.vue'
import print from "@/assets/images/print.svg";
import close from "@/assets/images/close.svg";

// list of vendors, already filtered per url params
const vendorStore = useVendorStore();
const { filteredVendors } = storeToRefs(vendorStore);
const countries = useLocationStore().countries;

const getCountryName = (ISO3) => countries.find((country) => country.ISO3 == ISO3).name;

// update vendors to display search results
let vendorSearch = defineModel();
let searchFilteredVendors = computed(() => {
  if (!vendorSearch.value) {
    return filteredVendors.value;
  }
  return filteredVendors.value.filter(vendor => {
    let search = vendorSearch.value.toLowerCase();
    return (
      vendor.company_name.toLowerCase().includes(search) ||
      vendor.subsectors && vendor.subsectors.join(',').toLowerCase().includes(search) ||
      vendor.email && vendor.email.toLowerCase().includes(search) ||
      vendor['primary_contact(s)'] && vendor['primary_contact(s)'].toLowerCase().includes(search) ||
      vendor.phone && vendor.phone.toLowerCase().includes(search) ||
      vendor.region && vendor.region.includes(search)
    )
  });
});

// rerender the list component when searching so that scrollbar stays consistent
const listKey = ref(0);
const rerenderList = () => {
  const vendorScroll = document.getElementById("vendorScroll");
  return vendorScroll.scrollTop = 0;
};

// Perform when vendor data updates
watch(searchFilteredVendors, (newValue, oldValue) => {
  rerenderList();
});

// expand and collapse vendor details
const toggleVisibility = (key, e) => {
  const vendor = filteredVendors.value.find((item) => item.id === key);
  if (document.getSelection().type === 'Range') {
    e.stopPropagation();
  }
  else {
    vendor.isVisible = !vendor.isVisible;
  }
}

// Format the service names
const formatServiceName = (service) => {
  return service
    .replace(/_\(y\/n\)/gi, '')    // Remove (y/n)
    .replace(/_/g, ' ')            // Replace underscores with spaces
};
</script>

<template>
  <div id="vlist">
    <div class="component_header">
      <div class="header-left">{{ filteredVendors.length }} Vendor<span v-if="filteredVendors.length !== 1">s</span></div>
      <div class="header-right">
        <img :src="print" style="margin-right: 10px; display: none;" />
        <img :src="close" @click="vendorStore.toggleVendors()" />
      </div>
    </div>
    <div class="component_body">
      <input v-model="vendorSearch" type="text" placeholder="search for a vendor" />
    </div>
    <div class="component_body" :key="listKey">
      <PerfectScrollbar id="vendorScroll">
        <div class="searchResultsDetails" v-if="vendorSearch"><strong>{{ searchFilteredVendors.length }}</strong> <span v-if="searchFilteredVendors.length === 1"><strong>vendor</strong> contains</span><span v-else><strong>vendors</strong> contain</span> details that include your search.</div>
        <transition-group name="list-card" tag="div">
          <div class="list-card" v-for="vendor in searchFilteredVendors" :key="vendor.id" @click="toggleVisibility(vendor.id, $event)">
            <div class="list-data list-data_title-wrapper">
              <span class="list-data_title">{{ vendor.company_name }}</span><div class="utilized list-data_item" v-if="vendor.previously_used">utilized</div><div v-if="vendor.region.includes('Global')" class="global list-data_item">global</div>
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
                  Countries of Operation:
                </span>
                <span v-for="(country, index) in vendor.country_location" :key="index">{{ getCountryName(country) }}<span v-if="index < vendor.country_location.length - 1">, </span></span>
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
                <Applink :to="vendor.url">{{ vendor.url }}</Applink>
              </div>
            </div>
          </div>
        </transition-group>
      </PerfectScrollbar>
    </div>
  </div>
</template>

<style scoped>
  #vlist {
    display: grid;
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
    font-family: SourceSansPro;
  }

  .searchResultsDetails {
    margin: 20px;
    font-style: italic;
    font-size: 14px;
    color: #651D32;
  }

  .ps {
    max-height: 100%;
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
