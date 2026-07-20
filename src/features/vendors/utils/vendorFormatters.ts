import { getNaicsLabel } from '@/features/naics/utils/naicsCodes'

export const formatServiceName = (service: string) => {
  return getNaicsLabel(service)
}
