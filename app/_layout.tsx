import { Slot } from 'expo-router';
import { AuthenticationProvider } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, AppState } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from '../context/ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function ErrorScreen({ error }: { error: Error }) {
  return (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <TouchableOpacity 
        style={styles.errorButton}
        onPress={() => {
          // In a real app, you might want to do more sophisticated error recovery
          if (Platform.OS === 'web') {
            location.reload();
          } else {
            // For native, we could use DevSettings or other approaches
            console.log('Attempting to recover from error');
          }
        }}
      >
        <Text style={styles.errorButtonText}>Try Again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Simple network status monitor using AppState instead of NetInfo
function NetworkStatusBar() {
  const [isOnline, setIsOnline] = useState(true);

  // This is a simplified version that doesn't actually check network status
  // In a real app, you would use NetInfo or another method to check connectivity
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // This is just a placeholder - in a real app you would check actual network status
      console.log('App state changed to', nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // For demo purposes, we'll just always show as online
  if (isOnline) return null;

  return (
    <View style={styles.offlineBar}>
      <Text style={styles.offlineText}>No internet connection</Text>
    </View>
  );
}

export default function Root() {
  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    // Note: These are placeholder fonts and may not load correctly in this demo
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Hide splash screen when fonts are loaded or there's an error
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="dark" />
        <View style={styles.container} onLayout={onLayoutRootView}>
          <NetworkStatusBar />
          <AuthenticationProvider>
            <Slot />
          </AuthenticationProvider>
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  offlineBar: {
    backgroundColor: '#FF3B30',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
