import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import Header from '../components/Header';
import VerifiedBadge from '../components/VerifiedBadge';
import api from '../services/api';

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (e) {
      console.warn('Error loading my bookings', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyBookings();
  };

  const handleCancel = (bookingId, destination) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your seat for the ride to ${destination}?`,
      [
        { text: 'No, Keep Seat' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/bookings/${bookingId}/cancel`, { cancellation_reason: 'Passenger schedule change' });
              Alert.alert('Booking Cancelled', 'Your reservation was cancelled and the seat has been returned to the ride.');
              fetchMyBookings();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Booked Rides"
        subtitle="Manage your passenger reservations"
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const ride = item.ride_id || {};
            const driver = ride.driver_id || {};
            const vehicle = ride.vehicle_id || {};
            const isConfirmed = ['accepted', 'confirmed'].includes(item.booking_status);
            const isCompleted = item.booking_status === 'completed';
            const isPending = item.booking_status === 'pending';

            return (
              <View style={[styles.bookingCard, SHADOWS.medium]}>
                {/* Header: Destination & Status */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.destinationTitle}>{ride.destination || 'Destination'}</Text>
                    <Text style={styles.dateTimeText}>
                      {ride.journey_date} • {ride.departure_time}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      isConfirmed
                        ? styles.statusPillConfirmed
                        : isCompleted
                        ? styles.statusPillCompleted
                        : isPending
                        ? styles.statusPillPending
                        : styles.statusPillCancelled,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{item.booking_status.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Driver & Vehicle Identification */}
                <View style={styles.driverSection}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{driver.name ? driver.name.charAt(0) : 'D'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={styles.driverName}>{driver.name || 'Driver'}</Text>
                      {driver.verification_status === 'verified' && <VerifiedBadge size="small" />}
                    </View>
                    <Text style={styles.carInfoText}>
                      {vehicle.vehicle_model || 'Car'} ({vehicle.colour || 'Silver'})
                    </Text>
                    {item.driver_contact_unlocked ? (
                      <Text style={styles.phoneText}>📞 {driver.phone}</Text>
                    ) : (
                      <Text style={styles.phoneMaskedText}>🔒 Mobile unlocks upon confirmation</Text>
                    )}
                  </View>

                  {/* Vehicle License Plate */}
                  <View style={styles.licensePlate}>
                    <View style={styles.indBox}>
                      <Text style={styles.indText}>IND</Text>
                    </View>
                    <Text style={styles.regNumberText}>
                      {vehicle.registration_number || 'UP32 AB 1234'}
                    </Text>
                  </View>
                </View>

                {/* Stops */}
                <View style={styles.stopsBox}>
                  <Text style={styles.stopText} numberOfLines={1}>
                    📍 <Text style={styles.boldText}>Pickup:</Text> {ride.pickup_location}
                  </Text>
                  <Text style={styles.stopText} numberOfLines={1}>
                    🏁 <Text style={styles.boldText}>Drop:</Text> {ride.drop_location}
                  </Text>
                </View>

                {/* Footer Cost & Actions */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.costBreakdownText}>
                      {item.seats_booked} seat(s) reserved
                    </Text>
                    <Text style={styles.costTotalText}>₹{item.total_cost}</Text>
                  </View>

                  <View style={styles.actionsRow}>
                    {isConfirmed && (
                      <>
                        <TouchableOpacity
                          style={styles.chatActionBtn}
                          onPress={() =>
                            navigation.navigate('InAppChat', {
                              rideId: ride._id,
                              driverName: driver.name,
                              driverId: driver._id,
                            })
                          }
                        >
                          <Ionicons name="chatbubble-ellipses" size={15} color={COLORS.primary} />
                          <Text style={styles.chatActionText}>Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.callActionBtn}
                          onPress={() => handleCall(driver.phone)}
                        >
                          <Ionicons name="call" size={15} color={COLORS.white} />
                          <Text style={styles.callActionText}>Call</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {isCompleted && !item.has_reviewed && (
                      <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={() =>
                          navigation.navigate('DrivingReviews', {
                            bookingId: item._id,
                            driverId: driver._id,
                            driverName: driver.name,
                          })
                        }
                      >
                        <Ionicons name="star" size={14} color="#B45309" />
                        <Text style={styles.rateBtnText}>Rate Experience</Text>
                      </TouchableOpacity>
                    )}

                    {(isPending || isConfirmed) && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancel(item._id, ride.destination)}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="ticket-alt" size={42} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Booked Rides Yet</Text>
              <Text style={styles.emptySub}>
                Search and request seats with verified student drivers from Chandigarh University UP.
              </Text>
              <TouchableOpacity
                style={styles.findBtn}
                onPress={() => navigation.navigate('FindRideTab')}
              >
                <Text style={styles.findBtnText}>Search Available Rides</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0D',
  },
  centered: {
    flex: 1,
    backgroundColor: '#090A0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 20,
    gap: 16,
    backgroundColor: '#090A0D',
  },
  bookingCard: {
    backgroundColor: '#121318',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateTimeText: {
    fontSize: 12,
    color: '#E4E4E7',
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  statusPillConfirmed: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  statusPillCompleted: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  statusPillPending: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  statusPillCancelled: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E4E4E7',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#181920',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  carInfoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  phoneText: {
    fontSize: 11,
    color: COLORS.emeraldDark,
    fontWeight: '700',
    marginTop: 2,
  },
  phoneMaskedText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  licensePlate: {
    backgroundColor: COLORS.plateYellow,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  indBox: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  indText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '900',
  },
  regNumberText: {
    paddingHorizontal: 6,
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  stopsBox: {
    gap: 4,
  },
  stopText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  costBreakdownText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  costTotalText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.navy,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chatActionText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  callActionText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rateBtnText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  findBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  findBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
