import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, ActivityIndicator, Alert, Animated } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { LogOut, ChevronRight, Edit2, User as UserIcon } from 'lucide-react-native';
import { useOnboardingProfile } from '../hooks/useOnboardingProfile';
import { saveOnboarding } from '../lib/api';

function ProfileSkeletonLoader() {
  const anim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
          <Animated.View style={{ width: 110, height: 14, backgroundColor: '#E5E7EB', borderRadius: 4, opacity: anim }} />
          <Animated.View style={{ width: 80, height: 14, backgroundColor: '#E5E7EB', borderRadius: 4, opacity: anim }} />
        </View>
      ))}
    </View>
  );
}

export default function ProfileTab() {
  const { user } = useUser();
  const { signOut, getToken } = useAuth();
  const { profile, loading: profileLoading, refetch } = useOnboardingProfile();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<{ key: string, label: string, value: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit Name
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleUpdateName = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await user.update({ firstName, lastName });
      setEditNameModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDetail = async () => {
    if (!editField) return;
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) throw new Error('No token');
      
      await saveOnboarding(token, {
        [editField.key]: editField.value
      });
      await refetch();
      setEditModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update details');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (key: string, label: string, value: string) => {
    setEditField({ key, label, value });
    setEditModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Top Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <UserIcon size={24} color="#000" />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'User'}</Text>
          </View>
        </View>
      </View>

      {/* Details Card */}
      <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
        <Text style={styles.cardSectionTitle}>Personal Details</Text>
        {profileLoading ? (
          <ProfileSkeletonLoader />
        ) : (
          <>
            <DetailRow 
              label="Current Weight" 
              value={profile?.weight ? `${profile.weight} kg` : 'Not set'} 
              onPress={() => openEdit('weight', 'Current Weight', profile?.weight || '')} 
            />
            <DetailRow 
              label="Goal Weight" 
              value={profile?.desired_weight ? `${profile.desired_weight} kg` : 'Not set'} 
              onPress={() => openEdit('desired_weight', 'Goal Weight', profile?.desired_weight || '')} 
            />
            <DetailRow 
              label="Height" 
              value={profile?.height ? `${profile.height} cm` : 'Not set'} 
              onPress={() => openEdit('height', 'Height', profile?.height || '')} 
            />
            <DetailRow 
              label="Goal" 
              value={profile?.goal || 'Not set'} 
              onPress={() => openEdit('goal', 'Goal (e.g. Lose weight)', profile?.goal || '')} 
            />
            <DetailRow 
              label="Activity Level" 
              value={profile?.activity_level || 'Not set'} 
              onPress={() => openEdit('activity_level', 'Activity Level', profile?.activity_level || '')} 
            />
          </>
        )}
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutCard} onPress={() => signOut()}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      {/* Edit Detail Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editField?.label}</Text>
            <TextInput
              style={styles.input}
              value={editField?.value}
              onChangeText={(val) => setEditField(prev => prev ? { ...prev, value: val } : null)}
              placeholder={`Enter ${editField?.label}`}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleUpdateDetail} disabled={saving}>
                {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={editNameModalVisible} transparent animationType="fade" onRequestClose={() => setEditNameModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              autoFocus
            />
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditNameModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleUpdateName} disabled={saving}>
                {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function DetailRow({ label, value, onPress }: { label: string, value: string, onPress: () => void }) {
  return (
    <Pressable style={styles.detailRow} onPress={onPress}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueContainer}>
        <Text style={styles.detailValue}>{value}</Text>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 110,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 15,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 20,
  },
  logoutCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#A3E635',
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
