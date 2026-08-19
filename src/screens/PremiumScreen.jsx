import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const PLANS = [
  { id: '3m', label: '3 Months', price: '₹999', original: '₹1,497', save: 'Save 33%' },
  { id: '6m', label: '6 Months', price: '₹1,699', original: '₹2,994', save: 'Save 43%'},
  { id: '12m', label: '12 Months', price: '₹2,499', original: '₹4,788', save: 'Save 48%' },
];

const BENEFITS = [
  'Unlimited Contact Access',
  'View Phone Numbers',
  'Priority in Search Results',
  'Highlight Your Profile',
  'See Who Viewed Your Profile',
  'Premium Customer Support',
];

const PremiumScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('6m');

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#CC0000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Membership</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Go Premium,</Text>
          <Text style={styles.heroTitle}>Get Better Matches</Text>
          <Text style={styles.heroDesc}>
            Increase your visibility and{'\n'}connect with the right match
          </Text>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>

        {/* Plans */}
        <View style={styles.plansSection}>
          <View style={styles.plansRow}>
            {PLANS.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlan,
                  plan.popular && styles.popularPlan,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.85}>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                <Text style={[styles.planLabel, selectedPlan === plan.id && styles.selectedPlanLabel]}>
                  {plan.label}
                </Text>
                <Text style={[styles.planPrice, selectedPlan === plan.id && styles.selectedPlanPrice]}>
                  {plan.price}
                </Text>
                <Text style={styles.planOriginal}>{plan.original}</Text>
                <Text style={[styles.planSave, selectedPlan === plan.id && styles.selectedPlanSave]}>
                  {plan.save}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Premium Benefits</Text>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Trust Badges */}
        <View style={styles.trustSection}>
          {['100% Secure', 'Verified Profiles', 'Community Trusted', 'Privacy Protected'].map(
            (item, i) => (
              <View key={i} style={styles.trustItem}>
                <Text style={styles.trustEmoji}>
                  {['🔒', '✅', '🤝', '🛡️'][i]}
                </Text>
                <Text style={styles.trustLabel}>{item}</Text>
              </View>
            ),
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Upgrade Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
          <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  backArrow: { color: '#FFFFFF', fontSize: 22, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  heroBanner: {
    backgroundColor: '#8B0000',
    padding: 28,
    alignItems: 'center',
    position: 'relative',
  },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  heroDesc: {
    color: '#FFCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  crownEmoji: { fontSize: 60, marginTop: 14 },
  plansSection: { padding: 20 },
  plansRow: { flexDirection: 'row', gap: 10 },
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    position: 'relative',
    paddingTop: 22,
  },
  selectedPlan: {
    borderColor: '#CC0000',
    backgroundColor: '#FFF8F8',
  },
  popularPlan: {
    borderColor: '#CC0000',
    backgroundColor: '#FFF8F8',
    elevation: 4,
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: { fontSize: 10, fontWeight: '800', color: '#8B0000' },
  planLabel: { fontSize: 13, color: '#666666', fontWeight: '600', marginBottom: 6 },
  selectedPlanLabel: { color: '#CC0000' },
  planPrice: { fontSize: 20, fontWeight: '800', color: '#222222', marginBottom: 3 },
  selectedPlanPrice: { color: '#CC0000' },
  planOriginal: {
    fontSize: 11,
    color: '#AAAAAA',
    textDecorationLine: 'line-through',
    marginBottom: 5,
  },
  planSave: {
    fontSize: 11,
    color: '#00AA44',
    fontWeight: '700',
    backgroundColor: '#E8FFE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedPlanSave: { backgroundColor: '#FFE8E8', color: '#CC0000' },
  benefitsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  benefitsTitle: { fontSize: 17, fontWeight: '700', color: '#222222', marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CC0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  benefitText: { fontSize: 15, color: '#444444' },
  trustSection: {
  flexDirection: 'row',
  flexWrap: 'nowrap',        // changed from 'wrap'
  paddingHorizontal: 16,      // reduced a bit to give more room
  gap: 8,                     // reduced gap so 4 items fit comfortably
  justifyContent: 'space-between',
  paddingVertical: 20,
  backgroundColor: '#F9F9F9',
  marginHorizontal: 16,
  borderRadius: 16,
},
trustItem: {
  alignItems: 'center',
  width: (width - 32 - 32 - 24) / 4,  // container width minus margins/padding/gaps, split 4 ways
},
trustEmoji: { fontSize: 22, marginBottom: 4 },   // slightly smaller
trustLabel: {
  fontSize: 10,               // smaller so labels don't wrap awkwardly
  color: '#555555',
  fontWeight: '600',
  textAlign: 'center',
},
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 8,
  },
  upgradeBtn: {
    backgroundColor: '#CC0000',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  upgradeBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
export default PremiumScreen;
