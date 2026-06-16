import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { optimizeSvg } from './optimize.mjs';

// ---------------------------------------------------------------------------
// Strip width and height, keep viewBox
// ---------------------------------------------------------------------------
describe('optimizeSvg', () => {
  it('strips width and height but keeps viewBox', () => {
    const input = `<svg aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"></path></svg>`;
    const result = optimizeSvg(input);

    // Space-prefixed to avoid matching stroke-width, stroke-height etc.
    assert.ok(!/ width=/.test(result), 'should not contain width attribute');
    assert.ok(!/ height=/.test(result), 'should not contain height attribute');
    assert.ok(result.includes('viewBox="0 0 24 24"'), 'should preserve viewBox');
  });

  // ---------------------------------------------------------------------------
  // Preserve currentColor for theming
  // ---------------------------------------------------------------------------
  it('preserves currentColor values for theming', () => {
    const input = `<svg aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 11C5 10.4477 5.44772 10 6 10H18C18.5523 10 19 10.4477 19 11V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
    const result = optimizeSvg(input);

    assert.ok(result.includes('currentColor'), 'should preserve currentColor');
  });

  // ---------------------------------------------------------------------------
  // Does not merge separate paths
  // ---------------------------------------------------------------------------
  it('does not merge separate paths', () => {
    const input = `<svg aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 11V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V11" stroke="currentColor" stroke-width="2"></path><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2"></path><path d="M8 14H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`;
    const result = optimizeSvg(input);

    // Count the number of <path occurrences — should be 3 (unchanged)
    const pathCount = (result.match(/<path/g) || []).length;
    assert.equal(pathCount, 3, `expected 3 paths, got ${pathCount}`);
  });

  // ---------------------------------------------------------------------------
  // Preserves explicit fill colors on brand icons
  // ---------------------------------------------------------------------------
  it('preserves explicit fill colors like #1877F2 on brand icons', () => {
    const input = `<svg aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2"></path></svg>`;
    const result = optimizeSvg(input);

    assert.ok(result.includes('#1877F2') || result.includes('#1877f2'), 'should preserve explicit fill color #1877F2');
  });

  // ---------------------------------------------------------------------------
  // Integration: real Central icon (IconLock)
  // ---------------------------------------------------------------------------
  it('optimizes a real Central icon end-to-end', async () => {
    // Import render helper and a real icon
    const { renderIconToSvg } = await import('./extract.mjs');
    const { IconLock } = await import(
      '@central-icons-react/round-outlined-radius-1-stroke-2/IconLock'
    );

    const raw = renderIconToSvg(IconLock);
    const optimized = optimizeSvg(raw);

    // Should be valid SVG
    assert.ok(optimized.startsWith('<svg'), 'should start with <svg');
    assert.ok(optimized.endsWith('</svg>'), 'should end with </svg>');

    // Dimensions stripped, viewBox preserved
    // Space-prefixed to avoid matching stroke-width etc.
    assert.ok(!/ width=/.test(optimized), 'should strip width');
    assert.ok(!/ height=/.test(optimized), 'should strip height');
    assert.ok(optimized.includes('viewBox'), 'should keep viewBox');

    // currentColor preserved
    assert.ok(optimized.includes('currentColor'), 'should preserve currentColor');

    // Optimized should be smaller or equal in size
    assert.ok(
      optimized.length <= raw.length,
      `optimized (${optimized.length}) should be <= raw (${raw.length})`,
    );
  });

  // ---------------------------------------------------------------------------
  // Returns a string
  // ---------------------------------------------------------------------------
  it('returns a string', () => {
    const input = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
    const result = optimizeSvg(input);
    assert.equal(typeof result, 'string');
  });
});
