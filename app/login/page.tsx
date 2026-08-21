"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      /*
       * We do NOT decide the role here.
       *
       * AuthContext will detect the user's role.
       */

      console.log(
        "Login successful:",
        user.uid
      );

      /*
       * Wait for AuthContext to process the Firebase
       * authentication state, then determine destination.
       *
       * We do that by checking Firestore directly here.
       */

      const { doc, getDoc } =
        await import("firebase/firestore");

      const { firestore } =
        await import("@/lib/firebase");

      const userDoc = await getDoc(
        doc(
          firestore,
          "users",
          user.uid
        )
      );

      if (!userDoc.exists()) {
        setError(
          "Your account profile was not found."
        );

        await auth.signOut();
        return;
      }

      const userData = userDoc.data();

      if (userData.role === "admin") {
        router.replace("/dashboard");
      } else if (userData.role === "user") {
        router.replace("/report");
      } else {
        setError(
          "Your account does not have a valid role."
        );

        await auth.signOut();
      }

    } catch (error: any) {
      console.error("Login error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError(
          "Invalid email or password."
        );
      } else if (
        error.code === "auth/too-many-requests"
      ) {
        setError(
          "Too many login attempts. Please try again later."
        );
      } else {
        setError(
          error.message ||
            "Login failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-8">

      <div className="w-full max-w-md">

        {/* HEADER */}

        <div className="mb-6 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 text-3xl shadow-lg">
            ♻️
          </div>

          <h1 className="text-3xl font-bold text-green-800">
            SwachhLens
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Smart waste reporting for a cleaner city.
          </p>

        </div>

        {/* LOGIN CARD */}

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Login to continue to SwachhLens.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="mt-6 space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 py-3.5 font-bold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* REGISTER */}

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">

            <p className="text-sm text-gray-600">
              Don&apos;t have an account?
            </p>

            <Link
              href="/register"
              className="mt-2 inline-block font-bold text-green-700 hover:text-green-800 hover:underline"
            >
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}