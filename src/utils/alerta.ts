import { Alert, Platform } from 'react-native';

/**
 * Avisos que funcionam também na web.
 *
 * No navegador o Alert do React Native não faz nada,
 * então usamos window.alert e window.confirm.
 */
export function avisar(titulo: string, mensagem: string) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }

  Alert.alert(titulo, mensagem);
}

export function confirmar(
  titulo: string,
  mensagem: string,
  textoConfirmar: string,
  aoConfirmar: () => void
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensagem}`)) {
      aoConfirmar();
    }
    return;
  }

  Alert.alert(titulo, mensagem, [
    {
      text: 'Cancelar',
      style: 'cancel',
    },
    {
      text: textoConfirmar,
      style: 'destructive',
      onPress: aoConfirmar,
    },
  ]);
}
