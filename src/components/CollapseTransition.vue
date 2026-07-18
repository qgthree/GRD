<script setup lang="ts">
const props = withDefaults(defineProps<{
  duration?: number
}>(), {
  // Tuned for accordions: slow enough to read, quick enough to feel responsive.
  duration: 280
})

const setTransition = (element: HTMLElement) => {
  element.style.transition = `height ${props.duration}ms ease-out`
}

const clearStyles = (element: HTMLElement) => {
  element.style.height = ''
  element.style.overflow = ''
  element.style.transition = ''
}

const beforeEnter = (element: Element) => {
  const htmlElement = element as HTMLElement

  htmlElement.style.height = '0'
  htmlElement.style.overflow = 'hidden'
}

const enter = (element: Element) => {
  const htmlElement = element as HTMLElement

  setTransition(htmlElement)
  requestAnimationFrame(() => {
    htmlElement.style.height = `${htmlElement.scrollHeight}px`
  })
}

const afterEnter = (element: Element) => {
  clearStyles(element as HTMLElement)
}

const beforeLeave = (element: Element) => {
  const htmlElement = element as HTMLElement

  htmlElement.style.height = `${htmlElement.scrollHeight}px`
  htmlElement.style.overflow = 'hidden'
}

const leave = (element: Element) => {
  const htmlElement = element as HTMLElement

  setTransition(htmlElement)
  // Reading offsetHeight commits the starting height before transitioning down.
  void htmlElement.offsetHeight
  requestAnimationFrame(() => {
    htmlElement.style.height = '0'
  })
}

const afterLeave = (element: Element) => {
  clearStyles(element as HTMLElement)
}
</script>

<template>
  <Transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot />
  </Transition>
</template>
