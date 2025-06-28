'use client'

import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  createUserWithEmailAndPassword
} from 'firebase/auth';

export const authService = {
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  async sendInvite(email: string) {
    try {
      // Create user with random password
      const tempPassword = Math.random().toString(36).slice(-8);
      await createUserWithEmailAndPassword(auth, email, tempPassword);
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    return auth.signOut();
  }
};
