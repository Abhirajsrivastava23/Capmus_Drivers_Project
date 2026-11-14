import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

export default function WelcomeScreen({ navigation }) {
  const [isSignInHovered, setIsSignInHovered] = useState(false);
  const [isNewStudentHovered, setIsNewStudentHovered] = useState(false);

  const highlights = [
    {
      icon: 'shield-check',
      title: 'Verified Students Only',
      desc: 'Exclusive to Chandigarh University UP students with validated university student IDs.',
    },
    {
      icon: 'account-group',
      title: 'Travel Cost Sharing',
      desc: 'Share genuine fuel expenses with campus peers on journeys between Kanpur, Unnao & Lucknow.',
    },
    {
      icon: 'car-key',
      title: 'Transparent Vehicle ID',
      desc: 'Identify driver by real name, UP vehicle registration number, and verified 5-star driving ratings.',
    },
  ];

  return (
    <View style={styles.shell}>
      <View style={styles.innerContainer}>
        {/* Top Hero Banner */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadgeContainer}>
            <Image
              source={require('../../assets/campus_f1_square.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.heroTitle}>Campus Drivers</Text>
          <Text style={styles.heroSubtitle}>
            Chandigarh University Uttar Pradesh
          </Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>STUDENT-ONLY CARPOOLING</Text>
          </View>
        </View>

        {/* Main Content & Features */}
        <ScrollView
          style={styles.contentSection}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mainHeading}>
            Smart, Safe & Affordable Hometown Travel
          </Text>
          <Text style={styles.mainDesc}>
            Have an empty car seat or looking for a ride home? Connect directly with verified Chandigarh University peers travelling on your route.
          </Text>

          <View style={styles.featureList}>
            {highlights.map((item, idx) => (
              <View key={idx} style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Disclaimer Policy Card */}
          <View style={styles.policyCard}>
            <Ionicons name="information-circle" size={18} color="#A1A1AA" />
            <Text style={styles.policyText}>
              This is a student cost-sharing network for genuine travel expenses, not a commercial taxi service.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          {/* Primary Sign In Button with Hover */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSignInHovered && styles.primaryButtonHover,
            ]}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Login')}
            onMouseEnter={() => setIsSignInHovered(true)}
            onMouseLeave={() => setIsSignInHovered(false)}
          >
            <Ionicons
              name="log-in-outline"
              size={18}
              color="#000000"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.primaryButtonText}>Sign In to Account</Text>
          </TouchableOpacity>

          {/* New Student Option with Interactive Hover Effect */}
          <TouchableOpacity
            style={[
              styles.newStudentCard,
              isNewStudentHovered && styles.newStudentCardHover,
            ]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Register')}
            onMouseEnter={() => setIsNewStudentHovered(true)}
            onMouseLeave={() => setIsNewStudentHovered(false)}
          >
            <View style={styles.newStudentLeft}>
              <View
                style={[
                  styles.studentIconBox,
                  isNewStudentHovered && styles.studentIconBoxHover,
                ]}
              >
                <Ionicons
                  name="school"
                  size={18}
                  color={isNewStudentHovered ? '#000000' : '#FFFFFF'}
                />
              </View>
              <View style={styles.newStudentTextGroup}>
                <Text
                  style={[
                    styles.newStudentTitle,
                    isNewStudentHovered && styles.newStudentTitleHover,
                  ]}
                >
                  New Student?
                </Text>
                <Text
                  style={[
                    styles.newStudentSub,
                    isNewStudentHovered && styles.newStudentSubHover,
                  ]}
                >
                  Register with Chandigarh Univ ID
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.registerBadge,
                isNewStudentHovered && styles.registerBadgeHover,
              ]}
            >
              <Text
                style={[
                  styles.registerBadgeText,
                  isNewStudentHovered && styles.registerBadgeTextHover,
                ]}
              >
                Join Now →
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#090A0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#090A0D',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1E2028',
  },
  heroSection: {
    backgroundColor: '#000000',
    paddingTop: 44,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  logoBadgeContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '600',
    marginTop: 4,
  },
  tag: {
    marginTop: 10,
    backgroundColor: '#14151D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E4E4E7',
    letterSpacing: 0.8,
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#090A0D',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  mainHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  mainDesc: {
    fontSize: 12.5,
    color: '#A1A1AA',
    lineHeight: 19,
    marginTop: 6,
  },
  featureList: {
    marginTop: 18,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#14151D',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    padding: 12,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E2028',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featureDesc: {
    fontSize: 11.5,
    color: '#A1A1AA',
    lineHeight: 16,
    marginTop: 2,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#121318',
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 11,
    color: '#71717A',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
    backgroundColor: '#090A0D',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    cursor: 'pointer',
  },
  primaryButtonHover: {
    backgroundColor: '#E4E4E7',
    transform: [{ translateY: -1 }],
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  newStudentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#14151D',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    cursor: 'pointer',
  },
  newStudentCardHover: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    transform: [{ translateY: -2 }],
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  newStudentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  studentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E2028',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentIconBoxHover: {
    backgroundColor: '#E4E4E7',
  },
  newStudentTextGroup: {
    flex: 1,
  },
  newStudentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  newStudentTitleHover: {
    color: '#000000',
  },
  newStudentSub: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  newStudentSubHover: {
    color: '#3F3F46',
  },
  registerBadge: {
    backgroundColor: '#1E2028',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  registerBadgeHover: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  registerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  registerBadgeTextHover: {
    color: '#FFFFFF',
  },
});
