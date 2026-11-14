import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { POPULAR_DESTINATIONS, UNIVERSITY_INFO } from '../constants/cities';
import Header from '../components/Header';

export default function SearchRideScreen({ navigation, route }) {
  const prefillDestination = route?.params?.prefillDestination || '';

  const [destination, setDestination] = useState(prefillDestination);
  const [seats, setSeats] = useState(1);
  const [acOnly, setAcOnly] = useState(false);

  const handleSearch = () => {
    navigation.navigate('AvailableRides', {
      destination: destination.trim(),
      seats,
      acOnly,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Find a Campus Ride"
        subtitle="Search verified student drivers"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Origin Field (Fixed to Chandigarh University UP) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Leaving From</Text>
          <View style={styles.readonlyInput}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.originTitle}>{UNIVERSITY_INFO.defaultOrigin}</Text>
              <Text style={styles.originSub}>{UNIVERSITY_INFO.defaultPickup}</Text>
            </View>
          </View>
        </View>

        {/* Destination Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Going To *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="location" size={18} color="#FFFFFF" />
            <TextInput
              style={styles.textInput}
              placeholder="Enter destination city (e.g. Kanpur)"
              placeholderTextColor="#71717A"
              value={destination}
              onChangeText={setDestination}
            />
            {destination ? (
              <TouchableOpacity onPress={() => setDestination('')}>
                <Ionicons name="close-circle" size={16} color="#71717A" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Quick Destination Chips */}
        <View style={styles.chipsSection}>
          <Text style={styles.chipsLabel}>Popular UP Hometowns:</Text>
          <View style={styles.chipRow}>
            {POPULAR_DESTINATIONS.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={[
                  styles.cityChip,
                  destination.toLowerCase() === city.name.toLowerCase() && styles.cityChipActive,
                ]}
                onPress={() => setDestination(city.name)}
              >
                <Text
                  style={[
                    styles.cityChipText,
                    destination.toLowerCase() === city.name.toLowerCase() && styles.cityChipTextActive,
                  ]}
                >
                  {city.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Origin & Departure Info */}
        <View style={styles.departureBadge}>
          <Ionicons name="time-outline" size={15} color="#A1A1AA" />
          <Text style={styles.departureBadgeText}>
            Standard Campus Departure: 4:30 PM (Daily Out Time)
          </Text>
        </View>

        {/* Seats Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Seats Required</Text>
          <View style={styles.seatRow}>
            {[1, 2, 3, 4].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.seatPill, seats === num && styles.seatPillActive]}
                onPress={() => setSeats(num)}
              >
                <Ionicons
                  name="person"
                  size={14}
                  color={seats === num ? '#000000' : '#A1A1AA'}
                />
                <Text
                  style={[styles.seatText, seats === num && styles.seatTextActive]}
                >
                  {num} {num === 1 ? 'Seat' : 'Seats'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AC Preference Toggle */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Air Conditioned (AC) Vehicle Only</Text>
            <Text style={styles.switchSub}>Only show rides offering AC comfort</Text>
          </View>
          <Switch
            value={acOnly}
            onValueChange={setAcOnly}
            trackColor={{ false: '#27272A', true: '#FFFFFF' }}
            thumbColor={acOnly ? '#000000' : '#71717A'}
          />
        </View>

        {/* Search CTA Button */}
        <TouchableOpacity
          style={styles.searchBtn}
          activeOpacity={0.88}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={18} color="#000000" />
          <Text style={styles.searchBtnText}>Search Available Rides</Text>
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
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E4E4E7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  readonlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#121318',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  originTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  originSub: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121318',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  chipsSection: {
    marginBottom: 18,
  },
  chipsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cityChip: {
    backgroundColor: '#181920',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  cityChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  cityChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  cityChipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  seatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seatPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  seatPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  seatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  seatTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#27272A',
    marginBottom: 24,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  switchSub: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  departureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#181920',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  departureBadgeText: {
    color: '#D4D4D8',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
