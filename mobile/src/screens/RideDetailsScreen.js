import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../constants/theme';
import Header from '../components/Header';
import VerifiedBadge from '../components/VerifiedBadge';
import RatingStars from '../components/RatingStars';
import api from '../services/api';

export default function RideDetailsScreen({ navigation, route }) {
  const { rideId } = route.params || {};
  const { user, isVerifiedStudent, login } = useAuth();

  const [ride, setRide] = useState(null);
  const [userBooking, setUserBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [pickupNote, setPickupNote] = useState('');

  // Confirmation Panel States
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  const fetchRideDetails = async () => {
    try {
      const res = await api.get(`/rides/${rideId}`);
      if (res.data.success) {
        setRide(res.data.ride);
        setUserBooking(res.data.userBooking);
        if (res.data.userBooking && ['confirmed', 'accepted'].includes(res.data.userBooking.booking_status)) {
          setConfirmedBookingData(res.data.userBooking);
        }
      }
    } catch (e) {
      console.warn('Unable to load ride details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const handleOpenBookingPanel = () => {
    setBookingError('');
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    setBookingError('');
    setBookingLoading(true);

    try {
      // If not logged in or in guest mode, auto-sign in as student passenger for smooth carpool experience
      if (!user) {
        try {
          await login('ananya.gupta@cumail.in', 'Password@123');
        } catch (authErr) {
          console.warn('Auto login failed', authErr);
        }
      }

      const res = await api.post('/bookings', {
        ride_id: rideId,
        seats_booked: selectedSeats,
        pickup_note: pickupNote,
        auto_confirm: true, // Direct confirmed reservation
      });

      if (res.data.success) {
        setConfirmedBookingData(res.data.booking);
        setUserBooking(res.data.booking);
        fetchRideDetails();
      } else {
        setBookingError(res.data.message || 'Booking could not be confirmed.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(
        err.response?.data?.message || err.message || 'Failed to submit booking.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCallDriver = (phone) => {
    const targetPhone = phone || ride?.driver?.phone;
    if (targetPhone && !targetPhone.includes('*')) {
      Linking.openURL(`tel:${targetPhone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: COLORS.textSecondary, marginBottom: 10 }}>Ride not found or removed.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const driver = ride.driver || {};
  const vehicle = ride.vehicle_id || {};
  const stats = driver.stats || {};
  const totalCost = selectedSeats * ride.cost_per_seat;
  const isBooked = !!userBooking || !!confirmedBookingData;

  return (
    <View style={styles.container}>
      <Header
        title={`Ride to ${ride.destination}`}
        subtitle={`Departure at ${ride.departure_time}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Driver Profile Card */}
        <TouchableOpacity
          style={[styles.driverCard, SHADOWS.medium]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('DriverProfile', { driverId: driver._id })}
        >
          <View style={styles.driverLeft}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>
                {driver.name ? driver.name.charAt(0) : 'D'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>{driver.name || 'Ananya Sharma'}</Text>
                <VerifiedBadge size="small" />
              </View>
              <Text style={styles.driverCourse}>
                {driver.course || 'B.Tech CSE'} • {driver.semester || '6th Semester'}
              </Text>
              <View style={styles.driverRatingRow}>
                <RatingStars
                  rating={stats.average_rating || 5.0}
                  size={13}
                  count={stats.total_reviews || 2}
                />
                <Text style={styles.completedRidesText}>
                  • {stats.completed_rides_as_driver || 15} rides completed
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Vehicle Registration Card (High Visibility) */}
        <View style={styles.vehicleSection}>
          <View style={styles.vehicleHeader}>
            <FontAwesome5 name="car-alt" size={16} color={COLORS.navy} />
            <Text style={styles.vehicleSectionTitle}>Vehicle Details</Text>
          </View>

          <View style={styles.vehicleDetailsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleModel}>{vehicle.vehicle_model || 'Hyundai i10'}</Text>
              <Text style={styles.vehicleSub}>
                Colour: {vehicle.colour || 'Silver'} • {vehicle.vehicle_type || 'Hatchback'}
              </Text>
            </View>

            {/* UP License Plate Box */}
            <View style={styles.licensePlateBox}>
              <View style={styles.plateIndBadge}>
                <Text style={styles.plateIndText}>IND</Text>
              </View>
              <Text style={styles.plateRegText}>
                {vehicle.registration_number || 'UP32 AB 1234'}
              </Text>
            </View>
          </View>

          <View style={styles.vehicleFeaturesRow}>
            <View style={styles.featurePill}>
              <Ionicons
                name={ride.ac_available ? 'snow' : 'snow-outline'}
                size={14}
                color={ride.ac_available ? '#0284C7' : COLORS.textMuted}
              />
              <Text style={styles.featurePillText}>
                {ride.ac_available ? 'AC Equipped' : 'Non-AC'}
              </Text>
            </View>

            <View style={styles.featurePill}>
              <Ionicons name="people-outline" size={14} color={COLORS.emeraldDark} />
              <Text style={styles.featurePillText}>
                {ride.available_seats} seat(s) available
              </Text>
            </View>
          </View>
        </View>

        {/* Route Timeline */}
        <View style={styles.routeSection}>
          <Text style={styles.sectionHeaderTitle}>Journey Itinerary</Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineIconWrapper}>
              <View style={styles.startDot} />
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.timeTagRow}>
                <Text style={styles.timelineTime}>{ride.departure_time}</Text>
                <Text style={styles.dateBadge}>{ride.journey_date}</Text>
              </View>
              <Text style={styles.stopName}>{ride.source}</Text>
              <Text style={styles.stopSub}>Pickup Point: {ride.pickup_location}</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineIconWrapper}>
              <Ionicons name="location" size={18} color={COLORS.danger} />
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.timeTagRow}>
                <Text style={styles.destinationTitle}>{ride.destination}</Text>
                {ride.expected_arrival ? (
                  <Text style={styles.etaBadge}>ETA: {ride.expected_arrival}</Text>
                ) : null}
              </View>
              <Text style={styles.stopSub}>Drop Point: {ride.drop_location}</Text>
            </View>
          </View>
        </View>

        {/* Driver Instructions */}
        {ride.instructions ? (
          <View style={styles.instructionsBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.instructionHeading}>Driver Instructions</Text>
              <Text style={styles.instructionBody}>{ride.instructions}</Text>
            </View>
          </View>
        ) : null}

        {/* Contact Protection / Revealed Details */}
        <View style={[styles.contactNotice, isBooked && styles.contactNoticeConfirmed]}>
          <Ionicons
            name={isBooked || driver.isPhoneRevealed ? 'call' : 'lock-closed'}
            size={18}
            color={isBooked || driver.isPhoneRevealed ? '#059669' : COLORS.navyLight}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactNoticeTitle}>
              {isBooked || driver.isPhoneRevealed
                ? `Driver Mobile: ${driver.phone || '9876500001'}`
                : `Driver Phone: ${driver.phone}`}
            </Text>
            <Text style={styles.contactNoticeSub}>
              {isBooked || driver.isPhoneRevealed
                ? 'Contact details are active for your confirmed trip. You can call the driver anytime.'
                : 'Mobile number is masked for student privacy and revealed upon booking confirmation.'}
            </Text>
          </View>
          {(isBooked || driver.isPhoneRevealed) && (
            <TouchableOpacity
              style={styles.callSmallBtn}
              onPress={() => handleCallDriver(driver.phone)}
            >
              <Ionicons name="call" size={15} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Seat Selection Card (Always available when seats are available) */}
        {ride.available_seats > 0 && !isBooked && (
          <View style={styles.seatSelectionSection}>
            <View style={styles.seatHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Select Number of Seats</Text>
              <Text style={styles.remainingSeatsLabel}>
                {ride.available_seats} remaining
              </Text>
            </View>

            <View style={styles.seatSelectorRow}>
              {[1, 2, 3].filter((n) => n <= ride.available_seats).map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.seatSelectBtn,
                    selectedSeats === n && styles.seatSelectBtnActive,
                  ]}
                  onPress={() => setSelectedSeats(n)}
                >
                  <Ionicons
                    name="person"
                    size={16}
                    color={selectedSeats === n ? COLORS.white : COLORS.primary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={[
                      styles.seatSelectText,
                      selectedSeats === n && styles.seatSelectTextActive,
                    ]}
                  >
                    {n} Seat{n > 1 ? 's' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.seatPriceSmall,
                      selectedSeats === n && styles.seatPriceSmallActive,
                    ]}
                  >
                    ₹{n * ride.cost_per_seat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Confirmed Banner in page body */}
        {isBooked && (
          <View style={styles.bookedBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.bookedBannerTitle}>You have booked this ride! 🎉</Text>
              <Text style={styles.bookedBannerSub}>
                Your seat is confirmed with {driver.name || 'driver'}. Tap below to view full details.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bookedBannerBtn}
              onPress={() => setIsConfirmationModalOpen(true)}
            >
              <Text style={styles.bookedBannerBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Bar: Cost Summary & Action */}
      <View style={[styles.bottomBar, SHADOWS.large]}>
        <View style={styles.priceSummary}>
          <Text style={styles.priceTotal}>₹{totalCost}</Text>
          <Text style={styles.priceBreakdown}>
            {selectedSeats} seat{selectedSeats > 1 ? 's' : ''} × ₹{ride.cost_per_seat} per seat
          </Text>
        </View>

        {isBooked ? (
          <TouchableOpacity
            style={styles.viewBookingBtn}
            onPress={() => setIsConfirmationModalOpen(true)}
            activeOpacity={0.88}
          >
            <Ionicons name="receipt-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.viewBookingBtnText}>Booking Confirmed</Text>
          </TouchableOpacity>
        ) : ride.available_seats === 0 ? (
          <View style={styles.fullyBookedBadge}>
            <Text style={styles.fullyBookedText}>All Seats Reserved</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.bookNowActionBtn}
            onPress={handleOpenBookingPanel}
            activeOpacity={0.88}
          >
            <Ionicons name="flash" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.bookNowActionBtnText}>
              Book {selectedSeats} Seat{selectedSeats > 1 ? 's' : ''} Now
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ========================================================================= */}
      {/* 🚀 CONFIRMATION PANEL (MODAL)                                             */}
      {/* ========================================================================= */}
      <Modal
        visible={isConfirmationModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmationModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmationPanel, SHADOWS.large]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {confirmedBookingData ? 'Booking Confirmed! 🎉' : 'Confirm Ride Booking'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {confirmedBookingData
                    ? 'Your seat has been reserved with driver'
                    : 'Chandigarh University UP Carpool & Fuel Share'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsConfirmationModalOpen(false)}
              >
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {confirmedBookingData ? (
                /* ======================================================= */
                /* SUCCESS STATE IN CONFIRMATION PANEL                     */
                /* ======================================================= */
                <View style={styles.successStateBox}>
                  <View style={styles.successIconCircle}>
                    <Ionicons name="checkmark-done-circle" size={54} color="#059669" />
                  </View>
                  <Text style={styles.successHeading}>Seat Successfully Reserved!</Text>
                  <Text style={styles.successDesc}>
                    You are confirmed for the ride to <Text style={{ fontWeight: '800' }}>{ride.destination}</Text> on{' '}
                    <Text style={{ fontWeight: '800' }}>{ride.journey_date}</Text> at{' '}
                    <Text style={{ fontWeight: '800' }}>{ride.departure_time}</Text>.
                  </Text>

                  {/* Confirmed Trip Details Card */}
                  <View style={styles.confirmedSummaryCard}>
                    <View style={styles.confirmedRow}>
                      <Text style={styles.confirmedLabel}>Student Driver:</Text>
                      <Text style={styles.confirmedValue}>{driver.name || 'Ananya Sharma'}</Text>
                    </View>
                    <View style={styles.confirmedRow}>
                      <Text style={styles.confirmedLabel}>Vehicle Plate:</Text>
                      <View style={styles.plateSmall}>
                        <Text style={styles.plateSmallText}>
                          {vehicle.registration_number || 'UP32 AB 1234'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.confirmedRow}>
                      <Text style={styles.confirmedLabel}>Driver Mobile:</Text>
                      <TouchableOpacity
                        style={styles.phoneClickRow}
                        onPress={() => handleCallDriver(driver.phone)}
                      >
                        <Ionicons name="call" size={13} color="#059669" />
                        <Text style={styles.phoneClickText}>{driver.phone || '9876500001'}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.confirmedRow}>
                      <Text style={styles.confirmedLabel}>Pickup Point:</Text>
                      <Text style={styles.confirmedValue}>{ride.pickup_location}</Text>
                    </View>
                    <View style={styles.confirmedRow}>
                      <Text style={styles.confirmedLabel}>Total Contribution:</Text>
                      <Text style={styles.confirmedValuePrice}>₹{totalCost}</Text>
                    </View>
                    <View style={styles.paymentNoticeBox}>
                      <Ionicons name="information-circle" size={16} color="#0284C7" />
                      <Text style={styles.paymentNoticeText}>
                        Pay ₹{totalCost} directly to the student driver via UPI or Cash after the trip.
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.successActionButtons}>
                    <TouchableOpacity
                      style={styles.callDriverActionBtn}
                      onPress={() => handleCallDriver(driver.phone)}
                    >
                      <Ionicons name="call" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                      <Text style={styles.callDriverActionBtnText}>Call Driver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.viewMyBookingsBtn}
                      onPress={() => {
                        setIsConfirmationModalOpen(false);
                        navigation.navigate('MyBookings');
                      }}
                    >
                      <Text style={styles.viewMyBookingsBtnText}>My Bookings ➔</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* ======================================================= */
                /* REVIEW & CONFIRM STATE IN CONFIRMATION PANEL            */
                /* ======================================================= */
                <View>
                  {/* Route & Timing Highlight */}
                  <View style={styles.panelRouteCard}>
                    <View style={styles.panelRouteTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.panelFromCity}>CUUP Campus, Lucknow</Text>
                        <Text style={styles.panelPickupSub}>{ride.pickup_location}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={18} color={COLORS.primary} style={{ marginHorizontal: 8 }} />
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.panelToCity}>{ride.destination}</Text>
                        <Text style={styles.panelDropSub}>{ride.drop_location}</Text>
                      </View>
                    </View>

                    <View style={styles.panelTimeBadgeRow}>
                      <View style={styles.panelBadge}>
                        <Ionicons name="calendar-outline" size={13} color={COLORS.navy} />
                        <Text style={styles.panelBadgeText}>{ride.journey_date}</Text>
                      </View>
                      <View style={[styles.panelBadge, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="time" size={13} color={COLORS.primary} />
                        <Text style={[styles.panelBadgeText, { color: COLORS.primary, fontWeight: '800' }]}>
                          Departure: {ride.departure_time}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Driver & Car Summary */}
                  <View style={styles.panelDriverBox}>
                    <View style={styles.panelDriverLeft}>
                      <View style={styles.driverSmallAvatar}>
                        <Text style={styles.driverSmallAvatarText}>
                          {driver.name ? driver.name.charAt(0) : 'A'}
                        </Text>
                      </View>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.panelDriverName}>{driver.name || 'Ananya Sharma'}</Text>
                          <VerifiedBadge size="small" />
                        </View>
                        <Text style={styles.panelVehicleText}>
                          {vehicle.vehicle_model || 'Hyundai i10'} • {vehicle.colour || 'Silver'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.plateMini}>
                      <Text style={styles.plateMiniText}>
                        {vehicle.registration_number || 'UP32 AB 1234'}
                      </Text>
                    </View>
                  </View>

                  {/* Seat Adjustment inside Panel */}
                  <View style={styles.panelSeatRow}>
                    <View>
                      <Text style={styles.panelSeatLabel}>Seats to Reserve</Text>
                      <Text style={styles.panelSeatSub}>₹{ride.cost_per_seat} per seat</Text>
                    </View>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={[styles.stepperBtn, selectedSeats <= 1 && { opacity: 0.5 }]}
                        onPress={() => setSelectedSeats((s) => Math.max(1, s - 1))}
                        disabled={selectedSeats <= 1}
                      >
                        <Ionicons name="remove" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{selectedSeats}</Text>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          selectedSeats >= ride.available_seats && { opacity: 0.5 },
                        ]}
                        onPress={() => setSelectedSeats((s) => Math.min(ride.available_seats, s + 1))}
                        disabled={selectedSeats >= ride.available_seats}
                      >
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Fare Breakdown */}
                  <View style={styles.fareBreakdownCard}>
                    <View style={styles.fareRow}>
                      <Text style={styles.fareLabel}>Per Seat Fuel Share</Text>
                      <Text style={styles.fareVal}>₹{ride.cost_per_seat}</Text>
                    </View>
                    <View style={styles.fareRow}>
                      <Text style={styles.fareLabel}>Number of Seats</Text>
                      <Text style={styles.fareVal}>× {selectedSeats}</Text>
                    </View>
                    <View style={styles.fareDivider} />
                    <View style={styles.fareTotalRow}>
                      <Text style={styles.fareTotalLabel}>Total Travel Contribution</Text>
                      <Text style={styles.fareTotalVal}>₹{totalCost}</Text>
                    </View>
                    <Text style={styles.paymentInfoText}>
                      • Pay directly to student driver via UPI or Cash upon pickup.
                    </Text>
                  </View>

                  {/* Optional Note */}
                  <View style={styles.pickupNoteGroup}>
                    <Text style={styles.pickupNoteLabel}>Pickup Note for Driver (Optional)</Text>
                    <TextInput
                      style={styles.pickupNoteInput}
                      placeholder="e.g. Waiting near Gate 2 security guard"
                      value={pickupNote}
                      onChangeText={setPickupNote}
                    />
                  </View>

                  {bookingError ? (
                    <View style={styles.errorBanner}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.errorBannerText}>{bookingError}</Text>
                    </View>
                  ) : null}

                  {/* Action Buttons */}
                  <TouchableOpacity
                    style={[styles.confirmFinalBtn, bookingLoading && { opacity: 0.8 }]}
                    onPress={handleConfirmBooking}
                    disabled={bookingLoading}
                    activeOpacity={0.88}
                  >
                    {bookingLoading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                        <Text style={styles.confirmFinalBtnText}>
                          Confirm & Book {selectedSeats} Seat{selectedSeats > 1 ? 's' : ''} (₹{totalCost})
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelModalBtn}
                    onPress={() => setIsConfirmationModalOpen(false)}
                    disabled={bookingLoading}
                  >
                    <Text style={styles.cancelModalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  driverCourse: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  driverRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  completedRidesText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  vehicleSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  vehicleSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
    textTransform: 'uppercase',
  },
  vehicleDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  vehicleSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  licensePlateBox: {
    backgroundColor: COLORS.plateYellow,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  plateIndBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  plateIndText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '900',
  },
  plateRegText: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  vehicleFeaturesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  featurePill: {
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
  featurePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  routeSection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineIconWrapper: {
    width: 24,
    alignItems: 'center',
  },
  startDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.emerald,
    marginTop: 3,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
  },
  timeTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.navy,
  },
  dateBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stopName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  stopSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  destinationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  etaBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emeraldDark,
  },
  instructionsBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 18,
  },
  instructionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  instructionBody: {
    fontSize: 11.5,
    color: '#1E3A8A',
    marginTop: 2,
    lineHeight: 16,
  },
  contactNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  contactNoticeConfirmed: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  contactNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  contactNoticeSub: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  callSmallBtn: {
    backgroundColor: '#059669',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatSelectionSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  seatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  remainingSeatsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  seatSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  seatSelectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#181920',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#27272A',
  },
  seatSelectBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  seatSelectText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A1A1AA',
  },
  seatSelectTextActive: {
    color: '#090A0D',
  },
  seatPriceSmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  seatPriceSmallActive: {
    color: '#DBEAFE',
  },
  bookedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  bookedBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#047857',
  },
  bookedBannerSub: {
    fontSize: 11,
    color: '#065F46',
    marginTop: 2,
  },
  bookedBannerBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookedBannerBtnText: {
    color: COLORS.white,
    fontSize: 11.5,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#090A0D',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  priceSummary: {
    gap: 2,
  },
  priceTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.navy,
  },
  priceBreakdown: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bookNowActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookNowActionBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  viewBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 16,
  },
  viewBookingBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  fullyBookedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  fullyBookedText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  // Modal / Confirmation Panel Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationPanel: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#121318',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#27272A',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  panelRouteCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  panelRouteTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  panelFromCity: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  panelPickupSub: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  panelToCity: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  panelDropSub: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 1,
    textAlign: 'right',
  },
  panelTimeBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderColor: '#EDF2F7',
    paddingTop: 8,
  },
  panelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  panelBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.navy,
  },
  panelDriverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  panelDriverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  driverSmallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverSmallAvatarText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  panelDriverName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  panelVehicleText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  plateMini: {
    backgroundColor: COLORS.plateYellow,
    borderWidth: 1,
    borderColor: '#0F172A',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  plateMiniText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  panelSeatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181920',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 12,
  },
  panelSeatLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  panelSeatSub: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121318',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#181920',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    minWidth: 20,
    textAlign: 'center',
  },
  fareBreakdownCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fareLabel: {
    fontSize: 11.5,
    color: '#1E3A8A',
  },
  fareVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  fareDivider: {
    height: 1,
    backgroundColor: '#DBEAFE',
    marginVertical: 6,
  },
  fareTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fareTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  fareTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E40AF',
  },
  paymentInfoText: {
    fontSize: 10.5,
    color: '#2563EB',
    fontStyle: 'italic',
  },
  pickupNoteGroup: {
    marginBottom: 12,
  },
  pickupNoteLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pickupNoteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorBannerText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  confirmFinalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 48,
    borderRadius: 14,
    marginBottom: 8,
  },
  confirmFinalBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  cancelModalBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  cancelModalBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  // Success View in Modal
  successStateBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successIconCircle: {
    marginBottom: 8,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 4,
  },
  successDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  confirmedSummaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 8,
  },
  confirmedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmedLabel: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  confirmedValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  confirmedValuePrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  plateSmall: {
    backgroundColor: COLORS.plateYellow,
    borderWidth: 1,
    borderColor: '#0F172A',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  plateSmallText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  phoneClickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phoneClickText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  paymentNoticeBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  paymentNoticeText: {
    fontSize: 10.5,
    color: '#1E40AF',
    lineHeight: 14,
    flex: 1,
  },
  successActionButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  callDriverActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 46,
    borderRadius: 14,
  },
  callDriverActionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  viewMyBookingsBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
    height: 46,
    borderRadius: 14,
  },
  viewMyBookingsBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
