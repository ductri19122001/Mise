import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CHANNEL_CONFIG } from '@/data/channelConfig';
import type { Defect, DefectStatus } from '@/types/reconciliation';

type DefectDetailProps = {
  defect: Defect;
  onBack: () => void;
  onResolve: (status: Exclude<DefectStatus, 'open'>) => void;
};

const defectNames: Record<Defect['defectType'], string> = {
  MISSING_LISTING: 'Missing listing',
  PRICE_MISMATCH: 'Price mismatch',
  DESCRIPTION_MISMATCH: 'Description mismatch',
  ADD_ON_MISMATCH: 'Add-on mismatch',
  AVAILABILITY_MISMATCH: 'Availability mismatch',
};

export default function DefectDetail({ defect, onBack, onResolve }: DefectDetailProps) {
  return (
    <View style={styles.screen}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹  Issues</Text>
      </Pressable>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>{defect.defectType.replaceAll('_', ' ')}</Text>
          <Text style={styles.title}>{defect.menuItemName}</Text>
          {defect.sizeName ? <Text style={styles.subtitle}>{defect.sizeName}</Text> : null}
        </View>
        <Text style={[styles.severityBadge, styles[`severity_${defect.severity}`]]}>{defect.severity}</Text>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>{defectNames[defect.defectType]}</Text>
      <View style={styles.evidenceList}>
        {CHANNEL_CONFIG.map(({ id, fileLabel }) => {
          const evidence = defect.evidence[id];
          return (
            <View style={styles.evidenceRow} key={id}>
              <Text style={styles.channelName}>{fileLabel}</Text>
              {evidence ? (
                <View style={styles.evidenceCopy}>
                  <Text style={styles.price}>${evidence.price.toFixed(2)}</Text>
                  <Text style={styles.evidenceText}>{evidence.available ? 'Available' : 'Unavailable'}</Text>
                  <Text style={styles.evidenceText}>{evidence.listingDescription || 'No description'}</Text>
                  <Text style={styles.evidenceText}>Add-ons: {evidence.addOns || 'None'}</Text>
                </View>
              ) : <Text style={styles.missingText}>Not listed in this capture</Text>}
            </View>
          );
        })}
      </View>
      <View style={styles.message}>
        <Text style={styles.messageMark}>i</Text>
        <Text style={styles.messageText}>{defect.message}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => onResolve('reviewed')} style={styles.reviewButton}>
          <Text style={styles.reviewButtonText}>Mark reviewed</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onResolve('dismissed')} style={styles.dismissButton}>
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%', paddingBottom: 20 },
  backButton: { alignSelf: 'flex-start', marginBottom: 18, paddingVertical: 4, paddingRight: 10 },
  backText: { color: '#718096', fontSize: 12, fontWeight: '600' },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#718096', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 7 },
  title: { color: '#15283F', fontSize: 24, fontWeight: '800', lineHeight: 31 },
  subtitle: { color: '#718096', fontSize: 12, marginTop: 5 },
  severityBadge: { overflow: 'hidden', borderRadius: 4, marginTop: 18, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },
  severity_high: { backgroundColor: '#FAE6E4', color: '#AD3D36' },
  severity_medium: { backgroundColor: '#FCF0DF', color: '#A36917' },
  severity_low: { backgroundColor: '#EDF1F5', color: '#5E7185' },
  divider: { height: 1, marginTop: 18, marginBottom: 17, backgroundColor: '#DCE2E7' },
  sectionTitle: { color: '#15283F', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  evidenceList: { overflow: 'hidden', borderColor: '#E1E5EB', borderWidth: 1, borderRadius: 7, backgroundColor: '#FFFFFF' },
  evidenceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 11 },
  channelName: { width: 78, color: '#465368', fontSize: 10, fontWeight: '700' },
  evidenceCopy: { flex: 1, gap: 4 },
  price: { color: '#253249', fontSize: 12, fontWeight: '800' },
  evidenceText: { color: '#778499', fontSize: 10, lineHeight: 14 },
  missingText: { flex: 1, color: '#A3692D', fontSize: 10 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, borderRadius: 5, padding: 11, backgroundColor: '#F8ECDF' },
  messageMark: { width: 17, height: 17, overflow: 'hidden', borderRadius: 9, backgroundColor: '#D08A36', color: '#FFFFFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  messageText: { flex: 1, color: '#945E26', fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 22 },
  reviewButton: { minHeight: 42, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#247052' },
  reviewButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  dismissButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderColor: '#CBD3DB', borderWidth: 1, borderRadius: 6, paddingHorizontal: 16, backgroundColor: '#FFFFFF' },
  dismissButtonText: { color: '#5C697B', fontSize: 11, fontWeight: '700' },
});