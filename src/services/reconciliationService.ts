import type { DocumentPickerAsset } from 'expo-document-picker';

import { CHANNEL_CONFIG, channelLabel } from '../data/channelConfig';
import type { CaptureFileText, ChannelCapture, ChannelType, ReconciliationReport, ValidationIssue } from '../types/reconciliation';

import { CaptureValidationError, validateAndParseCaptures } from './captureValidation';
import { reconcileMenuCaptures } from './reconciliationEngine';

export { CaptureValidationError };

export type CaptureFiles = Partial<Record<ChannelType, DocumentPickerAsset>>;
export type ValidationResult =
  | { valid: true; files: Array<{ channel: string; itemCount: number }>; captures: ChannelCapture[] }
  | { valid: false; reason: 'missing' | 'file-type' | 'invalid-name'; issues: ValidationIssue[] };

export async function validateCaptures(files: CaptureFiles): Promise<ValidationResult> {
  const selectedChannels = CHANNEL_CONFIG.filter(({ id }) => files[id]);
  if (selectedChannels.length === 0) return { valid: false, reason: 'missing', issues: [] };

  try {
    const fileTexts: CaptureFileText[] = await Promise.all(selectedChannels.map(async ({ id }) => {
      const file = files[id]!;
      let text: string;
      try {
        text = file.file ? await file.file.text() : await (await fetch(file.uri)).text();
      } catch {
        throw new CaptureValidationError([{
          fileName: file.name,
          expectedChannel: id,
          field: 'file',
          reason: 'Could not read this file in the current session.',
        }]);
      }
      return { expectedChannel: id, fileName: file.name, text };
    }));

    const captures = prepareCaptureFiles(fileTexts);
    return {
      valid: true,
      captures,
      files: captures.map((capture) => ({ channel: channelLabel(capture.channel), itemCount: capture.records.length })),
    };
  } catch (error) {
    const issues = error instanceof CaptureValidationError ? error.issues : [];
    return { valid: false, reason: issues.some(({ field }) => field === 'file') ? 'file-type' : 'invalid-name', issues };
  }
}

export function prepareCaptureFiles(files: CaptureFileText[]): ChannelCapture[] {
  return validateAndParseCaptures(files);
}

export function runReconciliation(captures: ChannelCapture[], now?: () => number): ReconciliationReport {
  return reconcileMenuCaptures(captures, now);
}

export function reconcileCaptureFiles(files: CaptureFileText[], now?: () => number): ReconciliationReport {
  return runReconciliation(prepareCaptureFiles(files), now);
}