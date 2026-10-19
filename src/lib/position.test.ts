import { describe, expect, it } from 'vitest';
import { tooltipShift } from './position';

describe('tooltipShift', () => {
  it('keeps a tooltip centred when it fits', () => {
    expect(tooltipShift(600, 190, 288, 1440)).toBe(0);
  });

  it('slides right for a trigger at the left edge', () => {
    // Centred on the Budget tile (x 24, 190 wide), the tooltip would start at x -25.
    expect(tooltipShift(24, 190, 288, 1440)).toBe(41);
  });

  it('slides left for a trigger at the right edge', () => {
    // Centred on the Morale tile (x 1226, 190 wide), it would end at x 1465.
    expect(tooltipShift(1226, 190, 288, 1440)).toBe(-41);
  });

  it('fits both columns of a 320px phone', () => {
    expect(tooltipShift(16, 140, 288, 320)).toBe(74);
    expect(tooltipShift(164, 140, 288, 320)).toBe(-74);
  });

  it('shrinks the tooltip on screens narrower than it', () => {
    // At 280px the tooltip is capped at 248px, which exactly fills the space between the margins.
    expect(tooltipShift(16, 120, 288, 280)).toBe(64);
  });
});
