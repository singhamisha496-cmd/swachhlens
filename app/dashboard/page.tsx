"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface Complaint {
  id: string;
  wasteType: string;
  sizeCategory: string;
  lat: number;
  lng: number;
  priorityScore: number;
  priorityLevel: string;
  recommendedAction: string;
  status: string;
  isDuplicate: boolean;
  duplicateOf: string | null;
  reportCount: number;
  aiConfidence: number;
  aiDescription: string;
  comment: string;
  createdAt: string;
}

export default function Dashboard() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    role,
    logout,
  } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ==========================================
  // FETCH COMPLAINTS
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/complaints");

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();

      if (data.success) {
        setComplaints(data.complaints || []);
      } else {
        throw new Error(
          data.error || "Failed to fetch complaints"
        );
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load complaints");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logout();

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);

      alert(
        "Unable to logout. Please try again."
      );

      setLoggingOut(false);
    }
  }

  // ==========================================
  // UPDATE COMPLAINT STATUS
  // ==========================================

  async function updateComplaintStatus(
    complaintId: string,
    status: string
  ) {
    try {
      const response = await fetch(
        `/api/complaints/${complaintId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Failed to update status"
        );
      }

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status,
              }
            : complaint
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        "Failed to update complaint status."
      );
    }
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalReports = complaints.length;

  const criticalReports = complaints.filter(
    (c) => c.priorityLevel === "critical"
  ).length;

  const openReports = complaints.filter(
    (c) => c.status === "open"
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;

  const resolvedReports = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  // ==========================================
  // FORMAT WASTE TYPE
  // ==========================================

  function formatWasteType(type: string) {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  // ==========================================
  // PRIORITY STYLE
  // ==========================================

  function getPriorityStyle(priority: string) {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";

      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  }

  // ==========================================
  // STATUS STYLE
  // ==========================================

  function getStatusStyle(status: string) {
    switch (status) {
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  // ==========================================
  // SIDEBAR NAVIGATION
  // ==========================================

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "📊",
    },
    {
      label: "Complaints",
      href: "/complaints",
      icon: "🗑️",
    },
    {
      label: "Map View",
      href: "/locations",
      icon: "📍",
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: "📈",
    },
    {
      label: "Reports",
      href: "/report",
      icon: "📄",
    },
  ];

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-slate-800">

      {/* ====================================== */}
      {/* MOBILE OVERLAY */}
      {/* ====================================== */}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() =>
            setIsSidebarOpen(false)
          }
        />
      )}

      {/* ====================================== */}
      {/* SIDEBAR */}
      {/* ====================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between bg-[#0F2228] text-slate-300 transition-transform duration-300 ease-in-out ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* SIDEBAR TOP */}

        <div className="overflow-y-auto px-4 py-5">

          {/* LOGO */}

          <div className="mb-6 flex items-center justify-between px-3">

            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-md">
                🌿
              </div>

              <div>

                <h1 className="text-lg font-bold leading-tight text-white">
                  SwachhLens
                </h1>

                <p className="text-xs text-slate-400">
                  Municipal Dashboard
                </p>

              </div>

            </Link>

            <button
              onClick={() =>
                setIsSidebarOpen(false)
              }
              className="text-slate-400 hover:text-white lg:hidden"
            >
              ✕
            </button>

          </div>

          {/* NAVIGATION */}

          <nav className="space-y-1">

            {navItems.map((item) => {

              const isActive =
                pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setIsSidebarOpen(false)
                  }
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >

                  <span className="text-base">
                    {item.icon}
                  </span>

                  {item.label}

                </Link>
              );
            })}

          </nav>

        </div>

        {/* ==================================== */}
        {/* SIDEBAR FOOTER */}
        {/* ==================================== */}

        <div className="border-t border-slate-800 p-4">

          <div className="rounded-xl border border-slate-700/50 bg-[#14323B] p-3.5 text-xs text-slate-300">

            <p className="font-semibold text-white">
              Swachh City, Our Duty
            </p>

            <p className="mt-1 text-slate-400">
              Let&apos;s build a cleaner and healthier tomorrow.
            </p>

          </div>

        </div>

      </aside>

      {/* ====================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================== */}

      <div className="flex min-h-screen flex-col lg:ml-64">

        {/* ==================================== */}
        {/* TOP BAR */}
        {/* ==================================== */}

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-8">

          {/* LEFT SIDE */}

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setIsSidebarOpen(true)
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              ☰
            </button>

            <div>

              <h2 className="text-xl font-bold leading-snug text-slate-900">
                Welcome, Municipal Officer
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Monitor and manage waste issues across the city
              </p>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-3">

            {/* REFRESH */}

            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              ↻ Refresh Data
            </button>

            {/* USER INFO */}

            <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                {user?.email
                  ? user.email
                      .charAt(0)
                      .toUpperCase()
                  : "A"}
              </div>

              <div className="text-xs">

                <p className="max-w-[180px] truncate font-semibold text-slate-800">
                  {user?.email || "Admin"}
                </p>

                <p className="text-slate-400">
                  {role === "admin"
                    ? "Municipal Admin"
                    : "Administrator"}
                </p>

              </div>

            </div>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>

          </div>

        </header>

        {/* ==================================== */}
        {/* CONTENT */}
        {/* ==================================== */}

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ================================= */}
          {/* STAT CARDS */}
          {/* ================================= */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {/* TOTAL */}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Total Complaints
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {loading
                    ? "..."
                    : totalReports}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-xl text-emerald-700">
                📋
              </div>

            </div>

            {/* OPEN */}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Open Complaints
                </p>

                <p className="mt-1 text-2xl font-extrabold text-amber-600">
                  {loading
                    ? "..."
                    : openReports}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-xl text-amber-700">
                ⚠️
              </div>

            </div>

            {/* IN PROGRESS */}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div>

                <p className="text-xs font-medium text-slate-500">
                  In Progress
                </p>

                <p className="mt-1 text-2xl font-extrabold text-blue-600">
                  {loading
                    ? "..."
                    : inProgress}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-xl text-blue-700">
                👷
              </div>

            </div>

            {/* RESOLVED */}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Resolved
                </p>

                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  {loading
                    ? "..."
                    : resolvedReports}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-xl text-emerald-700">
                ✓
              </div>

            </div>

            {/* CRITICAL */}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div>

                <p className="text-xs font-medium text-slate-500">
                  Critical Priority
                </p>

                <p className="mt-1 text-2xl font-extrabold text-red-600">
                  {loading
                    ? "..."
                    : criticalReports}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-100 text-xl text-red-700">
                🚨
              </div>

            </div>

          </div>

          {/* ================================= */}
          {/* COMPLAINT TABLE */}
          {/* ================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* TABLE HEADER */}

            <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h3 className="text-lg font-bold text-slate-900">
                  Recent Complaints
                </h3>

                <p className="text-xs text-slate-500">
                  Live data feed of reported issues across municipal sectors
                </p>

              </div>

              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {totalReports} Total Reports
              </span>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="p-12 text-center text-sm text-slate-500">
                Loading complaints...
              </div>

            ) : complaints.length === 0 ? (

              /* EMPTY */

              <div className="p-12 text-center text-sm text-slate-500">
                No complaints found.
              </div>

            ) : (

              /* TABLE */

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left text-sm">

                  <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">

                    <tr>

                      <th className="px-6 py-3.5">
                        Waste Issue
                      </th>

                      <th className="px-6 py-3.5">
                        Priority
                      </th>

                      <th className="px-6 py-3.5">
                        Score
                      </th>

                      <th className="px-6 py-3.5">
                        Coordinates
                      </th>

                      <th className="px-6 py-3.5">
                        Status Action
                      </th>

                      <th className="px-6 py-3.5">
                        Reports
                      </th>

                      <th className="px-6 py-3.5">
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700">

                    {complaints.map(
                      (complaint) => (

                        <tr
                          key={complaint.id}
                          className="transition hover:bg-slate-50/80"
                        >

                          {/* WASTE ISSUE */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">
                                🗑️
                              </div>

                              <div>

                                <p className="font-semibold text-slate-900">
                                  {formatWasteType(
                                    complaint.wasteType
                                  )}
                                </p>

                                <p className="text-xs text-slate-400">
                                  {formatWasteType(
                                    complaint.sizeCategory
                                  )}{" "}
                                  Volume
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* PRIORITY */}

                          <td className="px-6 py-4">

                            <span
                              className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                                complaint.priorityLevel
                              )}`}
                            >
                              {formatWasteType(
                                complaint.priorityLevel
                              )}
                            </span>

                          </td>

                          {/* SCORE */}

                          <td className="px-6 py-4">

                            <div className="font-bold text-slate-900">

                              {complaint.priorityScore}

                              <span className="text-xs font-normal text-slate-400">
                                {" "}
                                / 100
                              </span>

                            </div>

                            <div className="mt-1.5 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className={`h-full ${
                                  complaint.priorityLevel ===
                                  "critical"
                                    ? "bg-red-500"
                                    : complaint.priorityLevel ===
                                      "high"
                                    ? "bg-orange-500"
                                    : complaint.priorityLevel ===
                                      "medium"
                                    ? "bg-yellow-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      complaint.priorityScore,
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </td>

                          {/* COORDINATES */}

                          <td className="px-6 py-4">

                            <p className="text-xs font-medium text-slate-700">
                              📍{" "}
                              {complaint.lat.toFixed(
                                4
                              )}
                              ,{" "}
                              {complaint.lng.toFixed(
                                4
                              )}
                            </p>

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">

                            <select
                              value={
                                complaint.status
                              }
                              onChange={(e) =>
                                updateComplaintStatus(
                                  complaint.id,
                                  e.target.value
                                )
                              }
                              className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none transition ${getStatusStyle(
                                complaint.status
                              )}`}
                            >

                              <option value="open">
                                Open
                              </option>

                              <option value="in_progress">
                                In Progress
                              </option>

                              <option value="resolved">
                                Resolved
                              </option>

                            </select>

                          </td>

                          {/* REPORT COUNT */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-2">

                              <span className="font-semibold text-slate-900">
                                {complaint.reportCount}
                              </span>

                              {complaint.isDuplicate && (
                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                                  Duplicate
                                </span>
                              )}

                            </div>

                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">

                            {new Date(
                              complaint.createdAt
                            ).toLocaleString()}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}