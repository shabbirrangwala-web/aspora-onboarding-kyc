import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  pascalToKebab,
  extractAliases,
} from './extract.mjs';

// ---------------------------------------------------------------------------
// pascalToKebab
// ---------------------------------------------------------------------------
describe('pascalToKebab', () => {
  it('strips the Icon prefix and converts to kebab-case', () => {
    assert.equal(pascalToKebab('IconArrowRight'), 'arrow-right');
  });

  it('handles single-word names', () => {
    assert.equal(pascalToKebab('IconLock'), 'lock');
  });

  it('handles single-letter names', () => {
    assert.equal(pascalToKebab('IconX'), 'x');
  });

  it('handles leading digits', () => {
    assert.equal(pascalToKebab('Icon3dBoxTop'), '3d-box-top');
  });

  it('handles short numeric names', () => {
    assert.equal(pascalToKebab('Icon4k'), '4k');
  });

  it('handles consecutive uppercase that form an abbreviation', () => {
    assert.equal(pascalToKebab('IconAiSlop'), 'ai-slop');
  });

  it('handles Icon3d (digits only after prefix)', () => {
    assert.equal(pascalToKebab('Icon3d'), '3d');
  });

  it('handles multi-word with trailing number', () => {
    assert.equal(pascalToKebab('IconAirdrop2'), 'airdrop-2');
  });

  it('handles names with multiple uppercase segments', () => {
    assert.equal(pascalToKebab('IconAiTokens'), 'ai-tokens');
  });

  it('handles IconAirplaneDown style names', () => {
    assert.equal(pascalToKebab('IconAirplaneDown'), 'airplane-down');
  });
});

// ---------------------------------------------------------------------------
// extractAliases
// ---------------------------------------------------------------------------
describe('extractAliases', () => {
  it('parses a single-name ariaLabel', () => {
    const source = `ariaLabel:"lock"`;
    const result = extractAliases(source);
    assert.equal(result.id, 'lock');
    assert.deepEqual(result.aliases, []);
  });

  it('parses an ariaLabel with multiple aliases', () => {
    const source = `ariaLabel:"lock, private"`;
    const result = extractAliases(source);
    assert.equal(result.id, 'lock');
    assert.deepEqual(result.aliases, ['private']);
  });

  it('parses ariaLabel with many aliases', () => {
    const source = `ariaLabel:"3d-box-top, shaders, model, cube, ar"`;
    const result = extractAliases(source);
    assert.equal(result.id, '3d-box-top');
    assert.deepEqual(result.aliases, ['shaders', 'model', 'cube', 'ar']);
  });

  it('works with surrounding minified code', () => {
    const source = `var C=e=>o.createElement(p,{...e,ariaLabel:"arrow-right, next, forward"},o.createElement("path"`;
    const result = extractAliases(source);
    assert.equal(result.id, 'arrow-right');
    assert.deepEqual(result.aliases, ['next', 'forward']);
  });

  it('trims inconsistent spacing after commas', () => {
    const source = `ariaLabel:"ai-translate,language, auto-translate"`;
    const result = extractAliases(source);
    assert.equal(result.id, 'ai-translate');
    assert.deepEqual(result.aliases, ['language', 'auto-translate']);
  });

  it('returns null when no ariaLabel is found', () => {
    const result = extractAliases('no labels here');
    assert.equal(result, null);
  });
});

// ---------------------------------------------------------------------------
// Integration tests (renderIconToSvg, discoverIcons) removed — they depend
// on @central-icons-react npm packages which are no longer installed.
// The build pipeline now reads from staging/ instead.
// ---------------------------------------------------------------------------
