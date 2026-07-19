import type { LocationQuery } from 'vue-router'
import type { BoundarySelection } from '@/features/map/types'

interface BoundaryQueryKeys {
  parentKey: string
  childKey: string
}

export const mapBoundaryQueryKeys = {
  parentKey: 'state',
  childKey: 'district'
}

// Vue Router query values can be strings, arrays, nulls, or undefined.
// The map only needs a clean list of selected ids/names.
const queryList = (value: LocationQuery[string]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean) as string[]
  }

  return value ? value.split(',').filter(Boolean) : []
}

export const getBoundarySelection = (
  query: LocationQuery,
  keys: BoundaryQueryKeys
): BoundarySelection => {
  const parentIds = queryList(query[keys.parentKey])
  const childIds = queryList(query[keys.childKey])

  if (parentIds.length > 1) {
    return { type: 'parent-list', ids: parentIds }
  }

  if (parentIds.length === 1) {
    return { type: 'parent', id: parentIds[0] }
  }

  if (childIds.length > 1) {
    return { type: 'child-list', ids: childIds }
  }

  if (childIds.length === 1) {
    return { type: 'child', id: childIds[0] }
  }

  return { type: 'none' }
}
