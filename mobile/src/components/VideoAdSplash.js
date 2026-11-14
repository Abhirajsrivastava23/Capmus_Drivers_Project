import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VideoAdSplash({ onFinish }) {
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bufferText, setBufferText] = useState('Opening Campus Drivers...');
  const videoRef = useRef(null);

  useEffect(() => {
    // 4-second opening buffer ticker (0% -> 100% in 4000ms)
    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (pct < 35) {
        setBufferText('Opening Campus Drivers...');
      } else if (pct < 75) {
        setBufferText('Loading Corridor Assets...');
      } else if (pct < 98) {
        setBufferText('Launching Campus Drivers...');
      } else {
        setBufferText('Opening...');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        onFinish();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  const toggleSound = () => {
    if (Platform.OS === 'web' && videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      setIsMuted(next);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const videoSource = require('../../assets/intro_ad.mp4');
  const videoUri =
    typeof videoSource === 'string'
      ? videoSource
      : videoSource?.uri || '/assets/?unstable_path=.%2Fassets%2Fintro_ad.mp4';

  return (
    <View style={styles.container}>
      {/* Fullscreen Video Viewport */}
      <View style={styles.videoWrapper}>
        {Platform.OS === 'web' ? (
          <>
            <video
              ref={videoRef}
              src={videoUri}
              autoPlay
              playsInline
              muted={isMuted}
              onEnded={onFinish}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000000',
                WebkitMaskImage:
                  'radial-gradient(ellipse 95% 92% at 50% 50%, black 70%, transparent 100%)',
                maskImage:
                  'radial-gradient(ellipse 95% 92% at 50% 50%, black 70%, transparent 100%)',
              }}
            />
            {/* Soft Edge Fade Overlays for Web to avoid sharp borders */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: 80,
                background:
                  'linear-gradient(to right, #000000 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: 80,
                background:
                  'linear-gradient(to left, #000000 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 70,
                background:
                  'linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
                background:
                  'linear-gradient(to top, #000000 0%, rgba(0,0,0,0.8) 60%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          </>
        ) : (
          <Image
            source={require('../../assets/cu_drivers_hero.jpg')}
            style={styles.nativeFallback}
            resizeMode="contain"
          />
        )}

        {/* Top Right Skip Button */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.skipBtnText}>Skip</Text>
          <Ionicons name="play-forward" size={12} color="#D4D4D8" />
        </TouchableOpacity>

        {/* 🚀 NICHE BEECH ME: 4-SECOND OPENING BUFFER CARD */}
        <View style={styles.bufferCard}>
          <View style={styles.bufferHeader}>
            <View style={styles.bufferTitleRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.bufferText}>{bufferText}</Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{Math.round(progress)}%</Text>
            </View>
          </View>

          {/* 4s Progress Bar Track */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          {/* Subtext info */}
          <View style={styles.bufferFooter}>
            <Text style={styles.bufferSubtext}>Chandigarh University UP</Text>
            <Text style={styles.bufferTimer}>4s Buffer</Text>
          </View>
        </View>

        {/* Floating Sound Toggle at Bottom-Right */}
        <TouchableOpacity
          style={styles.soundBtn}
          onPress={toggleSound}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={16}
            color={isMuted ? '#A1A1AA' : '#10B981'}
          />
          <Text style={styles.soundBtnText}>
            {isMuted ? 'Sound' : 'Sound ON'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 99999,
  },
  videoWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  nativeFallback: {
    width: '100%',
    height: '100%',
  },
  bufferCard: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    width: '84%',
    maxWidth: 340,
    backgroundColor: 'rgba(11, 12, 16, 0.82)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 40,
  },
  bufferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bufferTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bufferText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  percentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  percentText: {
    color: '#D4D4D8',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#18181B',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  bufferFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bufferSubtext: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '500',
  },
  bufferTimer: {
    color: '#A1A1AA',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  soundBtn: {
    position: 'absolute',
    bottom: 34,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 40,
  },
  soundBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  skipBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  skipBtnText: {
    color: '#D4D4D8',
    fontSize: 12,
    fontWeight: '700',
  },
});
