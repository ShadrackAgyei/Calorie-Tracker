import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { useMealStore } from '../store/useMealStore';

WebBrowser.maybeCompleteAuthSession();

const androidClientId = Constants.expoConfig?.extra?.googleAndroidClientId as string;
const webClientId = Constants.expoConfig?.extra?.googleWebClientId as string;

export function useGoogleSignIn() {
  const init = useMealStore((s) => s.init);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    webClientId,
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken = response.params?.id_token;
    if (!idToken) return;

    supabase.auth
      .signInWithIdToken({ provider: 'google', token: idToken })
      .then(() => init());
  }, [response]);

  return {
    signInWithGoogle: () => promptAsync(),
    ready: !!request,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
  // Re-init will pick up a fresh anonymous session
  await useMealStore.getState().init();
}
