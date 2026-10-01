export function constrainPosition({ x, y }) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Position must be finite');
  const radius = Math.hypot(x, y);
  return radius > 1 ? { x: x / radius, y: y / radius } : { x, y };
}
export function soundParameters(position, outerReductionDb = 0) {
  const { x, y } = constrainPosition(position);
  const distance = Math.hypot(x, y);
  // Listening trial: preserve the inner half, then ease in extra attenuation.
  const outer = Math.max(0, Math.min(1, (distance - 0.5) / 0.5));
  const eased = outer * outer * (3 - 2 * outer);
  return { pan: x, presence: 10 ** (-(18 * distance + outerReductionDb * eased) / 20), distance };
}
export function describePosition(position) {
  const { pan, distance } = soundParameters(position);
  const side = Math.abs(pan) < 0.12 ? 'centred' : pan < 0 ? 'to your left' : 'to your right';
  const presence = distance < 0.3 ? 'close and prominent' : distance < 0.65 ? 'a little further away' : 'farther and quieter';
  return `${presence}, ${side}`;
}
