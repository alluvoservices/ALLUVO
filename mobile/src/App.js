import React from 'react';
import { SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function App() {
  const url = Constants?.expoConfig?.extra?.webAppUrl || 'https://alluvoservices.github.io/ALLUVO/';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0f1a' }}>
      <WebView source={{ uri: url }} style={{ flex: 1 }} originWhitelist={['*']} />
    </SafeAreaView>
  );
}
