import { nextTick, type Ref } from 'vue'

type Options = {
  onEscape?: () => void
}

// Keep this selector broad enough for normal dialog controls, but exclude tabindex="-1".
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const getFocusableElements = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.getClientRects().length > 0,
  )

// Keeps keyboard focus inside a mounted container and restores prior focus on close.
export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
  options: Options = {},
) {
  let cleanup: (() => void) | null = null
  let previouslyFocusedElement: HTMLElement | null = null

  const handleKeydown = (event: KeyboardEvent) => {
    const root = containerRef.value
    if (!root) return

    if (event.key === 'Escape') {
      event.preventDefault()
      options.onEscape?.()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = getFocusableElements(root)

    if (!focusable.length) {
      event.preventDefault()
      root.focus()
      return
    }

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    const active = document.activeElement as HTMLElement | null

    // If focus somehow escaped the modal, bring it back in on the next Tab.
    if (!active || !root.contains(active)) {
      event.preventDefault()
      first.focus()
      return
    }

    if (event.shiftKey) {
      if (active === first) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const activate = async () => {
    cleanup?.()
    previouslyFocusedElement = document.activeElement as HTMLElement | null

    await nextTick()

    const root = containerRef.value
    if (!root) return

    if (!root.hasAttribute('tabindex')) {
      root.tabIndex = -1
    }

    const firstFocusable = getFocusableElements(root)[0]

    if (firstFocusable) {
      firstFocusable.focus()
    } else {
      root.focus()
    }

    document.addEventListener('keydown', handleKeydown)
    cleanup = () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }

  const deactivate = () => {
    cleanup?.()
    cleanup = null

    requestAnimationFrame(() => {
      if (previouslyFocusedElement && document.contains(previouslyFocusedElement)) {
        previouslyFocusedElement.focus()
      }
    })
  }

  return {
    activate,
    deactivate,
  }
}
