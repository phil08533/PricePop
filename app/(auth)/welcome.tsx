import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { loginWithApple, loginWithGoogle } from '@services/authService';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@constants/index';

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<string | null>(null);

  const googleClientId = Constants.expoConfig?.extra?.googleClientId;
  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    iosClientId: googleClientId,
    androidClientId: googleClientId,
  });

  const handleGoogle = async () => {
    setLoading('google');
    try {
      const result = await promptGoogleAsync();
      if (result.type === 'success' && result.authentication?.idToken) {
        await loginWithGoogle(result.authentication.idToken);
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleApple = async () => {
    setLoading('apple');
    try {
      await loginWithApple();
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', 'Apple sign-in failed. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      {/* Logo */}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 100 }}
        style={styles.logoArea}
      >
        <Text style={styles.logo}>🏷️</Text>
        <Text style={styles.appName}>PricePop</Text>
        <Text style={styles.tagline}>How well do you know your prices?</Text>
      </MotiView>

      {/* Auth Buttons */}
      <MotiView
        from={{ translateY: 40, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: 'timing', duration: 500, delay: 300 }}
        style={styles.buttonsArea}
      >
        {/* Apple Sign-In — iOS only, required by App Store */}
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={RADIUS.full}
            style={styles.appleBtn}
            onPress={handleApple}
          />
        )}

        {/* Google */}
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={handleGoogle}
          disabled={!!loading}
          activeOpacity={0.85}
        >
          {loading === 'google' ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity
          style={[styles.socialBtn, styles.emailBtn]}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.socialIcon}>✉️</Text>
          <Text style={styles.socialText}>Continue with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            No account?{' '}
            <Text style={styles.registerLinkText}>Create one</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By continuing, you agree to our Terms & Privacy Policy.
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: SPACING.xl,
  },
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.sm,
  },
  appName: {
    fontSize: FONT_SIZES['5xl'],
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  buttonsArea: {
    gap: SPACING.sm,
  },
  appleBtn: {
    height: 54,
    width: '100%',
  },
  socialBtn: {
    height: 54,
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emailBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  socialIcon: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  socialText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  registerLinkText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  legal: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
});
