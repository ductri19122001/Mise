import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { CHANNEL_CONFIG, channelLabel } from '@/data/channelConfig';
import {
  runReconciliation,
  validateCaptures,
  type CaptureFiles,
  type ValidationResult,
} from '@/services/reconciliationService';
import type { ChannelType, ReconciliationReport } from '@/types/reconciliation';

type ImportStage = 'import' | 'error' | 'validated' | 'validating' | 'reconciling';

type MenuImportScreenProps = {
  onBack: () => void;
  onComplete: (report: ReconciliationReport) => void;
};

export default function MenuImportScreen({ onBack, onComplete }: MenuImportScreenProps) {
  const [stage, setStage] = useState<ImportStage>('import');
  const [files, setFiles] = useState<CaptureFiles>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [pickerError, setPickerError] = useState(false);

  const hasFilesSelected = CHANNEL_CONFIG.some(({ id }) => files[id]);

  async function chooseFile(channel: ChannelType) {
    setPickerError(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets[0]) {
        setFiles((current) => ({ ...current, [channel]: result.assets[0] }));
      }
    } catch {
      setPickerError(true);
    }
  }

  async function validateFiles() {
    setStage('validating');
    const result = await validateCaptures(files);
    setValidation(result);
    setStage(result.valid ? 'validated' : 'error');
  }

  function replaceFile(channel: ChannelType) {
    setFiles((current) => ({ ...current, [channel]: undefined }));
    setStage('import');
  }

  async function reconcile() {
    setStage('reconciling');
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (!validation?.valid) return;
    onComplete(runReconciliation(validation.captures));
    onBack();
  }

  if (stage === 'validating' || stage === 'reconciling') {
    return (
      <View style={styles.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator color="#247052" size="large" />
        <Text style={styles.loadingTitle}>
          {stage === 'validating' ? 'Validating files…' : 'Running reconciliation…'}
        </Text>
        <Text style={styles.loadingDetail}>
          {stage === 'validating' ? 'Checking the selected CSV captures.' : 'Comparing the imported menu listings.'}
        </Text>
      </View>
    );
  }

  if (stage === 'error') {
    const issues = validation && !validation.valid ? validation.issues : [];
    const firstIssue = issues[0];
    const replacementChannels = [...new Set(issues.map(({ expectedChannel }) => expectedChannel))];
    const message = firstIssue ? `${channelLabel(firstIssue.expectedChannel)} CSV cannot be used` : 'Selected CSV files need attention';

    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setStage('import')} style={styles.backButton}>
          <Text style={styles.backText}>‹  Import files</Text>
        </Pressable>
        <Text style={styles.eyebrow}>CHECK YOUR FILES</Text>
        <Text style={styles.title}>File needs attention</Text>
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorMark}>!</Text>
          <Text style={styles.errorMessage}>{message}</Text>
        </View>
        {issues.map((issue, index) => (
          <View style={styles.finding} key={`${issue.fileName}-${issue.field}-${index}`}>
            <Text style={styles.findingMark}>!</Text>
            <View style={styles.findingCopy}>
              <Text style={styles.findingText}>{issue.fileName} · {issue.field}{issue.row ? ` · row ${issue.row}` : ''}</Text>
              <Text style={styles.findingReason}>{issue.reason}</Text>
            </View>
          </View>
        ))}
        {replacementChannels.map((channel) => (
          <Pressable accessibilityRole="button" key={channel} onPress={() => replaceFile(channel)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Replace {channelLabel(channel)} CSV</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  if (stage === 'validated') {
    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setStage('import')} style={styles.backButton}>
          <Text style={styles.backText}>‹  Import files</Text>
        </Pressable>
        <Text style={styles.eyebrow}>STEP 02  /  READY</Text>
        <Text style={styles.title}>Files validated</Text>
        <Text style={styles.subtitle}>Ready for review from the selected CSV files.</Text>
        <View style={styles.validatedList}>
          {validation?.valid && validation.files.map(({ channel, itemCount }, index) => (
            <View style={styles.validatedRow} key={channel}>
              <Text style={[styles.channelInitial, index === 1 && styles.skipInitial, index === 2 && styles.uberInitial]}>
                {index === 2 ? 'U' : channel[0]}
              </Text>
              <Text style={styles.validatedChannel}>{channel}</Text>
              <Text style={styles.itemCount}>{itemCount} items</Text>
              <Text style={styles.validatedCheck}>✓</Text>
            </View>
          ))}
        </View>
        <View style={styles.sessionNotice}>
          <Text style={styles.noticeMark}>i</Text>
          <Text style={styles.noticeText}>Files stay in this session. The report is generated locally.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={reconcile} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Run reconciliation  →</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹  Issues</Text>
      </Pressable>
      <Text style={styles.eyebrow}>STEP 01  /  CAPTURE</Text>
      <Text style={styles.title}>Import menu captures</Text>
      <Text style={styles.subtitle}>Upload the latest CSV export from each channel.</Text>

      <View style={styles.uploadList}>
        {CHANNEL_CONFIG.map((channel) => {
          const file = files[channel.id];
          return (
            <View style={styles.uploadRow} key={channel.id}>
              <View style={styles.fileIcon}>
                <Text style={styles.fileIconText}>CSV</Text>
              </View>
              <View style={styles.uploadCopy}>
                <Text style={styles.uploadName}>{channel.name}</Text>
                <Text numberOfLines={1} style={styles.fileName}>{file?.name ?? 'Choose CSV file'}</Text>
              </View>
              {file ? (
                <Text style={styles.readyStatus}>✓  Ready</Text>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => chooseFile(channel.id)}
                  style={({ pressed }) => [styles.chooseButton, pressed && styles.pressedButton]}
                >
                  <Text style={styles.chooseButtonText}>Choose file</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      {pickerError ? <Text style={styles.pickerError}>Could not open the file picker. Please try again.</Text> : null}
      <View style={styles.formFooter}>
        <Text style={styles.formNote}>ⓘ  Select one or more channels. Files stay in this session.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasFilesSelected }}
          disabled={!hasFilesSelected}
          onPress={validateFiles}
          style={({ pressed }) => [styles.primaryButton, !hasFilesSelected && styles.disabledButton, pressed && hasFilesSelected && styles.pressedButton]}
        >
          <Text style={styles.primaryButtonText}>Validate &amp; reconcile  →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%', paddingBottom: 20 },
  backButton: { alignSelf: 'flex-start', marginBottom: 18, paddingVertical: 4, paddingRight: 10 },
  backText: { color: '#718096', fontSize: 12, fontWeight: '600' },
  eyebrow: { color: '#718096', fontSize: 10, fontWeight: '700', letterSpacing: 1.1, marginBottom: 7 },
  title: { color: '#15283F', fontSize: 25, fontWeight: '800', lineHeight: 32 },
  subtitle: { color: '#718096', fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 19 },
  uploadList: { gap: 10 },
  uploadRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: '#DDE2E8', borderWidth: 1, borderRadius: 8, padding: 11, backgroundColor: '#FFFFFF' },
  fileIcon: { width: 39, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: '#F0F1F3' },
  fileIconText: { color: '#858C95', fontSize: 9, fontWeight: '800' },
  uploadCopy: { flex: 1, minWidth: 0, gap: 4 },
  uploadName: { color: '#25364A', fontSize: 12, fontWeight: '700' },
  fileName: { color: '#8994A2', fontSize: 10 },
  chooseButton: { minHeight: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 5, paddingHorizontal: 10, backgroundColor: '#247052' },
  chooseButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  readyStatus: { color: '#247052', fontSize: 10, fontWeight: '800' },
  formFooter: { marginTop: 17 },
  formNote: { color: '#A3692D', fontSize: 10, marginBottom: 13 },
  primaryButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 6, paddingHorizontal: 14, backgroundColor: '#247052' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  disabledButton: { backgroundColor: '#8A9097' },
  pressedButton: { opacity: 0.75 },
  pickerError: { marginTop: 10, color: '#B53C35', fontSize: 11 },
  errorBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 18, borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#F3C8C8' },
  errorMark: { width: 18, height: 18, overflow: 'hidden', borderRadius: 9, backgroundColor: '#D7443E', color: '#FFFFFF', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  errorMessage: { flex: 1, color: '#8F292D', fontSize: 11, fontWeight: '700' },
  finding: { minHeight: 42, flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 9, borderColor: '#E0E4EA', borderWidth: 1, borderRadius: 6, padding: 11, backgroundColor: '#FFFFFF' },
  findingMark: { width: 16, height: 16, overflow: 'hidden', borderRadius: 8, backgroundColor: '#4C5158', color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  findingCopy: { flex: 1, gap: 4 },
  findingText: { color: '#3A4657', fontSize: 10, fontWeight: '700' },
  findingReason: { color: '#657387', fontSize: 10, lineHeight: 15 },
  validatedList: { gap: 8, marginTop: 19 },
  validatedRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: '#E0E4EA', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, backgroundColor: '#FFFFFF' },
  channelInitial: { width: 28, height: 28, overflow: 'hidden', borderRadius: 5, backgroundColor: '#E9F2EC', color: '#388455', fontSize: 11, fontWeight: '800', lineHeight: 28, textAlign: 'center' },
  skipInitial: { backgroundColor: '#F9EFE1', color: '#B77A35' },
  uberInitial: { backgroundColor: '#E9EEF8', color: '#4E6D9E' },
  validatedChannel: { flex: 1, color: '#243146', fontSize: 11, fontWeight: '700' },
  itemCount: { color: '#6C7A8C', fontSize: 10 },
  validatedCheck: { color: '#2D8C50', fontSize: 16, fontWeight: '700' },
  sessionNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 13, borderRadius: 5, padding: 10, backgroundColor: '#EEF2F5' },
  noticeMark: { width: 16, height: 16, overflow: 'hidden', borderRadius: 8, backgroundColor: '#71849A', color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  noticeText: { flex: 1, color: '#647286', fontSize: 10, lineHeight: 15 },
  loading: { minHeight: 320, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  loadingTitle: { marginTop: 18, color: '#15283F', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  loadingDetail: { marginTop: 7, color: '#718096', fontSize: 11, textAlign: 'center' },
});