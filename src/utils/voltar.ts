import { router } from 'expo-router';

/**
 * Volta para a tela anterior.
 *
 * Se não houver tela anterior (ex.: página aberta direto pelo link
 * ou recarregada na web), vai para a Home.
 */
export function voltar() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/home');
  }
}
