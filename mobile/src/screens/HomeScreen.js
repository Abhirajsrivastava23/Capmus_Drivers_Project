import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../constants/theme';
import { POPULAR_DESTINATIONS, UNIVERSITY_INFO } from '../constants/cities';
import VerifiedBadge from '../components/VerifiedBadge';
import RideCard from '../components/RideCard';
import { getSocket } from '../services/socket';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const { user, isVerifiedStudent, unreadNotifications, setUnreadNotifications } = useAuth();
  const [rides, setRides] = useState([]);
  const [broadcastRequests, setBroadcastRequests] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptedRequests, setAcceptedRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    try {
      const [resRides, resBroadcast] = await Promise.allSettled([
        api.get('/rides/search'),
        api.get('/rides/broadcast-requests'),
      ]);

      if (resRides.status === 'fulfilled' && resRides.value.data.success) {
        setRides(resRides.value.data.rides || []);
      }

      if (resBroadcast.status === 'fulfilled' && resBroadcast.value.data.success) {
        setBroadcastRequests(resBroadcast.value.data.requests || []);
      }
    } catch (e) {
      console.warn('Error loading home data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success && typeof res.data.unreadCount === 'number') {
        if (setUnreadNotifications) setUnreadNotifications(res.data.unreadCount);
      }
    } catch (ignored) {}
  };

  // Re-fetch whenever user returns to Home tab
  useFocusEffect(
    useCallback(() => {
      fetchRides();
      checkNotifications();
    }, [])
  );

  // Real-time listener: when any student registers/publishes a ride or broadcasts a ride request!
  useEffect(() => {
    const socket = getSocket();
    const handleRideUpdate = () => {
      fetchRides();
      checkNotifications();
    };

    if (socket) {
      socket.on('new_ride_published', handleRideUpdate);
      socket.on('ride_status_updated', handleRideUpdate);
      socket.on('new_student_ride_request', handleRideUpdate);
      socket.on('ride_request_accepted', handleRideUpdate);
      socket.on('new_notification', checkNotifications);
    }

    return () => {
      if (socket) {
        socket.off('new_ride_published', handleRideUpdate);
        socket.off('ride_status_updated', handleRideUpdate);
        socket.off('new_student_ride_request', handleRideUpdate);
        socket.off('ride_request_accepted', handleRideUpdate);
        socket.off('new_notification', checkNotifications);
      }
    };
  }, []);

  const handleAcceptBroadcast = async (reqItem) => {
    setAcceptingId(reqItem._id);
    try {
      const res = await api.post(`/rides/broadcast-requests/${reqItem._id}/accept`, {
        driver_name: user?.name ? (user.name.includes('Aarav') ? 'Aarav Sharma' : user.name) : 'Aarav Sharma',
        driver_phone: user?.phone || '9876500001',
        vehicle_info: 'Hyundai i10 Magna (UP32 AB 1234)',
      });

      if (res.data.success) {
        setAcceptedRequests((prev) => ({
          ...prev,
          [reqItem._id]: true,
        }));
        Alert.alert(
          'Request Accepted! 🚗',
          `You accepted the ride request for ${reqItem.passenger_name} to ${reqItem.destination}! We have notified the student.`,
          [
            {
              text: 'Call Passenger Now',
              onPress: () => Linking.openURL(`tel:${reqItem.passenger_phone || '9876500002'}`),
            },
            { text: 'Done', style: 'cancel' },
          ]
        );
      }
    } catch (e) {
      console.warn('Error accepting broadcast request', e);
      Alert.alert('Notice', 'Request was updated or already accepted.');
      fetchRides();
    } finally {
      setAcceptingId(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const handleRouteSelect = (destinationName) => {
    navigation.navigate('FindRideTab', {
      screen: 'SearchRide',
      params: { prefillDestination: destinationName },
    });
  };

  // Find lowest price offered by any driver for a destination
  const getMinPrice = (destinationName, defaultCost) => {
    const matching = (rides || []).filter(
      (r) =>
        r.ride_status === 'published' &&
        r.available_seats > 0 &&
        r.destination?.toLowerCase().includes(destinationName.toLowerCase())
    );
    if (matching.length > 0) {
      return Math.min(...matching.map((r) => r.cost_per_seat));
    }
    return defaultCost;
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.leftProfileBlock}>
          {user?.profile_photo ? (
            <Image
              source={{ uri: user.profile_photo }}
              style={styles.headerAvatarImg}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.headerInitialsBox}>
              <Text style={styles.headerInitialsText}>
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'CU'}
              </Text>
            </View>
          )}
          <View style={styles.userGreeting}>
            <Text style={styles.greetingText}>
              Hello, <Text style={styles.userName}>{user?.name ? user.name.split(' ')[0] : 'Student'}</Text> 👋
            </Text>
            <View style={styles.badgeRow}>
              {isVerifiedStudent ? (
                <VerifiedBadge size="small" />
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('StudentVerification')}
                  style={styles.unverifiedPill}
                >
                  <Text style={styles.unverifiedText}>Verify ID Card ⚠️</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.campusTag}>Lucknow Campus</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.sosButtonTop}
            onPress={() => navigation.navigate('EmergencySOS')}
            activeOpacity={0.8}
          >
            <Ionicons name="warning" size={14} color="#FFFFFF" />
            <Text style={styles.sosTopText}>SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color="#E4E4E7" />
            {unreadNotifications > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Searchbar Card */}
        <TouchableOpacity
          style={[styles.searchBarCard, SHADOWS.medium]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('FindRideTab')}
        >
          <View style={styles.searchBarLeft}>
            <View style={styles.searchIconBox}>
              <Ionicons name="search" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.searchBarTitle}>Where are you traveling?</Text>
              <Text style={styles.searchBarSub}>Kanpur, Unnao, Lucknow...</Text>
            </View>
          </View>
          <View style={styles.filterChip}>
            <Ionicons name="options-outline" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Quick Action Matrix */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#14151D', borderColor: '#27272A' }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OfferRideTab')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#1E2028' }]}>
              <FontAwesome5 name="car" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, { color: '#FFFFFF' }]}>Offer a Ride</Text>
            <Text style={[styles.actionDesc, { color: '#A1A1AA' }]}>Have empty seats? Share fuel cost</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#14151D', borderColor: '#27272A' }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FindRideTab')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#1E2028' }]}>
              <Ionicons name="search" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, { color: '#FFFFFF' }]}>Find a Ride</Text>
            <Text style={[styles.actionDesc, { color: '#A1A1AA' }]}>Search verified student cars</Text>
          </TouchableOpacity>
        </View>

        {/* Live Student Ride Requests (Broadcast alerts received by registered drivers) */}
        {broadcastRequests.length > 0 && (
          <View style={styles.broadcastSection}>
            <View style={styles.broadcastHeaderRow}>
              <View style={styles.broadcastTitleGroup}>
                <View style={styles.pulseDot} />
                <Text style={styles.broadcastSectionTitle}>STUDENT RIDE REQUESTS</Text>
                <View style={styles.broadcastCountBadge}>
                  <Text style={styles.broadcastCountText}>{broadcastRequests.length} Live</Text>
                </View>
              </View>
              <Text style={styles.broadcastSubtitle}>Students needing a ride from campus right now</Text>
            </View>

            {broadcastRequests.map((reqItem) => {
              const isAccepted = acceptedRequests[reqItem._id] || reqItem.status === 'accepted';
              const isAccepting = acceptingId === reqItem._id;

              return (
                <View key={reqItem._id} style={[styles.broadcastCard, SHADOWS.medium]}>
                  <View style={styles.broadcastCardTop}>
                    <View style={styles.passengerAvatar}>
                      <Ionicons name="person" size={16} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.passengerNameRow}>
                        <Text style={styles.passengerName}>{reqItem.passenger_name || 'Campus Student'}</Text>
                        <View style={styles.verifiedTag}>
                          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                          <Text style={styles.verifiedTagText}>CUUP</Text>
                        </View>
                      </View>
                      <Text style={styles.passengerDept}>{reqItem.passenger_course || 'Chandigarh Univ. UP Student'}</Text>
                    </View>
                    <View style={styles.estFareBadge}>
                      <Text style={styles.estFareLabel}>Est. Share</Text>
                      <Text style={styles.estFareValue}>₹{reqItem.estimated_contribution || 250}</Text>
                    </View>
                  </View>

                  {/* Route details */}
                  <View style={styles.broadcastRouteBox}>
                    <View style={styles.routePointRow}>
                      <View style={[styles.routeDot, { backgroundColor: '#71717A' }]} />
                      <Text style={styles.routeFromText}>CUUP Campus (NH-27 Main Gate)</Text>
                    </View>
                    <View style={styles.routeConnector} />
                    <View style={styles.routePointRow}>
                      <View style={[styles.routeDot, { backgroundColor: '#FFFFFF' }]} />
                      <Text style={styles.routeToText}>{reqItem.destination}</Text>
                      <View style={styles.seatsBadge}>
                        <Ionicons name="people" size={11} color="#A1A1AA" />
                        <Text style={styles.seatsBadgeText}>{reqItem.seats || 1} Seat</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.broadcastActionRow}>
                    {isAccepted ? (
                      <View style={styles.acceptedBanner}>
                        <View style={styles.acceptedInfoRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                          <Text style={styles.acceptedBannerText}>Accepted by you! Passenger notified.</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.callStudentBtn}
                          activeOpacity={0.85}
                          onPress={() => Linking.openURL(`tel:${reqItem.passenger_phone || '9876500002'}`)}
                        >
                          <Ionicons name="call" size={13} color="#000000" />
                          <Text style={styles.callStudentBtnText}>Call Passenger</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.acceptRequestBtn}
                        activeOpacity={0.85}
                        disabled={isAccepting}
                        onPress={() => handleAcceptBroadcast(reqItem)}
                      >
                        {isAccepting ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <>
                            <FontAwesome5 name="car-side" size={14} color="#000000" />
                            <Text style={styles.acceptRequestBtnText}>Accept Request & Offer Ride</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Popular University Routes Carousel */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Popular Campus Routes</Text>
            <Text style={styles.sectionSubtitle}>From Chandigarh University UP (NH-27 Gate)</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routeCarousel}
        >
          {POPULAR_DESTINATIONS.slice(0, 5).map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[styles.routePill, SHADOWS.small]}
              activeOpacity={0.85}
              onPress={() => handleRouteSelect(route.name)}
            >
              <View style={styles.routePillTop}>
                <Text style={styles.routeCity}>{route.name}</Text>
                <Text style={styles.routePrice}>₹{getMinPrice(route.name, route.defaultMinCost || 100)}</Text>
              </View>
              <View style={styles.routePillBottom}>
                <Text style={styles.routeDistance}>{route.estTime}</Text>
                <Ionicons name="arrow-forward-circle" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dynamic Available Rides Feed: Shows here as soon as someone registers/offers a ride */}
        {rides.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Available Student Rides</Text>
                <Text style={styles.sectionSubtitle}>Verified peers leaving soon from campus</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('FindRideTab')}>
                <Text style={styles.seeAllText}>View All ({rides.length})</Text>
              </TouchableOpacity>
            </View>

            {rides.map((ride) => (
              <RideCard
                key={ride._id}
                ride={ride}
                onPress={() => navigation.navigate('RideDetails', { rideId: ride._id })}
                onBookNow={() => navigation.navigate('RideDetails', { rideId: ride._id })}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0D',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#090A0D',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  leftProfileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
  },
  headerInitialsBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1E2028',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInitialsText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerLogoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
  },
  userGreeting: {
    gap: 2,
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  userName: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  unverifiedPill: {
    backgroundColor: '#18181B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  unverifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  campusTag: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E1F24',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3F3F46',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  sosTopText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#090A0D',
  },
  unreadBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#090A0D',
  },
  scrollContent: {
    padding: 20,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  searchBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121318',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 20,
  },
  searchBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  searchIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#1E2028',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchBarSub: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
  },
  filterChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E2028',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionDesc: {
    fontSize: 10.5,
    color: '#A1A1AA',
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  routeCarousel: {
    gap: 12,
    paddingBottom: 24,
  },
  routePill: {
    width: 160,
    backgroundColor: '#121318',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    justifyContent: 'space-between',
  },
  routePillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeCity: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  routePrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  routePillBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeDistance: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '500',
  },
  emptyCard: {
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyOfferBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyOfferText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  broadcastSection: {
    marginTop: 18,
    marginBottom: 4,
  },
  broadcastHeaderRow: {
    marginBottom: 10,
  },
  broadcastTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  broadcastSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#E4E4E7',
    letterSpacing: 0.6,
  },
  broadcastCountBadge: {
    backgroundColor: '#18181B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  broadcastCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  broadcastSubtitle: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  broadcastCard: {
    backgroundColor: '#14151D',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 12,
  },
  broadcastCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  passengerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
  },
  passengerDept: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  estFareBadge: {
    alignItems: 'flex-end',
  },
  estFareLabel: {
    fontSize: 9,
    color: '#71717A',
    fontWeight: '600',
  },
  estFareValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  broadcastRouteBox: {
    backgroundColor: '#0D0E12',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E2028',
    marginBottom: 12,
  },
  routePointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  routeConnector: {
    width: 1,
    height: 10,
    backgroundColor: '#27272A',
    marginLeft: 2.5,
    marginVertical: 2,
  },
  routeFromText: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
  },
  routeToText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E2028',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  seatsBadgeText: {
    fontSize: 10,
    color: '#D4D4D8',
    fontWeight: '600',
  },
  broadcastActionRow: {
    marginTop: 2,
  },
  acceptRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    borderRadius: 12,
  },
  acceptRequestBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#052E16',
    borderWidth: 1,
    borderColor: '#166534',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  acceptedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  acceptedBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#86EFAC',
  },
  callStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callStudentBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
});
