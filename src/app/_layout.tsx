import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';

import { QuickExitButton } from '../components/QuickExitButton';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export default function RootLayout() {
  const [appReady, setAppReady] =
    useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        await Asset.fromModule(
          require(
            '../../assets/images/logo-soma.png'
          )
        ).downloadAsync();
      } catch (error) {
        console.warn(
          'Erro ao carregar recursos iniciais:',
          error
        );
      } finally {
        setAppReady(true);
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />

      {/* Saída rápida: visível em todas as telas */}
      <QuickExitButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});