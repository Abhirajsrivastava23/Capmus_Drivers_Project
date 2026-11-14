import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Welcome');
      }
    }
  }, [loading, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <FontAwesome5 name="car-alt" size={42} color={COLORS.white} />
      </View>
      <Text style={styles.appName}>Campus Drivers</Text>
      <Text style={styles.universityText}>
        Chandigarh University Uttar Pradesh
      </Text>
      <Text style={styles.campusBadge}>LUCKNOW CAMPUS</Text>

      <ActivityIndicator
        size="small"
        color={COLORS.primary}
        style={styles.spinner}
      />
      <Text style={styles.sub}>Student Carpool & Ride Sharing Platform</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  universityText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  campusBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    backgroundColor: '#0F2744',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    letterSpacing: 1,
  },
  spinner: {
    marginTop: 40,
  },
  sub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 12,
  },
});
