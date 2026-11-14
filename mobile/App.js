import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import VideoAdSplash from './src/components/VideoAdSplash';

export default function App() {
  const [showIntroAd, setShowIntroAd] = useState(true);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        {showIntroAd ? (
          <VideoAdSplash onFinish={() => setShowIntroAd(false)} />
        ) : (
          <AppNavigator />
        )}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
