import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateAndParseCaptures } from '../src/services/captureValidation';
import { normalizeAddOns, normalizeComparableText, reconcileMenuCaptures } from '../src/services/reconciliationEngine';
import type { ChannelType, DefectType, MenuCaptureRecord } from '../src/types/reconciliation';
import { makeCapture, makeCsvText, makeRecord } from './helpers';

const allChannels: ChannelType[] = ['COUNTER', 'SKIP', 'UBER_EATS'];

function getDefect(captures: ReturnType<typeof makeCapture>[], defectType: DefectType) {
  const report = reconcileMenuCaptures(captures);
  const defect = report.defects.find((entry) => entry.defectType === defectType);
  assert.ok(defect, `expected ${defectType} defect`);
  return defect;
}

function recordsByChannel(change: Partial<Record<ChannelType, Partial<MenuCaptureRecord>>> = {}) {
  return allChannels.map((channel) => makeCapture(channel, [makeRecord(channel, change[channel]) ]));
}

test('normalizes descriptions by trimming, lowercasing, and collapsing whitespace', () => {
  assert.equal(normalizeComparableText('  Fresh   tomato  '), 'fresh tomato');
  assert.equal(normalizeComparableText('FRESH tomato'), 'fresh tomato');
});

test('normalizes add-on strings using the same basic text normalization', () => {
  assert.equal(normalizeAddOns('  Pepper   Sauce '), 'pepper sauce');
});

test('matches menu item and size IDs without using shifting source item IDs', () => {
  const captures = allChannels.map((channel) => makeCapture(channel, [
    makeRecord(channel, { sourceItemId: `unrelated-${channel}` }),
  ]));
  const report = reconcileMenuCaptures(captures);
  assert.equal(report.defects.length, 0);
});

test('detects a missing listing only when all three channel files are present', () => {
  const captures = [
    makeCapture('COUNTER', [makeRecord('COUNTER')]),
    makeCapture('SKIP', [makeRecord('SKIP')]),
    makeCapture('UBER_EATS', []),
  ];
  const defect = getDefect(captures, 'MISSING_LISTING');
  assert.deepEqual(defect.affectedChannels, ['Uber Eats']);
  assert.equal(defect.severity, 'high');

  const partial = reconcileMenuCaptures(captures.slice(0, 2));
  assert.equal(partial.defects.some((entry) => entry.defectType === 'MISSING_LISTING'), false);
});

test('detects price differences among available listings and generates the Counter warning', () => {
  const captures = recordsByChannel({ UBER_EATS: { price: 26 } });
  const defect = getDefect(captures, 'PRICE_MISMATCH');
  assert.equal(defect.message, 'Uber Eats is $1.00 below Counter.');
  assert.equal(defect.severity, 'high');
});

test('ignores price differences on listings that are unavailable', () => {
  const captures = recordsByChannel({ UBER_EATS: { price: 20, available: false } });
  const report = reconcileMenuCaptures(captures);
  assert.equal(report.defects.some((entry) => entry.defectType === 'PRICE_MISMATCH'), false);
});

test('detects description mismatch after applying the agreed normalization', () => {
  const normalized = recordsByChannel({
    SKIP: { listingDescription: ' STEAK   served with FRIES ' },
  });
  assert.equal(reconcileMenuCaptures(normalized).defects.some((entry) => entry.defectType === 'DESCRIPTION_MISMATCH'), false);

  const changed = recordsByChannel({ UBER_EATS: { listingDescription: 'Steak served with salad' } });
  assert.equal(getDefect(changed, 'DESCRIPTION_MISMATCH').severity, 'low');
});

test('detects add-on mismatch after basic normalization', () => {
  const captures = recordsByChannel({ UBER_EATS: { addOns: 'Chilli oil' } });
  assert.equal(getDefect(captures, 'ADD_ON_MISMATCH').severity, 'low');
});

test('detects availability mismatch and assigns medium severity', () => {
  const captures = recordsByChannel({ SKIP: { available: false } });
  assert.equal(getDefect(captures, 'AVAILABILITY_MISMATCH').severity, 'medium');
});

test('integrates three standardized CSV texts into real defects and record counts', () => {
  const captures = validateAndParseCaptures(allChannels.map((channel) => ({
    expectedChannel: channel,
    fileName: `${channel}.csv`,
    text: makeCsvText(channel, {
      price: channel === 'UBER_EATS' ? '26.00' : '27.00',
      source_item_id: `source-id-that-varies-${channel}`,
    }),
  })));

  const report = reconcileMenuCaptures(captures);
  assert.deepEqual(report.recordCounts, { COUNTER: 1, SKIP: 1, UBER_EATS: 1 });
  assert.equal(report.summary.total, 1);
  assert.equal(report.defects[0].defectType, 'PRICE_MISMATCH');
  assert.equal(report.defects[0].message, 'Uber Eats is $1.00 below Counter.');
});