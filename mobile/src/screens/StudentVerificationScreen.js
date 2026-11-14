import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../constants/theme';
import Header from '../components/Header';
import VerifiedBadge from '../components/VerifiedBadge';
import api from '../services/api';

export default function StudentVerificationScreen({ navigation }) {
  const { user, refreshProfile, isVerifiedStudent } = useAuth();

  const [studentIdNumber, setStudentIdNumber] = useState(user?.student_id || '');
  const [course, setCourse] = useState(user?.course || 'B.Tech CSE');
  const [semester, setSemester] = useState(user?.semester || '6th Semester');
  const [department, setDepartment] = useState('Engineering & Technology');
  const [frontImage, setFrontImage] = useState(
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'
  );

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.student_id) setStudentIdNumber(user.student_id);
    if (user?.course) setCourse(user.course);
    if (user?.semester) setSemester(user.semester);
  }, [user]);

  const handleSubmitVerification = async () => {
    if (!studentIdNumber) {
      Alert.alert('Missing Field', 'Please enter your Chandigarh University Student Roll / ID number.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/submit-student-verification', {
        student_id_number: studentIdNumber.trim().toUpperCase(),
        course,
        semester,
        department,
        id_card_front_image: frontImage,
      });

      await refreshProfile();
      setSubmitted(true);
      Alert.alert(
        'ID Submitted Successfully! 🎓',
        'Your student ID has been sent to Chandigarh University transport administration for review. Approval takes less than 24 hours.'
      );
    } catch (err) {
      Alert.alert('Submission Error', err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Student ID Verification"
        subtitle="Mandatory for carpooling privileges"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Verification Status Banner */}
        <View
          style={[
            styles.statusBanner,
            isVerifiedStudent
              ? styles.statusVerified
              : user?.verification_status === 'pending'
              ? styles.statusPending
              : styles.statusUnverified,
          ]}
        >
          <View style={styles.statusIconBox}>
            <MaterialCommunityIcons
              name={
                isVerifiedStudent
                  ? 'shield-check'
                  : user?.verification_status === 'pending'
                  ? 'clock-outline'
                  : 'shield-alert-outline'
              }
              size={24}
              color={
                isVerifiedStudent
                  ? COLORS.emeraldDark
                  : user?.verification_status === 'pending'
                  ? '#B45309'
                  : COLORS.danger
              }
            />
          </View>
          <View style={styles.statusTextBox}>
            <Text style={styles.statusTitle}>
              {isVerifiedStudent
                ? 'Account Verified Student'
                : user?.verification_status === 'pending'
                ? 'Verification Under Review'
                : 'ID Verification Required'}
            </Text>
            <Text style={styles.statusDesc}>
              {isVerifiedStudent
                ? 'Your student identity is officially approved. You can offer and book campus rides.'
                : user?.verification_status === 'pending'
                ? 'Submitted ID is being verified by university administration.'
                : 'Upload your Chandigarh University ID card to unlock ride sharing.'}
            </Text>
          </View>
        </View>

        {/* Student ID Card Simulation Card */}
        <View style={[styles.idCardContainer, SHADOWS.medium]}>
          <View style={styles.idCardHeader}>
            <View>
              <Text style={styles.cuTitle}>CHANDIGARH UNIVERSITY</Text>
              <Text style={styles.cuCampus}>UTTAR PRADESH • LUCKNOW CAMPUS</Text>
            </View>
            <FontAwesome5 name="university" size={18} color={COLORS.navy} />
          </View>

          <View style={styles.idCardBody}>
            <View style={styles.idPhotoPlaceholder}>
              <FontAwesome5 name="user-graduate" size={28} color={COLORS.primary} />
            </View>

            <View style={styles.idDetails}>
              <Text style={styles.studentNameText}>{user?.name || 'Student Name'}</Text>
              <Text style={styles.rollNoText}>
                ID: {studentIdNumber || user?.student_id || 'CUUP2024CS0142'}
              </Text>
              <Text style={styles.degreeText}>
                {course} • {semester}
              </Text>
              <Text style={styles.deptText}>{department}</Text>
            </View>
          </View>

          <View style={styles.idCardFooter}>
            <VerifiedBadge size="small" />
            <Text style={styles.validText}>Valid for Session 2024-2027</Text>
          </View>
        </View>

        {/* Form Fields for ID Submission */}
        {!isVerifiedStudent && (
          <View style={styles.formSection}>
            <Text style={styles.formHeading}>Update / Submit ID Details</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>University Roll / Student ID *</Text>
              <TextInput
                style={styles.input}
                value={studentIdNumber}
                onChangeText={setStudentIdNumber}
                placeholder="e.g. CUUP2024CS0142"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Course / Degree</Text>
                <TextInput
                  style={styles.input}
                  value={course}
                  onChangeText={setCourse}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Semester</Text>
                <TextInput
                  style={styles.input}
                  value={semester}
                  onChangeText={setSemester}
                />
              </View>
            </View>

            <View style={styles.uploadCard}>
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
              <Text style={styles.uploadTitle}>ID Card Document Linked</Text>
              <Text style={styles.uploadSubtitle}>
                Verified high-resolution digital student identity record
              </Text>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitVerification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>Submit for ID Clearance</Text>
              )}
            </TouchableOpacity>
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
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusVerified: {
    backgroundColor: '#0C2419',
    borderColor: '#134E35',
  },
  statusPending: {
    backgroundColor: '#261F0E',
    borderColor: '#4A3B14',
  },
  statusUnverified: {
    backgroundColor: '#2A1215',
    borderColor: '#4C1D24',
  },
  statusIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextBox: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statusDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  idCardContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cuTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: 0.5,
  },
  cuCampus: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
  },
  idCardBody: {
    flexDirection: 'row',
    paddingVertical: 14,
    gap: 14,
    alignItems: 'center',
  },
  idPhotoPlaceholder: {
    width: 64,
    height: 74,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  idDetails: {
    flex: 1,
  },
  studentNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rollNoText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
    fontFamily: 'Courier',
    marginTop: 2,
  },
  degreeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  deptText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  validText: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  formSection: {
    gap: 12,
  },
  formHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formGroup: {
    gap: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: '#14151D',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: '#FFFFFF',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
  uploadCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginVertical: 8,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  uploadSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    cursor: 'pointer',
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
