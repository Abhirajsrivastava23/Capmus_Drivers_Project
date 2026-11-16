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
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';

const AVATAR_OPTIONS = [
  { id: 1, label: 'Student 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
  { id: 2, label: 'Student 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80' },
  { id: 3, label: 'Student 3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
  { id: 4, label: 'Student 4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
];

export default function StudentRegistrationScreen({ navigation, route }) {
  const { register } = useAuth();
  const prefilledPhone = route?.params?.prefilledPhone || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(prefilledPhone);
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  const handleRegister = async () => {
    setErrorMessage('');
    setIsAlreadyRegistered(false);

    if (!name.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }

    if (!studentId.trim()) {
      setErrorMessage('Please enter your University Roll / Student ID Number.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your University / Student Email Address.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your 10-digit Mobile Phone Number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Please create a password (minimum 6 characters).');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        student_id: studentId.trim().toUpperCase(),
        course: course.trim() || 'B.Tech CSE',
        semester: semester.trim() || '1st Semester',
        password,
        profile_photo: selectedAvatar,
        emergency_contact_name: emergencyName.trim() || 'Parent / Guardian',
        emergency_contact_phone: emergencyPhone.trim() || phone.trim(),
        emergency_contact_relation: emergencyRelation || 'Parent',
      });

      // Successful registration: Navigate directly into Main app tabs!
      navigation.replace('MainTabs');
    } catch (err) {
      const msg =
        err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))
          ? 'Registration request timed out. Please check your connection and retry.'
          : err.response?.data?.message || err.message || 'Registration failed. Please check your details.';
      setErrorMessage(msg);

      // If email or account is already registered, set state so user can navigate to Sign In
      if (
        err.response?.data?.alreadyRegistered ||
        msg.toLowerCase().includes('already') ||
        msg.toLowerCase().includes('exists')
      ) {
        setIsAlreadyRegistered(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Student Registration"
        subtitle="Chandigarh University Uttar Pradesh"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Error Banner / Already Registered Card */}
        {errorMessage ? (
          <View style={[styles.errorBox, isAlreadyRegistered && styles.alreadyRegisteredBox]}>
            <View style={styles.errorHeaderRow}>
              <Ionicons
                name={isAlreadyRegistered ? 'alert-circle' : 'close-circle'}
                size={18}
                color={isAlreadyRegistered ? '#F59E0B' : '#F87171'}
              />
              <Text
                style={[
                  styles.errorText,
                  isAlreadyRegistered && styles.alreadyRegisteredText,
                ]}
              >
                {errorMessage}
              </Text>
            </View>

            {isAlreadyRegistered && (
              <TouchableOpacity
                style={styles.alreadyLoginBtn}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('Login', {
                    prefilledEmail: email.trim() || studentId.trim(),
                  })
                }
              >
                <Ionicons name="log-in-outline" size={16} color="#000000" />
                <Text style={styles.alreadyLoginBtnText}>Sign In to Account →</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Section 1: Academic Identity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1. Academic Identity</Text>
          <Text style={styles.sectionSubtitle}>Must match your physical university ID card</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
            placeholder="Enter your full name"
            placeholderTextColor="#71717A"
            value={name}
            onChangeText={setName}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            importantForAutofill="no"
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>University Roll / Student ID Number *</Text>
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
            placeholder="Enter University Roll / Student ID"
            placeholderTextColor="#71717A"
            value={studentId}
            onChangeText={setStudentId}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            importantForAutofill="no"
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1.2 }]}>
            <Text style={styles.label}>Course / Degree *</Text>
            <TextInput
              style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
              placeholder="e.g. B.Tech / BCA"
              placeholderTextColor="#71717A"
              value={course}
              onChangeText={setCourse}
              autoComplete="off"
              autoCorrect={false}
              spellCheck={false}
              importantForAutofill="no"
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Semester *</Text>
            <TextInput
              style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
              placeholder="e.g. 1st / 4th Semester"
              placeholderTextColor="#71717A"
              value={semester}
              onChangeText={setSemester}
              autoComplete="off"
              autoCorrect={false}
              spellCheck={false}
              importantForAutofill="no"
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        {/* Profile Avatar Selection Row */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Student Profile Photo</Text>
          <Text style={styles.sectionSubtitle}>Choose your student photo for campus ride sharing</Text>
        </View>

        <View style={styles.avatarSelectionRow}>
          {AVATAR_OPTIONS.map((av) => (
            <TouchableOpacity
              key={av.id}
              style={[
                styles.avatarOptionBox,
                selectedAvatar === av.url && styles.avatarOptionSelected,
              ]}
              onPress={() => setSelectedAvatar(av.url)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: av.url }} style={styles.avatarOptionImg} resizeMode="cover" />
              {selectedAvatar === av.url && (
                <View style={styles.avatarCheckmark}>
                  <Ionicons name="checkmark" size={10} color="#000000" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 2: Account & Contact */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>2. Account & Contact</Text>
          <Text style={styles.sectionSubtitle}>Used for trip notifications and verified login</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>University / Student Email Address *</Text>
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
            placeholder="Enter university student email address"
            placeholderTextColor="#71717A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            importantForAutofill="no"
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mobile Phone Number *</Text>
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
            placeholder="10-digit mobile number"
            placeholderTextColor="#71717A"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            importantForAutofill="no"
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Account Password *</Text>
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
            placeholder="Create password (minimum 6 characters)"
            placeholderTextColor="#71717A"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            importantForAutofill="no"
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Section 3: Emergency Contact (Optional for faster onboarding) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>3. Emergency Contact Details (Optional)</Text>
          <Text style={styles.sectionSubtitle}>Optional campus safety contact</Text>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1.2 }]}>
            <Text style={styles.label}>Contact Name</Text>
            <TextInput
              style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
              placeholder="Contact person name (optional)"
              placeholderTextColor="#71717A"
              value={emergencyName}
              onChangeText={setEmergencyName}
              autoComplete="off"
              autoCorrect={false}
              spellCheck={false}
              importantForAutofill="no"
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
              placeholder="Relationship (e.g. Parent / Guardian)"
              placeholderTextColor="#71717A"
              value={emergencyRelation}
              onChangeText={setEmergencyRelation}
              autoComplete="off"
              autoCorrect={false}
              spellCheck={false}
              importantForAutofill="no"
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Emergency Phone Number</Text>
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, boxShadow: 'none' }]}
            placeholder="10-digit emergency number (optional)"
            placeholderTextColor="#71717A"
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            keyboardType="phone-pad"
            maxLength={10}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            importantForAutofill="no"
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Submit Button with Hover */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitHovered && styles.submitButtonHover,
          ]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
          onMouseEnter={() => setIsSubmitHovered(true)}
          onMouseLeave={() => setIsSubmitHovered(false)}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.submitButtonText}>Register Student Account</Text>
          )}
        </TouchableOpacity>

        {/* Footer Link to Login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In to Account →</Text>
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
  },
  content: {
    padding: 20,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  errorBox: {
    backgroundColor: '#271010',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  alreadyRegisteredBox: {
    backgroundColor: '#231B0B',
    borderColor: '#B45309',
  },
  errorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 12.5,
    color: '#F87171',
    flex: 1,
    fontWeight: '600',
    lineHeight: 18,
  },
  alreadyRegisteredText: {
    color: '#FDE68A',
  },
  alreadyLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    cursor: 'pointer',
  },
  alreadyLoginBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
  },
  avatarSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  avatarOptionBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#14151D',
    borderWidth: 2,
    borderColor: '#27272A',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
  },
  avatarOptionSelected: {
    borderColor: '#FFFFFF',
  },
  avatarOptionImg: {
    width: '100%',
    height: '100%',
  },
  avatarCheckmark: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#14151D',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 13.5,
    color: '#FFFFFF',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    cursor: 'pointer',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonHover: {
    backgroundColor: '#E4E4E7',
    transform: [{ translateY: -1 }],
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 12.5,
    color: '#71717A',
  },
  loginLink: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
