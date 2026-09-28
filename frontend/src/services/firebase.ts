import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type ConfirmationResult,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCUw4gYFma3fnKLAMD2hB8BClUCsmL4QoI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'unistore-app-live.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'unistore-app-live',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'unistore-app-live.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '563037245485',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:563037245485:web:55a0ec547887b9fe81e8a4',
};

// Initialize Firebase App singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/**
 * Sign in with Apple Popup
 */
export async function signInWithApple() {
  const result = await signInWithPopup(firebaseAuth, appleProvider);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/**
 * Initialize invisible ReCAPTCHA for Phone Authentication
 */
export async function setupRecaptcha(containerId: string = 'recaptcha-container'): Promise<RecaptchaVerifier> {
  // Clear any existing verifier on window if necessary
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      console.warn('Error clearing existing RecaptchaVerifier:', e);
    }
    (window as any).recaptchaVerifier = null;
  }

  // Ensure DOM container exists and is completely cleared
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  } else {
    container.innerHTML = '';
  }

  const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA token expired, clearing verifier');
      try {
        verifier.clear();
      } catch {}
      (window as any).recaptchaVerifier = null;
    },
  });

  // Explicitly pre-render widget to obtain valid widgetId before sending request
  await verifier.render();
  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Clean up recaptcha verifier and its container
 */
export function clearRecaptcha(containerId: string = 'recaptcha-container') {
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {}
    (window as any).recaptchaVerifier = null;
  }
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Send Phone OTP via SMS
 */
export async function sendPhoneOtp(phoneWithCountryCode: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(firebaseAuth, phoneWithCountryCode, verifier);
}

/**
 * Verify OTP entered by user
 */
export async function verifyPhoneOtp(confirmationResult: ConfirmationResult, code: string) {
  const result = await confirmationResult.confirm(code);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(firebaseAuth, email, pass);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/**
 * Register with Email and Password and send verification email
 */
export async function registerWithEmailAndVerification(email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
  await sendEmailVerification(result.user);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

export const registerWithEmail = registerWithEmailAndVerification;

/**
 * Resend email verification
 */
export async function resendEmailVerification(user: FirebaseUser) {
  await sendEmailVerification(user);
}

/**
 * Login with email and verify if email is verified
 */
export async function loginWithEmailChecked(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(firebaseAuth, email, pass);
  if (!result.user.emailVerified) {
    const error: any = new Error('Your email address is not verified yet. Please check your inbox or spam folder for the verification link.');
    error.code = 'auth/unverified-email';
    error.user = result.user;
    throw error;
  }
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/**
 * Send Password Reset Email via Firebase
 */
export async function sendResetPasswordEmail(email: string) {
  return await sendPasswordResetEmail(firebaseAuth, email);
}

/**
 * Sign out of Firebase
 */
export async function logoutFirebase() {
  return await firebaseSignOut(firebaseAuth);
}

/**
 * Client-side Cloud Firestore Backsupport Helper
 * Mirrored secondary backup directly into Firestore
 */
export async function syncOrderToFirestoreBackup(orderData: any) {
  try {
    const orderId = orderData.order_number || orderData.id;
    if (!orderId) return;
    const docRef = doc(firestore, 'backup_orders', orderId);
    await setDoc(docRef, {
      ...orderData,
      backed_up_at: serverTimestamp(),
      source: 'UniStore_Client_Sync',
    }, { merge: true });
    console.log(`[Firebase Backup] Order ${orderId} synced to Firestore backup successfully.`);
  } catch (err) {
    console.warn('[Firebase Backup] Client sync failed (will be handled by backend):', err);
  }
}

export { onAuthStateChanged, type FirebaseUser };
