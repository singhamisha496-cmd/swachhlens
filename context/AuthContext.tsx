"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  User,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  firestore,
} from "@/lib/firebase";

type UserRole = "user" | "admin";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [role, setRole] =
    useState<UserRole | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          try {
            setUser(currentUser);

            if (!currentUser) {
              setRole(null);
              setLoading(false);
              return;
            }

            const userRef = doc(
              firestore,
              "users",
              currentUser.uid
            );

            const userSnapshot =
              await getDoc(userRef);

            if (!userSnapshot.exists()) {
              setRole(null);
              setLoading(false);
              return;
            }

            const userData =
              userSnapshot.data();

            if (
              userData.role === "user" ||
              userData.role === "admin"
            ) {
              setRole(userData.role);
            } else {
              setRole(null);
            }
          } catch (error) {
            console.error(
              "Error loading authentication data:",
              error
            );

            setRole(null);
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}