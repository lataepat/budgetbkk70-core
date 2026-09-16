/** Shared map/list encoding. Missing and unattributed values never receive a budget rank. */
export function mapMetricValue(row, metric) {
  const key = metric === 'office' ? 'district_office_budget'
    : metric === 'central' ? 'central_exclusive_budget_safe_to_attribute' : 'minimum_verified_budget';
  const value = row?.[key];
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

export function districtMapScale(districts, metric) {
  const ordered = [...districts].sort((a, b) =>
    (mapMetricValue(b, metric) ?? -1) - (mapMetricValue(a, metric) ?? -1)
    || a.district.localeCompare(b.district, 'th'));
  const positive = ordered.filter(row => (mapMetricValue(row, metric) ?? 0) > 0);
  const entries = new Map();
  for (const row of ordered) {
    const value = mapMetricValue(row, metric);
    const rank = value !== null && value > 0
      ? positive.findIndex(other => mapMetricValue(other, metric) === value) + 1 : null;
    const band = rank === null ? 0 : 5 - Math.min(4, Math.floor((rank - 1) * 5 / positive.length));
    entries.set(row.district, { value, rank, band });
  }
  return { ordered, entries, unrankedCount: ordered.length - positive.length };
}

export function mapRoute(district = '', metric = 'office') {
  const params = new URLSearchParams({ metric });
  if (district) params.set('district', district);
  return `#map?${params.toString()}`;
}

/** Keep screen-space pan math while redrawing vector geometry at its native resolution. */
export function mapCameraViewBox(view, width, height, mapWidth, mapHeight) {
  const scale = Math.min(width / mapWidth, height / mapHeight);
  const offsetX = (width - mapWidth * scale) / 2;
  const offsetY = (height - mapHeight * scale) / 2;
  return [
    (-view.x / view.zoom - offsetX) / scale,
    (-view.y / view.zoom - offsetY) / scale,
    width / (scale * view.zoom),
    height / (scale * view.zoom),
  ];
}
