// Badge utility — returns a className for any status/condition string
export function badgeClass(status) {
  if (!status) return "badge";
  const slug = status.toLowerCase().replace(/[\s/]+/g, "-");
  return `badge badge-${slug}`;
}
