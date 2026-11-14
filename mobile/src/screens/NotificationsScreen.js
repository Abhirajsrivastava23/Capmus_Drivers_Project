import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import api from '../services/api';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'rides'

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      console.warn('Error loading notifications', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.warn('Failed to mark notifications read', e);
    }
  };

  const handleNotificationPress = async (item) => {
    // If not read, mark as read
    if (!item.is_read) {
      try {
        await api.put(`/notifications/${item._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, is_read: true } : n))
        );
      } catch (e) {
        console.warn('Error marking notification as read', e);
      }
    }

    // Navigate to appropriate screen based on notification type
    const type = item.type;
    const data = item.data || {};

    if (type === 'booking_request') {
      navigation.navigate('BookingRequests', { rideId: data.ride_id });
    } else if (type === 'booking_accepted' || type === 'booking_confirmed' || type === 'ride_completed') {
      navigation.navigate('MyBookings');
    } else if (type === 'ride_broadcast') {
      navigation.navigate('AvailableRides');
    } else if (data.ride_id) {
      navigation.navigate('RideDetails', { rideId: data.ride_id });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'booking_request':
        return {
          name: 'account-clock-outline',
          color: '#F59E0B',
          bg: '#251C0C',
          border: '#452E0B',
        };
      case 'booking_accepted':
      case 'booking_confirmed':
      case 'student_verified':
        return {
          name: 'shield-check-outline',
          color: '#10B981',
          bg: '#0E2419',
          border: '#154B33',
        };
      case 'booking_rejected':
      case 'ride_cancelled':
        return {
          name: 'close-circle-outline',
          color: '#EF4444',
          bg: '#2B1216',
          border: '#531B23',
        };
      case 'departure_time_changed':
        return {
          name: 'clock-alert-outline',
          color: '#38BDF8',
          bg: '#0C2233',
          border: '#153E5C',
        };
      case 'sos_alert':
        return {
          name: 'alert-octagon',
          color: '#EF4444',
          bg: '#380E0E',
          border: '#6B1B1B',
        };
      case 'ride_broadcast':
        return {
          name: 'car-connected',
          color: '#C084FC',
          bg: '#201338',
          border: '#432677',
        };
      case 'ride_completed':
        return {
          name: 'flag-checkered',
          color: '#FFFFFF',
          bg: '#181920',
          border: '#3F3F46',
        };
      case 'review_received':
      case 'system':
        return {
          name: 'star-outline',
          color: '#FBBF24',
          bg: '#251E0E',
          border: '#4C3B12',
        };
      default:
        return {
          name: 'bell-outline',
          color: '#E4E4E7',
          bg: '#16171E',
          border: '#27272A',
        };
    }
  };

  // Filter list
  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.is_read;
    if (activeFilter === 'rides') {
      return [
        'booking_request',
        'booking_accepted',
        'booking_confirmed',
        'ride_broadcast',
        'ride_completed',
        'departure_time_changed',
      ].includes(item.type);
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={styles.container}>
      {/* 🚀 Dark Luxury Header */}
      <Header
        title="Notifications"
        subtitle="Live alerts for rides and bookings"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={styles.markAllBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={13} color="#FFFFFF" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : null
        }
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
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'unread' && styles.filterChipActive]}
          onPress={() => setActiveFilter('unread')}
          activeOpacity={0.8}
        >
          <View style={styles.filterUnreadRow}>
            {unreadCount > 0 && <View style={styles.chipUnreadDot} />}
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'unread' && styles.filterChipTextActive,
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'rides' && styles.filterChipActive]}
          onPress={() => setActiveFilter('rides')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'rides' && styles.filterChipTextActive,
            ]}
          >
            Rides & Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📋 Notification Stream */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Fetching campus alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
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
            const iconConfig = getIconForType(item.type);
            const isUnread = !item.is_read;

            return (
              <TouchableOpacity
                style={[styles.notificationCard, isUnread && styles.unreadCard]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.85}
              >
                {/* Icon Badge */}
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: iconConfig.bg,
                      borderColor: iconConfig.border,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={iconConfig.name}
                    size={22}
                    color={iconConfig.color}
                  />
                </View>

                {/* Content Area */}
                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.timeText}>
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  <Text style={styles.body}>{item.body}</Text>

                  {/* Interactive Broadcast Action */}
                  {item.type === 'ride_broadcast' && item.data?.request_id && (
                    <TouchableOpacity
                      style={styles.actionNotifyBtn}
                      activeOpacity={0.85}
                      onPress={async () => {
                        try {
                          await api.post(
                            `/rides/broadcast-requests/${item.data.request_id}/accept`,
                            {
                              driver_name: 'Ananya Sharma',
                              driver_phone: '9876500001',
                              vehicle_info: 'Hyundai i10 Magna (UP32 AB 1234)',
                            }
                          );
                          alert('Request Accepted! 🎉 Passenger notified.');
                          fetchNotifications();
                        } catch (e) {
                          alert('Request already accepted or expired.');
                        }
                      }}
                    >
                      <Ionicons name="car" size={14} color="#000000" />
                      <Text style={styles.actionNotifyText}>
                        Accept Request & Offer Ride
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Unread Amber Indicator Dot */}
                {isUnread && (
                  <View style={styles.unreadIndicator}>
                    <View style={styles.unreadDot} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={36} color="#71717A" />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === 'unread' ? 'No Unread Alerts' : 'No Notifications'}
              </Text>
              <Text style={styles.emptySub}>
                {activeFilter === 'unread'
                  ? "You're all caught up! You have read all your recent notifications."
                  : 'Updates on ride requests, student confirmations, and departures will appear here.'}
              </Text>
              {activeFilter !== 'all' && (
                <TouchableOpacity
                  style={styles.showAllBtn}
                  onPress={() => setActiveFilter('all')}
                >
                  <Text style={styles.showAllText}>View All Notifications</Text>
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
  center: {
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
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E2028',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
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
  chipUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    backgroundColor: '#121318', // Matte obsidian card
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#161822',
    borderColor: '#3F3F46',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B', // Amber accent indicator for unread alerts
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF', // High-contrast crisp white title
    flex: 1,
    paddingRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
  },
  body: {
    fontSize: 12,
    color: '#A1A1AA', // Silver-grey readable body
    lineHeight: 18,
    marginTop: 2,
  },
  unreadIndicator: {
    paddingTop: 5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  actionNotifyBtn: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionNotifyText: {
    color: '#090A0D',
    fontSize: 11,
    fontWeight: '800',
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
