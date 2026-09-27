import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import MenuImportScreen from '@/components/menu-import-screen';
import DefectDetail from '@/components/defect-detail';
import type { Defect, DefectStatus, ReconciliationReport } from '@/types/reconciliation';

const defectNames: Record<Defect['defectType'], string> = {
  MISSING_LISTING: 'Missing listing',
  PRICE_MISMATCH: 'Price mismatch',
  DESCRIPTION_MISMATCH: 'Description mismatch',
  ADD_ON_MISMATCH: 'Add-on mismatch',
  AVAILABILITY_MISMATCH: 'Availability mismatch',
};

const severityColor = {
  high: '#D7443E',
  medium: '#C98713',
  low: '#D7443E',
};

export default function HomeScreen() {
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [screen, setScreen] = useState<'issues' | 'import' | 'detail'>('issues');
  const [activeDefectId, setActiveDefectId] = useState<string | null>(null);
  const issuesNeedingAttention = report?.defects.filter((defect) => defect.status === 'open').length ?? 0;
  const activeDefect = report?.defects.find((defect) => defect.id === activeDefectId);

  function updateDefectStatus(defectId: string, status: Exclude<DefectStatus, 'open'>) {
    setReport((current) => {
      if (!current) return current;
      const defects = current.defects.map((defect) => defect.id === defectId ? { ...defect, status } : defect);
      return { ...current, defects, summary: { ...current.summary, open: defects.filter((defect) => defect.status === 'open').length } };
    });
    setScreen('issues');
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.brand}>MISE</Text>
          <Text style={styles.workspace}>Noelle&apos;s Cafe</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {screen === 'import' ? (
            <MenuImportScreen
              onBack={() => setScreen('issues')}
              onComplete={(nextReport) => { setReport(nextReport); setScreen('issues'); }}
            />
          ) : screen === 'detail' ? (
            activeDefect ? <DefectDetail defect={activeDefect} onBack={() => setScreen('issues')} onResolve={(status) => updateDefectStatus(activeDefect.id, status)} /> : null
          ) : (
            <>
              <View style={styles.titleRow}>
                <View>
                  <Text style={styles.eyebrow}>MONDAY, 12 SEPTEMBER</Text>
                  <Text style={styles.title}>Issues</Text>
                  {report ? <Text style={styles.subtitle}>{issuesNeedingAttention} issues need attention</Text> : null}
                </View>
                <View style={styles.titleActions}>
                  {report ? <View style={styles.countBadge}><Text style={styles.countText}>{issuesNeedingAttention}</Text></View> : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Import CSV"
                    onPress={() => setScreen('import')}
                    style={({ pressed }) => [styles.importButton, pressed && styles.pressedButton]}
                  >
                    <Text style={styles.importIcon}>↑</Text>
                    <Text style={styles.importButtonText}>Import CSV</Text>
                  </Pressable>
                </View>
              </View>

              {report ? (
                <>
                  <Text style={styles.sectionLabel}>RECONCILIATION RESULTS</Text>
                  {report.defects.length === 0 ? (
                    <View style={styles.emptyState}><Text style={styles.emptyTitle}>No inconsistencies found</Text></View>
                  ) : report.defects.map((defect) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${defect.menuItemName}, ${defectNames[defect.defectType]}. View details.`}
                      key={defect.id}
                      onPress={() => { setActiveDefectId(defect.id); setScreen('detail'); }}
                      style={({ pressed }) => [styles.issueCard, defect.status !== 'open' && styles.resolvedCard, pressed && styles.pressedButton]}
                    >
                      <View style={[styles.issueStripe, { backgroundColor: severityColor[defect.severity] }]} />
                      <View style={styles.issueBody}>
                        <View style={styles.issueTopline}>
                          <Text style={[styles.amount, { color: severityColor[defect.severity] }]}>{defectNames[defect.defectType]}</Text>
                          <Text style={styles.newLabel}>{defect.status === 'open' ? defect.severity.toUpperCase() : defect.status.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.issueTitle}>{defect.menuItemName}{defect.sizeName ? ` · ${defect.sizeName}` : ''}</Text>
                        <Text style={styles.issueDetail}>{defect.message}</Text>
                        <View style={styles.actionButton}><Text style={styles.actionText}>View evidence</Text></View>
                      </View>
                    </Pressable>
                  ))}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No reconciliation report yet</Text>
                  <Text style={styles.emptyDetail}>Import one or more menu capture CSV files to identify inconsistencies across the selected channels.</Text>
                  <Pressable accessibilityRole="button" onPress={() => setScreen('import')} style={styles.actionButton}>
                    <Text style={styles.actionText}>Import CSV</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingBottom: BottomTabInset + Spacing.three,
  },
  header: {
    backgroundColor: '#15283F',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 16,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.8,
  },
  workspace: {
    color: '#D6DFEA',
    fontSize: 12,
    marginTop: 3,
  },
  content: {
    padding: 18,
    paddingBottom: 34,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  importButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderColor: '#CBD3DB',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
  },
  importIcon: {
    color: '#15283F',
    fontSize: 15,
    fontWeight: '800',
  },
  importButtonText: {
    color: '#15283F',
    fontSize: 10,
    fontWeight: '700',
  },
  eyebrow: {
    color: '#718096',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  title: {
    color: '#15283F',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#718096',
    fontSize: 13,
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: '#E6B85C',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#15283F',
    fontSize: 18,
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: '#15283F',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryLabel: {
    color: '#B7C5D5',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryHint: {
    color: '#C9D3DE',
    fontSize: 11,
  },
  workflowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  workflowTitle: {
    color: '#718096',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 13,
  },
  workflowLine: { flexDirection: 'row', alignItems: 'flex-start' },
  workflowStep: { alignItems: 'center', width: 55 },
  workflowDotDone: { backgroundColor: '#247052', borderRadius: 6, height: 12, width: 12 },
  workflowDotActive: { backgroundColor: '#E6B85C', borderColor: '#C98713', borderRadius: 7, borderWidth: 2, height: 14, width: 14 },
  workflowDot: { backgroundColor: '#E6E9ED', borderRadius: 6, height: 12, width: 12 },
  workflowConnectorDone: { backgroundColor: '#247052', flex: 1, height: 2, marginTop: 5 },
  workflowConnector: { backgroundColor: '#DCE2E7', flex: 1, height: 2, marginTop: 5 },
  workflowText: { color: '#8A96A5', fontSize: 9, marginTop: 6, textAlign: 'center' },
  workflowTextActive: { color: '#C98713', fontSize: 9, fontWeight: '800', marginTop: 6, textAlign: 'center' },
  sectionLabel: {
    color: '#718096',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  issueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#15283F',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  resolvedCard: {
    opacity: 0.55,
  },
  issueStripe: {
    width: 4,
  },
  issueBody: {
    flex: 1,
    padding: 14,
  },
  issueTopline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  newLabel: {
    color: '#718096',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  issueTitle: {
    color: '#15283F',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 7,
  },
  issueDetail: {
    color: '#718096',
    fontSize: 12,
    marginTop: 5,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF3EF',
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 12,
  },
  pressedButton: {
    opacity: 0.7,
  },
  actionText: {
    color: '#247052',
    fontSize: 11,
    fontWeight: '800',
  },
  footerNote: {
    color: '#8A96A5',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    borderColor: '#CBD3DB',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    color: '#15283F',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDetail: {
    color: '#718096',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: 'center',
  },
});
