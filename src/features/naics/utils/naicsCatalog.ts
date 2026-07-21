import type { NaicsCode } from '@/features/naics/types'

export interface NaicsBucket {
  level: number
  title: string
  description: string
  codes: NaicsCode[]
}

export const naicsBucketDefinitions = [
  { level: 2, title: 'NAICS Sectors', description: '20 broad two-digit sectors' },
  { level: 3, title: 'Subsectors', description: 'Three-digit industry subsectors' },
  { level: 4, title: 'Industry Groups', description: 'Four-digit industry groups' },
  { level: 5, title: 'NAICS Industries', description: 'Five-digit NAICS industries' },
  { level: 6, title: 'U.S. National Industries', description: 'Six-digit U.S. detail industries' }
] as const

export const naicsLevel = (code: string) => code.includes('-') ? 2 : code.length

// Build the bucket list from an already-loaded catalog. Keeping this pure lets
// async components decide when to pay the cost of importing the full NAICS data.
export const createNaicsBuckets = (codes: NaicsCode[]): NaicsBucket[] => {
  return naicsBucketDefinitions.map((bucket) => ({
    ...bucket,
    codes: codes.filter((code) => naicsLevel(code.code) === bucket.level)
  }))
}
