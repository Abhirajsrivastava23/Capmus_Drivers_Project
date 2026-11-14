import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { UNIVERSITY_INFO, POPULAR_DESTINATIONS } from '../constants/cities';
import Header from '../components/Header';
import api from '../services/api';

export default function OfferRideScreen({ navigation }) {
  const { user, isVerifiedStudent, login } = useAuth();
  const scrollViewRef = React.useRef(null);

  const [source, setSource] = useState(UNIVERSITY_INFO.defaultOrigin);
  const [destination, setDestination] = useState('Kanpur');
  const [pickupLocation, setPickupLocation] = useState(UNIVERSITY_INFO.defaultPickup);
  const [dropLocation, setDropLocation] = useState('Kanpur Central / Mall Road');
  const [journeyDate, setJourneyDate] = useState('2026-11-20');
  const [departureTime, setDepartureTime] = useState('04:30 PM');
  const [expectedArrival, setExpectedArrival] = useState('');
  const [availableSeats, setAvailableSeats] = useState('3');
  const [costPerSeat, setCostPerSeat] = useState('250');
  const [acAvailable, setAcAvailable] = useState(true);
  const [instructions, setInstructions] = useState('Please arrive 10 mins early at CUUP main gate.');

  const [publishedRide, setPublishedRide] = useState(null);
  const [quickLoggingIn, setQuickLoggingIn] = useState(false);

  const handleQuickDriverLogin = async () => {
    setQuickLoggingIn(true);
    setErrorMessage('');
    try {
      await login('ananya.gupta@cumail.in', 'Password@123');
    } catch (e) {
      setErrorMessage('Sign in failed. Please use Login screen.');
    } finally {
      setQuickLoggingIn(false);
    }
  };

  const adjustTimeMinutes = (deltaMinutes) => {
    const match = departureTime.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    let hours = 16;
    let minutes = 30;
    let period = 'PM';

    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      period = match[3] ? match[3].toUpperCase() : (hours < 8 ? 'PM' : 'AM');
    }

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    let totalMinutes = hours * 60 + minutes + deltaMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);

    let newHours = Math.floor(totalMinutes / 60);
    let newMinutes = totalMinutes % 60;
    const newPeriod = newHours >= 12 ? 'PM' : 'AM';
    let displayHours = newHours % 12;
    if (displayHours === 0) displayHours = 12;

    const formatted = `${String(displayHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')} ${newPeriod}`;
    setDepartureTime(formatted);
  };

  // Vehicle Details
  const [vehicleModel, setVehicleModel] = useState('Hyundai i10');
  const [vehicleNumber, setVehicleNumber] = useState('UP32 AB 1234');
  const [colour, setColour] = useState('Silver');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePublishRide = async () => {
    setErrorMessage('');
    setPublishedRide(null);

    // If guest / not logged in, auto sign-in with verified driver account
    if (!user) {
      setQuickLoggingIn(true);
      try {
        await login('ananya.gupta@cumail.in', 'Password@123');
      } catch (e) {
        setErrorMessage('Please sign in with your student account to offer rides.');
        setQuickLoggingIn(false);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        return;
      }
      setQuickLoggingIn(false);
    }

    if (!destination || !pickupLocation || !dropLocation || !journeyDate || !departureTime || !costPerSeat) {
      setErrorMessage('Please complete all journey parameters (destination, pickup, drop, date, exact time, and cost).');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    if (!vehicleModel || !vehicleNumber || !colour) {
      setErrorMessage('Please provide your vehicle model, colour, and registration number (e.g. UP32 AB 1234).');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/rides', {
        source,
        destination: destination.trim(),
        pickup_location: pickupLocation.trim(),
        drop_location: dropLocation.trim(),
        journey_date: journeyDate.trim(),
        departure_time: departureTime.trim(),
        expected_arrival: expectedArrival ? expectedArrival.trim() : '',
        available_seats: Number(availableSeats) || 3,
        cost_per_seat: Number(costPerSeat) || 250,
        ac_available: acAvailable,
        instructions: instructions ? instructions.trim() : '',
        vehicle_model: vehicleModel.trim(),
        registration_number: vehicleNumber.trim().toUpperCase(),
        colour: colour.trim(),
      });

      if (res.data.success) {
        setPublishedRide(res.data.ride);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        // Automatically transition to Available Rides list after 1.5 seconds
        setTimeout(() => {
          navigation.navigate('FindRideTab');
        }, 1500);
      } else {
        setErrorMessage(res.data.message || 'Could not publish ride.');
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {
      console.error('Publish ride error:', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to publish ride.'
      );
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    setDestination(city.name);
    setDropLocation(city.drop);
    setCostPerSeat(String(city.avgCost));
    setExpectedArrival(city.estTime ? 'Approx ' + city.estTime : '');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Offer a Ride"
        subtitle="Publish your trip & share fuel expenses"
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {/* User Account / Driver Status Banner */}
        {user ? (
          <View style={styles.driverStatusBar}>
            <Ionicons name="shield-checkmark" size={18} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.driverStatusName}>
                Verified Driver: {user.name} ({user.student_id})
              </Text>
              <Text style={styles.driverStatusSub}>
                Chandigarh University UP • UP32 AB 1234
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.guestNoticeBox}>
            <Ionicons name="information-circle" size={20} color="#0284C7" />
            <View style={{ flex: 1 }}>
              <Text style={styles.guestNoticeTitle}>Browsing as Guest</Text>
              <Text style={styles.guestNoticeSub}>
                To offer rides, a verified CUUP student account is used.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.guestSignInBtn}
              onPress={handleQuickDriverLogin}
              disabled={quickLoggingIn}
            >
              <Text style={styles.guestSignInText}>
                {quickLoggingIn ? 'Signing in...' : 'Sign In as Driver'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Section 1: Route */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>1. Journey Route</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Starting Location (Origin)</Text>
            <TextInput
              style={styles.input}
              value={source}
              onChangeText={setSource}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination City *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kanpur, Unnao, Lucknow"
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          {/* Quick Select Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCitiesRow}>
            {POPULAR_DESTINATIONS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.cityBtn,
                  destination.toLowerCase() === c.name.toLowerCase() && styles.cityBtnActive,
                ]}
                onPress={() => handleCitySelect(c)}
              >
                <Text
                  style={[
                    styles.cityBtnText,
                    destination.toLowerCase() === c.name.toLowerCase() && styles.cityBtnTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exact Pickup Point *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. CUUP Main Gate (NH-27 Highway)"
              value={pickupLocation}
              onChangeText={setPickupLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exact Drop Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kanpur Central / Rawatpur / Mall Road"
              value={dropLocation}
              onChangeText={setDropLocation}
            />
          </View>
        </View>

        {/* Section 2: Departure Schedule */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>2. Departure Schedule</Text>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Departure Time *</Text>
            </View>

            {/* Departure Time Input with Quick Stepper */}
            <View style={styles.timeInputRow}>
              <TouchableOpacity
                style={styles.stepBtn}
                activeOpacity={0.7}
                onPress={() => adjustTimeMinutes(-15)}
              >
                <Ionicons name="remove-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.stepBtnText}>-15m</Text>
              </TouchableOpacity>

              <View style={styles.timeDisplayBox}>
                <Ionicons name="time" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.timeInputText}
                  value={departureTime}
                  onChangeText={setDepartureTime}
                  placeholder="04:30 PM"
                />
              </View>

              <TouchableOpacity
                style={styles.stepBtn}
                activeOpacity={0.7}
                onPress={() => adjustTimeMinutes(15)}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.stepBtnText}>+15m</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Time Preset Chips */}
            <View style={styles.timeChipsRow}>
              {[
                { label: '04:30 PM', val: '04:30 PM' },
                { label: '05:00 PM', val: '05:00 PM' },
                { label: '05:30 PM', val: '05:30 PM' },
                { label: '06:00 PM', val: '06:00 PM' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.val}
                  style={[
                    styles.timeChip,
                    departureTime === t.val && styles.timeChipActive,
                  ]}
                  onPress={() => setDepartureTime(t.val)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      departureTime === t.val && styles.timeChipTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Date Selector */}
          <View style={styles.dateChipsRow}>
            <Text style={styles.dateLabel}>Ride Date:</Text>
            {[
              { label: 'Today (20 Nov)', val: '2026-11-20' },
              { label: 'Tomorrow (21 Nov)', val: '2026-11-21' },
            ].map((d) => (
              <TouchableOpacity
                key={d.val}
                style={[
                  styles.dateChip,
                  journeyDate === d.val && styles.dateChipActive,
                ]}
                onPress={() => setJourneyDate(d.val)}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    journeyDate === d.val && styles.dateChipTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 3: Seats & Travel Cost */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>3. Seats & Cost Sharing</Text>

          <View style={styles.formRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Available Seats *</Text>
              <TextInput
                style={styles.input}
                placeholder="3"
                value={availableSeats}
                onChangeText={setAvailableSeats}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Cost Per Seat (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="250"
                value={costPerSeat}
                onChangeText={setCostPerSeat}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Air Conditioning (AC)</Text>
              <Text style={styles.switchDesc}>AC will be operating during highway drive</Text>
            </View>
            <Switch
              value={acAvailable}
              onValueChange={setAcAvailable}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
            />
          </View>
        </View>

        {/* Section 4: Vehicle Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>4. Personal Vehicle Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Car Make & Model *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Hyundai i10 / Maruti Swift / Honda City"
              value={vehicleModel}
              onChangeText={setVehicleModel}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.inputGroup, { flex: 1.3 }]}>
              <Text style={styles.label}>Vehicle Number (UP Registration) *</Text>
              <TextInput
                style={[styles.input, { fontFamily: 'Courier', fontWeight: '800' }]}
                placeholder="UP32 AB 1234"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                autoCapitalize="characters"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Colour *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Silver"
                value={colour}
                onChangeText={setColour}
              />
            </View>
          </View>
        </View>

        {/* Section 5: Instructions */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>5. Additional Journey Instructions</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]}
            placeholder="e.g. Music preferences, specific stopover points, co-traveler notes..."
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Error Notice Above Button */}
        {errorMessage ? (
          <View style={styles.errorBoxBottom}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorTextBottom}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Success Card Above Button */}
        {publishedRide ? (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={28} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>Journey Published & Live! 🚗</Text>
              <Text style={styles.successSub}>
                Your trip from Chandigarh University to {publishedRide.destination} ({publishedRide.departure_time}) is now active.
              </Text>
              <View style={styles.successBtnRow}>
                <TouchableOpacity
                  style={styles.successBtnPrimary}
                  onPress={() => navigation.navigate('FindRideTab')}
                >
                  <Text style={styles.successBtnPrimaryText}>View Available Rides ➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Publish Button */}
        <TouchableOpacity
          style={[styles.publishBtn, (loading || quickLoggingIn) && { opacity: 0.8 }]}
          onPress={handlePublishRide}
          disabled={loading || quickLoggingIn}
          activeOpacity={0.88}
        >
          {loading || quickLoggingIn ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.publishBtnText}>Publish Journey</Text>
          )}
        </TouchableOpacity>

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
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C1917',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#44403C',
  },
  errorText: {
    fontSize: 12,
    color: '#E4E4E7',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#121318',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 18,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E4E4E7',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 13,
    color: '#FFFFFF',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
  quickCitiesRow: {
    marginBottom: 12,
  },
  cityBtn: {
    backgroundColor: '#181920',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
    marginRight: 6,
  },
  cityBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  cityBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  cityBtnTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#27272A',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  switchDesc: {
    fontSize: 10.5,
    color: '#A1A1AA',
    marginTop: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hintText: {
    fontSize: 11,
    color: '#E4E4E7',
    fontWeight: '600',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 10,
    height: 48,
    borderRadius: 12,
    gap: 4,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeDisplayBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181920',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  timeInputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  timeChip: {
    backgroundColor: '#181920',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  timeChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  timeChipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  dateChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#27272A',
  },
  dateLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  dateChip: {
    backgroundColor: '#181920',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  dateChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  dateChipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  publishBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  publishBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  errorBoxBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  errorTextBottom: {
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  successCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 3,
  },
  successSub: {
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16,
    marginBottom: 10,
  },
  successBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  successBtnPrimary: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  successBtnPrimaryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  driverStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  driverStatusName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#166534',
  },
  driverStatusSub: {
    fontSize: 10.5,
    color: '#15803D',
    marginTop: 1,
  },
  guestNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  guestNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  guestNoticeSub: {
    fontSize: 10.5,
    color: '#1D4ED8',
    marginTop: 1,
  },
  guestSignInBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  guestSignInText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
