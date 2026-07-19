<template>
  <Transition
    name="fade"
    appear
    @after-enter="activate"
    @before-leave="deactivate"
    @after-leave="emit('afterLeave')"
  >
    <div v-if="show" class="modal-overlay" @click.self="emit('closeModal')">
      <div
        ref="modalRef"
        class="modal-container"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        :style="modalStyles"
      >
        <button
          v-if="!slots.header"
          type="button"
          class="modal-close"
          aria-label="Close modal"
          @click="emit('closeModal')"
        >
          <CloseIcon />
        </button>

        <slot name="header" :close="() => emit('closeModal')" />

        <div v-if="modalImage" class="modal-layout" :class="`is-${backgroundPlacement}`">
          <div
            class="modal-media"
            role="presentation"
            :style="modalImageStyles"
          ></div>

          <div class="modal-content">
            <slot />
          </div>
        </div>

        <div v-else class="modal-content">
          <slot />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useSlots } from 'vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import { useFocusTrap } from '@/utils/focusTrap'
import type { ModalBackgroundPlacement } from './modalTypes'

const props = withDefaults(
  defineProps<{
    show: boolean
    title: string
    modalImage?: string
    backgroundPlacement?: ModalBackgroundPlacement
    maxWidth?: string
  }>(),
  {
    modalImage: '',
    backgroundPlacement: 'auto',
    maxWidth: '760px',
  },
)

const emit = defineEmits<{
  (_e: 'closeModal'): void
  (_e: 'afterLeave'): void
}>()
const slots = useSlots()

// Template styles are computed here so callers can configure layout without receiving CSS control.
const modalImageStyles = computed(() => ({
  backgroundImage: props.modalImage ? `url("${props.modalImage}")` : undefined,
}))

// Pass width through CSS so layout rules can still clamp it responsively.
const modalStyles = computed(() => ({
  '--modal-max-width': props.maxWidth,
}))

// Focus management activates with the transition so keyboard users enter the modal when it appears.
const modalRef = ref<HTMLElement | null>(null)

const { activate, deactivate } = useFocusTrap(modalRef, {
  onEscape: () => emit('closeModal'),
})

// Clean up even if the parent unmounts this component while it is open.
onBeforeUnmount(deactivate)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  --modal-block-space: clamp(48px, 12dvh, 120px);

  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: var(--modal-block-space) 24px;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;

  .modal-container {
    position: relative;
    width: min(var(--modal-max-width), 100%);
    min-width: min(360px, 100%);
    max-height: min(calc(100dvh - (var(--modal-block-space) * 2)), 720px);
    display: flex;
    flex-direction: column;
    background: #fff;
    color: #000;
    border-radius: 15px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
    overflow: hidden;

    &:focus {
      outline: none;
    }

    .modal-close {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 1;
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      padding: 0;
      background: transparent;
      color: #1a0033;
      cursor: pointer;

      svg {
        width: 28px;
        height: auto;
        transition: all 0.2s ease;
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover svg {
          width: 2.25rem;
        }
      }

      &:active svg {
        transform: scale(0.8);
      }
    }

    .modal-layout {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;

      &.is-auto,
      &.is-left,
      &.is-right {
        flex-direction: row;
      }

      &.is-right {
        flex-direction: row-reverse;
      }

      .modal-media {
        flex: 0 0 auto;
        min-height: 120px;
        background-position: center;
        background-size: cover;
      }

      &.is-top .modal-media {
        flex-basis: 33.333%;
      }

      &.is-auto .modal-media,
      &.is-right .modal-media,
      &.is-left .modal-media {
        flex-basis: 33.333%;
        min-width: 180px;
        min-height: auto;
      }

    }

    .modal-content {
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
      overflow: auto;
    }
  }
}

@media (orientation: portrait) {
  .modal-overlay {
    .modal-layout {
      &.is-auto {
        flex-direction: row-reverse;
      }
    }
  }
}

@media (max-width: 700px) {
  .modal-overlay {
    --modal-block-space: 32px;

    padding-inline: 12px;

    .modal-layout {
      &.is-auto,
      &.is-left,
      &.is-right {
        flex-direction: row;
      }

      &.is-auto,
      &.is-right {
        flex-direction: row-reverse;
      }

      &.is-auto .modal-media,
      &.is-right .modal-media,
      &.is-left .modal-media {
        min-width: 96px;
      }
    }
  }
}
</style>
