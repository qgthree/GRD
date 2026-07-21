import naics2022 from '@/features/naics/data/naics2022.json'
import type { NaicsCode } from '@/features/naics/types'

export interface NaicsSelection {
  selectedCodes: string[]
  excludedCodes: string[]
}

export const naicsCodes = naics2022 as NaicsCode[]

const naicsByCode = new Map(naicsCodes.map((code) => [code.code, code]))
const childrenByParentCode = new Map<string, NaicsCode[]>()

naicsCodes.forEach((code) => {
  if (!code.parentCode) return

  childrenByParentCode.set(code.parentCode, [
    ...(childrenByParentCode.get(code.parentCode) ?? []),
    code
  ])
})

export const naicsLevel = (code: string) => code.includes('-') ? 2 : code.length

export const naicsSectors = naicsCodes.filter((code) => !code.parentCode)

export const naicsBuckets = [
  { level: 2, title: 'NAICS Sectors', description: '20 broad two-digit sectors' },
  { level: 3, title: 'Subsectors', description: 'Three-digit industry subsectors' },
  { level: 4, title: 'Industry Groups', description: 'Four-digit industry groups' },
  { level: 5, title: 'NAICS Industries', description: 'Five-digit NAICS industries' },
  { level: 6, title: 'U.S. National Industries', description: 'Six-digit U.S. detail industries' }
].map((bucket) => ({
  ...bucket,
  codes: naicsCodes.filter((code) => naicsLevel(code.code) === bucket.level)
}))

const naicsCodesByDisplayOrder = naicsBuckets.flatMap((bucket) => bucket.codes.map((code) => code.code))
const naicsCodesDeepestFirst = [...naicsCodes]
  .sort((firstCode, secondCode) => naicsLevel(secondCode.code) - naicsLevel(firstCode.code))
  .map((code) => code.code)

export const getNaicsTitle = (code: string) => naicsByCode.get(code)?.title ?? code

export const getNaicsLabel = (code: string) => `${code} ${getNaicsTitle(code)}`

export const getNaicsChildren = (code: string) => childrenByParentCode.get(code) ?? []

export const getNaicsAncestors = (code: string) => {
  const ancestors: NaicsCode[] = []
  let currentCode = naicsByCode.get(code)?.parentCode

  while (currentCode) {
    const parent = naicsByCode.get(currentCode)
    if (!parent) break

    ancestors.unshift(parent)
    currentCode = parent.parentCode
  }

  return ancestors
}

export const getNaicsDescendants = (code: string): NaicsCode[] => {
  const children = childrenByParentCode.get(code) ?? []

  return children.flatMap((child) => [child, ...getNaicsDescendants(child.code)])
}

export const naicsCodeMatches = (code: string, selectedCode: string) => {
  return code === selectedCode || getNaicsAncestors(code).some((ancestor) => ancestor.code === selectedCode)
}

export const selectedNaicsCodeMatches = (
  code: string,
  selectedCodes: string[],
  excludedCodes: string[] = []
) => {
  return (
    selectedCodes.some((selectedCode) => naicsCodeMatches(code, selectedCode)) &&
    !excludedCodes.some((excludedCode) => naicsCodeMatches(code, excludedCode))
  )
}

export const sortNaicsCodes = (codes: string[]) => {
  const selected = new Set(codes)

  return naicsCodesByDisplayOrder.filter((code) => selected.has(code))
}

export const hasSelectedNaicsAncestor = (code: string, selectedCodes: string[]) => {
  return getNaicsAncestors(code).some((ancestor) => selectedCodes.includes(ancestor.code))
}

export const hasSelectedNaicsDescendant = (code: string, selectedCodes: string[]) => {
  return selectedCodes.some((selectedCode) => {
    return getNaicsAncestors(selectedCode).some((ancestor) => ancestor.code === code)
  })
}

// Checked means either directly selected, inherited from a selected ancestor,
// or implied upward because a selected child needs its parent context visible.
export const isNaicsCodeChecked = (code: string, selectedCodes: string[], excludedCodes: string[] = []) => {
  return (
    selectedNaicsCodeMatches(code, selectedCodes, excludedCodes) ||
    hasSelectedNaicsDescendant(code, selectedCodes)
  )
}

export const isNaicsCodeImpliedByDescendant = (code: string, selectedCodes: string[]) => {
  return !selectedCodes.includes(code) && hasSelectedNaicsDescendant(code, selectedCodes)
}

export const canonicalizeNaicsSelection = (
  selectedCodes: string[],
  excludedCodes: string[] = []
): NaicsSelection => {
  const selected = new Set(selectedCodes)
  const excluded = new Set(excludedCodes)
  let changed = true

  // If every direct child of a parent is selected, store the parent instead.
  // Repeating this deepest-first collapses fully selected branches upward.
  while (changed) {
    changed = false

    naicsCodesDeepestFirst.forEach((code) => {
      const children = getNaicsChildren(code)
      if (!children.length || selected.has(code)) return

      const selectedList = [...selected]
      const excludedList = [...excluded]
      const allChildrenSelected = children.every((child) => {
        return selectedNaicsCodeMatches(child.code, selectedList, excludedList)
      })

      if (!allChildrenSelected) return

      selected.add(code)
      getNaicsDescendants(code).forEach((descendant) => selected.delete(descendant.code))
      changed = true
    })
  }

  // A selected ancestor already includes its descendants, so descendant codes
  // do not need to stay in the positive selection list.
  Array.from(selected).forEach((code) => {
    const hasSelectedAncestor = getNaicsAncestors(code).some((ancestor) => selected.has(ancestor.code))
    if (hasSelectedAncestor) {
      selected.delete(code)
    }
  })

  // A parent can remain selected even when every child has been excluded. That
  // keeps parent-level vendor/search matches available when the user wants the
  // broad NAICS code without any child industries.
  //
  // Exclusions only mean something beneath a selected ancestor. Once that
  // ancestor is gone, discard the stale exception from the URL.
  Array.from(excluded).forEach((code) => {
    const hasSelectedAncestor = getNaicsAncestors(code).some((ancestor) => selected.has(ancestor.code))
    if (!hasSelectedAncestor) {
      excluded.delete(code)
    }
  })

  return {
    selectedCodes: [...selected],
    excludedCodes: [...excluded]
  }
}

export const toggleNaicsSelection = (
  code: string,
  selectedCodes: string[],
  excludedCodes: string[] = []
): NaicsSelection => {
  const selected = new Set(selectedCodes)
  const excluded = new Set(excludedCodes)
  const branchCodes = [code, ...getNaicsDescendants(code).map((descendant) => descendant.code)]
  const checked = isNaicsCodeChecked(code, selectedCodes, excludedCodes)
  const selectedAncestor = hasSelectedNaicsAncestor(code, selectedCodes)

  // Positive selections include a full branch. Exclusions carve a branch out of
  // a selected ancestor. Implied parents are still clickable, and clearing one
  // removes the selected children that made it appear checked.
  if (checked) {
    if (selected.has(code) || !selectedAncestor) {
      branchCodes.forEach((branchCode) => {
        selected.delete(branchCode)
        excluded.delete(branchCode)
      })
    }
    else {
      excluded.add(code)
    }
  }
  else {
    if (!selectedAncestor) {
      selected.add(code)
    }

    const codesToClearFromExclusions = [
      code,
      ...getNaicsAncestors(code).map((ancestor) => ancestor.code),
      ...branchCodes
    ]

    codesToClearFromExclusions.forEach((branchCode) => excluded.delete(branchCode))
  }

  return canonicalizeNaicsSelection([...selected], [...excluded])
}
