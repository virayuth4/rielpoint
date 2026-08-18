"use client";

import authenticatedFetch from "@/app/auth/authenticatedFetch";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AddMerchantPage() {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const merchantId = searchParams.get("id");

  const missingIdError = isEditMode && !merchantId;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [affiliateNetwork, setAffiliateNetwork] = useState("");
  const [affiliateMerchantId, setAffiliateMerchantId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [trackedCashback, setTrackedCashback] = useState("");
  const [confirmedCashback, setConfirmedCashback] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [refunds, setRefunds] = useState("");
  const [terms, setTerms] = useState("");
  const [generalDescription, setGeneralDescription] = useState("");

  const [logo, setLogo] = useState(null); // { file, previewUrl }
  const [existingLogoUrl, setExistingLogoUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState(isEditMode && merchantId ? "loading" : "idle"); // loading | idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");
  

  // Auto-generate slug from name until the user edits slug manually
function generateSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (logo?.previewUrl) URL.revokeObjectURL(logo.previewUrl);
    };
  }, [logo]);

  // Fetch existing merchant data when in edit mode
  useEffect(() => {
    if (!isEditMode || !merchantId) return;

    let cancelled = false;

    async function loadMerchant() {
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate-merchants/${merchantId}`,
          { method: "GET" }
        );
        const json = await res.json();
        const merchant = json.data;

        if (cancelled) return;

        setName(merchant.name || "");
        setSlug(merchant.slug || "");
        setSlugTouched(true); // don't overwrite a fetched slug with auto-generation
        setWebsiteUrl(merchant.website_url || "");
        setAffiliateNetwork(merchant.affiliate_network || "");
        setAffiliateMerchantId(merchant.affiliate_merchant_id || "");
        setTrackingUrl(merchant.tracking_url || "");
        setIsActive(merchant.is_active !== undefined ? Boolean(merchant.is_active) : true);
        setTrackedCashback(
          merchant.tracked_cashback !== undefined && merchant.tracked_cashback !== null
            ? String(merchant.tracked_cashback)
            : ""
        );
        setConfirmedCashback(
          merchant.confirmed_cashback !== undefined && merchant.confirmed_cashback !== null
            ? String(merchant.confirmed_cashback)
            : ""
        );
        setExclusions(merchant.exclusions || "");
        setRefunds(merchant.refunds || "");
        setTerms(merchant.terms || "");
        setGeneralDescription(merchant.general_description || "");
        setExistingLogoUrl(merchant.logo_url || "");

        setStatus("idle");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err.message || "Failed to load merchant for editing.");
      }
    }

    loadMerchant();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, merchantId]);

  function addLogoFile(fileList) {
    const file = Array.from(fileList).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    if (logo?.previewUrl) URL.revokeObjectURL(logo.previewUrl);
    setLogo({ file, previewUrl: URL.createObjectURL(file) });
    setExistingLogoUrl(""); // new upload replaces the existing logo
  }

  function removeLogo() {
    if (logo?.previewUrl) URL.revokeObjectURL(logo.previewUrl);
    setLogo(null);
  }

  function removeExistingLogo() {
    setExistingLogoUrl("");
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      addLogoFile(e.dataTransfer.files);
    }
  }, [logo]);

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleFileInputChange(e) {
    if (e.target.files?.length) {
      addLogoFile(e.target.files);
    }
    e.target.value = "";
  }

  function resetForm() {
    if (logo?.previewUrl) URL.revokeObjectURL(logo.previewUrl);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setWebsiteUrl("");
    setAffiliateNetwork("");
    setAffiliateMerchantId("");
    setTrackingUrl("");
    setIsActive(true);
    setTrackedCashback("");
    setConfirmedCashback("");
    setExclusions("");
    setRefunds("");
    setTerms("");
    setGeneralDescription("");
    setLogo(null);
    setExistingLogoUrl("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("website_url", websiteUrl.trim());
    formData.append("affiliate_network", affiliateNetwork.trim());
    formData.append("affiliate_merchant_id", affiliateMerchantId.trim());
    formData.append("tracking_url", trackingUrl.trim());
    formData.append("is_active", isActive);
    if (trackedCashback !== "") formData.append("tracked_cashback", trackedCashback);
    if (confirmedCashback !== "") formData.append("confirmed_cashback", confirmedCashback);
    if (exclusions.trim()) formData.append("exclusions", exclusions.trim());
    if (refunds.trim()) formData.append("refunds", refunds.trim());
    if (terms.trim()) formData.append("terms", terms.trim());
    if (generalDescription.trim()) formData.append("general_description", generalDescription.trim());
    if (logo?.file) formData.append("logo", logo.file);

    if (isEditMode) {
      formData.append("existing_logo_url", existingLogoUrl);
    }

    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate-merchants/${merchantId}`
        : `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate-merchants/add`;

      const res = await authenticatedFetch(url, {
        method: isEditMode ? "PUT" : "POST",
        body: formData,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || `Request failed with status ${res.status}`);
      }
      console.log("res", res)

      setStatus("success");
      if (!isEditMode) resetForm();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  const isSubmitting = status === "submitting";
  const isLoading = status === "loading";

  const activeError = missingIdError ? "Missing merchant id for edit mode." : errorMessage;
  const isErrorState = status === "error" || missingIdError;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-xl text-sm text-slate-500">Loading merchant…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditMode ? "Edit affiliate merchant" : "Create affiliate merchant"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "Update the details below and save your changes."
              : "Fill in the details below to add a new affiliate merchant."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
              const newName = e.target.value;
              setName(newName);
              if (!slugTouched) {
                setSlug(generateSlug(newName));
              }
            }}
              placeholder="e.g. Acme Store"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="e.g. acme-store"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <p className="mt-1 text-xs text-slate-400">Used in URLs. Auto-generated from name until edited.</p>
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-slate-700">
              Website URL
            </label>
            <input
              id="website_url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Affiliate network / Affiliate merchant id */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="affiliate_network" className="block text-sm font-medium text-slate-700">
                Affiliate network
              </label>
              <input
                id="affiliate_network"
                type="text"
                value={affiliateNetwork}
                onChange={(e) => setAffiliateNetwork(e.target.value)}
                placeholder="e.g. CJ, Rakuten"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="affiliate_merchant_id" className="block text-sm font-medium text-slate-700">
                Affiliate merchant ID
              </label>
              <input
                id="affiliate_merchant_id"
                type="text"
                value={affiliateMerchantId}
                onChange={(e) => setAffiliateMerchantId(e.target.value)}
                placeholder="ID from the network"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* Tracking URL */}
          <div>
            <label htmlFor="tracking_url" className="block text-sm font-medium text-slate-700">
              Tracking URL
            </label>
            <textarea
              id="tracking_url"
              rows={3}
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://network.example.com/track?ref=..."
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Tracked / confirmed cashback */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tracked_cashback" className="block text-sm font-medium text-slate-700">
                Tracked cashback (%)
              </label>
              <input
                id="tracked_cashback"
                type="number"
                step="1"
                min="0"
                max="100"
                value={trackedCashback}
                onChange={(e) => setTrackedCashback(e.target.value)}
                placeholder="e.g. 10"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="confirmed_cashback" className="block text-sm font-medium text-slate-700">
                Confirmed cashback (%)
              </label>
              <input
                id="confirmed_cashback"
                type="number"
                step="1"
                min="0"
                max="100"
                value={confirmedCashback}
                onChange={(e) => setConfirmedCashback(e.target.value)}
                placeholder="e.g. 8"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* General description */}
          <div>
            <label htmlFor="general_description" className="block text-sm font-medium text-slate-700">
              General description
            </label>
            <textarea
              id="general_description"
              rows={4}
              value={generalDescription}
              onChange={(e) => setGeneralDescription(e.target.value)}
              placeholder="Describe the merchant"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Exclusions */}
          <div>
            <label htmlFor="exclusions" className="block text-sm font-medium text-slate-700">
              Exclusions
            </label>
            <textarea
              id="exclusions"
              rows={3}
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              placeholder="Categories or purchases excluded from cashback"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Refunds */}
          <div>
            <label htmlFor="refunds" className="block text-sm font-medium text-slate-700">
              Refunds policy
            </label>
            <textarea
              id="refunds"
              rows={3}
              value={refunds}
              onChange={(e) => setRefunds(e.target.value)}
              placeholder="How refunds affect cashback"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Terms */}
          <div>
            <label htmlFor="terms" className="block text-sm font-medium text-slate-700">
              Terms
            </label>
            <textarea
              id="terms"
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Any additional terms and conditions"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Logo</label>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
                isDragging
                  ? "border-slate-500 bg-slate-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mb-2 h-8 w-8 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12"
                />
              </svg>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-xs text-slate-400">PNG, JPG, or WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {(existingLogoUrl || logo) && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {existingLogoUrl && (
                  <div className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                    <img src={existingLogoUrl} alt="Current logo" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExistingLogo();
                      }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove logo"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {logo && (
                  <div className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                    <img src={logo.previewUrl} alt="Logo preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLogo();
                      }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove logo"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
              Merchant is active
            </label>
          </div>

          {/* Status messages */}
          {isErrorState && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {activeError}
            </p>
          )}
          {status === "success" && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {isEditMode ? "Merchant updated successfully." : "Merchant added successfully."}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || missingIdError}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? isEditMode ? "Saving…" : "Creating merchant…"
              : isEditMode ? "Save changes" : "Create merchant"}
          </button>
        </form>
      </div>
    </main>
  );
}