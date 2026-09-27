import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseCliInputs } from '../scripts/reconcile-cli';

test('maps the documented three positional paths to channels in canonical order', () => {
  assert.deepEqual(parseCliInputs(['counter.csv', 'skip.csv', 'uber.csv']), [
    { channel: 'COUNTER', path: 'counter.csv' },
    { channel: 'SKIP', path: 'skip.csv' },
    { channel: 'UBER_EATS', path: 'uber.csv' },
  ]);
});

test('allows channel flags for partial or non-canonical selections', () => {
  assert.deepEqual(parseCliInputs(['--uber-eats', 'eats.csv', '--counter', 'counter.csv']), [
    { channel: 'UBER_EATS', path: 'eats.csv' },
    { channel: 'COUNTER', path: 'counter.csv' },
  ]);
});

test('rejects duplicate channel flags and missing paths', () => {
  assert.throws(() => parseCliInputs(['--counter', 'one.csv', '--counter', 'two.csv']), /Only one COUNTER/);
  assert.throws(() => parseCliInputs(['--skip']), /Invalid channel flag or missing path/);
});