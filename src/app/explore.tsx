import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MarginsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>MISE</Text>
        <Text style={styles.workspace}>Noelle&apos;s Cafe</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>FUTURE STAGE</Text>
        <Text style={styles.title}>Margins</Text>
        <Text style={styles.subtitle}>This feature is planned for a future stage.</Text>
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
