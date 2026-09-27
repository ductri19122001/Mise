import { CHANNEL_TYPES, type CaptureFileText, type ChannelCapture, type ChannelType, type MenuCaptureRecord, type ValidationIssue } from '../types/reconciliation';
import { REQUIRED_CSV_COLUMNS, parseCsv } from './csvParser';

export class CaptureValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super('One or more capture files failed validation.');
    this.name = 'CaptureValidationError';
  }
}

function readRecord(
  row: Record<string, string>,
  rowNumber: number,
  file: CaptureFileText,
  issues: ValidationIssue[],
): MenuCaptureRecord | null {
  const channelValue = row.channel_type;
  if (!CHANNEL_TYPES.includes(channelValue as ChannelType)) {
    issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: 'channel_type', reason: 'Channel type must be COUNTER, SKIP, or UBER_EATS.', row: rowNumber });
    return null;
  }
  if (channelValue !== file.expectedChannel) {
    issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: 'channel_type', reason: `Channel type must be ${file.expectedChannel}.`, row: rowNumber });
  }

  const priceText = row.price ?? '';
  const price = Number(priceText);
  if (priceText === '' || !Number.isFinite(price) || price < 0) {
    issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: 'price', reason: 'Price must be a number greater than or equal to zero.', row: rowNumber });
  }

  const availableText = row.available ?? '';
  if (availableText !== 'TRUE' && availableText !== 'FALSE') {
    issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: 'available', reason: 'Available must be TRUE or FALSE.', row: rowNumber });
  }

  const menuItemIdText = row.menu_item_id ?? '';
  const menuItemId = Number(menuItemIdText);
  if (menuItemIdText === '' || !Number.isFinite(menuItemId)) {
    issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: 'menu_item_id', reason: 'Menu item ID must be numeric.', row: rowNumber });
  }

  if (channelValue !== file.expectedChannel || priceText === '' || !Number.isFinite(price) || price < 0
    || (availableText !== 'TRUE' && availableText !== 'FALSE')
    || menuItemIdText === '' || !Number.isFinite(menuItemId)) {
    return null;
  }

  return {
    captureId: row.capture_id ?? '',
    capturedAt: row.captured_at ?? '',
    source: row.source ?? '',
    dataVersion: row.data_version ?? '',
    channelListingId: row.channel_listing_id ?? '',
    channelId: row.channel_id ?? '',
    channelType: file.expectedChannel,
    channelName: row.channel_name ?? '',
    menuItemId,
    menuItemName: row.menu_item_name ?? '',
    category: row.category ?? '',
    sizeVariantId: row.size_variant_id ?? '',
    sizeName: row.size_name ?? '',
    available: availableText === 'TRUE',
    lastUpdated: row.last_updated ?? '',
    price,
    listingDescription: row.listing_description ?? '',
    addOns: row.add_ons ?? '',
    sourceItemId: row.source_item_id ?? '',
  };
}

export function validateAndParseCaptures(files: CaptureFileText[]): ChannelCapture[] {
  if (files.length === 0) {
    throw new CaptureValidationError([{
      fileName: '',
      expectedChannel: 'COUNTER',
      field: 'file',
      reason: 'Select at least one channel CSV file.',
    }]);
  }

  const issues: ValidationIssue[] = [];
  const seenChannels = new Set<ChannelType>();
  const captures: ChannelCapture[] = [];

  for (const file of files) {
    if (!file.fileName.toLowerCase().endsWith('.csv')) {
      issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: 'file', reason: 'File extension must be .csv.' });
      continue;
    }
    if (seenChannels.has(file.expectedChannel)) {
      issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: 'channel', reason: `Only one ${file.expectedChannel} file may be selected.` });
      continue;
    }
    seenChannels.add(file.expectedChannel);

    const parsed = parseCsv(file.text);
    for (const parserError of parsed.errors) {
      issues.push({
        fileName: file.fileName,
        expectedChannel: file.expectedChannel,
        field: 'csv',
        reason: parserError.message,
        row: parserError.row,
      });
    }

    for (const column of REQUIRED_CSV_COLUMNS) {
      if (!parsed.headers.includes(column)) {
        issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: column, reason: `Missing required column: ${column}.` });
      }
    }
    if (parsed.rows.length === 0) {
      issues.push({ fileName: file.fileName, expectedChannel: file.expectedChannel, field: 'rows', reason: 'CSV must contain at least one data row.' });
    }

    const startIssueCount = issues.length;
    const records = parsed.rows
      .map((row, index) => readRecord(row, index + 2, file, issues))
      .filter((record): record is MenuCaptureRecord => record !== null);
    if (issues.length === startIssueCount) {
      captures.push({ channel: file.expectedChannel, fileName: file.fileName, records });
    }
  }

  if (issues.length > 0) throw new CaptureValidationError(issues);
  return captures;
}