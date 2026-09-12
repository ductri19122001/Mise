import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type Issue = {
  severity: 'high' | 'medium' | 'low';
  amount: string;
  title: string;
  detail: string;
  action: string;
};

const issues: Issue[] = [
  {
    severity: 'high',
    amount: '-$4,500/yr',
    title: '3 items missing from both digital menus',
    detail: 'Bacon, avocado, halloumi + 7 more',
    action: 'Review items',
  },
  {
    severity: 'medium',
    amount: '-$2,800/yr',
    title: 'Large coffee size not available on Skip',
    detail: 'Counter $4.80 / $5.50',
    action: 'Compare channels',
  },
  {
    severity: 'medium',
    amount: '-$2,250/yr',
    title: 'Fillet Steak cheaper on Uber Eats',
    detail: 'Counter $27.00 · Uber Eats $26.00',
    action: 'Fix pricing',
  },
  {
    severity: 'low',
    amount: 'Customer-facing error',
    title: 'Tuna Salad described as containing ham on Skip',
    detail: 'Counter: tuna & poached egg · Skip: ham & poached egg',
    action: 'Mark fixed',
  },
];

const severityColor = {
  high: '#D7443E',
  medium: '#C98713',
  low: '#D7443E',
};

export default function HomeScreen() {
  const [resolved, setResolved] = useState<string[]>([]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.brand}>MISE</Text>
          <Text style={styles.workspace}>Noelle&apos;s Cafe</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.eyebrow}>MONDAY, 12 SEPTEMBER</Text>
              <Text style={styles.title}>Issues</Text>
              <Text style={styles.subtitle}>{issues.length - resolved.length} issues need attention</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{issues.length - resolved.length}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>ESTIMATED ANNUAL IMPACT</Text>
              <Text style={styles.summaryValue}>-$9,550</Text>
            </View>
            <Text style={styles.summaryHint}>across 3 channels</Text>
          </View>

          <View style={styles.workflowCard}>
            <Text style={styles.workflowTitle}>WORKFLOW STATUS</Text>
            <View style={styles.workflowLine}>
              <View style={styles.workflowStep}><View style={styles.workflowDotDone} /><Text style={styles.workflowText}>Capture</Text></View>
              <View style={styles.workflowConnectorDone} />
              <View style={styles.workflowStep}><View style={styles.workflowDotDone} /><Text style={styles.workflowText}>Reconcile</Text></View>
              <View style={styles.workflowConnector} />
              <View style={styles.workflowStep}><View style={styles.workflowDotActive} /><Text style={styles.workflowTextActive}>Review</Text></View>
              <View style={styles.workflowConnector} />
              <View style={styles.workflowStep}><View style={styles.workflowDot} /><Text style={styles.workflowText}>Approve</Text></View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>REVIEW QUEUE</Text>
          {issues.map((issue) => {
            const isResolved = resolved.includes(issue.title);
            return (
              <View key={issue.title} style={[styles.issueCard, isResolved && styles.resolvedCard]}>
                <View style={[styles.issueStripe, { backgroundColor: severityColor[issue.severity] }]} />
                <View style={styles.issueBody}>
                  <View style={styles.issueTopline}>
                    <Text style={[styles.amount, { color: severityColor[issue.severity] }]}>{issue.amount}</Text>
                    {!isResolved && <Text style={styles.newLabel}>NEW</Text>}
                  </View>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <Text style={styles.issueDetail}>{issue.detail}</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setResolved((current) => isResolved ? current.filter((item) => item !== issue.title) : [...current, issue.title])}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.pressedButton]}
                  >
                    <Text style={styles.actionText}>{isResolved ? 'Restore' : issue.action}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          <Text style={styles.footerNote}>Last checked today at 9:14am · Data synced from menu channels</Text>
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
});
