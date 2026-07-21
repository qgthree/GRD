import type { NaicsCode } from '@/features/naics/types'

interface NaicsIndex {
  byCode: Map<string, NaicsCode>
}

let naicsCodesPromise: Promise<NaicsCode[]> | null = null
let naicsIndexPromise: Promise<NaicsIndex> | null = null

// The full NAICS file is large enough to keep out of the first app bundle.
// Cache the dynamic import so URL-filtering, nav labels, and the sector panel
// all reuse the same loaded catalog once any of them needs it.
export const loadNaicsCodes = () => {
  naicsCodesPromise ??= import('@/features/naics/data/naics2022.json')
    .then((module) => module.default as NaicsCode[])

  return naicsCodesPromise
}

// The index is built lazily from the same catalog. Keep it private so callers
// ask for domain-specific helpers instead of passing maps around the app.
const loadNaicsIndex = () => {
  naicsIndexPromise ??= loadNaicsCodes().then((codes) => {
    const byCode = new Map(codes.map((code) => [code.code, code]))

    return { byCode }
  })

  return naicsIndexPromise
}

const getNaicsAncestorsFromIndex = (code: string, byCode: Map<string, NaicsCode>) => {
  const ancestors: NaicsCode[] = []
  let currentCode = byCode.get(code)?.parentCode

  while (currentCode) {
    const parent = byCode.get(currentCode)
    if (!parent) break

    ancestors.unshift(parent)
    currentCode = parent.parentCode
  }

  return ancestors
}

// Used by compact UI summaries, such as the nav title. Calling this is the
// point where a route with selected sectors intentionally loads the catalog.
export const loadNaicsTitleMap = async (codes: string[]) => {
  const { byCode } = await loadNaicsIndex()

  return new Map(codes.map((code) => [code, byCode.get(code)?.title ?? code]))
}

// Vendor cards can render with raw codes first, then hydrate labels only when
// the list opens or the user searches by service text.
export const loadNaicsLabelMap = async (codes: string[]) => {
  const titleMap = await loadNaicsTitleMap(codes)

  return new Map(codes.map((code) => [code, `${code} ${titleMap.get(code) ?? code}`]))
}

// Build a route-scoped matcher once per sector-filtered vendor update. The
// returned function is synchronous so each vendor/code check stays cheap.
export const createSelectedNaicsMatcher = async (selectedCodes: string[], excludedCodes: string[] = []) => {
  const { byCode } = await loadNaicsIndex()

  // Callers such as vendor filtering may test many vendor codes. Cache each
  // code's ancestry so one route update does not repeatedly walk the same tree.
  const ancestorsByCode = new Map<string, NaicsCode[]>()
  const getAncestors = (code: string) => {
    if (!ancestorsByCode.has(code)) {
      ancestorsByCode.set(code, getNaicsAncestorsFromIndex(code, byCode))
    }

    return ancestorsByCode.get(code) ?? []
  }

  return (code: string) => {
    const ancestors = getAncestors(code)
    const codeMatches = (selectedCode: string) => {
      return code === selectedCode || ancestors.some((ancestor) => ancestor.code === selectedCode)
    }

    return selectedCodes.some(codeMatches) && !excludedCodes.some(codeMatches)
  }
}
