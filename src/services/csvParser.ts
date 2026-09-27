import Papa from 'papaparse';

import type { ParsedCsv } from '../types/reconciliation';

export const REQUIRED_CSV_COLUMNS = [
  'capture_id',
  'captured_at',
  'source',
  'data_version',
  'channel_listing_id',
  'channel_id',
  'channel_type',
  'channel_name',
  'menu_item_id',
  'menu_item_name',
  'category',
  'size_variant_id',
  'size_name',
  'available',
  'last_updated',
  'price',
  'listing_description',
  'add_ons',
  'source_item_id',
] as const;

export function parseCsv(text: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    transformHeader: (header) => header.trim(),
  });

  return {
    headers: result.meta.fields ?? [],
    rows: result.data.map((row) => Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, String(value ?? '').trim()]),
    )),
    errors: result.errors.map((error) => ({
      row: error.row !== undefined ? error.row + 2 : undefined,
      message: error.message,
    })),
  };
}