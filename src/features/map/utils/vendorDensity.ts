export interface VendorDensityBucket {
  min: number
  max: number
  fillOpacity: number
  label: string
}

const maxDensityBuckets = 5
const minimumOpacity = 0.14
const maximumOpacity = 0.75

const vendorLabel = (count: number) => {
  return count === 1 ? 'vendor' : 'vendors'
}

const bucketLabel = (bucket: Pick<VendorDensityBucket, 'min' | 'max'>) => {
  if (bucket.min === bucket.max) {
    return `${bucket.min} ${vendorLabel(bucket.min)}`
  }

  return `${bucket.min}-${bucket.max} vendors`
}

const bucketOpacity = (index: number, bucketCount: number) => {
  if (bucketCount === 1) return maximumOpacity

  // Buckets are created from lowest to highest vendor presence, so opacity
  // increases in that same order.
  const step = (maximumOpacity - minimumOpacity) / (bucketCount - 1)
  return minimumOpacity + step * index
}

// Turns country-level vendor counts into up to five visual ranges. The ranges
// are based on unique count values so repeated counts do not collapse the map
// into one large bucket.
export const createVendorDensityBuckets = (counts: number[]) => {
  const uniqueCounts = [...new Set(counts)]
    .sort((firstCount, secondCount) => firstCount - secondCount)
  const bucketCount = Math.min(maxDensityBuckets, uniqueCounts.length)
  const buckets: Array<Pick<VendorDensityBucket, 'min' | 'max'>> = []

  for (let index = 0; index < bucketCount; index += 1) {
    const startIndex = Math.floor(index * uniqueCounts.length / bucketCount)
    const endIndex = Math.floor((index + 1) * uniqueCounts.length / bucketCount) - 1

    buckets.push({
      min: uniqueCounts[startIndex],
      max: uniqueCounts[Math.max(startIndex, endIndex)]
    })
  }

  return buckets.map((bucket, index) => ({
    ...bucket,
    fillOpacity: bucketOpacity(index, buckets.length),
    label: bucketLabel(bucket)
  }))
}

export const findVendorDensityBucket = (buckets: VendorDensityBucket[], count: number) => {
  return buckets.find((bucket) => count >= bucket.min && count <= bucket.max)
}
