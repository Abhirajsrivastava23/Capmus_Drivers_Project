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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import Header from '../components/Header';
import api from '../services/api';

export default function MyPublishedRidesScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit departure time & seats modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [newDepartureTime, setNewDepartureTime] = useState('');
  const [newSeats, setNewSeats] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchPublishedRides = async () => {
    try {
      const res = await api.get('/rides/driver/my-rides');
      if (res.data.success) {
        setRides(res.data.rides || []);
      }
    } catch (e) {
      console.warn('Error fetching driver published rides', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPublishedRides();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPublishedRides();
  };

  const handleStartRide = async (rideId, destination) => {
    Alert.alert(
      'Start Journey 🚗',
      `Ready to depart for ${destination}? Confirmed passengers will be notified and live trip tracking will activate.`,
      [
        { text: 'Cancel' },
        {
          text: 'Start Journey',
          onPress: async () => {
            try {
              await api.put(`/rides/${rideId}/start`);
              Alert.alert('Trip Started!', 'Have a safe and pleasant drive!');
              fetchPublishedRides();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to start ride');
            }
          },
        },
      ]
    );
  };

  const handleCompleteRide = async (rideId, destination) => {
    Alert.alert(
      'Complete Journey 🎉',
      `Have you arrived safely at ${destination}? This will mark all bookings completed and invite passengers to review your driving.`,
      [
        { text: 'Cancel' },
        {
          text: 'Complete Journey',
          onPress: async () => {
            try {
              await api.put(`/rides/${rideId}/complete`);
              Alert.alert('Trip Completed!', 'Thank you for sharing your ride!');
              fetchPublishedRides();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to complete ride');
            }
          },
        },
      ]
    );
  };

  const handleCancelRide = (rideId, destination) => {
    Alert.prompt
      ? Alert.prompt(
          'Cancel Journey',
          'Please enter a cancellation reason to notify booked passengers:',
          async (reason) => {
            try {
              await api.put(`/rides/${rideId}/cancel`, { cancellation_reason: reason });
              Alert.alert('Ride Cancelled', 'Booked passengers have been notified.');
              fetchPublishedRides();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
            }
          }
        )
      : (async () => {
          try {
            await api.put(`/rides/${rideId}/cancel`, { cancellation_reason: 'Driver schedule update' });
            Alert.alert('Ride Cancelled', 'Booked passengers have been notified.');
            fetchPublishedRides();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
          }
        })();
  };

  const openEditModal = (ride) => {
    setEditingRide(ride);
    setNewDepartureTime(ride.departure_time);
    setNewSeats(String(ride.available_seats));
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRide) return;
    setSavingEdit(true);
    try {
      await api.put(`/rides/${editingRide._id}`, {
        departure_time: newDepartureTime.trim(),
        available_seats: Number(newSeats),
      });
      setEditModalVisible(false);
      Alert.alert('Updated', 'Ride details updated successfully.');
      fetchPublishedRides();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update ride details');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Published Rides"
        subtitle="Manage rides you have offered"
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const isPublished = item.ride_status === 'published';
            const isStarted = item.ride_status === 'started';
            const isCompleted = item.ride_status === 'completed';
            const vehicle = item.vehicle_id || {};

            return (
              <View style={[styles.rideCard, SHADOWS.medium]}>
                {/* Header: Destination & Status */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.destText}>{item.destination}</Text>
                    <Text style={styles.dateSub}>
                      {item.journey_date} • Dep: <Text style={styles.boldTime}>{item.departure_time}</Text>
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      isStarted
                        ? styles.pillStarted
                        : isCompleted
                        ? styles.pillCompleted
                        : isPublished
                        ? styles.pillPublished
                        : styles.pillCancelled,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{item.ride_status.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Vehicle & Seat Counts */}
                <View style={styles.statsBanner}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Vehicle</Text>
                    <Text style={styles.statVal} numberOfLines={1}>{vehicle.vehicle_model || 'Car'}</Text>
                    <Text style={styles.plateMini}>{vehicle.registration_number || 'UP32 AB 1234'}</Text>
                  </View>

                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Seats Remaining</Text>
                    <Text style={styles.statVal}>
                      {item.available_seats} of {item.total_seats}
                    </Text>
                    <Text style={styles.subStat}>{item.booked_seats} reserved</Text>
                  </View>

                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Cost Share</Text>
                    <Text style={styles.statVal}>₹{item.cost_per_seat}</Text>
                    <Text style={styles.subStat}>per seat</Text>
                  </View>
                </View>

                {/* Booking Requests Alert */}
                {item.pending_requests_count > 0 && (
                  <TouchableOpacity
                    style={styles.pendingRequestsAlert}
                    onPress={() =>
                      navigation.navigate('BookingRequests', {
                        rideId: item._id,
                        destination: item.destination,
                      })
                    }
                  >
                    <Ionicons name="notifications" size={16} color="#B45309" />
                    <Text style={styles.pendingRequestsText}>
                      {item.pending_requests_count} student booking request(s) waiting!
                    </Text>
                    <Text style={styles.reviewBtnText}>Review →</Text>
                  </TouchableOpacity>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  {isPublished && (
                    <>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => openEditModal(item)}
                      >
                        <Ionicons name="time-outline" size={14} color={COLORS.navy} />
                        <Text style={styles.editBtnText}>Edit Time/Seats</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.manageRequestsBtn}
                        onPress={() =>
                          navigation.navigate('BookingRequests', {
                            rideId: item._id,
                            destination: item.destination,
                          })
                        }
                      >
                        <Ionicons name="people" size={14} color={COLORS.primaryDark} />
                        <Text style={styles.manageRequestsBtnText}>Requests</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={() => handleStartRide(item._id, item.destination)}
                      >
                        <Ionicons name="play" size={12} color={COLORS.white} />
                        <Text style={styles.startBtnText}>Start</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancelRide(item._id, item.destination)}
                      >
                        <Ionicons name="close" size={14} color={COLORS.danger} />
                      </TouchableOpacity>
                    </>
                  )}

                  {isStarted && (
                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => handleCompleteRide(item._id, item.destination)}
                    >
                      <Ionicons name="checkmark-done" size={16} color={COLORS.white} />
                      <Text style={styles.completeBtnText}>Mark Journey as Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="car" size={42} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Published Rides</Text>
              <Text style={styles.emptySub}>
                Planning to drive from campus? Publish a ride to help peers and share travel costs.
              </Text>
              <TouchableOpacity
                style={styles.offerBtn}
                onPress={() => navigation.navigate('OfferRideTab')}
              >
                <Text style={styles.offerBtnText}>Offer a Ride</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Edit Departure Time & Seats Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Departure Time & Seats</Text>
            <Text style={styles.modalSub}>
              Confirmed passengers will be notified immediately of schedule changes.
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Departure Time</Text>
              <TextInput
                style={styles.modalInput}
                value={newDepartureTime}
                onChangeText={setNewDepartureTime}
                placeholder="e.g. 08:00 AM"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Available Seats Remaining</Text>
              <TextInput
                style={styles.modalInput}
                value={newSeats}
                onChangeText={setNewSeats}
                keyboardType="numeric"
                placeholder="e.g. 2"
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSaveText}>Save & Notify</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  rideCard: {
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
  destText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateSub: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  boldTime: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  pillPublished: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  pillStarted: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  pillCompleted: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  pillCancelled: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E4E4E7',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#181920',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  plateMini: {
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: '800',
    color: COLORS.navy,
  },
  subStat: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  pendingRequestsAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingRequestsText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navy,
  },
  manageRequestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
  },
  manageRequestsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.emerald,
    marginLeft: 'auto',
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  cancelBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.navy,
  },
  completeBtnText: {
    color: COLORS.white,
    fontSize: 13,
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
  offerBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  offerBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#121318',
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  modalInputGroup: {
    gap: 4,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalSaveBtn: {
    flex: 1.5,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
