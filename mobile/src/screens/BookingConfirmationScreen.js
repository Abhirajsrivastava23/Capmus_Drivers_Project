import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import Header from '../components/Header';
import VerifiedBadge from '../components/VerifiedBadge';
import api from '../services/api';

export default function BookingConfirmationScreen({ navigation, route }) {
  const { booking } = route.params || {};

  const [paymentDeclared, setPaymentDeclared] = useState(
    booking?.payment_status === 'upi_declared' || booking?.payment_status === 'cash_declared'
  );
  const [loading, setLoading] = useState(false);

  const ride = booking?.ride_id || {};
  const driver = ride.driver_id || {};
  const vehicle = ride.vehicle_id || {};

  const handleCall = () => {
    if (driver.phone) {
      Linking.openURL(`tel:${driver.phone}`);
    }
  };

  const handleOpenChat = () => {
    navigation.navigate('InAppChat', {
      rideId: ride._id,
      driverName: driver.name,
      driverId: driver._id,
    });
  };

  const handleDeclarePayment = async (method) => {
    setLoading(true);
    try {
      await api.put(`/bookings/${booking._id}/payment`, {
        payment_method: method,
        upi_reference: `UPI/CUUP/${Date.now().toString().slice(-6)}`,
      });
      setPaymentDeclared(true);
      Alert.alert('Payment Declared', `Payment declared via ${method.toUpperCase()} for your journey to ${ride.destination}.`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Booking Confirmation"
        subtitle="Your seat is confirmed"
        showBack
        onBack={() => navigation.navigate('MainTabs')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Success Banner */}
        <View style={styles.successCard}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.successHeading}>Seat Confirmed!</Text>
          <Text style={styles.successSub}>
            Your ride from Chandigarh University UP to {ride.destination} is confirmed.
          </Text>
        </View>

        {/* Unlocked Driver Card with Direct Contact */}
        <View style={[styles.driverContactCard, SHADOWS.medium]}>
          <View style={styles.driverTopRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{driver.name ? driver.name.charAt(0) : 'D'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.driverName}>{driver.name || 'Student Driver'}</Text>
                <VerifiedBadge size="small" />
              </View>
              <Text style={styles.courseText}>
                {driver.course} • {driver.semester}
              </Text>
              <Text style={styles.phoneRevealedText}>
                📞 Mobile: <Text style={styles.boldPhone}>{driver.phone || '9876500001'}</Text>
              </Text>
            </View>
          </View>

          {/* Quick Contact Actions */}
          <View style={styles.contactActionsRow}>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.85}>
              <Ionicons name="call" size={16} color={COLORS.white} />
              <Text style={styles.callBtnText}>Call Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chatBtn} onPress={handleOpenChat} activeOpacity={0.85}>
              <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.primary} />
              <Text style={styles.chatBtnText}>In-App Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Vehicle to Identify</Text>
          <View style={styles.vehicleRow}>
            <View>
              <Text style={styles.vehicleModel}>{vehicle.vehicle_model || 'Student Car'}</Text>
              <Text style={styles.vehicleColor}>Colour: {vehicle.colour || 'Silver'}</Text>
            </View>

            <View style={styles.plate}>
              <View style={styles.plateInd}>
                <Text style={styles.plateIndText}>IND</Text>
              </View>
              <Text style={styles.plateNumber}>
                {vehicle.registration_number || 'UP32 AB 1234'}
              </Text>
            </View>
          </View>
        </View>

        {/* Journey Details */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Trip Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Departure:</Text>
            <Text style={styles.detailVal}>
              {ride.departure_time} ({ride.journey_date})
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup Location:</Text>
            <Text style={styles.detailVal}>{ride.pickup_location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Drop Location:</Text>
            <Text style={styles.detailVal}>{ride.drop_location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Seats Reserved:</Text>
            <Text style={styles.detailVal}>{booking?.seats_booked || 1} Seat(s)</Text>
          </View>
        </View>

        {/* Fuel Expense Cost Sharing Declaration */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentTitle}>Declared Fuel Contribution</Text>
            <Text style={styles.paymentTotal}>₹{booking?.total_cost || 250}</Text>
          </View>
          <Text style={styles.paymentNotice}>
            Pay your driver directly in Cash or via direct UPI during the journey.
          </Text>

          {!paymentDeclared ? (
            <View style={styles.paymentButtonRow}>
              <TouchableOpacity
                style={styles.upiBtn}
                onPress={() => handleDeclarePayment('upi')}
                disabled={loading}
              >
                <Text style={styles.upiBtnText}>Pay via UPI (GPay/PhonePe)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cashBtn}
                onPress={() => handleDeclarePayment('cash')}
                disabled={loading}
              >
                <Text style={styles.cashBtnText}>Pay in Cash</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.declaredBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.emeraldDark} />
              <Text style={styles.declaredText}>Payment Status Declared</Text>
            </View>
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
  },
  successCard: {
    backgroundColor: COLORS.emeraldLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.emeraldDark,
  },
  successSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  driverContactCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
    gap: 14,
  },
  driverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  courseText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  phoneRevealedText: {
    fontSize: 12,
    color: COLORS.emeraldDark,
    fontWeight: '600',
    marginTop: 4,
  },
  boldPhone: {
    fontWeight: '800',
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.emerald,
    paddingVertical: 10,
    borderRadius: 12,
  },
  callBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
    textTransform: 'uppercase',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  vehicleColor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  plate: {
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
  plateNumber: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  paymentCard: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B21A8',
  },
  paymentTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6B21A8',
  },
  paymentNotice: {
    fontSize: 11,
    color: '#581C87',
    lineHeight: 16,
  },
  paymentButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  upiBtn: {
    flex: 1.3,
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  upiBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  cashBtn: {
    flex: 1,
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#3F3F46',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  cashBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  declaredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.emeraldLight,
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  declaredText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emeraldDark,
  },
});
