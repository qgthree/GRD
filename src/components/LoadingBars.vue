<template>
  <svg class="loading-bars" viewBox="0 0 48 24" aria-hidden="true">
    <rect x="6" y="8" width="6" height="12" rx="2" />
    <rect x="21" y="4" width="6" height="16" rx="2" />
    <rect x="36" y="10" width="6" height="10" rx="2" />
  </svg>
</template>

<style scoped>
.loading-bars {
  display: block;
  width: 48px;
  height: 24px;
  fill: currentColor;
}

.loading-bars rect {
  animation: loading-bars 0.75s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center bottom;
}

.loading-bars rect:nth-child(2) {
  animation-delay: 0.1s;
}

.loading-bars rect:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes loading-bars {
  0%,
  100% {
    opacity: 0.45;
    transform: scaleY(0.55);
  }

  50% {
    opacity: 1;
    transform: scaleY(1);
  }
}
</style>
