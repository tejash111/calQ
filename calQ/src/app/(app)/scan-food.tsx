import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { X, Zap, ZapOff, Camera, ImageIcon } from 'lucide-react-native';
import { imageStore } from '../../lib/imageStore';

const { width, height } = Dimensions.get('window');
const BRACKET_SIZE = 40;
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanFoodScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [activeMode, setActiveMode] = useState<'scan' | 'gallery'>('scan');

  // Request permission on mount
  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      if (photo?.uri) {
        imageStore.setBase64(photo.base64 || '');
        router.push({
          pathname: '/(app)/scan-preview',
          params: { imageUri: photo.uri },
        });
      }
    } catch (err) {
      console.error('Camera capture error:', err);
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      imageStore.setBase64(asset.base64 || '');
      router.push({
        pathname: '/(app)/scan-preview',
        params: { imageUri: asset.uri },
      });
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" />
        <Image 
          source={require('../../../assets/dash/camera.svg')} 
          style={{ width: 80, height: 80, marginBottom: 24, opacity: 0.8 }} 
          contentFit="contain" 
          tintColor="#000"
        />
        <Text style={styles.permissionText}>Camera permission is required to scan food.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.goBackContainer} onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flash}
      />

      {/* Dark overlay with transparent scan area */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top overlay */}
        <View style={styles.overlayTop} />
        {/* Middle row */}
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          {/* Transparent scan area with corner brackets */}
          <View style={styles.scanArea}>
            {/* Top-left bracket */}
            <View style={[styles.bracket, styles.bracketTL]} />
            {/* Top-right bracket */}
            <View style={[styles.bracket, styles.bracketTR]} />
            {/* Bottom-left bracket */}
            <View style={[styles.bracket, styles.bracketBL]} />
            {/* Bottom-right bracket */}
            <View style={[styles.bracket, styles.bracketBR]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        {/* Bottom overlay */}
        <View style={styles.overlayBottom} />
      </View>

      {/* Top bar — Close */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Mode tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, activeMode === 'scan' && styles.modeTabActive]}
          onPress={() => setActiveMode('scan')}
        >
          <Camera size={18} color={activeMode === 'scan' ? '#000' : '#9CA3AF'} strokeWidth={2} />
          <Text style={[styles.modeTabText, activeMode === 'scan' && styles.modeTabTextActive]}>
            Scan Food
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, activeMode === 'gallery' && styles.modeTabActive]}
          onPress={() => {
            setActiveMode('gallery');
            handleGallery();
          }}
        >
          <ImageIcon size={18} color={activeMode === 'gallery' ? '#000' : '#9CA3AF'} strokeWidth={2} />
          <Text style={[styles.modeTabText, activeMode === 'gallery' && styles.modeTabTextActive]}>
            Gallery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Flash toggle */}
        <TouchableOpacity style={styles.flashBtn} onPress={() => setFlash((f) => !f)}>
          {flash ? (
            <Zap size={22} color="#FFD700" strokeWidth={2.5} fill="#FFD700" />
          ) : (
            <ZapOff size={22} color="#fff" strokeWidth={2} />
          )}
        </TouchableOpacity>

        {/* Capture button */}
        <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.7}>
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>

        {/* Spacer for symmetry */}
        <View style={{ width: 50 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Overlay
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  // Corner brackets
  bracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  bracketTL: {
    top: 0, left: 0,
    borderTopWidth: 3, borderLeftWidth: 3,
    borderTopLeftRadius: 16,
  },
  bracketTR: {
    top: 0, right: 0,
    borderTopWidth: 3, borderRightWidth: 3,
    borderTopRightRadius: 16,
  },
  bracketBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 3, borderLeftWidth: 3,
    borderBottomLeftRadius: 16,
  },
  bracketBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 3, borderRightWidth: 3,
    borderBottomRightRadius: 16,
  },
  // Top bar
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  // Mode tabs
  modeTabs: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  modeTabActive: {
    backgroundColor: '#fff',
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  modeTabTextActive: {
    color: '#000',
  },
  // Bottom controls
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  flashBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  // Permission screen
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Subtle gray
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    color: '#374151',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  permissionButton: {
    backgroundColor: '#A3E635', // Brand color
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  goBackContainer: {
    padding: 10,
  },
  goBackText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
