import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { merchantId } = await params; // ← fix 1: await params before reading it

  const offerId = req.nextUrl.searchParams.get("offer");
  const fallback = req.nextUrl.searchParams.get("fallback");
  const idToken = req.cookies.get("firebase_token")?.value;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/click`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          merchant_id: Number(merchantId),
          offer_id: offerId ? Number(offerId) : null,
          ip_address: ip,
          user_agent: userAgent,
        }),
      }
    );
    console.log("Respond", res)

    if (!res.ok) throw new Error("click logging failed");

    const { data } = await res.json();
    return NextResponse.redirect(data.destination_url, { status: 302 });
  } catch (err) {
    // fix 2: build an absolute URL using the incoming request as the base
    const fallbackUrl = new URL(fallback || "/rewards", req.url);
    return NextResponse.redirect(fallbackUrl, { status: 302 });
  }
}