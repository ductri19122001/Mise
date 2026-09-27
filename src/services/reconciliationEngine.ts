import { CHANNEL_TYPES, type ChannelCapture, type ChannelType, type Defect, type DefectType, type ListingEvidence, type MenuCaptureRecord, type ReconciliationReport, type Severity } from '../types/reconciliation';
import { channelLabel } from '../data/channelConfig';

export function normalizeComparableText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeAddOns(value: string): string {
  return normalizeComparableText(value);
}

type ListingSet = Partial<Record<ChannelType, MenuCaptureRecord>>;

const severityByType: Record<DefectType, Severity> = {
  MISSING_LISTING: 'high',
  PRICE_MISMATCH: 'high',
  DESCRIPTION_MISMATCH: 'low',
  ADD_ON_MISMATCH: 'low',
  AVAILABILITY_MISMATCH: 'medium',
};

function matchingKey(record: MenuCaptureRecord): string {
  return `${record.menuItemId}\u001f${record.sizeVariantId}`;
}

function toEvidence(record: MenuCaptureRecord | undefined): ListingEvidence | null {
  if (!record) return null;
  return {
    channelType: record.channelType,
    channelName: record.channelName,
    price: record.price,
    available: record.available,
    listingDescription: record.listingDescription,
    addOns: record.addOns,
    channelListingId: record.channelListingId,
  };
}

function makeDefect(
  defectType: DefectType,
  key: string,
  listings: ListingSet,
  affectedChannels: ChannelType[],
  message: string,
): Defect {
  const firstRecord = CHANNEL_TYPES.map((channel) => listings[channel]).find(
    (record): record is MenuCaptureRecord => Boolean(record),
  )!;

  return {
    id: `${defectType}:${key}`,
    defectType,
    severity: severityByType[defectType],
    menuItemId: firstRecord.menuItemId,
    menuItemName: firstRecord.menuItemName,
    sizeName: firstRecord.sizeName || 'Standard',
    affectedChannels: affectedChannels.map(channelLabel),
    evidence: Object.fromEntries(CHANNEL_TYPES.map((channel) => [channel, toEvidence(listings[channel])])),
    message,
    status: 'open',
  };
}

function differentFromBaseline<T>(
  values: Array<{ channel: ChannelType; record: MenuCaptureRecord; value: T }>,
  equal: (left: T, right: T) => boolean,
): ChannelType[] {
  if (values.length < 2) return [];
  const baseline = values.find(({ channel }) => channel === 'COUNTER') ?? values[0];
  return values
    .filter(({ channel, value }) => channel !== baseline.channel && !equal(value, baseline.value))
    .map(({ channel }) => channel);
}

function priceMessage(listings: ListingSet): string {
  const values = CHANNEL_TYPES
    .map((channel) => ({ channel, record: listings[channel] }))
    .filter((entry): entry is { channel: ChannelType; record: MenuCaptureRecord } => Boolean(entry.record && entry.record.available));
  const counter = values.find(({ channel }) => channel === 'COUNTER');
  const baseline = counter ?? values[0];
  const other = values.find(({ channel, record }) => channel !== baseline.channel && record.price !== baseline.record.price);

  if (!other) return 'Available listing prices differ across channels.';
  const difference = Math.abs(other.record.price - baseline.record.price).toFixed(2);
  const relation = other.record.price < baseline.record.price ? 'below' : 'above';
  return `${channelLabel(other.channel)} is $${difference} ${relation} ${channelLabel(baseline.channel)}.`;
}

function reconcileKey(key: string, listings: ListingSet, checkMissing: boolean): Defect[] {
  const records = CHANNEL_TYPES
    .map((channel) => ({ channel, record: listings[channel] }))
    .filter((entry): entry is { channel: ChannelType; record: MenuCaptureRecord } => Boolean(entry.record));
  if (records.length === 0) return [];

  const defects: Defect[] = [];
  const itemName = records[0].record.menuItemName;

  if (checkMissing) {
    const missingChannels = CHANNEL_TYPES.filter((channel) => !listings[channel]);
    if (missingChannels.length > 0) {
      const labels = missingChannels.map(channelLabel);
      defects.push(makeDefect(
        'MISSING_LISTING',
        key,
        listings,
        missingChannels,
        `${itemName} is missing from ${labels.join(', ')}.`,
      ));
    }
  }

  const availablePrices = records.filter(({ record }) => record.available);
  const changedPrices = differentFromBaseline(
    availablePrices.map(({ channel, record }) => ({ channel, record, value: record.price })),
    (left, right) => left === right,
  );
  if (changedPrices.length > 0) {
    defects.push(makeDefect('PRICE_MISMATCH', key, listings, changedPrices, priceMessage(listings)));
  }

  const changedDescriptions = differentFromBaseline(
    records.map(({ channel, record }) => ({ channel, record, value: normalizeComparableText(record.listingDescription) })),
    (left, right) => left === right,
  );
  if (changedDescriptions.length > 0) {
    defects.push(makeDefect(
      'DESCRIPTION_MISMATCH',
      key,
      listings,
      changedDescriptions,
      `${itemName} has different descriptions across channels.`,
    ));
  }

  const changedAddOns = differentFromBaseline(
    records.map(({ channel, record }) => ({ channel, record, value: normalizeAddOns(record.addOns) })),
    (left, right) => left === right,
  );
  if (changedAddOns.length > 0) {
    defects.push(makeDefect(
      'ADD_ON_MISMATCH',
      key,
      listings,
      changedAddOns,
      `${itemName} has different add-ons across channels.`,
    ));
  }

  const changedAvailability = differentFromBaseline(
    records.map(({ channel, record }) => ({ channel, record, value: record.available })),
    (left, right) => left === right,
  );
  if (changedAvailability.length > 0) {
    defects.push(makeDefect(
      'AVAILABILITY_MISMATCH',
      key,
      listings,
      changedAvailability,
      `${itemName} availability differs across channels.`,
    ));
  }

  return defects;
}

export function reconcileMenuCaptures(
  captures: ChannelCapture[],
  now: () => number = () => performance.now(),
): ReconciliationReport {
  const startedAt = now();
  const providedChannels = new Set(captures.map(({ channel }) => channel));
  const recordsByKey = new Map<string, ListingSet>();
  const recordCounts = Object.fromEntries(CHANNEL_TYPES.map((channel) => [channel, 0])) as Record<ChannelType, number>;

  for (const capture of captures) {
    recordCounts[capture.channel] += capture.records.length;
    for (const record of capture.records) {
      const key = matchingKey(record);
      const listings = recordsByKey.get(key) ?? {};
      listings[capture.channel] = record;
      recordsByKey.set(key, listings);
    }
  }

  const checkMissing = CHANNEL_TYPES.every((channel) => providedChannels.has(channel));
  const defects = Array.from(recordsByKey, ([key, listings]) => reconcileKey(key, listings, checkMissing))
    .flat()
    .sort((left, right) => left.menuItemName.localeCompare(right.menuItemName)
      || left.sizeName.localeCompare(right.sizeName)
      || left.defectType.localeCompare(right.defectType));
  const summary = {
    total: defects.length,
    high: defects.filter(({ severity }) => severity === 'high').length,
    medium: defects.filter(({ severity }) => severity === 'medium').length,
    low: defects.filter(({ severity }) => severity === 'low').length,
    open: defects.filter(({ status }) => status === 'open').length,
  };

  return {
    executionTimeMs: Math.max(0, now() - startedAt),
    inputFiles: captures.map(({ fileName }) => fileName),
    recordCounts,
    summary,
    defects,
  };
}