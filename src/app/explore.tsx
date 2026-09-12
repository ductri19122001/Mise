import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const channels = [
  ['Counter', '$15.00', '0%', '$15.00', '68%'],
  ['Skip', '$15.00', '8%', '$14.55', '67%'],
  ['Uber Eats', '$17.00', '25%', '$12.75', '62%'],
];

export default function MarginsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>MISE</Text>
        <Text style={styles.workspace}>Noelle&apos;s Cafe</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.back}>‹ Back</Text>
        <Text style={styles.eyebrow}>MENU SYNC GUARD</Text>
        <Text style={styles.title}>Avocado on Sourdough</Text>
        <Text style={styles.subtitle}>Channel margins (illustrative)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.channelColumn]}>CHANNEL</Text>
            <Text style={styles.headerText}>PRICE</Text>
            <Text style={styles.headerText}>COMM.</Text>
            <Text style={styles.headerText}>NET</Text>
            <Text style={styles.headerText}>MARGIN</Text>
          </View>
          {channels.map(([channel, price, commission, net, margin]) => (
            <View style={[styles.row, channel === 'Uber Eats' && styles.warningRow]} key={channel}>
              <Text style={[styles.cell, styles.channelColumn, channel !== 'Counter' && styles.channelStrong]}>{channel}</Text>
              <Text style={styles.cell}>{price}</Text>
              <Text style={styles.cell}>{commission}</Text>
              <Text style={styles.cell}>{net}</Text>
              <Text style={[styles.cell, styles.marginCell, channel === 'Uber Eats' && styles.warningText]}>{margin}</Text>
            </View>
          ))}
        </View>
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Uber Eats has the lowest margin</Text>
          <Text style={styles.alertDetail}>25% commission reduces net revenue by $2.25 per item.</Text>
        </View>
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationLabel}>RECOMMENDATION</Text>
          <Text style={styles.recommendationTitle}>Raise Eats to $19.20</Text>
          <Text style={styles.recommendationDetail}>Holds roughly 67% margin after 25% commission.</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.approveButton}><Text style={styles.approveText}>Approve</Text></Pressable>
            <Pressable style={styles.dismissButton}><Text style={styles.dismissText}>Dismiss</Text></Pressable>
          </View>
        </View>
        <View style={styles.mutedCard}>
          <Text style={styles.mutedTitle}>CONTEXT NEEDED</Text>
          <Text style={styles.mutedDetail}>Cost estimate: $4.50-$6.50. Add cost data to improve confidence.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#15283F', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 16 },
  brand: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 2.8 },
  workspace: { color: '#D6DFEA', fontSize: 12, marginTop: 3 },
  content: { padding: 18, paddingBottom: 32 },
  back: { color: '#718096', fontSize: 12, marginBottom: 18 },
  eyebrow: { color: '#718096', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7 },
  title: { color: '#15283F', fontSize: 25, fontWeight: '800' },
  subtitle: { color: '#718096', fontSize: 13, marginTop: 4, marginBottom: 18 },
  table: { backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'hidden' },
  tableHeader: { backgroundColor: '#E6E9ED', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 11 },
  headerText: { color: '#526171', flex: 1, fontSize: 8, fontWeight: '800', letterSpacing: 0.3, textAlign: 'right' },
  channelColumn: { flex: 1.45, textAlign: 'left' },
  row: { borderTopWidth: 1, borderTopColor: '#EDF0F2', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 13 },
  warningRow: { backgroundColor: '#FFF0EE' },
  cell: { color: '#25364A', flex: 1, fontSize: 10, textAlign: 'right' },
  channelStrong: { fontWeight: '800', textAlign: 'left' },
  marginCell: { color: '#247052', fontWeight: '800' },
  warningText: { color: '#D7443E' },
  alertCard: { backgroundColor: '#FCE8E5', borderColor: '#F2B6AE', borderRadius: 9, borderWidth: 1, padding: 14, marginTop: 14 },
  alertTitle: { color: '#B53C35', fontSize: 13, fontWeight: '800' },
  alertDetail: { color: '#8B5550', fontSize: 11, lineHeight: 16, marginTop: 5 },
  recommendationCard: { backgroundColor: '#EAF5EF', borderColor: '#B9DCC8', borderRadius: 9, borderWidth: 1, padding: 14, marginTop: 10 },
  recommendationLabel: { color: '#4F8B6D', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  recommendationTitle: { color: '#247052', fontSize: 15, fontWeight: '800', marginTop: 5 },
  recommendationDetail: { color: '#4F7561', fontSize: 11, marginTop: 4 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveButton: { backgroundColor: '#247052', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  approveText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  dismissButton: { backgroundColor: '#FFFFFF', borderColor: '#B9DCC8', borderRadius: 6, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  dismissText: { color: '#4F7561', fontSize: 11, fontWeight: '700' },
  mutedCard: { borderColor: '#CBD3DB', borderRadius: 9, borderStyle: 'dashed', borderWidth: 1, padding: 14, marginTop: 10 },
  mutedTitle: { color: '#788797', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  mutedDetail: { color: '#8A96A5', fontSize: 11, lineHeight: 16, marginTop: 5 },
});
