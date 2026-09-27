import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

import { CHANNEL_TYPES, type ChannelType } from '../src/types/reconciliation';
import { channelLabel } from '../src/data/channelConfig';
import { CaptureValidationError, prepareCaptureFiles, runReconciliation } from '../src/services/reconciliationService';

interface CliInput {
  channel: ChannelType;
  path: string;
}

const usage = `Usage:
  npm run reconcile -- <counter.csv> [skip.csv] [uber-eats.csv]
  npm run reconcile -- --counter <path> [--skip <path>] [--uber-eats <path>]`;

export function parseCliInputs(args: string[]): CliInput[] {
  if (args.length === 0) throw new Error(usage);

  if (!args[0].startsWith('--')) {
    if (args.length > CHANNEL_TYPES.length) throw new Error(`Expected one to three CSV paths.\n${usage}`);
    return args.map((path, index) => ({ channel: CHANNEL_TYPES[index], path }));
  }

  const flagChannels: Record<string, ChannelType> = {
    '--counter': 'COUNTER',
    '--skip': 'SKIP',
    '--uber-eats': 'UBER_EATS',
  };
  const inputs: CliInput[] = [];
  for (let index = 0; index < args.length; index += 2) {
    const channel = flagChannels[args[index]];
    const path = args[index + 1];
    if (!channel || !path || path.startsWith('--')) {
      throw new Error(`Invalid channel flag or missing path: ${args[index]}\n${usage}`);
    }
    if (inputs.some((input) => input.channel === channel)) {
      throw new Error(`Only one ${channel} file may be provided.\n${usage}`);
    }
    inputs.push({ channel, path });
  }
  return inputs;
}

function printReport(report: ReturnType<typeof runReconciliation>, suppliedChannels: Set<ChannelType>): void {
  console.log('=== MISE MENU RECONCILIATION REPORT ===\n');
  console.log('Files processed:');
  for (const channel of CHANNEL_TYPES) {
    const count = report.recordCounts[channel];
    console.log(`${channelLabel(channel)}: ${count} records${suppliedChannels.has(channel) ? '' : ' (not supplied)'}`);
  }

  for (const defect of report.defects) {
    console.log(`\n[${defect.severity.toUpperCase()}] ${defect.defectType.replaceAll('_', ' ')}`);
    console.log(`Item: ${defect.menuItemName} (ID: ${defect.menuItemId})`);
    if (defect.sizeName) console.log(`Size: ${defect.sizeName}`);
    for (const channel of CHANNEL_TYPES) {
      const evidence = defect.evidence[channel];
      if (!evidence) {
        console.log(`${channelLabel(channel)}: not present in selected files`);
      } else {
        console.log(`${channelLabel(channel)}: $${evidence.price.toFixed(2)} | ${evidence.available ? 'available' : 'unavailable'} | ${evidence.listingDescription}`);
      }
    }
    console.log(`Message: ${defect.message}`);
  }

  console.log('\nSummary:');
  console.log(`High: ${report.summary.high}`);
  console.log(`Medium: ${report.summary.medium}`);
  console.log(`Low: ${report.summary.low}`);
  console.log(`Total open defects: ${report.summary.open}`);
  console.log(`Execution time: ${report.executionTimeMs.toFixed(2)} ms`);
  console.log(`Performance target under 5 seconds: ${report.executionTimeMs < 5000 ? 'PASS' : 'FAIL'}`);
}

async function main(): Promise<void> {
  let inputs: CliInput[];
  try {
    inputs = parseCliInputs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
    return;
  }

  try {
    const fileTexts = await Promise.all(inputs.map(async ({ channel, path }) => ({
      expectedChannel: channel,
      fileName: basename(path),
      text: await readFile(resolve(path), 'utf8'),
    })));
    const captures = prepareCaptureFiles(fileTexts);
    const report = runReconciliation(captures, () => performance.now());
    printReport(report, new Set(captures.map(({ channel }) => channel)));
  } catch (error) {
    if (error instanceof CaptureValidationError) {
      for (const issue of error.issues) {
        const fileName = issue.fileName || 'Selected files';
        const row = issue.row ? `, row ${issue.row}` : '';
        console.error(`${fileName} — ${issue.field}${row}: ${issue.reason}`);
      }
      process.exitCode = 1;
      return;
    }
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}