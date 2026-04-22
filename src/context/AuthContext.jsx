import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebase";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const missingFirebaseMessage =
  "Firebase authentication is not configured yet. Add your Vite Firebase environment variables to enable login.";

const ensureAuthAvailable = () => {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(missingFirebaseMessage);
  }

  return auth;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const persistSession = async () => {
    const authInstance = ensureAuthAvailable();
    await setPersistence(authInstance, browserLocalPersistence);
    return authInstance;
  };

  const signUp = async ({ name, email, password }) => {
    const authInstance = await persistSession();
    const credentials = await createUserWithEmailAndPassword(authInstance, email, password);

    if (name?.trim()) {
      await updateProfile(credentials.user, { displayName: name.trim() });
    }

    return credentials.user;
  };

  const login = async ({ email, password }) => {
    const authInstance = await persistSession();
    const credentials = await signInWithEmailAndPassword(authInstance, email, password);
    return credentials.user;
  };

  const signInWithGoogle = async () => {
    const authInstance = await persistSession();
    const credentials = await signInWithPopup(authInstance, googleProvider);
    return credentials.user;
  };

  const logout = async () => {
    const authInstance = ensureAuthAvailable();
    await signOut(authInstance);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isFirebaseConfigured,
      login,
      signUp,
      signInWithGoogle,
      logout,
      missingFirebaseMessage,
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
