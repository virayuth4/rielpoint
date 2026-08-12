import { NextResponse } from "next/server";

export async function POST(req) {
  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("firebase_token", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // matches Firebase ID token's 1hr expiry
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("firebase_token", "", { path: "/", maxAge: 0 });
  return res;
}