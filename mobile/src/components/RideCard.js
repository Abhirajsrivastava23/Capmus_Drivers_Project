import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import VerifiedBadge from './VerifiedBadge';
import RatingStars from './RatingStars';

export default function RideCard({ ride, onPress, onBookNow }) {
  if (!ride) return null;

  const driver = ride.driver || {};
  const vehicle = ride.vehicle || {};
  const stats = driver.stats || {};

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.medium]}
      activeOpacity={0.92}
      onPress={onPress}
    >
      {/* Top Header: Driver Information & Verified Badge */}
      <View style={styles.headerRow}>
        <View style={styles.driverInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
            </Text>
          </View>
          <View style={styles.driverMeta}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.driverName} numberOfLines={1}>
                {driver.name || 'Student Driver'}
              </Text>
              <VerifiedBadge size="small" />
            </View>
            <View style={styles.ratingRow}>
              <RatingStars
                rating={stats.average_rating || 5.0}
                size={12}
                count={stats.total_reviews || 0}
              />
              <Text style={styles.ridesCountDot}>•</Text>
              <Text style={styles.ridesCountText}>
                {stats.completed_rides_as_driver || 0} rides completed
              </Text>
            </View>
          </View>
        </View>

        {/* Cost per seat */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>₹{ride.cost_per_seat}</Text>
          <Text style={styles.priceSub}>per seat</Text>
        </View>
      </View>

      {/* Prominent Vehicle Identification Card */}
      <View style={styles.vehicleBanner}>
        <View style={styles.vehicleLeft}>
          <FontAwesome5 name="car" size={13} color={COLORS.navyLight} />
          <Text style={styles.vehicleModel} numberOfLines={1}>
            {vehicle.model || 'Student Car'}
          </Text>
          {ride.ac_available && (
            <View style={styles.acTag}>
              <Ionicons name="snow" size={10} color="#0284C7" />
              <Text style={styles.acText}>AC</Text>
            </View>
          )}
        </View>

        {/* High-visibility Indian License Plate Box */}
        <View style={styles.licensePlate}>
          <View style={styles.plateInd}>
            <Text style={styles.plateIndText}>IND</Text>
          </View>
          <Text style={styles.plateNumber}>
            {vehicle.registration_number || 'UP32 AB 1234'}
          </Text>
        </View>
      </View>

      {/* Route & Timing Itinerary */}
      <View style={styles.routeContainer}>
        {/* Departure */}
        <View style={styles.routeStop}>
          <View style={styles.stopIconWrapper}>
            <View style={styles.stopDotGreen} />
            <View style={styles.stopDottedLine} />
          </View>
          <View style={styles.stopDetails}>
            <View style={styles.timeLocationRow}>
              <Text style={styles.timeText}>{ride.departure_time}</Text>
              <Text style={styles.dateBadge}>{ride.journey_date}</Text>
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {ride.source || 'Chandigarh University UP Campus, Lucknow'}
            </Text>
            <Text style={styles.pickupDetail} numberOfLines={1}>
              Pickup: {ride.pickup_location}
            </Text>
          </View>
        </View>

        {/* Destination */}
        <View style={styles.routeStop}>
          <View style={styles.stopIconWrapper}>
            <Ionicons name="location" size={16} color={COLORS.danger} />
          </View>
          <View style={styles.stopDetails}>
            <View style={styles.timeLocationRow}>
              <Text style={styles.destinationName}>{ride.destination}</Text>
              {ride.expected_arrival ? (
                <Text style={styles.etaText}>ETA: {ride.expected_arrival}</Text>
              ) : null}
            </View>
            <Text style={styles.pickupDetail} numberOfLines={1}>
              Drop: {ride.drop_location}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Info & Actions */}
      <View style={styles.cardFooter}>
        <View style={styles.seatBadge}>
          <Ionicons name="people" size={14} color="#FFFFFF" />
          <Text style={styles.seatCountText}>
            <Text style={styles.boldSeats}>{ride.available_seats}</Text> seat{ride.available_seats !== 1 ? 's' : ''} left
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.85}
          onPress={onBookNow || onPress}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={14} color="#000000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121318',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverMeta: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ridesCountDot: {
    color: '#71717A',
    fontSize: 10,
  },
  ridesCountText: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priceSub: {
    fontSize: 10,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  vehicleBanner: {
    backgroundColor: '#181920',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  vehicleModel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    maxWidth: 130,
  },
  acTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#1E2028',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  acText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  licensePlate: {
    backgroundColor: '#1E2028',
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
    fontSize: 7.5,
    fontWeight: '900',
  },
  plateNumber: {
    paddingHorizontal: 6,
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  routeContainer: {
    marginBottom: 14,
  },
  routeStop: {
    flexDirection: 'row',
    minHeight: 46,
  },
  stopIconWrapper: {
    width: 22,
    alignItems: 'center',
  },
  stopDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  stopDottedLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: '#3F3F46',
    marginVertical: 3,
  },
  stopDetails: {
    flex: 1,
    paddingLeft: 8,
  },
  timeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E4E4E7',
    backgroundColor: '#1E2028',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  destinationName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  locationText: {
    fontSize: 12,
    color: '#D4D4D8',
    fontWeight: '500',
    marginTop: 1,
  },
  pickupDetail: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  etaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  seatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#181920',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  seatCountText: {
    fontSize: 12,
    color: '#E4E4E7',
    fontWeight: '600',
  },
  boldSeats: {
    fontWeight: '800',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 14,
  },
  bookButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
