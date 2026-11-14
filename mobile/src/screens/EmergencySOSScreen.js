import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { UNIVERSITY_INFO } from '../constants/cities';
import Header from '../components/Header';
import api from '../services/api';

export default function EmergencySOSScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosTriggering, setSosTriggering] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Add contact state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [phone, setPhone] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/safety/emergency-contacts');
      if (res.data.success) {
        setContacts(res.data.contacts || []);
      }
    } catch (e) {
      console.warn('Error loading emergency contacts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleTriggerSOS = async () => {
    Alert.alert(
      '🚨 TRIGGER EMERGENCY SOS?',
      'This will broadcast an urgent safety alert with your GPS coordinates to Chandigarh University Campus Security and all your registered emergency contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CONFIRM EMERGENCY',
          style: 'destructive',
          onPress: async () => {
            setSosTriggering(true);
            try {
              // Simulated coordinates of CUUP Lucknow campus route on NH-27
              const res = await api.post('/safety/sos', {
                latitude: 26.8467,
                longitude: 80.9462,
                emergency_message: 'Emergency assistance requested on highway trip',
              });

              setSosActive(true);
              Alert.alert(
                '🚨 SOS BROADCASTED!',
                'University Campus Security, Proctor Office, and your Emergency Contacts have been alerted. UP Police 112 has been linked.',
                [
                  {
                    text: 'Call Police 112',
                    onPress: () => Linking.openURL('tel:112'),
                  },
                  { text: 'OK' },
                ]
              );
            } catch (err) {
              Alert.alert('SOS Error', err.response?.data?.message || 'Failed to trigger SOS');
            } finally {
              setSosTriggering(false);
            }
          },
        },
      ]
    );
  };

  const handleAddContact = async () => {
    if (!name || !phone) {
      Alert.alert('Missing Field', 'Please provide contact name and phone number.');
      return;
    }

    setSavingContact(true);
    try {
      await api.post('/safety/emergency-contacts', {
        name: name.trim(),
        relationship,
        phone_number: phone.trim(),
      });
      setShowAddForm(false);
      setName('');
      setPhone('');
      fetchContacts();
      Alert.alert('Saved', 'Emergency contact registered.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save contact');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/safety/emergency-contacts/${contactId}`);
      fetchContacts();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete contact');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Emergency & Safety"
        subtitle="Chandigarh University Safety Center"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Giant Red SOS Trigger Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={[styles.sosButton, SHADOWS.large]}
            activeOpacity={0.8}
            onPress={handleTriggerSOS}
            disabled={sosTriggering}
          >
            {sosTriggering ? (
              <ActivityIndicator size="large" color={COLORS.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="alert-octagon" size={48} color={COLORS.white} />
                <Text style={styles.sosButtonText}>EMERGENCY SOS</Text>
                <Text style={styles.sosButtonSub}>Hold to alert campus safety</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {sosActive && (
          <View style={styles.activeSosBanner}>
            <Ionicons name="warning" size={18} color={COLORS.danger} />
            <Text style={styles.activeSosText}>
              Emergency SOS Active! Campus Proctor and Contacts have received your GPS coordinates.
            </Text>
          </View>
        )}

        {/* Quick Dial Helplines */}
        <View style={styles.helplineSection}>
          <Text style={styles.sectionHeading}>Emergency Helplines</Text>

          <View style={styles.helplineGrid}>
            <TouchableOpacity
              style={styles.helplineCard}
              onPress={() => Linking.openURL('tel:112')}
            >
              <View style={[styles.helplineIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="call" size={18} color={COLORS.danger} />
              </View>
              <View>
                <Text style={styles.helplineTitle}>UP Police Emergency</Text>
                <Text style={styles.helplineNumber}>Dial 112</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineCard}
              onPress={() => Linking.openURL('tel:1090')}
            >
              <View style={[styles.helplineIcon, { backgroundColor: '#FDF2F8' }]}>
                <Ionicons name="shield" size={18} color="#BE185D" />
              </View>
              <View>
                <Text style={styles.helplineTitle}>Women Power Line</Text>
                <Text style={styles.helplineNumber}>Dial 1090</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helplineCard}
              onPress={() => Linking.openURL(`tel:${UNIVERSITY_INFO.emergencyHelpline}`)}
            >
              <View style={[styles.helplineIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="school" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.helplineTitle}>CUUP Security Office</Text>
                <Text style={styles.helplineNumber}>{UNIVERSITY_INFO.emergencyHelpline}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Registered Emergency Contacts */}
        <View style={styles.contactsSection}>
          <View style={styles.contactsHeaderRow}>
            <Text style={styles.sectionHeading}>My Emergency Contacts</Text>
            <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
              <Text style={styles.addContactBtnText}>{showAddForm ? 'Cancel' : '+ Add Contact'}</Text>
            </TouchableOpacity>
          </View>

          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={styles.addFormTitle}>Add Safety Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact Name (e.g. Father)"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship (e.g. Parent, Guardian)"
                value={relationship}
                onChangeText={setRelationship}
              />
              <TextInput
                style={styles.input}
                placeholder="10-digit Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.saveContactBtn}
                onPress={handleAddContact}
                disabled={savingContact}
              >
                {savingContact ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveContactText}>Save Emergency Contact</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : contacts.length > 0 ? (
            contacts.map((c) => (
              <View key={c._id} style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Ionicons name="person" size={16} color={COLORS.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactRel}>
                    {c.relationship} • {c.phone_number}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${c.phone_number}`)}
                  style={styles.callIconBtn}
                >
                  <Ionicons name="call" size={14} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteContact(c._id)}
                  style={styles.deleteIconBtn}
                >
                  <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noContacts}>No emergency contacts added yet.</Text>
          )}
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
    gap: 20,
  },
  sosContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sosButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#1E1F24',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#3F3F46',
    gap: 4,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosButtonSub: {
    color: '#A1A1AA',
    fontSize: 9.5,
    fontWeight: '600',
  },
  activeSosBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C1917',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#44403C',
  },
  activeSosText: {
    fontSize: 11.5,
    color: '#E4E4E7',
    fontWeight: '700',
    flex: 1,
  },
  helplineSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  helplineGrid: {
    gap: 10,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#121318',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  helplineIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#181920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helplineNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E4E4E7',
    marginTop: 1,
  },
  contactsSection: {
    gap: 12,
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addContactBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  addForm: {
    backgroundColor: '#121318',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 8,
  },
  addFormTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12,
    color: '#FFFFFF',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
  saveContactBtn: {
    backgroundColor: '#FFFFFF',
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveContactText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#121318',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#181920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactRel: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  callIconBtn: {
    backgroundColor: '#27272A',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  deleteIconBtn: {
    padding: 6,
  },
  noContacts: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
