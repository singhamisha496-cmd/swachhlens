"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();

  const {
    user,
    role,
    loading,
  } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role === "admin") {
      router.replace("/dashboard");
      return;
    }

    if (role === "user") {
      router.replace("/report");
      return;
    }

    router.replace("/login");
  }, [user, role, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />

        <p className="text-sm font-medium text-gray-600">
          Loading SwachhLens...
        </p>
      </div>
    </main>
  );
}