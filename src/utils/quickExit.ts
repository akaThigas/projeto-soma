import { BackHandler, Linking, Platform } from 'react-native';
import { router } from 'expo-router';

/**
 * Página neutra aberta pela saída rápida.
 *
 * Deve ser um site comum, que não chame atenção caso
 * outra pessoa veja a tela (ex.: previsão do tempo).
 */
export const QUICK_EXIT_URL =
  'https://www.google.com/search?q=previs%C3%A3o+do+tempo';

/**
 * Sai rapidamente do SOMA e mostra uma página neutra.
 *
 * Web / PWA:
 * - troca a aba atual pela página neutra (location.replace).
 *   Abre uma página só, no mesmo navegador, sem abrir outra aba nem
 *   o app do Google; e o "voltar" do navegador não retorna ao SOMA.
 *
 * Android / iOS:
 * - volta o app para a Home, para que nenhuma tela sensível
 *   fique aberta ao retornar ao aplicativo;
 * - abre a página neutra no navegador;
 * - no Android, fecha o aplicativo em seguida.
 */
export function quickExit() {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return;
    }

    window.location.replace(QUICK_EXIT_URL);
    return;
  }

  try {
    if (router.canDismiss()) {
      router.dismissAll();
    }

    router.replace('/home');
  } catch (error) {
    console.warn('Erro ao reiniciar a navegação na saída rápida:', error);
  }

  Linking.openURL(QUICK_EXIT_URL).catch((error) => {
    console.warn('Erro ao abrir a página neutra:', error);
  });

  if (Platform.OS === 'android') {
    setTimeout(() => {
      BackHandler.exitApp();
    }, 300);
  }
}
