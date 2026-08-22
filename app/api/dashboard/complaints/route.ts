import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { db } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // ==========================================
    // GET AUTHORIZATION HEADER
    // ==========================================

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // EXTRACT FIREBASE ID TOKEN
    // ==========================================

    const token = authorization.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing authentication token.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // VERIFY FIREBASE TOKEN
    // ==========================================

    const decodedToken = await getAuth().verifyIdToken(token);

    const uid = decodedToken.uid;

    // ==========================================
    // GET USER ROLE FROM FIRESTORE
    // ==========================================

    const userDoc = await db
      .collection("users")
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found.",
        },
        { status: 403 }
      );
    }

    const userData = userDoc.data();

    // ==========================================
    // ADMIN ACCESS CHECK
    // ==========================================

    if (userData?.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Admin privileges required.",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // FETCH COMPLAINTS
    // ==========================================

    const snapshot = await db
      .collection("complaints")
      .orderBy("createdAt", "desc")
      .get();

    // ==========================================
    // FORMAT COMPLAINTS
    // ==========================================

    const complaints = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,

        // Convert Firestore Timestamp to ISO string
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() ??
          data.createdAt ??
          null,
      };
    });

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Dashboard complaints API error:", error);

    // ==========================================
    // FIREBASE AUTH ERRORS
    // ==========================================

    if (
      error instanceof Error &&
      (
        error.message.includes("Firebase ID token") ||
        error.message.includes("expired") ||
        error.message.includes("invalid")
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired authentication token.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // GENERAL ERROR
    // ==========================================

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch complaints.",
      },
      { status: 500 }
    );
  }
}