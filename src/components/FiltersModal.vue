<script setup>
import { useFiltersStore } from '@/stores/filtersStore';
import close from "@/assets/images/close.svg";
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import FilterTypeSelector from '@/components/FilterTypeSelector.vue'
</script>

<template>
  <div class="modal-mask">
    <div id="filters">
      <div class="component_header">
        <div class="header-left">Filters</div>
        <div class="header-right">
          <img :src="close" @click="useFiltersStore().toggleFiltersView('hidden')" />
        </div>
      </div>
      <div class="component_body">
        <FilterTypeSelector />
        <PerfectScrollbar>
          <div id="locationTypeSelector">
            <div class="selectorLeft">Filter By Region</div>
            <div class="selectorCenter">
              <label class="switch">
                <input type="checkbox" />
              <span class="slider"></span>
            </label>
            </div>
            <div class="selectorRight">Filter By Country</div>
          </div>
        </PerfectScrollbar>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-mask {
  display: grid;
  justify-items: center;
  position: fixed;
  z-index: 9998;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
  /* fixes flicker in Chrome when closing modal */
  -webkit-transform: translatez(0);
}

#filters {
    display: grid;
    border-radius: 10px;
    width: 600px;
    position: relative;
    top: 30px;
    height: fit-content;
    max-width: calc(100vw - 60px);
    max-height: calc(100vh - 60px);
    background-color: #fff;
    -webkit-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    -moz-box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    box-shadow: 0px 3px 17px -10px rgba(0,0,0,0.75);
    overflow: hidden;
  }
  .component_header {
    height: 44px;
  }
  .component_body {
    max-height: calc(100vh - 104px);
    width: 100%;
    padding: 30px;
  }
  .ps {
    max-height: 100%;
    background-color: #fff;
  }

  /* form inputs */
  #locationTypeSelector {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 100px 1fr;
    align-items: center;
    margin: 20px 0px;
  }
  #locationTypeSelector > * {
    display: inline-grid;
    align-items: center;
    justify-items: center;
    cursor: pointer;
  }
  .selectorLeft {
    justify-content: right;
  }
  .selectorRight {
    justify-content: left;
  }
  .selectorLeft.active, .selectorRight.active {
    cursor: default;
  }
</style>