<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
}>()

// Internal links should use Vue Router, while external URLs should render as
// normal anchors with safe new-tab behavior.
const isExternal = computed(
  () => typeof props.to === 'string' && /^(https?:\/\/|www\.)/.test(props.to),
)
</script>

<template>
  <a v-if="isExternal" :href="String(to)" target="_blank" rel="noopener"><slot /></a>
  <router-link v-else :to="to"><slot /></router-link>
</template>
