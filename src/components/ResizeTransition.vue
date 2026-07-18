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

const shouldMeasureWidth = computed(() => props.axis === 'width' || props.axis === 'both')
const shouldMeasureHeight = computed(() => props.axis === 'height' || props.axis === 'both')
const transition = computed(() => {
  const transitions = []
  if (shouldMeasureWidth.value) transitions.push(`width ${props.duration}ms ease-out`)
  if (shouldMeasureHeight.value) transitions.push(`height ${props.duration}ms ease-out`)

  return transitions.join(', ')
})

const updateSize = () => {
  if (!content.value) return

  cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(() => {
    if (!content.value) return

    if (shouldMeasureWidth.value) {
      width.value = `${content.value.offsetWidth}px`
    }

    if (shouldMeasureHeight.value) {
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
      width: shouldMeasureWidth ? width : undefined,
      height: shouldMeasureHeight ? height : undefined,
      transition
    }"
  >
    <div ref="content" class="resize-transition-content" :class="`axis-${axis}`">
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

.resize-transition-content.axis-width,
.resize-transition-content.axis-both {
  display: inline-block;
}
</style>
