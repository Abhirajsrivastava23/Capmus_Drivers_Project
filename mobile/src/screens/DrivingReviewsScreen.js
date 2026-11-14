import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import RatingStars from '../components/RatingStars';
import api from '../services/api';

export default function DrivingReviewsScreen({ navigation, route }) {
  const { bookingId, driverId, driverName } = route.params || {};

  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Submit Review Form State
  const [safetyRating, setSafetyRating] = useState(5);
  const [behaviourRating, setBehaviourRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const fetchDriverReviews = async () => {
    try {
      const res = await api.get(`/reviews/driver/${driverId}`);
      if (res.data.success) {
        setReviewsData(res.data);
      }
    } catch (e) {
      console.warn('Error fetching driver reviews', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driverId) fetchDriverReviews();
  }, [driverId]);

  const handleSubmitReview = async () => {
    if (!bookingId) {
      Alert.alert('Notice', 'Reviews can only be submitted for completed bookings.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        booking_id: bookingId,
        safety_rating: safetyRating,
        behaviour_rating: behaviourRating,
        punctuality_rating: punctualityRating,
        communication_rating: communicationRating,
        overall_rating: overallRating,
        review_text: reviewText.trim(),
      });

      setSubmittedSuccess(true);
      Alert.alert(
        'Review Submitted! ⭐',
        'Thank you for rating your driving experience. Your feedback helps maintain high safety standards across Chandigarh University UP.'
      );
      fetchDriverReviews();
    } catch (err) {
      Alert.alert('Submission Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportReview = async (reviewId) => {
    Alert.prompt
      ? Alert.prompt(
          'Report Review',
          'Please describe why this review is fake or abusive:',
          async (reason) => {
            try {
              await api.post(`/reviews/${reviewId}/report`, { report_reason: reason });
              Alert.alert('Reported', 'Review has been flagged for campus moderation.');
              fetchDriverReviews();
            } catch (e) {
              Alert.alert('Error', 'Failed to report review');
            }
          }
        )
      : (async () => {
          try {
            await api.post(`/reviews/${reviewId}/report`, { report_reason: 'Flagged by student as inaccurate' });
            Alert.alert('Reported', 'Review has been flagged for campus moderation.');
            fetchDriverReviews();
          } catch (e) {
            Alert.alert('Error', 'Failed to report review');
          }
        })();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Driving Experience Ratings"
        subtitle={`Driver: ${driverName || 'Student Driver'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Rating Breakdown Header */}
        {reviewsData?.breakdown && (
          <View style={styles.overviewCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.bigRating}>{reviewsData.breakdown.overall} ★</Text>
              <View>
                <Text style={styles.scoreTitle}>Average Driver Rating</Text>
                <Text style={styles.scoreSub}>
                  Based on {reviewsData.breakdown.total_reviews} verified completed rides
                </Text>
              </View>
            </View>

            <View style={styles.criteriaGrid}>
              <View style={styles.critPill}>
                <Text style={styles.critLabel}>Safety:</Text>
                <Text style={styles.critVal}>{reviewsData.breakdown.safety} ★</Text>
              </View>
              <View style={styles.critPill}>
                <Text style={styles.critLabel}>Behaviour:</Text>
                <Text style={styles.critVal}>{reviewsData.breakdown.behaviour} ★</Text>
              </View>
              <View style={styles.critPill}>
                <Text style={styles.critLabel}>Punctuality:</Text>
                <Text style={styles.critVal}>{reviewsData.breakdown.punctuality} ★</Text>
              </View>
              <View style={styles.critPill}>
                <Text style={styles.critLabel}>Communication:</Text>
                <Text style={styles.critVal}>{reviewsData.breakdown.communication} ★</Text>
              </View>
            </View>
          </View>
        )}

        {/* Submit Review Card (Only shown if coming from completed booking) */}
        {bookingId && !submittedSuccess && (
          <View style={styles.submitCard}>
            <Text style={styles.submitCardTitle}>Rate Your Driving Experience</Text>
            <Text style={styles.submitCardSub}>
              Please rate your student driver across all 5 evaluation criteria:
            </Text>

            {/* Criteria 1: Overall */}
            <View style={styles.criteriaInputRow}>
              <Text style={styles.criteriaInputLabel}>1. Overall Experience</Text>
              <RatingStars
                rating={overallRating}
                size={22}
                interactive
                onRatingChange={setOverallRating}
              />
            </View>

            {/* Criteria 2: Driving Safety */}
            <View style={styles.criteriaInputRow}>
              <Text style={styles.criteriaInputLabel}>2. Driving Safety (Speed & Braking)</Text>
              <RatingStars
                rating={safetyRating}
                size={22}
                interactive
                onRatingChange={setSafetyRating}
              />
            </View>

            {/* Criteria 3: Driving Behaviour */}
            <View style={styles.criteriaInputRow}>
              <Text style={styles.criteriaInputLabel}>3. Driving Behaviour & Courtesy</Text>
              <RatingStars
                rating={behaviourRating}
                size={22}
                interactive
                onRatingChange={setBehaviourRating}
              />
            </View>

            {/* Criteria 4: Punctuality */}
            <View style={styles.criteriaInputRow}>
              <Text style={styles.criteriaInputLabel}>4. Punctuality at Pickup Point</Text>
              <RatingStars
                rating={punctualityRating}
                size={22}
                interactive
                onRatingChange={setPunctualityRating}
              />
            </View>

            {/* Criteria 5: Communication */}
            <View style={styles.criteriaInputRow}>
              <Text style={styles.criteriaInputLabel}>5. Communication & Coordination</Text>
              <RatingStars
                rating={communicationRating}
                size={22}
                interactive
                onRatingChange={setCommunicationRating}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.textLabel}>Your Passenger Review (Optional)</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share feedback on highway driving, cleanliness, and overall experience..."
                placeholderTextColor={COLORS.textMuted}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>Submit 5-Star Driving Review</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Existing Passenger Reviews */}
        <View style={styles.reviewsListSection}>
          <Text style={styles.sectionTitle}>Previous Passenger Reviews</Text>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : reviewsData?.reviews?.length > 0 ? (
            reviewsData.reviews.map((rev) => (
              <View key={rev._id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <RatingStars rating={rev.overall_rating} size={14} />
                  <TouchableOpacity
                    onPress={() => handleReportReview(rev._id)}
                    style={styles.flagBtn}
                  >
                    <Ionicons name="flag-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.flagBtnText}>Report</Text>
                  </TouchableOpacity>
                </View>

                {rev.review_text ? (
                  <Text style={styles.reviewText}>"{rev.review_text}"</Text>
                ) : null}

                <View style={styles.reviewMeta}>
                  <Text style={styles.passengerMeta}>
                    Verified Student • {rev.passenger_id?.course || 'CUUP'}
                  </Text>
                  <Text style={styles.dateMeta}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No passenger reviews yet.</Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  overviewCard: {
    backgroundColor: '#121318',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bigRating: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.navy,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scoreSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  critPill: {
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
  critLabel: {
    fontSize: 11,
    color: '#A1A1AA',
  },
  critVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  submitCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
  },
  submitCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E40AF',
  },
  submitCardSub: {
    fontSize: 11.5,
    color: '#1E3A8A',
    lineHeight: 16,
  },
  criteriaInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  criteriaInputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E3A8A',
    flex: 1,
  },
  inputGroup: {
    gap: 6,
    marginTop: 6,
  },
  textLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  reviewInput: {
    backgroundColor: '#121318',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    padding: 10,
    height: 70,
    fontSize: 12,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
  submitBtn: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#090A0D',
    fontSize: 13,
    fontWeight: '800',
  },
  reviewsListSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  flagBtnText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  reviewText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  passengerMeta: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dateMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  noReviews: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 12,
  },
});
