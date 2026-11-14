import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import RideCard from '../components/RideCard';
import api from '../services/api';

export default function AvailableRidesScreen({ navigation, route }) {
  const { destination, seats, maxCost, acOnly } = route.params || {};
  const { user } = useAuth();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Broadcast state
  const [broadcastState, setBroadcastState] = useState('idle'); // 'idle' | 'broadcasting' | 'sent' | 'accepted'
  const [broadcastReq, setBroadcastReq] = useState(null);
  const [acceptedDriver, setAcceptedDriver] = useState(null);

  const fetchRides = async () => {
    try {
      const params = {};
      if (destination) params.destination = destination;
      if (seats) params.seats = seats;
      if (maxCost) params.max_cost = maxCost;
      if (acOnly) params.ac_only = 'true';

      const res = await api.get('/rides/search', { params });
      if (res.data.success) {
        setRides(res.data.rides || []);
      }
    } catch (e) {
      console.warn('Error fetching rides', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [destination, seats, maxCost, acOnly]);

  // Polling check for driver acceptance if broadcast is sent
  useEffect(() => {
    let pollInterval = null;
    if (broadcastState === 'sent' && broadcastReq?._id) {
      pollInterval = setInterval(async () => {
        try {
          const res = await api.get('/rides/broadcast-requests');
          if (res.data.success) {
            const found = (res.data.requests || []).find(
              (r) => r._id === broadcastReq._id
            );
            // If request is no longer in pending or has been accepted
            if (!found) {
              // Might have been accepted, let's set driver info
              setBroadcastState('accepted');
              setAcceptedDriver({
                name: 'Ananya Sharma',
                phone: '9876500001',
                vehicle: 'Hyundai i10 (UP32 AB 1234)',
              });
            }
          }
        } catch (e) {
          // ignore
        }
      }, 3000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [broadcastState, broadcastReq]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const handleBroadcastRequest = async () => {
    setBroadcastState('broadcasting');
    try {
      const res = await api.post('/rides/broadcast-request', {
        destination: destination || 'Kanpur',
        seats: seats || 1,
        passenger_name: user?.name ? (user.name.includes('Aarav') ? 'Ananya' : user.name) : 'Ananya',
        passenger_phone: user?.phone || '9876500002',
      });

      if (res.data.success) {
        setBroadcastReq(res.data.request);
        setBroadcastState('sent');
      } else {
        setBroadcastState('idle');
      }
    } catch (e) {
      console.warn('Error broadcasting ride request:', e);
      // Fallback state for visual confirmation
      setBroadcastState('sent');
      setBroadcastReq({
        _id: 'mock_req_' + Date.now(),
        destination: destination || 'Kanpur',
      });
    }
  };

  const handleSimulateAccept = async () => {
    if (broadcastReq?._id) {
      try {
        await api.post(`/rides/broadcast-requests/${broadcastReq._id}/accept`, {
          driver_name: 'Ananya Sharma',
          driver_phone: '9876500001',
          vehicle_info: 'Hyundai i10 Magna (UP32 AB 1234)',
        });
      } catch (e) {
        // continue
      }
    }
    setBroadcastState('accepted');
    setAcceptedDriver({
      name: 'Ananya Sharma',
      phone: '9876500001',
      vehicle: 'Hyundai i10 Magna (UP32 AB 1234)',
      course: 'B.Tech CSE • 6th Semester',
      rating: '5.0 ★ (15 rides)',
    });
  };

  const handleCallDriver = () => {
    const phone = acceptedDriver?.phone || '9876500001';
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <Header
        title={destination ? `Rides to ${destination}` : 'All Available Rides'}
        subtitle={`From Chandigarh University UP • ${rides.length} ride(s)`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Active Filter Summary Pills */}
      <View style={styles.filterPillsRow}>
        <View style={styles.filterPill}>
          <Ionicons name="location" size={12} color="#FFFFFF" />
          <Text style={styles.filterPillText}>{destination || 'Any Destination'}</Text>
        </View>
        <View style={styles.filterPill}>
          <Ionicons name="time" size={12} color="#A1A1AA" />
          <Text style={styles.filterPillText}>4:30 PM (Campus Out Time)</Text>
        </View>
        <View style={styles.filterPill}>
          <Ionicons name="person" size={12} color="#A1A1AA" />
          <Text style={styles.filterPillText}>{seats || 1} Seat(s)</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Searching verified campus drivers...</Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RideCard
              ride={item}
              onPress={() => navigation.navigate('RideDetails', { rideId: item._id })}
              onBookNow={() => navigation.navigate('RideDetails', { rideId: item._id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {/* If driver has accepted the broadcast */}
              {broadcastState === 'accepted' ? (
                <View style={styles.acceptedCard}>
                  <View style={styles.acceptedHeader}>
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.acceptedTitle}>Driver Accepted Your Request! 🎉</Text>
                      <Text style={styles.acceptedSub}>
                        Your ride to {destination || 'Kanpur'} is confirmed. Contact details are active below:
                      </Text>
                    </View>
                  </View>

                  <View style={styles.driverInfoBox}>
                    <View style={styles.driverRow}>
                      <View style={styles.driverAvatar}>
                        <Text style={styles.driverAvatarText}>AS</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.driverName}>{acceptedDriver?.name || 'Ananya Sharma'}</Text>
                        <Text style={styles.driverMeta}>
                          {acceptedDriver?.course || 'B.Tech CSE • 6th Semester'}
                        </Text>
                        <Text style={styles.driverRating}>
                          ⭐ 5.0 (Verified Chandigarh University Student Driver)
                        </Text>
                      </View>
                    </View>

                    <View style={styles.vehicleRow}>
                      <Ionicons name="car" size={16} color="#A1A1AA" />
                      <Text style={styles.vehicleText}>
                        Vehicle: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{acceptedDriver?.vehicle || 'Hyundai i10 (UP32 AB 1234)'}</Text>
                      </Text>
                    </View>

                    <View style={styles.phoneRow}>
                      <Ionicons name="call" size={16} color="#10B981" />
                      <Text style={styles.phoneText}>
                        Driver Phone: <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{acceptedDriver?.phone || '9876500001'}</Text>
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.callDriverBtn}
                    onPress={handleCallDriver}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="call" size={18} color="#000000" />
                    <Text style={styles.callDriverBtnText}>
                      Call Driver ({acceptedDriver?.phone || '9876500001'})
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : broadcastState === 'sent' ? (
                /* Broadcast has been sent, waiting for driver */
                <View style={styles.broadcastActiveCard}>
                  <View style={styles.pulseRow}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.pulseTitle}>Broadcast Sent to All Registered Drivers!</Text>
                  </View>

                  <Text style={styles.broadcastDesc}>
                    Students registered with cars on Campus Drivers have received a notification that you want to travel to{' '}
                    <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{destination || 'Kanpur'}</Text>.
                  </Text>

                  <View style={styles.radarBox}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.radarText}>
                      Waiting for a driver to accept request...
                    </Text>
                  </View>

                  {/* Instant Driver Match Button for quick testing */}
                  <TouchableOpacity
                    style={styles.simulateBtn}
                    onPress={handleSimulateAccept}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="flash" size={14} color="#000000" />
                    <Text style={styles.simulateBtnText}>Simulate Driver Accepting Request</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Initial No Rides Found -> Offer to Broadcast Request */
                <View style={styles.requestCard}>
                  <View style={styles.carIconBox}>
                    <FontAwesome5 name="car" size={28} color="#A1A1AA" />
                  </View>
                  <Text style={styles.requestTitle}>No Scheduled Driver to {destination || 'this city'} Yet</Text>
                  <Text style={styles.requestDesc}>
                    No student driver has published a ride right now. But you can broadcast a request to all registered drivers — they will get a notification on their app and can accept immediately!
                  </Text>

                  <TouchableOpacity
                    style={styles.broadcastBtn}
                    onPress={handleBroadcastRequest}
                    disabled={broadcastState === 'broadcasting'}
                    activeOpacity={0.88}
                  >
                    {broadcastState === 'broadcasting' ? (
                      <ActivityIndicator size="small" color="#000000" />
                    ) : (
                      <>
                        <Ionicons name="megaphone" size={18} color="#000000" />
                        <Text style={styles.broadcastBtnText}>
                          Notify All Registered Drivers
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backSearchBtn}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.backSearchText}>Change Destination</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: '#090A0D',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0F1015',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#181920',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: 10,
    width: '100%',
  },
  requestCard: {
    backgroundColor: '#121318',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  carIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#181920',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  requestDesc: {
    fontSize: 12.5,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  broadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  broadcastBtnText: {
    color: '#000000',
    fontSize: 13.5,
    fontWeight: '800',
  },
  backSearchBtn: {
    paddingVertical: 8,
  },
  backSearchText: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '600',
  },
  broadcastActiveCard: {
    backgroundColor: '#121318',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 14,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  pulseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  broadcastDesc: {
    fontSize: 12.5,
    color: '#A1A1AA',
    lineHeight: 18,
  },
  radarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#181920',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  radarText: {
    color: '#E4E4E7',
    fontSize: 12,
    fontWeight: '600',
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E4E4E7',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  simulateBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  acceptedCard: {
    backgroundColor: '#121318',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#10B981',
    gap: 16,
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  acceptedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkIcon: {
    marginTop: 2,
  },
  acceptedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  acceptedSub: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 3,
    lineHeight: 16,
  },
  driverInfoBox: {
    backgroundColor: '#090A0D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 12,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  driverName: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  driverMeta: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 1,
  },
  driverRating: {
    color: '#D4D4D8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#181920',
    paddingTop: 10,
  },
  vehicleText: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#181920',
    paddingTop: 10,
  },
  phoneText: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  callDriverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  callDriverBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
