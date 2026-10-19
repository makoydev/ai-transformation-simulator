/**
 * How far (in px) to slide a tooltip that is centred on its trigger so that it
 * stays at least `margin` px inside the viewport. The tooltip is never wider
 * than the viewport minus both margins, which matches its CSS max-width.
 */
export function tooltipShift(
  triggerLeft: number,
  triggerWidth: number,
  tooltipWidth: number,
  viewportWidth: number,
  margin = 16,
): number {
  const width = Math.min(tooltipWidth, viewportWidth - 2 * margin);
  const left = triggerLeft + triggerWidth / 2 - width / 2;
  const clamped = Math.min(Math.max(left, margin), viewportWidth - margin - width);
  return Math.round(clamped - left);
}
