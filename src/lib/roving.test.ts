import { describe, expect, it } from 'vitest';
import { nextIndex, rovingTabIndex } from './roving';

describe('nextIndex', () => {
  it('moves forward and back with the arrows, wrapping at the ends', () => {
    expect(nextIndex('ArrowRight', 0, 3)).toBe(1);
    expect(nextIndex('ArrowDown', 2, 3)).toBe(0);
    expect(nextIndex('ArrowLeft', 0, 3)).toBe(2);
    expect(nextIndex('ArrowUp', 2, 3)).toBe(1);
  });

  it('jumps to the ends with Home and End', () => {
    expect(nextIndex('Home', 2, 5)).toBe(0);
    expect(nextIndex('End', 0, 5)).toBe(4);
  });

  it('ignores other keys', () => {
    expect(nextIndex('Enter', 1, 3)).toBeNull();
    expect(nextIndex('Tab', 1, 3)).toBeNull();
  });
});

describe('rovingTabIndex', () => {
  it('makes only the selected item tabbable', () => {
    expect([true, false, false].map((s, i) => rovingTabIndex(s, i, true))).toEqual([0, -1, -1]);
    expect([false, false, true].map((s, i) => rovingTabIndex(s, i, true))).toEqual([-1, -1, 0]);
  });

  it('falls back to the first item when nothing is selected', () => {
    expect([false, false, false].map((s, i) => rovingTabIndex(s, i, false))).toEqual([0, -1, -1]);
  });
});
