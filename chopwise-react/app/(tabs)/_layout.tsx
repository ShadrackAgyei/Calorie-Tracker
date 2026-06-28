import { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import {
  TouchableOpacity, View, StyleSheet,
  Modal, Pressable, Platform,
} from 'react-native';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HomeIcon, TrendIcon, CalendarIcon, PersonIcon,
  CameraIcon, SearchIcon, ChevronRightIcon, PlusIcon,
} from '../../src/components/icons';

const GREEN = '#007A3D';
const GRAY = '#9CA3AF';

function PlusTabButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={camStyles.wrapper} onPress={onPress} activeOpacity={0.85}>
      <View style={camStyles.circle}>
        <PlusIcon size={26} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

function AddMealSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  function go(href: '/scan' | '/manual-log') {
    onClose();
    setTimeout(() => router.push(href), 50);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={sheet.overlay} onPress={onClose} />
      <View style={[sheet.container, { paddingBottom: bottom + 16 }]}>
        <View style={sheet.handle} />
        <Text style={sheet.title}>Add Meal</Text>

        <TouchableOpacity style={sheet.option} onPress={() => go('/scan')} activeOpacity={0.8}>
          <View style={[sheet.iconBox, { backgroundColor: '#E6F2EC' }]}>
            <CameraIcon size={22} color={GREEN} />
          </View>
          <View style={sheet.optionText}>
            <Text style={sheet.optionTitle}>Scan Meal</Text>
            <Text style={sheet.optionSub}>AI photo detection</Text>
          </View>
          <ChevronRightIcon size={18} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity style={sheet.option} onPress={() => go('/manual-log')} activeOpacity={0.8}>
          <View style={[sheet.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <SearchIcon size={22} color="#3B82F6" />
          </View>
          <View style={sheet.optionText}>
            <Text style={sheet.optionTitle}>Search Food</Text>
            <Text style={sheet.optionSub}>Find and log food</Text>
          </View>
          <ChevronRightIcon size={18} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity style={sheet.cancel} onPress={onClose} activeOpacity={0.7}>
          <Text style={sheet.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function TabLayout() {
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: GREEN,
          tabBarInactiveTintColor: GRAY,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
            backgroundColor: '#FFFFFF',
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color }) => <TrendIcon color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: '',
            tabBarButton: () => <PlusTabButton onPress={() => setSheetVisible(true)} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <CalendarIcon color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <PersonIcon color={color} size={22} />,
          }}
        />
        <Tabs.Screen name="today" options={{ href: null }} />
      </Tabs>

      <AddMealSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </>
  );
}

const camStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -18,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
});

const sheet = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  optionSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 2,
  },
  cancelText: { fontSize: 15, color: '#9CA3AF', fontWeight: '600' },
});
