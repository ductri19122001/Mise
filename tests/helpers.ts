import { REQUIRED_CSV_COLUMNS } from '../src/services/csvParser';
import type { ChannelCapture, ChannelType, MenuCaptureRecord } from '../src/types/reconciliation';

export function makeRecord(
  channelType: ChannelType,
  overrides: Partial<MenuCaptureRecord> = {},
): MenuCaptureRecord {
  const channelName = channelType === 'UBER_EATS' ? 'Uber Eats' : channelType === 'SKIP' ? 'Skip' : 'Counter';
  return {
    captureId: `capture-${channelType}`,
    capturedAt: '2026-09-27T10:00:00Z',
    source: 'test',
    dataVersion: '1',
    channelListingId: `listing-${channelType}`,
    channelId: channelType,
    channelType,
    channelName,
    menuItemId: 101,
    menuItemName: 'Steak sandwich',
    category: 'Mains',
    sizeVariantId: 'large',
    sizeName: 'Large',
    available: true,
    lastUpdated: '2026-09-27T10:00:00Z',
    price: 27,
    listingDescription: 'Steak served with fries',
    addOns: 'Pepper sauce',
    sourceItemId: `source-${channelType}`,
    ...overrides,
  };
}

export function makeCapture(channel: ChannelType, records: MenuCaptureRecord[]): ChannelCapture {
  return { channel, fileName: `${channel.toLowerCase()}.csv`, records };
}

function csvValue(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function makeCsvText(
  channel: ChannelType,
  overrides: Record<string, string> = {},
  omitColumns: string[] = [],
): string {
  const channelName = channel === 'UBER_EATS' ? 'Uber Eats' : channel === 'SKIP' ? 'Skip' : 'Counter';
  const values: Record<string, string> = {
    capture_id: `capture-${channel}`,
    captured_at: '2026-09-27T10:00:00Z',
    source: 'test',
    data_version: '1',
    channel_listing_id: `listing-${channel}`,
    channel_id: channel,
    channel_type: channel,
    channel_name: channelName,
    menu_item_id: '101',
    menu_item_name: 'Steak sandwich',
    category: 'Mains',
    size_variant_id: 'large',
    size_name: 'Large',
    available: 'TRUE',
    last_updated: '2026-09-27T10:00:00Z',
    price: '27.00',
    listing_description: 'Steak served with fries',
    add_ons: 'Pepper sauce',
    source_item_id: `source-${channel}`,
    ...overrides,
  };
  const columns = REQUIRED_CSV_COLUMNS.filter((column) => !omitColumns.includes(column));
  return [columns.join(','), columns.map((column) => csvValue(values[column] ?? '')).join(',')].join('\n');
}