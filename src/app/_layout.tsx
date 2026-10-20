import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  carregarEscalaTexto,
  EscalaTextoId,
  TextScaleProvider,
} from '../components/AppText';
import { BottomNavigation } from '../components/BottomNavigation';
import { QuickExitButton } from '../components/QuickExitButton';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

export default function RootLayout() {
  const [appReady, setAppReady] =
    useState(false);

  // Tamanho do texto salvo, lido antes da primeira tela para não "piscar".
  const [escalaInicial, setEscalaInicial] =
    useState<EscalaTextoId>('normal');

  useEffect(() => {
    async function prepareApp() {
      try {
        setEscalaInicial(await carregarEscalaTexto());

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
    // GestureHandlerRootView: necessário para o arraste e a pinça do mapa
    <TextScaleProvider inicial={escalaInicial}>
    <GestureHandlerRootView style={styles.root}>
      {/* As telas ocupam o espaço acima do menu inferior */}
      <View style={styles.screens}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>

      {/* Menu inferior: fixo, fora da rolagem das telas */}
      <BottomNavigation />

      {/* Saída rápida: visível em todas as telas */}
      <QuickExitButton />
    </GestureHandlerRootView>
    </TextScaleProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  screens: {
    flex: 1,
  },
});