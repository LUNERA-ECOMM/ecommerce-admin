'use client';

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

const provider = new GoogleAuthProvider();

const ensureAuth = () => {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.warn('Firebase authentication is not initialized. Check environment configuration.');
  }
  return auth;
};

export const signInWithGoogle = async () => {
  const auth = ensureAuth();
  if (!auth) {
    throw new Error('Firebase authentication is not initialized.');
  }

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  const auth = ensureAuth();
  if (!auth) {
    throw new Error('Firebase authentication is not initialized.');
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const subscribeToAuth = (callback) => {
  const auth = ensureAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }

  const unsubscribe = firebaseOnAuthStateChanged(auth, callback);
  return unsubscribe;
};

export const isAdmin = (email) => email === 'arbengrepi@gmail.com';

