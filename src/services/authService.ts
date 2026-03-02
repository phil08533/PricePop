import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { auth } from './firebase';
import { createUserProfile } from './userService';

// ─── Email Auth ───────────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user);
  return credential.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ─── Google Auth ──────────────────────────────────────────────────────────────

export async function loginWithGoogle(idToken: string): Promise<User> {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, googleCredential);
  await createUserProfile(result.user, true);
  return result.user;
}

// ─── Apple Auth (iOS only — required by App Store) ────────────────────────────

export async function loginWithApple(): Promise<User> {
  // Generate nonce for security
  const rawNonce = Array.from(
    { length: 32 },
    () => Math.random().toString(36)[2]
  ).join('');
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  const { identityToken } = appleCredential;
  if (!identityToken) throw new Error('Apple Sign-In failed: no identity token');

  const provider = new OAuthProvider('apple.com');
  const oauthCredential = provider.credential({
    idToken: identityToken,
    rawNonce,
  });

  const result = await signInWithCredential(auth, oauthCredential);

  // Apple only gives name on first sign-in
  if (appleCredential.fullName?.givenName) {
    const displayName = [
      appleCredential.fullName.givenName,
      appleCredential.fullName.familyName,
    ]
      .filter(Boolean)
      .join(' ');
    await updateProfile(result.user, { displayName });
  }

  await createUserProfile(result.user, true);
  return result.user;
}

// ─── Sign Out ────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await signOut(auth);
}
