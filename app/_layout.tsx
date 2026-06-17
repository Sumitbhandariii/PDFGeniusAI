/**
 * Root Layout - PDF Genius AI
 * Sets up all providers and navigation stack
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import '@/shims/web-deps';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider, AuthProvider } from '@/template';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PDFProvider } from '@/contexts/PDFContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <ThemeProvider>
        <PDFProvider>
          <AuthProvider>
            <SafeAreaProvider>
              <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="pdf-viewer"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_bottom',
                    presentation: 'fullScreenModal',
                  }}
                />
                <Stack.Screen
                  name="ai-chat"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="ai-result"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    headerShown: false,
                    animation: 'fade',
                  }}
                />
              </Stack>
              <StatusBar style="light" />
            </SafeAreaProvider>
          </AuthProvider>
        </PDFProvider>
      </ThemeProvider>
    </AlertProvider>
  );
}
