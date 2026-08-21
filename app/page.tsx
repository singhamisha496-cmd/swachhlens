"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* HEADER */}
      <header className="border-b border-green-100 bg-white/90 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-2xl text-white">
              🌿
            </div>

            <div>
              <h1 className="text-xl font-bold text-green-800">
                SwachhLens
              </h1>

              <p className="text-xs text-gray-500">
                Smart Waste Reporting
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* <Link
              href="/login"
              className="rounded-xl border border-green-600 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
            >
              Login
            </Link> */}

            <Link
              href="/register"
              className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-5xl shadow-sm">
            ♻️
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Keep Your City
            <span className="block text-green-700">
              Clean & Smart
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            SwachhLens helps citizens report waste issues with photos
            and location information while enabling municipal authorities
            to monitor and manage complaints efficiently.
          </p>

          {/* BUTTONS */}
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-2xl bg-green-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-800"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-2xl border-2 border-green-700 bg-white px-8 py-4 text-lg font-bold text-green-700 transition hover:bg-green-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-7 text-center shadow-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">
              📷
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              Report Waste
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Upload a photo and report waste problems in your area.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 text-center shadow-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              📍
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              Capture Location
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Share the location of the waste issue using GPS.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 text-center shadow-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
              🤖
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              AI Analysis
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              AI analyzes reported waste and helps prioritize complaints.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-green-100 bg-white px-6 py-6 text-center">
        <p className="text-sm text-gray-500">
          🛡️ SwachhLens — Building cleaner and healthier communities.
        </p>
      </footer>
    </main>
  );
}