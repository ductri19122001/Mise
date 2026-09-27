import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IngredientsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>MISE</Text>
        <Text style={styles.workspace}>Noelle&apos;s Cafe</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>FUTURE STAGE</Text>
        <Text style={styles.title}>Ingredients</Text>
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
  content: { padding: 18 },
  eyebrow: { color: '#718096', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7 },
  title: { color: '#15283F', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#718096', fontSize: 13, marginTop: 4, marginBottom: 18 },
  table: { backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'hidden' },
  tableHeader: { backgroundColor: '#E6E9ED', flexDirection: 'row', justifyContent: 'space-between', padding: 11 },
  headerText: { color: '#526171', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  row: { borderTopWidth: 1, borderTopColor: '#EDF0F2', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13 },
  itemCopy: { flex: 1, paddingRight: 12 },
  itemName: { color: '#25364A', fontSize: 13, fontWeight: '700' },
  price: { color: '#8A96A5', fontSize: 11, marginTop: 3 },
  margin: { color: '#247052', fontSize: 13, fontWeight: '800' },
  emptyAction: { borderColor: '#CBD3DB', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, alignItems: 'center', padding: 18, marginTop: 16 },
  emptyTitle: { color: '#69798A', fontSize: 12, fontWeight: '700' },
  emptySubtitle: { color: '#9AA5B1', fontSize: 11, marginTop: 4 },
});