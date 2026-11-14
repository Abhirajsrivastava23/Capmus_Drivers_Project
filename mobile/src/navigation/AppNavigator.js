import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import StudentRegistrationScreen from '../screens/StudentRegistrationScreen';
import StudentVerificationScreen from '../screens/StudentVerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchRideScreen from '../screens/SearchRideScreen';
import AvailableRidesScreen from '../screens/AvailableRidesScreen';
import RideDetailsScreen from '../screens/RideDetailsScreen';
import OfferRideScreen from '../screens/OfferRideScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import BookingRequestsScreen from '../screens/BookingRequestsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import MyPublishedRidesScreen from '../screens/MyPublishedRidesScreen';
import DriverProfileScreen from '../screens/DriverProfileScreen';
import DrivingReviewsScreen from '../screens/DrivingReviewsScreen';
import InAppChatScreen from '../screens/InAppChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EmergencySOSScreen from '../screens/EmergencySOSScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const FindRideStack = createNativeStackNavigator();
const MyRidesStack = createNativeStackNavigator();

// Find Ride Stack
function FindRideNavigator() {
  return (
    <FindRideStack.Navigator screenOptions={{ headerShown: false }}>
      <FindRideStack.Screen name="SearchRide" component={SearchRideScreen} />
      <FindRideStack.Screen name="AvailableRides" component={AvailableRidesScreen} />
    </FindRideStack.Navigator>
  );
}

// My Rides Dual Navigator (Bookings & Published)
function MyRidesNavigator() {
  return (
    <MyRidesStack.Navigator screenOptions={{ headerShown: false }}>
      <MyRidesStack.Screen name="MyBookings" component={MyBookingsScreen} />
      <MyRidesStack.Screen name="MyPublishedRides" component={MyPublishedRidesScreen} />
    </MyRidesStack.Navigator>
  );
}

// Main Bottom Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#71717A',
        tabBarStyle: {
          backgroundColor: '#090A0D',
          borderTopWidth: 1,
          borderTopColor: '#27272A',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 3,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tab.Screen
        name="FindRideTab"
        component={FindRideNavigator}
        options={{
          tabBarLabel: 'Find Ride',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tab.Screen
        name="OfferRideTab"
        component={OfferRideScreen}
        options={{
          tabBarLabel: 'Offer Ride',
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#71717A',
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="car"
              size={20}
              color={focused ? '#FFFFFF' : '#71717A'}
              solid
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyRidesTab"
        component={MyRidesNavigator}
        options={{
          tabBarLabel: 'My Rides',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'ticket-confirmation' : 'ticket-confirmation-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={UserProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={22}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Application Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={StudentRegistrationScreen} />
        <Stack.Screen name="StudentVerification" component={StudentVerificationScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
        <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
        <Stack.Screen name="BookingRequests" component={BookingRequestsScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="MyPublishedRides" component={MyPublishedRidesScreen} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="DrivingReviews" component={DrivingReviewsScreen} />
        <Stack.Screen name="InAppChat" component={InAppChatScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="SearchRide" component={SearchRideScreen} />
        <Stack.Screen name="AvailableRides" component={AvailableRidesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
