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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [loginId, setLoginId] = useState('aarav.sharma@cumail.in');
  const [password, setPassword] = useState('Password@123');
  const [phone, setPhone] = useState('9876500001');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);

  const handlePasswordLogin = async () => {
    if (!loginId || !password) {
      setErrorMessage('Please provide your student email / ID and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await login(loginId, password);
      navigation.replace('MainTabs');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Invalid credentials. Please verify and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setErrorMessage('Please enter your 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      if (res.data.dev_otp) {
        setOtp(res.data.dev_otp);
      }
      Alert.alert('OTP Sent', `Verification code sent to ${phone}. (Dev code: ${res.data.dev_otp || '123456'})`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp });
      if (res.data.isExistingUser && res.data.token) {
        await login(res.data.user.email, 'Password@123');
        navigation.replace('MainTabs');
      } else {
        navigation.navigate('Register', { prefilledPhone: phone });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const pickDemoAccount = (type) => {
    if (type === 'driver') {
      setLoginId('aarav.sharma@cumail.in');
      setPassword('Password@123');
      setPhone('9876500001');
    } else if (type === 'passenger') {
      setLoginId('ananya.gupta@cumail.in');
      setPassword('Password@123');
      setPhone('9876500002');
    } else if (type === 'admin') {
      setLoginId('admin@campusdrivers.cu.ac.in');
      setPassword('Password@123');
      setPhone('9999900000');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/campus_f1_square.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.appName}>Campus Drivers</Text>
          <Text style={styles.subTitle}>Chandigarh University UP • Student Login</Text>
        </View>
      </View>

      {/* Login Mode Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, loginMethod === 'password' && styles.tabActive]}
          onPress={() => {
            setLoginMethod('password');
            setErrorMessage('');
          }}
        >
          <Text style={[styles.tabText, loginMethod === 'password' && styles.tabTextActive]}>
            Email / Student ID
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, loginMethod === 'otp' && styles.tabActive]}
          onPress={() => {
            setLoginMethod('otp');
            setErrorMessage('');
          }}
        >
          <Text style={[styles.tabText, loginMethod === 'otp' && styles.tabTextActive]}>
            Mobile OTP Login
          </Text>
        </TouchableOpacity>
      </View>

      {/* Demo Credentials Pill */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Quick Demo Switcher:</Text>
        <View style={styles.demoButtons}>
          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => pickDemoAccount('driver')}
          >
            <Text style={styles.demoPillText}>🚗 Driver (Aarav - UP32 AB 1234)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => pickDemoAccount('passenger')}
          >
            <Text style={styles.demoPillText}>🙋 Passenger (Ananya)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#F87171" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Form Fields */}
      {loginMethod === 'password' ? (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student Email or University Roll No.</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color="#A1A1AA" />
              <TextInput
                style={styles.input}
                placeholder="e.g. aarav.sharma@cumail.in"
                placeholderTextColor="#71717A"
                value={loginId}
                onChangeText={setLoginId}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HelpSupport')}>
                <Text style={styles.forgotLink}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color="#A1A1AA" />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#71717A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitHovered && styles.submitButtonHover,
            ]}
            onPress={handlePasswordLogin}
            disabled={loading}
            activeOpacity={0.85}
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={18} color="#A1A1AA" />
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor="#71717A"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {otpSent ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>6-Digit OTP Code</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#A1A1AA" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#71717A"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitHovered && styles.submitButtonHover,
            ]}
            onPress={otpSent ? handleVerifyOtp : handleSendOtp}
            disabled={loading}
            activeOpacity={0.85}
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.submitButtonText}>
                {otpSent ? 'Verify OTP & Continue' : 'Send Verification OTP'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Footer Navigation to Registration with Hover Card */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have a verified account yet?</Text>
        <TouchableOpacity
          style={[
            styles.registerCard,
            isRegisterHovered && styles.registerCardHover,
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Register')}
          onMouseEnter={() => setIsRegisterHovered(true)}
          onMouseLeave={() => setIsRegisterHovered(false)}
        >
          <Ionicons
            name="school-outline"
            size={16}
            color={isRegisterHovered ? '#000000' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.registerLink,
              isRegisterHovered && styles.registerLinkHover,
            ]}
          >
            Register Chandigarh University ID →
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0D',
  },
  content: {
    padding: 24,
    paddingTop: 54,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#14151D',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#27272A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  demoBox: {
    backgroundColor: '#121318',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    marginBottom: 6,
  },
  demoButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoPill: {
    backgroundColor: '#1E2028',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  demoPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#271010',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  forgotLink: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14151D',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  prefix: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    cursor: 'pointer',
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
    marginTop: 32,
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#71717A',
  },
  registerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14151D',
    borderWidth: 1,
    borderColor: '#3F3F46',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    cursor: 'pointer',
  },
  registerCardHover: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    transform: [{ translateY: -1 }],
  },
  registerLink: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  registerLinkHover: {
    color: '#000000',
  },
});
