import 'react-native-get-random-values';

// Polyfill crypto.randomUUID — not available in React Native's JS runtime
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as Crypto).randomUUID = (): `${string}-${string}-${string}-${string}-${string}` => {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}` as `${string}-${string}-${string}-${string}-${string}`;
  };
}

import 'expo-router/entry';
