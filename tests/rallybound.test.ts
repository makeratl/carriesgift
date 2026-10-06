import { describe, expect, it } from 'vitest';
import { parseRaised } from '../lib/rallybound';

// Shape captured from kidneytribute.rallybound.org/carrieburns on 2026-10-06.
const page = (amt: string) => `<div class="widget widget-default team-raised "><div class="middleStuff" id="NewProgressAmtRaised"><span class="was-raised">${amt}</span><div> raised of  $5,000  goal\n\t\t</div></div>`;

describe('parseRaised', () => {
  it('reads the total', () => {
    expect(parseRaised(page('$0'))).toBe(0);
    expect(parseRaised(page('$1,840'))).toBe(1840);
    expect(parseRaised(page('$12,345.50'))).toBe(12345);
  });
  it('returns null when the markup changes', () => {
    expect(parseRaised('<div>nothing here</div>')).toBeNull();
    expect(parseRaised('<div id="NewProgressAmtRaised"><span>soon</span></div>')).toBeNull();
  });
});
