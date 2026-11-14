import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';

export default function SettingsScreen({ navigation }) {
  const { logout, user } = useAuth();
  const [tripNotifications, setTripNotifications] = useState(true);
  const [chatAlerts, setChatAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [maskPhonePublicly, setMaskPhonePublicly] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Campus Drivers?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Welcome');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Settings & Privacy"
        subtitle="Manage notifications and security"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Notifications Group */}
        <View style={styles.groupCard}>
          <Text style={styles.groupHeader}>Trip & Ride Notifications</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Booking Status Alerts</Text>
              <Text style={styles.settingSub}>When a driver accepts or rejects your request</Text>
            </View>
            <Switch
              value={tripNotifications}
              onValueChange={setTripNotifications}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>In-App Chat Notifications</Text>
              <Text style={styles.settingSub}>Alerts for messages between carpool peers</Text>
            </View>
            <Switch
              value={chatAlerts}
              onValueChange={setChatAlerts}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Live Trip Location Sharing</Text>
              <Text style={styles.settingSub}>Allow confirmed peers to track vehicle on highway</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
            />
          </View>
        </View>

        {/* Privacy Group */}
        <View style={styles.groupCard}>
          <Text style={styles.groupHeader}>Privacy & Security Controls</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Mask Phone Number Publicly</Text>
              <Text style={styles.settingSub}>
                Only reveal your phone number after booking is confirmed
              </Text>
            </View>
            <Switch
              value={maskPhonePublicly}
              onValueChange={setMaskPhonePublicly}
              trackColor={{ false: '#CBD5E1', true: COLORS.emerald }}
            />
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.actionTitle}>Community Safety Guidelines</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() =>
              Alert.alert(
                'Chandigarh University Policy',
                'Campus Drivers is an exclusive cost-sharing and carpool initiative for Chandigarh University UP students. Commercial transportation is strictly prohibited.'
              )
            }
          >
            <Text style={styles.actionTitle}>University Carpooling Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Account Controls */}
        <View style={styles.groupCard}>
          <Text style={styles.groupHeader}>Account Access</Text>

          <View style={styles.accountInfoRow}>
            <Text style={styles.accountLabel}>Signed in as:</Text>
            <Text style={styles.accountEmail}>{user?.email}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
            <Text style={styles.logoutText}>Sign Out of Campus Drivers</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>
          Campus Drivers v1.0.0 (Build 2026.11) • Chandigarh University UP
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  groupCard: {
    backgroundColor: '#121318',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 12,
  },
  groupHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  accountInfoRow: {
    paddingVertical: 4,
  },
  accountLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  accountEmail: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
});
