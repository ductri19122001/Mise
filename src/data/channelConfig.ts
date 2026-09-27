import type { ChannelType } from '../types/reconciliation';

export const CHANNEL_CONFIG: ReadonlyArray<{
  id: ChannelType;
  name: string;
  fileLabel: string;
}> = [
  { id: 'COUNTER', name: 'Counter menu', fileLabel: 'Counter' },
  { id: 'SKIP', name: 'Skip menu', fileLabel: 'Skip' },
  { id: 'UBER_EATS', name: 'Uber Eats menu', fileLabel: 'Uber Eats' },
];

export function channelLabel(channel: ChannelType): string {
  return CHANNEL_CONFIG.find((entry) => entry.id === channel)?.fileLabel ?? channel;
}