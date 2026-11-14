import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import Header from '../components/Header';
import VerifiedBadge from '../components/VerifiedBadge';
import RatingStars from '../components/RatingStars';
import api from '../services/api';

export default function DriverProfileScreen({ navigation, route }) {
  const { driverId } = route.params || {};

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${driverId}/driver-profile`);
        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (e) {
        console.warn('Error loading driver profile', e);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) fetchProfile();
  }, [driverId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) return null;

  const stats = profile.stats || {};
  const vehicle = profile.primary_vehicle;
  const reviews = profile.reviews || [];

  return (
    <View style={styles.container}>
      <Header
        title="Driver Profile & Verification"
        subtitle="Chandigarh University UP Verified Driver"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Core Driver Identity (Prioritizes Name, Status, Vehicle, NOT Photo) */}
        <View style={[styles.mainCard, SHADOWS.medium]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name ? profile.name.charAt(0) : 'D'}</Text>
          </View>
          <Text style={styles.driverFullName}>{profile.name}</Text>
          <View style={styles.badgeRow}>
            {profile.is_verified_student ? (
              <VerifiedBadge size="medium" />
            ) : (
              <View style={styles.unverifiedBadge}>
                <Text style={styles.unverifiedText}>Pending Verification</Text>
              </View>
            )}
            <Text style={styles.studentIdBadge}>ID: {profile.student_id}</Text>
          </View>
          <Text style={styles.academicText}>
            {profile.course} • {profile.semester}
          </Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.average_rating || 5.0} ★</Text>
              <Text style={styles.statTitle}>Driving Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.total_completed_rides || 0}</Text>
              <Text style={styles.statTitle}>Completed Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.total_reviews || 0}</Text>
              <Text style={styles.statTitle}>Passenger Reviews</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        {vehicle && (
          <View style={styles.vehicleCard}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="car" size={15} color={COLORS.navy} />
              <Text style={styles.cardTitle}>Registered Car Details</Text>
            </View>

            <View style={styles.vehicleRow}>
              <View>
                <Text style={styles.vehicleModelText}>{vehicle.model}</Text>
                <Text style={styles.vehicleColorText}>
                  {vehicle.colour} • {vehicle.vehicle_type}
                </Text>
              </View>

              {/* License Plate Graphic */}
              <View style={styles.plateBox}>
                <View style={styles.plateInd}>
                  <Text style={styles.plateIndText}>IND</Text>
                </View>
                <Text style={styles.plateReg}>{vehicle.registration_number}</Text>
              </View>
            </View>

            <View style={styles.vehicleTagsRow}>
              <View style={styles.vehicleTag}>
                <Ionicons
                  name={vehicle.ac_available ? 'snow' : 'snow-outline'}
                  size={12}
                  color={vehicle.ac_available ? '#0284C7' : COLORS.textMuted}
                />
                <Text style={styles.vehicleTagText}>
                  {vehicle.ac_available ? 'AC Equipped' : 'Non-AC'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 5-Star Driving Performance Breakdown */}
        <View style={styles.scoreCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer-outline" size={16} color={COLORS.navy} />
            <Text style={styles.cardTitle}>5-Star Driving Experience Breakdown</Text>
          </View>

          <View style={styles.criteriaGrid}>
            <View style={styles.criteriaItem}>
              <Text style={styles.criteriaLabel}>Driving Safety</Text>
              <Text style={styles.criteriaScore}>{stats.safety_score || 5.0} ★</Text>
            </View>
            <View style={styles.criteriaItem}>
              <Text style={styles.criteriaLabel}>Driving Behaviour</Text>
              <Text style={styles.criteriaScore}>{stats.behaviour_score || 5.0} ★</Text>
            </View>
            <View style={styles.criteriaItem}>
              <Text style={styles.criteriaLabel}>Punctuality</Text>
              <Text style={styles.criteriaScore}>{stats.punctuality_score || 5.0} ★</Text>
            </View>
            <View style={styles.criteriaItem}>
              <Text style={styles.criteriaLabel}>Communication</Text>
              <Text style={styles.criteriaScore}>{stats.communication_score || 5.0} ★</Text>
            </View>
          </View>
        </View>

        {/* Passenger Reviews Feed */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.cardTitle}>Passenger Reviews ({reviews.length})</Text>
          </View>

          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <View key={rev._id} style={styles.reviewItem}>
                <View style={styles.reviewTopRow}>
                  <RatingStars rating={rev.overall_rating} size={12} showNumber={false} />
                  <Text style={styles.reviewDate}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reviewBody}>"{rev.review_text}"</Text>
                <View style={styles.reviewFooter}>
                  <Text style={styles.reviewerName}>
                    — {rev.passenger_id?.name || 'Verified Student'} ({rev.passenger_id?.course || 'CUUP'})
                  </Text>
                  {rev.ride_id?.destination && (
                    <Text style={styles.reviewRoute}>Trip to {rev.ride_id.destination}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>
              No reviews recorded yet. Completed trips by passengers will appear here.
            </Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  mainCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '900',
  },
  driverFullName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  unverifiedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  unverifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  studentIdBadge: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: '800',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  academicText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.navy,
  },
  statTitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  vehicleCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
    textTransform: 'uppercase',
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleModelText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  vehicleColorText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  plateBox: {
    backgroundColor: COLORS.plateYellow,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  plateInd: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  plateIndText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '900',
  },
  plateReg: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  vehicleTagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vehicleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#181920',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  vehicleTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scoreCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  criteriaItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  criteriaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  criteriaScore: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.navy,
    marginTop: 4,
  },
  reviewsSection: {
    gap: 12,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  reviewBody: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewerName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  reviewRoute: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  noReviewsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 12,
  },
});
