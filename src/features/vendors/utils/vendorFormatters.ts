// Stored service keys sometimes include data-entry suffixes and underscores;
// this produces the readable labels shown in the vendor list.
export const formatServiceName = (service: string) => {
  return service
    .replace(/_\(y\/n\)/gi, '')
    .replace(/_/g, ' ')
}
