<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

type ResizeAxis = 'height' | 'width' | 'both'

const props = withDefaults(defineProps<{
  axis?: ResizeAxis
  duration?: number
}>(), {
  axis: 'height',
  duration: 120
})

const content = ref<HTMLElement | null>(null)
const width = ref('auto')
const height = ref('auto')
let observer: ResizeObserver | null = null
let animationFrame = 0

const measuresWidth = () => props.axis === 'width' || props.axis === 'both'
const measuresHeight = () => props.axis === 'height' || props.axis === 'both'

const transition = computed(() => [
  measuresWidth() && `width ${props.duration}ms ease-out`,
  measuresHeight() && `height ${props.duration}ms ease-out`
].filter(Boolean).join(', '))

const updateSize = () => {
  if (!content.value) return

  cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(() => {
    if (!content.value) return

    if (measuresWidth()) {
      width.value = `${content.value.offsetWidth}px`
    }

    if (measuresHeight()) {
      height.value = `${content.value.offsetHeight}px`
    }
  })
}

onMounted(async () => {
  await nextTick()
  updateSize()

  // CSS cannot transition cleanly between natural `auto` sizes. This wrapper
  // measures the content and animates only the axes requested by the caller.
  observer = new ResizeObserver(updateSize)
  if (content.value) {
    observer.observe(content.value)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  observer?.disconnect()
})
</script>

<template>
  <div
    class="resize-transition"
    :style="{
      width: measuresWidth() ? width : undefined,
      height: measuresHeight() ? height : undefined,
      transition
    }"
  >
    <div ref="content" class="resize-transition-content" :class="{ 'measure-width': measuresWidth() }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.resize-transition {
  overflow: hidden;
}

.resize-transition-content {
  display: flow-root;
}

.resize-transition-content.measure-width {
  display: inline-block;
}
</style>
