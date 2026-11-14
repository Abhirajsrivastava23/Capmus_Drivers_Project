import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../constants/theme';
import Header from '../components/Header';
import VerifiedBadge from '../components/VerifiedBadge';
import api from '../services/api';

export default function UserProfileScreen({ navigation }) {
  const { user, isVerifiedStudent, logout, refreshProfile } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  const AVATAR_OPTIONS = [
    { id: 1, label: 'Student 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
    { id: 2, label: 'Student 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80' },
    { id: 3, label: 'Student 3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
    { id: 4, label: 'Student 4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  ];

  const handleSelectAvatar = async (url) => {
    setUpdatingPhoto(true);
    try {
      await api.put('/auth/profile', { profile_photo: url });
      if (refreshProfile) await refreshProfile();
      setShowAvatarPicker(false);
    } catch (e) {
      console.warn('Error updating profile photo', e);
    } finally {
      setUpdatingPhoto(false);
    }
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/users/vehicle/my-vehicles');
        if (res.data.success) {
          setVehicles(res.data.vehicles || []);
        }
      } catch (e) {
        console.warn('Error fetching user vehicles', e);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const stats = user?.stats || {};
  const primaryVehicle = vehicles[0];

  return (
    <View style={styles.container}>
      <Header
        title="Student Profile"
        subtitle="Chandigarh University UP Carpool ID"
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color={COLORS.navy} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={[styles.profileCard, SHADOWS.medium]}>
          <View style={styles.avatarContainer}>
            {user?.profile_photo ? (
              <Image
                source={{ uri: user.profile_photo }}
                style={styles.profileAvatarImg}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileInitialsAvatar}>
                <Text style={styles.profileInitialsText}>
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
            <TouchableOpacity
              style={styles.changePhotoBtn}
              activeOpacity={0.8}
              onPress={() => setShowAvatarPicker(!showAvatarPicker)}
            >
              <Ionicons name="camera" size={13} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Quick Avatar Chooser Dropdown */}
          {showAvatarPicker && (
            <View style={styles.avatarPickerBox}>
              <Text style={styles.avatarPickerHeading}>Choose Student Profile Photo:</Text>
              <View style={styles.avatarPickerRow}>
                {AVATAR_OPTIONS.map((av) => (
                  <TouchableOpacity
                    key={av.id}
                    style={[
                      styles.avatarPickCircle,
                      user?.profile_photo === av.url && styles.avatarPickSelected,
                    ]}
                    onPress={() => handleSelectAvatar(av.url)}
                    disabled={updatingPhoto}
                  >
                    <Image source={{ uri: av.url }} style={styles.avatarPickImg} />
                    {user?.profile_photo === av.url && (
                      <View style={styles.avatarPickBadge}>
                        <Ionicons name="checkmark" size={10} color="#000000" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {updatingPhoto && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 4 }} />}
            </View>
          )}

          <Text style={styles.userName}>
            {user?.name || 'Verified Student'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            {isVerifiedStudent ? (
              <VerifiedBadge size="medium" />
            ) : (
              <TouchableOpacity
                style={styles.unverifiedBtn}
                onPress={() => navigation.navigate('StudentVerification')}
              >
                <Text style={styles.unverifiedBtnText}>⚠️ Verify Student ID</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.studentIdBox}>{user?.student_id}</Text>
          </View>

          <Text style={styles.courseText}>
            {user?.course} • {user?.semester}
          </Text>

          {/* Dual Role Activity Counters */}
          <View style={styles.countersRow}>
            <View style={styles.counterBox}>
              <Text style={styles.counterVal}>{stats.completed_rides_as_driver || 0}</Text>
              <Text style={styles.counterLabel}>Rides Offered</Text>
            </View>
            <View style={styles.counterDiv} />
            <View style={styles.counterBox}>
              <Text style={styles.counterVal}>{stats.completed_rides_as_passenger || 0}</Text>
              <Text style={styles.counterLabel}>Rides Taken</Text>
            </View>
            <View style={styles.counterDiv} />
            <View style={styles.counterBox}>
              <Text style={styles.counterVal}>{stats.average_rating || 5.0} ★</Text>
              <Text style={styles.counterLabel}>Driver Rating</Text>
            </View>
          </View>
        </View>

        {/* Registered Vehicle Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Registered Car (Driver Module)</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OfferRideTab')}>
              <Text style={styles.sectionAction}>
                {primaryVehicle ? 'Offer Ride' : '+ Add Car'}
              </Text>
            </TouchableOpacity>
          </View>

          {primaryVehicle ? (
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleLeft}>
                <FontAwesome5 name="car" size={18} color={COLORS.navy} />
                <View>
                  <Text style={styles.vehicleModel}>{primaryVehicle.vehicle_model}</Text>
                  <Text style={styles.vehicleColour}>Colour: {primaryVehicle.colour}</Text>
                </View>
              </View>

              {/* Number Plate */}
              <View style={styles.plate}>
                <View style={styles.plateInd}>
                  <Text style={styles.plateIndText}>IND</Text>
                </View>
                <Text style={styles.plateText}>{primaryVehicle.registration_number}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noVehicleBox}>
              <Text style={styles.noVehicleText}>No personal car registered yet.</Text>
              <Text style={styles.noVehicleSub}>
                Publishing an offered ride will automatically register your vehicle.
              </Text>
            </View>
          )}
        </View>

        {/* Quick Access Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('StudentVerification')}
          >
            <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryLight }]}>
              <MaterialCommunityIcons name="shield-check" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>University ID Verification</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyPublishedRides')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#ECFDF5' }]}>
              <FontAwesome5 name="route" size={16} color={COLORS.emeraldDark} />
            </View>
            <Text style={styles.menuTitle}>My Published Rides</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#F8FAFC' }]}>
              <MaterialCommunityIcons name="ticket-outline" size={18} color={COLORS.navy} />
            </View>
            <Text style={styles.menuTitle}>My Bookings</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EmergencySOS')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning" size={18} color={COLORS.danger} />
            </View>
            <Text style={styles.menuTitle}>Emergency SOS & Contacts</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="help-circle-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>Help & Safety Guidelines</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

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
  scroll: {
    flex: 1,
    backgroundColor: '#090A0D',
  },
  content: {
    padding: 20,
    gap: 18,
  },
  profileCard: {
    backgroundColor: '#121318',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileAvatarImg: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#18181B',
    borderWidth: 2,
    borderColor: '#3F3F46',
  },
  profileInitialsAvatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#18181B',
    borderWidth: 2,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitialsText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
    cursor: 'pointer',
  },
  avatarPickerBox: {
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  avatarPickerHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    marginBottom: 8,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  avatarPickCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#27272A',
    position: 'relative',
    cursor: 'pointer',
  },
  avatarPickSelected: {
    borderColor: '#FFFFFF',
  },
  avatarPickImg: {
    width: '100%',
    height: '100%',
  },
  avatarPickBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  unverifiedBtn: {
    backgroundColor: '#18181B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  unverifiedBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  studentIdBox: {
    fontSize: 11,
    fontFamily: 'Courier',
    fontWeight: '800',
    color: '#E4E4E7',
    backgroundColor: '#18181B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  courseText: {
    fontSize: 11.5,
    color: '#A1A1AA',
    fontWeight: '600',
    marginTop: 4,
  },
  countersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  counterBox: {
    alignItems: 'center',
    flex: 1,
  },
  counterVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  counterLabel: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '600',
    marginTop: 2,
  },
  counterDiv: {
    width: 1,
    height: 24,
    backgroundColor: '#27272A',
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121318',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleModel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  vehicleColour: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  plate: {
    backgroundColor: '#181920',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    overflow: 'hidden',
  },
  plateInd: {
    backgroundColor: '#090A0D',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  plateIndText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
  },
  plateText: {
    paddingHorizontal: 6,
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  noVehicleBox: {
    backgroundColor: '#121318',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    gap: 2,
  },
  noVehicleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noVehicleSub: {
    fontSize: 11,
    color: '#71717A',
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: '#121318',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2028',
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#181920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
});
