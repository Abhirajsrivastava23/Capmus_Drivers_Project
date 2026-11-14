import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function VerifiedBadge({ size = 'medium' }) {
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall]}>
      <MaterialCommunityIcons
        name="shield-check"
        size={isSmall ? 12 : 14}
        color="#FFFFFF"
      />
      <Text style={[styles.text, isSmall && styles.textSmall]}>
        Verified Student
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3F3F46',
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  text: {
    color: '#E4E4E7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 9.5,
  },
});
