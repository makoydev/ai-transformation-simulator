/**
 * Colour values for code that needs them in TypeScript: SVG strokes, inline styles and
 * colours with an alpha suffix such as `${color}22`. Each group mirrors a set of tokens in
 * src/styles/index.css (for example `hue.sky` is `--color-hue-sky`), which Tailwind classes
 * use directly. palette.test.ts fails if the two drift apart.
 */

/** The soft base hues. Departments, executives, approaches and lessons take their identity colour from here. */
const hue = {
  sky: '#6fa8c9',
  green: '#6db894',
  amber: '#d6ab5e',
  yellow: '#d4c36e',
  violet: '#a29ad4',
  pink: '#cf8db0',
  rose: '#d68a92',
  red: '#cc6b6b',
  orange: '#d49763',
  indigo: '#8e96d2',
  slate: '#94a3b8',
} as const;

export const PALETTE = {
  hue,
  brand: { violet: '#8f8acb', indigo: '#7f8dc6', cyan: '#72b4bb' },
  /** The seven headline metrics. */
  metric: {
    budget: hue.green,
    value: hue.amber,
    roi: hue.yellow,
    adoption: hue.sky,
    risk: hue.rose,
    trust: hue.violet,
    morale: hue.pink,
  },
  /** Risk levels. Always shown with a text label too, never colour alone. */
  status: { low: '#5fa877', moderate: hue.amber, high: '#ec835a', critical: '#c4625f' },
  /**
   * Chart lines and chart furniture. The series pairs are mid-tones (OKLCH L 0.64 to 0.66,
   * C 0.10 to 0.11) that pass the colour-vision and contrast checks against `surface`. They
   * are darker and slightly stronger than the metric hues, because thin lines need more
   * presence than tiles do.
   */
  chart: {
    value: '#b7893b',
    target: '#4e94c3',
    trust: '#8b80ca',
    morale: '#c87d52',
    surface: '#21242b',
    grid: '#3b3f49',
    axis: '#5c616c',
  },
} as const;
