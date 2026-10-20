import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PALETTE } from './palette';

const css = readFileSync(new URL('../styles/index.css', import.meta.url), 'utf8');

function token(name: string): string | undefined {
  return css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1]?.toLowerCase();
}

describe('palette', () => {
  for (const [group, colors] of Object.entries(PALETTE)) {
    for (const [name, hex] of Object.entries(colors)) {
      it(`${group}.${name} matches --color-${group}-${name} in index.css`, () => {
        expect(token(`${group}-${name}`)).toBe(hex.toLowerCase());
      });
    }
  }
});
