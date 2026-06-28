import { useEffect } from 'react';
import { Platform } from 'react-native';
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
    if (Platform.OS === 'web') return;
    if (response?.type !== 'success') return;

    const idToken = response.params?.id_token;
    if (!idToken) return;

    supabase.auth
      .signInWithIdToken({ provider: 'google', token: idToken })
      .then(() => init());
  }, [response]);

  const signInWithGoogle = async () => {
    if (Platform.OS === 'web') {
      const redirectTo = `${window.location.origin}/profile`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      return;
    }

    await promptAsync();
  };

  return {
    signInWithGoogle,
    ready: Platform.OS === 'web' || !!request,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
  // Re-init will pick up a fresh anonymous session
  await useMealStore.getState().init();
}
