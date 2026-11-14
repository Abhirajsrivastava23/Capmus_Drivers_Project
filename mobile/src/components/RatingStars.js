import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function RatingStars({
  rating = 5.0,
  size = 14,
  interactive = false,
  onRatingChange,
  showNumber = true,
  count,
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {stars.map((star) => {
          const isFilled = star <= Math.round(rating);
          const icon = (
            <Ionicons
              key={star}
              name={isFilled ? 'star' : 'star-outline'}
              size={size}
              color={isFilled ? '#F59E0B' : '#CBD5E1'}
            />
          );

          if (interactive) {
            return (
              <TouchableOpacity
                key={star}
                onPress={() => onRatingChange && onRatingChange(star)}
                activeOpacity={0.7}
                style={styles.touchableStar}
              >
                {icon}
              </TouchableOpacity>
            );
          }

          return icon;
        })}
      </View>

      {showNumber && !interactive && (
        <Text style={[styles.ratingText, { fontSize: size * 0.9 }]}>
          {Number(rating).toFixed(1)}
          {count !== undefined && (
            <Text style={styles.countText}> ({count})</Text>
          )}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  touchableStar: {
    padding: 4,
  },
  ratingText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  countText: {
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
});
