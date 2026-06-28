import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DownloadIcon, XIcon } from './icons';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISSED_KEY = 'chopwise_install_dismissed';

function isStandalone() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function PwaInstallBanner() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || isStandalone()) return;
    if (window.localStorage.getItem(DISMISSED_KEY) === '1') return;

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (ios) {
      setShowIosHint(true);
      setVisible(true);
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (Platform.OS !== 'web' || !visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') setVisible(false);
    setPromptEvent(null);
  };

  return (
    <View style={styles.banner}>
      <View style={styles.icon}>
        <DownloadIcon size={18} color="#007A3D" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Install ChopWise</Text>
        <Text style={styles.subtitle}>
          {showIosHint
            ? 'Tap Share, then Add to Home Screen.'
            : 'Add it to your phone for faster access.'}
        </Text>
      </View>
      {promptEvent ? (
        <TouchableOpacity style={styles.installButton} onPress={install}>
          <Text style={styles.installText}>Install</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={styles.closeButton} onPress={dismiss} accessibilityLabel="Dismiss">
        <XIcon size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E6F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: { color: '#111827', fontSize: 13, fontWeight: '700' },
  subtitle: { color: '#6B7280', fontSize: 11, marginTop: 2, lineHeight: 15 },
  installButton: {
    backgroundColor: '#007A3D',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  installText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
