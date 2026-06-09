import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";


export async function POST(req: Request) {
  console.log("📩 /api/send-email HIT");

  try {
    const body = await req.json();

    console.log("📦 RAW REQUEST BODY:", body);

    const { type, order } = body;

    console.log("📌 EMAIL TYPE RECEIVED:", type);
    console.log("👤 ORDER RECEIVED:", {
      email: order?.customer_email,
      name: order?.customer_name,
      id: order?.id,
    });

    // ✅ Validate allowed types
    const allowedTypes = ["paid", "shipped", "cancelled", "refunded"] as const;

    if (!allowedTypes.includes(type)) {
      console.error("❌ INVALID EMAIL TYPE:", type);

      return NextResponse.json(
        { success: false, error: "Invalid email type", receivedType: type },
        { status: 400 }
      );
    }

    // ✅ Validate order data
    if (!order?.customer_email || !order?.customer_name) {
      console.error("❌ MISSING ORDER DATA:", order);

      return NextResponse.json(
        { success: false, error: "Missing order customer details", order },
        { status: 400 }
      );
    }

    console.log("🚀 CALLING sendOrderEmail...");

    const result = await sendOrderEmail(type, order);

    console.log("📨 EMAIL RESULT:", result);

    if (!result.success) {
      console.error("❌ EMAIL FAILED:", result.error);

      return NextResponse.json(
        { success: false, error: result.error || "Email failed" },
        { status: 500 }
      );
    }

    console.log("✅ EMAIL SENT SUCCESSFULLY");

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.error("🔥 send-email API CRASHED:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}