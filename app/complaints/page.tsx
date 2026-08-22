"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";

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

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;

      if (!user) {
        throw new Error("Please login first.");
      }

      const token = await user.getIdToken();

      const response = await fetch("/api/dashboard/complaints", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to fetch complaints"
        );
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Complaints error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load complaints"
      );
    } finally {
      setLoading(false);
    }
  }

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
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to update status"
        );
      }

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status }
            : complaint
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update complaint status.");
    }
  }

  function formatText(value: string) {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

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

  const total = complaints.length;

  const open = complaints.filter(
    (c) => c.status === "open"
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;

  const resolved = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800">

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Complaints Management
          </h1>

          <p className="text-xs text-slate-500">
            View and manage reported waste issues
          </p>
        </div>

        <div className="flex items-center gap-2">

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Dashboard
          </Link>

          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            ↻ Refresh
          </button>

        </div>

      </header>

      <main className="space-y-6 p-4 sm:p-6 lg:p-8">

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Complaints
            </p>

            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {loading ? "..." : total}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Open
            </p>

            <p className="mt-2 text-3xl font-extrabold text-amber-600">
              {loading ? "..." : open}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-extrabold text-blue-600">
              {loading ? "..." : inProgress}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-extrabold text-emerald-600">
              {loading ? "..." : resolved}
            </p>
          </div>

        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Complaints
              </h2>

              <p className="text-xs text-slate-500">
                Municipal waste reports received from citizens
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {total} Reports
            </span>

          </div>

          {loading ? (

            <div className="p-12 text-center text-sm text-slate-500">
              Loading complaints...
            </div>

          ) : complaints.length === 0 ? (

            <div className="p-12 text-center">
              <div className="text-4xl">🗑️</div>

              <p className="mt-3 font-semibold text-slate-700">
                No complaints found
              </p>

              <p className="mt-1 text-sm text-slate-400">
                New complaints will appear here.
              </p>
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-left text-sm">

                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">

                  <tr>
                    <th className="px-6 py-4">Waste Issue</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Reports</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {complaints.map((complaint) => (

                    <tr
                      key={complaint.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                            🗑️
                          </div>

                          <div>

                            <p className="font-semibold text-slate-900">
                              {formatText(complaint.wasteType)}
                            </p>

                            <p className="text-xs text-slate-400">
                              {formatText(complaint.sizeCategory)} Volume
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityStyle(
                            complaint.priorityLevel
                          )}`}
                        >
                          {formatText(complaint.priorityLevel)}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <p className="font-bold text-slate-900">
                          {complaint.priorityScore}
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            /100
                          </span>
                        </p>

                        <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  complaint.priorityScore || 0,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <p className="text-xs font-medium text-slate-700">
                          📍 {Number(complaint.lat).toFixed(4)}
                        </p>

                        <p className="text-xs text-slate-400">
                          {Number(complaint.lng).toFixed(4)}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <select
                          value={complaint.status}
                          onChange={(e) =>
                            updateComplaintStatus(
                              complaint.id,
                              e.target.value
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold outline-none ${getStatusStyle(
                            complaint.status
                          )}`}
                        >

                          <option value="open">Open</option>

                          <option value="in_progress">
                            In Progress
                          </option>

                          <option value="resolved">
                            Resolved
                          </option>

                        </select>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <span className="font-semibold text-slate-900">
                            {complaint.reportCount}
                          </span>

                          {complaint.isDuplicate && (
                            <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                              Duplicate
                            </span>
                          )}

                        </div>

                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">

                        {complaint.createdAt
                          ? new Date(
                              complaint.createdAt
                            ).toLocaleString()
                          : "N/A"}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}