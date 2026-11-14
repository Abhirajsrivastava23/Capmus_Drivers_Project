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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import Header from '../components/Header';
import VerifiedBadge from '../components/VerifiedBadge';
import api from '../services/api';

export default function BookingRequestsScreen({ navigation, route }) {
  const { rideId, destination } = route.params || {};

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'confirmed'

  const fetchRequests = async () => {
    try {
      const endpoint = rideId ? `/bookings/ride/${rideId}` : '/bookings/ride/all';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (e) {
      console.warn('Unable to fetch requests', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [rideId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAccept = async (bookingId) => {
    setActionId(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/accept`);
      Alert.alert(
        'Request Accepted! 🎉',
        `Seats confirmed for passenger. Remaining seats on ride: ${res.data.remaining_seats}`
      );
      fetchRequests();
    } catch (err) {
      Alert.alert('Action Failed', err.response?.data?.message || 'Failed to accept booking');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (bookingId) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this passenger booking request?',
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Yes, Decline',
          style: 'destructive',
          onPress: async () => {
            setActionId(bookingId);
            try {
              await api.put(`/bookings/${bookingId}/reject`, { reason: 'Seats no longer available' });
              fetchRequests();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to reject booking');
            } finally {
              setActionId(null);
            }
          },
        },
      ]
    );
  };

  const handleCallPassenger = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Phone Hidden', 'Passenger contact will be unlocked once trip starts.');
    }
  };

  const filteredBookings = bookings.filter((item) => {
    if (activeFilter === 'pending') return item.booking_status === 'pending';
    if (activeFilter === 'confirmed') {
      return ['accepted', 'confirmed', 'completed'].includes(item.booking_status);
    }
    return true;
  });

  const pendingCount = bookings.filter((b) => b.booking_status === 'pending').length;

  return (
    <View style={styles.container}>
      {/* 🚀 Dark Luxury Header */}
      <Header
        title="Booking Requests"
        subtitle={destination ? `For trip to ${destination}` : 'Incoming seat requests from students'}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* 🔍 Filter Tabs Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            All ({bookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'pending' && styles.filterChipActive]}
          onPress={() => setActiveFilter('pending')}
          activeOpacity={0.8}
        >
          <View style={styles.filterUnreadRow}>
            {pendingCount > 0 && <View style={styles.pendingDot} />}
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'pending' && styles.filterChipTextActive,
              ]}
            >
              Pending ({pendingCount})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'confirmed' && styles.filterChipActive]}
          onPress={() => setActiveFilter('confirmed')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'confirmed' && styles.filterChipTextActive,
            ]}
          >
            Confirmed & Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📋 List of Requests */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading seat requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={['#FFFFFF']}
            />
          }
          renderItem={({ item }) => {
            const passenger = item.passenger_id || {};
            const ride = item.ride_id || {};
            const isPending = item.booking_status === 'pending';
            const isConfirmed = ['accepted', 'confirmed'].includes(item.booking_status);
            const isCompleted = item.booking_status === 'completed';
            const isRejected = ['rejected', 'cancelled'].includes(item.booking_status);

            return (
              <View style={[styles.requestCard, isPending && styles.requestCardPending]}>
                {/* Top Passenger Profile Row */}
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {passenger.name ? passenger.name.charAt(0).toUpperCase() : 'P'}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.passengerName}>{passenger.name || 'Student'}</Text>
                      {passenger.verification_status === 'verified' && (
                        <VerifiedBadge size="small" />
                      )}
                    </View>
                    <Text style={styles.courseText}>
                      {passenger.course || 'CUUP Student'} • {passenger.semester || 'Academic'}
                    </Text>
                    <Text style={styles.rollText}>Roll: {passenger.student_id || 'CUUP2024'}</Text>
                  </View>

                  <View style={styles.seatsPill}>
                    <Ionicons name="people" size={13} color="#FFFFFF" />
                    <Text style={styles.seatsPillText}>{item.seats_booked} Seat(s)</Text>
                  </View>
                </View>

                {/* Route Destination Tag if known */}
                {ride.destination && (
                  <View style={styles.routeTag}>
                    <Ionicons name="navigate-outline" size={12} color="#A1A1AA" />
                    <Text style={styles.routeTagText}>
                      Trip: {ride.from || 'CUUP Campus'} → {ride.destination}
                    </Text>
                  </View>
                )}

                {/* 📝 Passenger Pickup Note - High Contrast Box */}
                {item.pickup_note ? (
                  <View style={styles.noteBox}>
                    <View style={styles.noteHeader}>
                      <Ionicons name="chatbubble-ellipses-outline" size={12} color="#F59E0B" />
                      <Text style={styles.noteLabel}>Passenger Pickup Note</Text>
                    </View>
                    <Text style={styles.noteText}>"{item.pickup_note}"</Text>
                  </View>
                ) : null}

                {/* Card Footer: Cost Contribution & Actions */}
                <View style={styles.cardFooter}>
                  <div>
                    <Text style={styles.costLabel}>Cost Contribution</Text>
                    <Text style={styles.costValue}>₹{item.total_cost}</Text>
                  </div>

                  {isPending ? (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(item._id)}
                        disabled={actionId === item._id}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.rejectBtnText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAccept(item._id)}
                        disabled={actionId === item._id}
                        activeOpacity={0.85}
                      >
                        {actionId === item._id ? (
                          <ActivityIndicator size="small" color="#090A0D" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={14} color="#090A0D" />
                            <Text style={styles.acceptBtnText}>Accept Request</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.statusRow}>
                      {passenger.phone && (isConfirmed || isCompleted) && (
                        <TouchableOpacity
                          style={styles.callBtn}
                          onPress={() => handleCallPassenger(passenger.phone)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="call" size={12} color="#FFFFFF" />
                          <Text style={styles.callBtnText}>Call</Text>
                        </TouchableOpacity>
                      )}

                      <View
                        style={[
                          styles.statusPill,
                          isConfirmed && styles.statusPillConfirmed,
                          isCompleted && styles.statusPillCompleted,
                          isRejected && styles.statusPillRejected,
                        ]}
                      >
                        {isConfirmed && <Ionicons name="checkmark-circle" size={12} color="#34D399" />}
                        {isCompleted && <Ionicons name="flag" size={12} color="#A1A1AA" />}
                        {isRejected && <Ionicons name="close-circle" size={12} color="#F87171" />}
                        <Text
                          style={[
                            styles.statusPillText,
                            isConfirmed && styles.statusPillTextConfirmed,
                            isCompleted && styles.statusPillTextCompleted,
                            isRejected && styles.statusPillTextRejected,
                          ]}
                        >
                          {item.booking_status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="mail-unread-outline" size={38} color="#71717A" />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === 'pending' ? 'No Pending Requests' : 'No Booking Requests'}
              </Text>
              <Text style={styles.emptySub}>
                {activeFilter === 'pending'
                  ? 'All student booking requests have been reviewed.'
                  : 'When students request seats on your carpool journeys, they will appear here.'}
              </Text>
              {activeFilter !== 'all' && (
                <TouchableOpacity
                  style={styles.showAllBtn}
                  onPress={() => setActiveFilter('all')}
                >
                  <Text style={styles.showAllText}>View All Requests</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#090A0D', // Executive Dark Obsidian
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
    backgroundColor: '#090A0D',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#121318',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  filterChipTextActive: {
    color: '#090A0D',
    fontWeight: '800',
  },
  filterUnreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  list: {
    padding: 16,
    gap: 14,
  },
  requestCard: {
    backgroundColor: '#121318', // Deep matte obsidian card
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  requestCardPending: {
    borderColor: '#3F3F46',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF', // High-contrast crisp white
  },
  courseText: {
    fontSize: 11.5,
    color: '#A1A1AA', // Silver-grey
    marginTop: 2,
  },
  rollText: {
    fontSize: 10.5,
    color: '#71717A',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  seatsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#181920',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  seatsPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  routeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#090A0D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    alignSelf: 'flex-start',
  },
  routeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  noteBox: {
    backgroundColor: '#181920', // Dark obsidian container (replaces blinding white box!)
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  noteLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 12.5,
    color: '#FFFFFF', // 100% visible crisp white note text
    fontStyle: 'italic',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  costLabel: {
    fontSize: 10.5,
    color: '#71717A',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  costValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF', // High-contrast pure white (replaces invisible black text!)
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  rejectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  rejectBtnText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800',
  },
  acceptBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  acceptBtnText: {
    color: '#090A0D',
    fontSize: 12,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#181920',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  statusPillConfirmed: {
    backgroundColor: '#0C2419',
    borderColor: '#134E35',
  },
  statusPillCompleted: {
    backgroundColor: '#181920',
    borderColor: '#3F3F46',
  },
  statusPillRejected: {
    backgroundColor: '#2A1215',
    borderColor: '#4C1D24',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPillTextConfirmed: {
    color: '#34D399',
  },
  statusPillTextCompleted: {
    color: '#A1A1AA',
  },
  statusPillTextRejected: {
    color: '#F87171',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#121318',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptySub: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  showAllBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  showAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E4E4E7',
  },
});
