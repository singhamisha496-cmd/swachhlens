"use client";

import UserGuard from "@/components/UserGuard";

import { useRef, useState } from "react";

type LocationData = {
  latitude: number;
  longitude: number;
};

type AIResult = {
  wasteType: string;
  sizeCategory: string;
  confidence: number;
  description: string;
};

const wasteTypes = [
  { name: "Garbage", icon: "🗑️" },
  { name: "Plastic", icon: "🧴" },
  { name: "Overflowing Bin", icon: "🚮" },
  { name: "Construction", icon: "🧱" },
  { name: "Litter", icon: "🛍️" },
  { name: "Other", icon: "•••" },
];

export default function ReportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const [location, setLocation] =
    useState<LocationData | null>(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState("Garbage");

  const [comment, setComment] = useState("");

  const [loadingAI, setLoadingAI] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [aiResult, setAiResult] =
    useState<AIResult | null>(null);

  const [complaintId, setComplaintId] =
    useState("");

  // -----------------------------------------
  // Convert image to Base64
  // -----------------------------------------

  const fileToBase64 = (
    file: File
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        const result = reader.result as string;

        const base64 = result.split(",")[1];

        resolve(base64);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // -----------------------------------------
  // Photo
  // -----------------------------------------

  const handlePhoto = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setPhoto(imageUrl);
    setFileName(file.name);
    setSelectedFile(file);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      handlePhoto(file);
    }
  };

  const takePhoto = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    if (photo) {
      URL.revokeObjectURL(photo);
    }

    setPhoto(null);
    setFileName("");
    setSelectedFile(null);
    setAiResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // -----------------------------------------
  // Location
  // -----------------------------------------

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
      },
      () => {
        alert(
          "Unable to get your location. Please allow location permission."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // -----------------------------------------
  // Submit complaint
  // -----------------------------------------

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please upload a photo of the waste.");
      return;
    }

    if (!location) {
      alert("Please capture your location.");
      return;
    }

    try {
      setLoadingAI(true);
      setAiResult(null);

      const imageBase64 =
        await fileToBase64(selectedFile);

      const response = await fetch(
        "/api/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64,
            imageMimeType: selectedFile.type,
            lat: location.latitude,
            lng: location.longitude,
            comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to submit the complaint."
        );
      }

      setAiResult(data.classification);

      setComplaintId(
        data.complaintId || ""
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Complaint submission error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the complaint."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  // -----------------------------------------
  // Reset
  // -----------------------------------------

  const resetReport = () => {
    if (photo) {
      URL.revokeObjectURL(photo);
    }

    setSubmitted(false);
    setPhoto(null);
    setSelectedFile(null);
    setFileName("");
    setLocation(null);
    setSelectedType("Garbage");
    setComment("");
    setAiResult(null);
    setComplaintId("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================
  // SUCCESS SCREEN
  // =========================================

  if (submitted) {
    return (
      <UserGuard>
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-8">
          <div className="mx-auto flex min-h-[85vh] max-w-2xl items-center justify-center">
            <div className="w-full rounded-3xl border border-green-200 bg-white p-6 shadow-xl sm:p-10">

              <div className="text-center">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-5xl">
                  ✅
                </div>

                <h1 className="text-3xl font-bold text-green-700">
                  Report Submitted!
                </h1>

                <p className="mt-2 text-gray-600">
                  Thank you for helping keep your area clean.
                </p>

                {complaintId && (
                  <p className="mt-3 text-xs text-gray-500">
                    Complaint ID:{" "}
                    <span className="font-semibold">
                      {complaintId}
                    </span>
                  </p>
                )}

              </div>

              {/* Report Details */}

              <div className="mt-8 space-y-5 rounded-2xl bg-gray-50 p-5">

                <div>
                  <p className="font-semibold text-gray-800">
                    📷 Photo
                  </p>

                  <p className="mt-1 break-all text-gray-600">
                    {fileName}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    📍 Location
                  </p>

                  <p className="mt-1 text-gray-600">
                    Latitude:{" "}
                    {location?.latitude.toFixed(6)}
                  </p>

                  <p className="text-gray-600">
                    Longitude:{" "}
                    {location?.longitude.toFixed(6)}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    🗑️ Selected Waste Type
                  </p>

                  <p className="mt-1 text-gray-600">
                    {selectedType}
                  </p>
                </div>

                {aiResult && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                    <p className="font-semibold text-green-800">
                      🤖 AI Analysis
                    </p>

                    <p className="mt-2 text-sm text-gray-700">
                      Waste Type:{" "}
                      <span className="font-semibold">
                        {aiResult.wasteType}
                      </span>
                    </p>

                    <p className="text-sm text-gray-700">
                      Size:{" "}
                      <span className="font-semibold">
                        {aiResult.sizeCategory}
                      </span>
                    </p>

                    <p className="text-sm text-gray-700">
                      Confidence:{" "}
                      <span className="font-semibold">
                        {(
                          aiResult.confidence * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {aiResult.description}
                    </p>

                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-800">
                    💬 Comment
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-gray-600">
                    {comment ||
                      "No comment added."}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    🕐 Reported At
                  </p>

                  <p className="mt-1 text-gray-600">
                    {new Date().toLocaleString()}
                  </p>
                </div>

              </div>

              <button
                onClick={resetReport}
                className="mt-7 w-full rounded-xl bg-green-700 py-3.5 font-semibold text-white transition hover:bg-green-800"
              >
                Report Another Issue
              </button>

            </div>
          </div>
        </main>
      </UserGuard>
    );
  }

  // =========================================
  // REPORT FORM
  // =========================================

  return (
    <UserGuard>
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-3 py-5 sm:px-6 sm:py-8">

        <div className="mx-auto w-full max-w-2xl">

          {/* HEADER */}

          <header className="mb-6 rounded-3xl bg-white px-5 py-5 shadow-sm sm:px-8">

            <div className="flex items-center gap-3">

              <button
                type="button"
                className="text-3xl leading-none text-green-700"
                onClick={() =>
                  window.history.back()
                }
              >
                ←
              </button>

              <div className="flex-1 text-center">

                <div className="flex items-center justify-center gap-2">

                  <span className="text-3xl">
                    ♻️
                  </span>

                  <h1 className="text-2xl font-bold text-green-800 sm:text-3xl">
                    SwachhLens
                  </h1>

                </div>

                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                  Report a waste issue in your area
                </p>

              </div>

              <div className="w-8" />

            </div>

          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* PHOTO */}

            <section className="rounded-3xl bg-white p-5 shadow-md sm:p-7">

              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                <span className="text-2xl">
                  📷
                </span>

                Waste Photo
              </h2>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              {!photo ? (
                <button
                  type="button"
                  onClick={takePhoto}
                  className="flex min-h-[250px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-300 bg-green-50 px-5 text-center transition hover:bg-green-100"
                >

                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-200 text-5xl">
                    📷
                  </div>

                  <p className="text-lg font-bold text-gray-900">
                    Take a Photo / Choose Photo
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Capture a clear photo of the waste issue
                  </p>

                </button>
              ) : (
                <div>

                  <div className="relative overflow-hidden rounded-2xl">

                    <img
                      src={photo}
                      alt="Waste preview"
                      className="h-64 w-full object-cover sm:h-80"
                    />

                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-xl text-white shadow-lg hover:bg-red-600"
                    >
                      ×
                    </button>

                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={takePhoto}
                      className="rounded-xl border border-green-500 py-3 font-semibold text-green-700 transition hover:bg-green-50"
                    >
                      🔄 Retake
                    </button>

                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-xl border border-red-400 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      🗑️ Remove
                    </button>

                  </div>

                </div>
              )}

            </section>

            {/* LOCATION */}

            <section className="rounded-3xl bg-white p-5 shadow-md sm:p-7">

              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                <span className="text-2xl">
                  📍
                </span>
                Location
              </h2>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">

                {!location ? (
                  <>
                    <p className="mb-4 text-gray-700">
                      GPS location has not been captured yet.
                    </p>

                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={locationLoading}
                      className="w-full rounded-xl bg-green-700 py-3.5 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locationLoading
                        ? "Getting Location..."
                        : "📍 Get My Current Location"}
                    </button>
                  </>
                ) : (
                  <>

                    <div className="mb-3 flex items-center gap-2 font-semibold text-green-700">

                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-200">
                        ✓
                      </span>

                      Location captured

                    </div>

                    <p className="text-sm text-gray-700">
                      Latitude:{" "}
                      {location.latitude.toFixed(6)}
                    </p>

                    <p className="text-sm text-gray-700">
                      Longitude:{" "}
                      {location.longitude.toFixed(6)}
                    </p>

                    <button
                      type="button"
                      onClick={getLocation}
                      className="mt-4 rounded-xl border border-green-500 px-5 py-2.5 font-semibold text-green-700 hover:bg-green-100"
                    >
                      Change Location
                    </button>

                  </>
                )}

              </div>

            </section>

            {/* WASTE TYPE */}

            <section className="rounded-3xl bg-white p-5 shadow-md sm:p-7">

              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">

                <span className="text-2xl">
                  🗑️
                </span>

                Waste Type

                <span className="text-sm font-normal text-gray-500">
                  (Optional)
                </span>

              </h2>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                {wasteTypes.map((type) => {

                  const active =
                    selectedType === type.name;

                  return (
                    <button
                      type="button"
                      key={type.name}
                      onClick={() =>
                        setSelectedType(
                          type.name
                        )
                      }
                      className={`min-h-[90px] rounded-2xl border-2 px-2 py-3 transition ${
                        active
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-800 hover:border-green-300"
                      }`}
                    >

                      <div className="text-2xl">
                        {type.icon}
                      </div>

                      <div className="mt-2 text-sm font-semibold">
                        {type.name}
                      </div>

                    </button>
                  );
                })}

              </div>

            </section>

            {/* TIMESTAMP */}

            <section className="rounded-3xl bg-white p-5 shadow-md sm:p-7">

              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">

                <span className="text-2xl">
                  🕐
                </span>

                Timestamp

              </h2>

              <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-4">

                <p className="text-sm text-gray-700">
                  The current date and time will be automatically captured.
                </p>

                <span className="ml-3 shrink-0 rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-700">
                  Auto
                </span>

              </div>

            </section>

            {/* COMMENT */}

            <section className="rounded-3xl bg-white p-5 shadow-md sm:p-7">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">

                  <span className="text-2xl">
                    💬
                  </span>

                  Comment

                  <span className="text-sm font-normal text-gray-500">
                    (Optional)
                  </span>

                </h2>

                <span className="text-xs text-gray-500">
                  {comment.length}/500
                </span>

              </div>

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value.slice(
                      0,
                      500
                    )
                  )
                }
                rows={5}
                placeholder="What's happening? Describe the waste issue..."
                className="w-full resize-none rounded-2xl border border-gray-300 p-4 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

            </section>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loadingAI}
              className="w-full rounded-2xl bg-green-700 py-4 text-lg font-bold tracking-wide text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingAI
                ? "🤖 ANALYZING & SUBMITTING..."
                : "➤  REPORT ISSUE"}
            </button>

            <div className="pb-6 text-center">

              <p className="text-sm text-green-700">
                🛡️ Thank you for keeping our city clean! 🌱
              </p>

            </div>

          </form>

        </div>

      </main>
    </UserGuard>
  );
}