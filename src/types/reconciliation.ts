export const CHANNEL_TYPES = ['COUNTER', 'SKIP', 'UBER_EATS'] as const;

export type ChannelType = (typeof CHANNEL_TYPES)[number];
export type Severity = 'high' | 'medium' | 'low';
export type DefectType =
  | 'MISSING_LISTING'
  | 'PRICE_MISMATCH'
  | 'DESCRIPTION_MISMATCH'
  | 'ADD_ON_MISMATCH'
  | 'AVAILABILITY_MISMATCH';
export type DefectStatus = 'open' | 'reviewed' | 'dismissed';

export interface MenuCaptureRecord {
  captureId: string;
  capturedAt: string;
  source: string;
  dataVersion: string;
  channelListingId: string;
  channelId: string;
  channelType: ChannelType;
  channelName: string;
  menuItemId: number;
  menuItemName: string;
  category: string;
  sizeVariantId: string;
  sizeName: string;
  available: boolean;
  lastUpdated: string;
  price: number;
  listingDescription: string;
  addOns: string;
  sourceItemId: string;
}

export interface ChannelCapture {
  channel: ChannelType;
  fileName: string;
  records: MenuCaptureRecord[];
}

export interface CaptureFileText {
  expectedChannel: ChannelType;
  fileName: string;
  text: string;
}

export interface ValidationIssue {
  fileName: string;
  expectedChannel: ChannelType;
  field: string;
  reason: string;
  row?: number;
}

export interface ListingEvidence {
  channelType: ChannelType;
  channelName: string;
  price: number;
  available: boolean;
  listingDescription: string;
  addOns: string;
  channelListingId: string;
}

export interface Defect {
  id: string;
  defectType: DefectType;
  severity: Severity;
  menuItemId: number;
  menuItemName: string;
  sizeName: string;
  affectedChannels: string[];
  evidence: Record<string, ListingEvidence | null>;
  message: string;
  status: DefectStatus;
}

export interface ReconciliationReport {
  executionTimeMs: number;
  inputFiles: string[];
  recordCounts: Record<ChannelType, number>;
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    open: number;
  };
  defects: Defect[];
}

export interface CsvParserError {
  row?: number;
  message: string;
}

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  errors: CsvParserError[];
}