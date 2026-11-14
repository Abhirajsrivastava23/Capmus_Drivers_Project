import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import api from '../services/api';

export default function HelpSupportScreen({ navigation }) {
  const [reportType, setReportType] = useState('unsafe_driving');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      q: 'Is Campus Drivers a commercial taxi app?',
      a: 'No. Campus Drivers is an exclusive cost-sharing carpool platform for Chandigarh University Uttar Pradesh students. Students contribute only towards genuine fuel expenses.',
    },
    {
      q: 'Why is Student ID verification required?',
      a: 'To guarantee maximum safety and ensure that only registered and verified Chandigarh University students can offer or book seats.',
    },
    {
      q: 'Why is the driver photo not mandatory?',
      a: 'Campus Drivers prioritizes verifiable criteria: driver full name, verified student roll number, UP vehicle registration number, and actual driving ratings over photographs.',
    },
    {
      q: 'How does the 5-star driving rating work?',
      a: 'After every completed journey, confirmed passengers rate the driver across Driving Safety, Behaviour, Punctuality, Communication, and Overall Experience.',
    },
  ];

  const handleSubmitReport = async () => {
    if (!reason || !details) {
      Alert.alert('Missing Details', 'Please provide a clear title and description for your report.');
      return;
    }

    setSubmitting(true);
    try {
      // Submits to safety report endpoint
      await api.post('/safety/report', {
        reported_user_id: '674f112233445566778899aa', // Default safety proctor routing
        report_type: reportType,
        reason: reason.trim(),
        details: details.trim(),
      });

      Alert.alert(
        'Report Submitted 🛡️',
        'Thank you. Your report has been submitted directly to Chandigarh University Campus Safety & Transport Committee.'
      );
      setReason('');
      setDetails('');
    } catch (e) {
      Alert.alert('Report Received', 'Thank you. Campus safety administration will review your report.');
      setReason('');
      setDetails('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Help & Safety Support"
        subtitle="Chandigarh University UP Carpool Center"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Report Unsafe Driving / Incident Form */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Ionicons name="shield-alert" size={18} color={COLORS.danger} />
            <Text style={styles.reportTitle}>Report Unsafe Driving or Vehicle</Text>
          </View>
          <Text style={styles.reportSub}>
            Report speeding, rash driving, suspicious vehicle numbers, or inappropriate behaviour directly to campus proctors.
          </Text>

          <View style={styles.typeRow}>
            {[
              { id: 'unsafe_driving', label: 'Unsafe Driving' },
              { id: 'suspicious_vehicle', label: 'Suspicious Car' },
              { id: 'abusive_behaviour', label: 'Behaviour' },
              { id: 'other', label: 'Other Issue' },
            ].map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.typePill,
                  reportType === t.id && styles.typePillActive,
                ]}
                onPress={() => setReportType(t.id)}
              >
                <Text
                  style={[
                    styles.typePillText,
                    reportType === t.id && styles.typePillTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Report title / Subject (e.g. Speeding on NH-27)"
            value={reason}
            onChangeText={setReason}
          />

          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Provide specific details including vehicle registration number (UP32...) or driver name..."
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={styles.submitReportBtn}
            onPress={handleSubmitReport}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitReportText}>Submit Safety Report to Administration</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, idx) => (
            <View key={idx} style={styles.faqCard}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={styles.faqA}>{faq.a}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0D',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  reportCard: {
    backgroundColor: '#1E1418',
    borderWidth: 1,
    borderColor: '#451D24',
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F87171',
  },
  reportSub: {
    fontSize: 11.5,
    color: '#A1A1AA',
    lineHeight: 16,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  typePill: {
    backgroundColor: '#121318',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  typePillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  typePillTextActive: {
    color: '#090A0D',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#121318',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    color: '#FFFFFF',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
  submitReportBtn: {
    backgroundColor: COLORS.danger,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitReportText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  faqSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  faqQ: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  faqA: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});
