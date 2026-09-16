// Arc lengths use the official total; never normalize an incomplete breakdown.
export function allocationArcs(parts, total) {
  if (!Number.isFinite(total) || total <= 0 || parts.some(part => !Number.isFinite(part.amount) || part.amount < 0)) return [];
  if (Math.abs(parts.reduce((sum, part) => sum + part.amount, 0) - total) > .01) return [];
  let offset = 0;
  const point = fraction => {
    const angle = (fraction * 360 - 90) * Math.PI / 180;
    return [200 + 167 * Math.cos(angle), 200 + 167 * Math.sin(angle)].map(value => Number(value.toFixed(6))).join(' ');
  };
  return parts.map(part => {
    const share = part.amount / total;
    const start = offset;
    offset += share;
    const d = share === 1
      ? `M ${point(start)} A 167 167 0 1 1 ${point(start + .5)} A 167 167 0 1 1 ${point(offset)}`
      : `M ${point(start)} A 167 167 0 ${share > .5 ? 1 : 0} 1 ${point(offset)}`;
    return { ...part, share, d: share > 0 ? d : '' };
  });
}
