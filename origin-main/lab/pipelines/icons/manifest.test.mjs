import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildManifest, buildKeys } from './manifest.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SOURCE_INFO = {
  package: '@central-icons-react',
  version: '1.1.216',
  combo: { join: 'round', radius: 1, stroke: 2 },
};

const sampleIcons = [
  { id: 'lock', aliases: ['private'] },
  { id: 'arrow-right', aliases: ['next', 'forward'] },
  { id: 'home', aliases: [] },
];

// ---------------------------------------------------------------------------
// buildManifest
// ---------------------------------------------------------------------------
describe('buildManifest', () => {
  it('produces correct structure with id_format and source block', () => {
    const manifest = buildManifest(sampleIcons, SOURCE_INFO);
    assert.equal(manifest.id_format, 'origin.icon.{id}.{variant}');
    assert.deepEqual(manifest.source, SOURCE_INFO);
    assert.ok(Array.isArray(manifest.icons), 'icons should be an array');
  });

  it('sorts icons alphabetically by id', () => {
    const manifest = buildManifest(sampleIcons, SOURCE_INFO);
    const ids = manifest.icons.map((i) => i.id);
    assert.deepEqual(ids, ['arrow-right', 'home', 'lock']);
  });

  it('generates correct variant paths', () => {
    const manifest = buildManifest(
      [{ id: 'lock', aliases: [] }],
      SOURCE_INFO,
    );
    const icon = manifest.icons[0];
    assert.deepEqual(icon.variants, {
      outlined: 'outputs/icons/outlined/lock.svg',
      filled: 'outputs/icons/filled/lock.svg',
    });
  });

  it('handles icons with empty aliases', () => {
    const manifest = buildManifest(
      [{ id: 'home', aliases: [] }],
      SOURCE_INFO,
    );
    const icon = manifest.icons[0];
    assert.deepEqual(icon.aliases, []);
    assert.equal(icon.id, 'home');
  });

  it('preserves aliases from input', () => {
    const manifest = buildManifest(
      [{ id: 'arrow-right', aliases: ['next', 'forward'] }],
      SOURCE_INFO,
    );
    const icon = manifest.icons[0];
    assert.deepEqual(icon.aliases, ['next', 'forward']);
  });
});

// ---------------------------------------------------------------------------
// buildKeys
// ---------------------------------------------------------------------------
describe('buildKeys', () => {
  const manifest = buildManifest(sampleIcons, SOURCE_INFO);

  it('generates two keys per icon (outlined + filled)', () => {
    const result = buildKeys(manifest);
    assert.equal(result.keys.length, sampleIcons.length * 2);
  });

  it('keys are sorted alphabetically', () => {
    const result = buildKeys(manifest);
    const sorted = [...result.keys].sort();
    assert.deepEqual(result.keys, sorted);
  });

  it('total count equals icons.length * 2', () => {
    const result = buildKeys(manifest);
    assert.equal(result.keys.length, manifest.icons.length * 2);
  });

  it('keys follow the origin.icon.{id}.{variant} format', () => {
    const result = buildKeys(manifest);
    const pattern = /^origin\.icon\.[a-z0-9-]+\.(outlined|filled)$/;
    for (const key of result.keys) {
      assert.match(key, pattern, `key "${key}" does not match expected format`);
    }
  });

  it('includes correct id_format', () => {
    const result = buildKeys(manifest);
    assert.equal(result.id_format, 'origin.icon.{id}.{variant}');
  });

  it('generates expected keys for a single icon', () => {
    const small = buildManifest([{ id: 'lock', aliases: [] }], SOURCE_INFO);
    const result = buildKeys(small);
    assert.deepEqual(result.keys, [
      'origin.icon.lock.filled',
      'origin.icon.lock.outlined',
    ]);
  });
});
