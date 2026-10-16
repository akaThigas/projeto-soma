import { BackHandler, Linking, Platform } from 'react-native';
import { router } from 'expo-router';

/**
 * Página "máscara" da saída rápida na web (public/tempo.html):
 * uma previsão do tempo do próprio site, sem nada do SOMA.
 * Fica no mesmo endereço do site, então não abre o Google nem
 * outra aba, e também funciona com o SOMA salvo na tela inicial.
 */
export const QUICK_EXIT_WEB_PATH = `${process.env.EXPO_BASE_URL ?? ''}/tempo.html`;

/**
 * Página neutra aberta pela saída rápida no Android e no iOS.
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
 * - troca a aba atual pela página "máscara" do próprio site
 *   (location.replace): o SOMA some da tela, nenhuma aba nova é aberta
 *   e o "voltar" do navegador não retorna ao SOMA.
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

    window.location.replace(QUICK_EXIT_WEB_PATH);
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
