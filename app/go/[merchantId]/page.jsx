import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import RedirectClient from "./redirectingClient";

async function getRedirectData(merchantId, offer) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const idToken = cookieStore.get("firebase_token")?.value;
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0] ?? null;
  const userAgent = headerStore.get("user-agent") ?? null;

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
        offer_id: offer ? Number(offer) : null,
        ip_address: ip,
        user_agent: userAgent,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("click logging failed");

  const { data } = await res.json();

  const safeUrl = new URL(data.destination_url);
  if (!["http:", "https:"].includes(safeUrl.protocol)) {
    throw new Error("bad destination url");
  }

  return {
    to: safeUrl.toString(),
    name: data.merchant_name ?? "your destination",
    logo: data.merchant_logo_url ?? null,
  };
}

export default async function GoPage({ params, searchParams }) {
  const { merchantId } = await params;
  const { offer, fallback } = await searchParams;

  let redirectData = null;

  try {
    redirectData = await getRedirectData(merchantId, offer);
  } catch (err) {
    redirect(fallback || "/rewards");
  }


  return (
    <RedirectClient
      to={redirectData.to}
      name={redirectData.name}
      logo={redirectData.logo}
    />
  );
}