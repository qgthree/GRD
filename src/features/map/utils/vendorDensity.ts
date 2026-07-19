export interface VendorDensityBucket {
  min: number
  max: number
  fillOpacity: number
  label: string
}

const maxDensityBuckets = 5
const zeroVendorOpacity = 0.06
const singleVendorOpacity = 0.22
const maximumOpacity = 0.56

const vendorLabel = (count: number) => {
  return count === 1 ? 'vendor' : 'vendors'
}

const bucketLabel = (bucket: Pick<VendorDensityBucket, 'min' | 'max'>) => {
  if (bucket.min === bucket.max) {
    return `${bucket.min} ${vendorLabel(bucket.min)}`
  }

  return `${bucket.min}-${bucket.max} vendors`
}

const bucketOpacity = (bucket: Pick<VendorDensityBucket, 'min' | 'max'>, maxCount: number) => {
  if (bucket.max <= 0) return zeroVendorOpacity
  if (maxCount <= 1) return singleVendorOpacity

  // One vendor should remain visually light. Higher counts ramp smoothly, but
  // the darkest state still leaves boundary lines readable.
  const normalizedCount = (bucket.max - 1) / (maxCount - 1)
  return singleVendorOpacity + ((maximumOpacity - singleVendorOpacity) * Math.sqrt(normalizedCount))
}

// Turns geography-level vendor counts into up to five visual ranges. Opacity is
// anchored to count values so low-count maps do not become overly dark.
export const createVendorDensityBuckets = (counts: number[]) => {
  const uniqueCounts = [...new Set(counts)]
    .sort((firstCount, secondCount) => firstCount - secondCount)
  const bucketCount = Math.min(maxDensityBuckets, uniqueCounts.length)
  const maxCount = uniqueCounts.at(-1) ?? 0
  const buckets: Array<Pick<VendorDensityBucket, 'min' | 'max'>> = []

  for (let index = 0; index < bucketCount; index += 1) {
    const startIndex = Math.floor(index * uniqueCounts.length / bucketCount)
    const endIndex = Math.floor((index + 1) * uniqueCounts.length / bucketCount) - 1

    buckets.push({
      min: uniqueCounts[startIndex],
      max: uniqueCounts[Math.max(startIndex, endIndex)]
    })
  }

  return buckets.map((bucket) => ({
    ...bucket,
    fillOpacity: bucketOpacity(bucket, maxCount),
    label: bucketLabel(bucket)
  }))
}

export const findVendorDensityBucket = (buckets: VendorDensityBucket[], count: number) => {
  return buckets.find((bucket) => count >= bucket.min && count <= bucket.max)
}
