import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CaptureValidationError, validateAndParseCaptures } from '../src/services/captureValidation';
import type { ChannelType } from '../src/types/reconciliation';
import { makeCsvText } from './helpers';

function input(channel: ChannelType, overrides: Record<string, string> = {}, omitColumns: string[] = []) {
  return {
    expectedChannel: channel,
    fileName: `${channel.toLowerCase()}.csv`,
    text: makeCsvText(channel, overrides, omitColumns),
  };
}

test('accepts one valid CSV and reports actual parsed records', () => {
  const [capture] = validateAndParseCaptures([input('COUNTER')]);
  assert.equal(capture.channel, 'COUNTER');
  assert.equal(capture.records.length, 1);
  assert.equal(capture.records[0].price, 27);
});

test('reports missing required columns with file and field details', () => {
  assert.throws(
    () => validateAndParseCaptures([input('SKIP', {}, ['price'])]),
    (error: unknown) => {
      assert.ok(error instanceof CaptureValidationError);
      assert.ok(error.issues.some((issue) => issue.fileName === 'skip.csv'
        && issue.field === 'price'
        && issue.reason.includes('Missing required column')));
      return true;
    },
  );
});

test('requires exact channel type for the selected upload row', () => {
  assert.throws(
    () => validateAndParseCaptures([input('SKIP', { channel_type: 'COUNTER' })]),
    (error: unknown) => {
      assert.ok(error instanceof CaptureValidationError);
      assert.ok(error.issues.some((issue) => issue.field === 'channel_type' && issue.reason === 'Channel type must be SKIP.'));
      return true;
    },
  );
});

test('rejects negative prices and non-boolean availability values', () => {
  assert.throws(
    () => validateAndParseCaptures([input('COUNTER', { price: '-1', available: 'yes' })]),
    (error: unknown) => {
      assert.ok(error instanceof CaptureValidationError);
      assert.ok(error.issues.some((issue) => issue.field === 'price'));
      assert.ok(error.issues.some((issue) => issue.field === 'available'));
      return true;
    },
  );
});

test('rejects non-CSV filenames before parsing', () => {
  assert.throws(
    () => validateAndParseCaptures([{ ...input('COUNTER'), fileName: 'menu.json' }]),
    (error: unknown) => {
      assert.ok(error instanceof CaptureValidationError);
      assert.ok(error.issues.some((issue) => issue.field === 'file' && issue.reason.includes('.csv')));
      return true;
    },
  );
});