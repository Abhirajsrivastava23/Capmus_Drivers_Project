import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import Header from '../components/Header';
import { getSocket, joinRideRoom, leaveRideRoom } from '../services/socket';
import api from '../services/api';

export default function InAppChatScreen({ navigation, route }) {
  const { rideId, driverName, driverId } = route.params || {};
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [driverPhone, setDriverPhone] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await api.get(`/messages/ride/${rideId}`);
        if (res.data.success) {
          setMessages(res.data.messages || []);
          if (res.data.ride?.driver?.phone) {
            setDriverPhone(res.data.ride.driver.phone);
          }
        }
      } catch (e) {
        console.warn('Error fetching chat history', e);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
    joinRideRoom(rideId);

    const socket = getSocket();
    const handleNewMessage = (newMsg) => {
      if (newMsg.ride_id === rideId) {
        setMessages((prev) => [...prev, newMsg]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      leaveRideRoom(rideId);
    };
  }, [rideId]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    // Determine receiver: if current user is driver, receiver is passenger, else receiver is driverId
    const receiver = driverId || user._id;

    try {
      const res = await api.post('/messages/send', {
        ride_id: rideId,
        receiver_id: receiver,
        message: text,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch (err) {
      console.warn('Failed to send message', err);
    }
  };

  const handleCall = () => {
    if (driverPhone) {
      Linking.openURL(`tel:${driverPhone}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header
        title={`Chat with ${driverName || 'Driver'}`}
        subtitle="In-app carpool messaging"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          driverPhone ? (
            <TouchableOpacity onPress={handleCall} style={styles.callHeaderBtn}>
              <Ionicons name="call" size={16} color={COLORS.white} />
            </TouchableOpacity>
          ) : null
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item._id || String(index)}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isMe = item.sender_id?._id === user?._id || item.sender_id === user?._id;
            return (
              <View
                style={[
                  styles.messageBubble,
                  isMe ? styles.myMessage : styles.theirMessage,
                ]}
              >
                {!isMe && (
                  <Text style={styles.senderLabel}>
                    {item.sender_id?.name || driverName}
                  </Text>
                )}
                <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
                  {item.message}
                </Text>
                <Text style={[styles.timeLabel, isMe ? styles.myTime : styles.theirTime]}>
                  {new Date(item.sent_at || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Start conversation about pickup location and timing.</Text>
            </View>
          }
        />
      )}

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Type message to driver..."
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0D',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callHeaderBtn: {
    backgroundColor: '#181920',
    borderWidth: 1,
    borderColor: '#3F3F46',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    padding: 16,
    gap: 10,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#181920',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A1A1AA',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  myText: {
    color: '#090A0D',
    fontWeight: '600',
  },
  theirText: {
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: 9.5,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  myTime: {
    color: 'rgba(0,0,0,0.5)',
  },
  theirTime: {
    color: '#71717A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    maxWidth: 240,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#090A0D',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#121318',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
