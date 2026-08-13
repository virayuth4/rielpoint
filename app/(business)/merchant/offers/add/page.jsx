"use client";

import authenticatedFetch from "@/app/auth/authenticatedFetch";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const CATEGORY_OPTIONS = [
  { value: "", label: "Select a category" },
  { value: "hotels", label: "Hotels" },
  { value: "cafe", label: "Cafe" },
  { value: "restaurants", label: "Restaurants" },
  { value: "retail", label: "Retail" },
  { value: "travel", label: "Travel" },
  { value: "electronics", label: "Electronics" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

const CASHBACK_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage of purchase" },
  { value: "fixed", label: "Fixed amount" },
];

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "KHR"];

const MAX_IMAGES = 10;

export default function AddOfferPage() {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const offerId = searchParams.get("id");

  const missingIdError = isEditMode && !offerId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cashbackType, setCashbackType] = useState("percentage");
  const [cashbackRate, setCashbackRate] = useState("");
  const [fixedCashbackAmount, setFixedCashbackAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");
  const [maxCashbackAmount, setMaxCashbackAmount] = useState("");
  const [terms, setTerms] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [merchants, setMerchants] = useState([]);
    const [merchantId, setMerchantId] = useState("");

  const [images, setImages] = useState([]); // [{ file, previewUrl }]
  const [existingImages, setExistingImages] = useState([]); // array of URL strings
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState(isEditMode && offerId ? "loading" : "idle"); // loading | idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  async function loadMerchants() {
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/merchants`,
        { method: "GET" }
      );
      const json = await res.json();
      setMerchants(json.data || []);
    } catch (err) {
      console.error("Failed to load merchants:", err);
    }
  }
  loadMerchants();
}, []);

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  // Fetch existing offer data when in edit mode
  useEffect(() => {
    if (!isEditMode || !offerId) return;

    let cancelled = false;

    async function loadOffer() {
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/offers/${offerId}`,
          { method: "GET" }
        );
        const json = await res.json();
        const offer = json.data;

        if (cancelled) return;

        setTitle(offer.title || "");
        setDescription(offer.description || "");
        setCategory(offer.category || "");
        setCashbackType(offer.cashback_type || "percentage");
        setCashbackRate(
          offer.cashback_rate !== undefined && offer.cashback_rate !== null
            ? String(offer.cashback_rate)
            : ""
        );
        setFixedCashbackAmount(
          offer.fixed_cashback_amount !== undefined && offer.fixed_cashback_amount !== null
            ? String(offer.fixed_cashback_amount)
            : ""
        );
        setCurrency(offer.currency || "USD");
        setMinPurchaseAmount(
          offer.min_purchase_amount !== undefined && offer.min_purchase_amount !== null
            ? String(offer.min_purchase_amount)
            : ""
        );
        setMaxCashbackAmount(
          offer.max_cashback_amount !== undefined && offer.max_cashback_amount !== null
            ? String(offer.max_cashback_amount)
            : ""
        );
        setTerms(offer.terms || "");
        setStartAt(offer.start_at ? offer.start_at.slice(0, 10) : "");
        setEndAt(offer.end_at ? offer.end_at.slice(0, 10) : "");
        setIsActive(offer.is_active !== undefined ? Boolean(offer.is_active) : true);
        setRedirectUrl(offer.redirect_url || "");
        setMerchantId(offer.merchant_id !== undefined && offer.merchant_id !== null ? String(offer.merchant_id) : "");
        const paths =
          typeof offer.image_paths === "string"
            ? JSON.parse(offer.image_paths)
            : offer.image_paths || [];
        setExistingImages(paths);

        setStatus("idle");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err.message || "Failed to load offer for editing.");
      }
    }

    loadOffer();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, offerId]);

  const totalImageCount = images.length + existingImages.length;

  function addFiles(fileList) {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!incoming.length) return;

    setImages((prev) => {
      const room = MAX_IMAGES - prev.length - existingImages.length;
      const accepted = incoming.slice(0, Math.max(room, 0));
      const next = accepted.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
  }

  function removeImage(index) {
    setImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingImage(index) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }, [existingImages.length]);

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
      addFiles(e.target.files);
    }
    e.target.value = "";
  }

  function resetForm() {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setTitle("");
    setDescription("");
    setCategory("");
    setCashbackType("percentage");
    setCashbackRate("");
    setFixedCashbackAmount("");
    setCurrency("USD");
    setMinPurchaseAmount("");
    setMaxCashbackAmount("");
    setTerms("");
    setStartAt("");
    setEndAt("");
    setIsActive(true);
    setRedirectUrl("");
    setImages([]);
    setExistingImages([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
     formData.append("merchant_id", merchantId);
    formData.append("cashback_type", cashbackType);
    if (cashbackType === "percentage") {
      formData.append("cashback_rate", cashbackRate);
    } else {
      formData.append("fixed_cashback_amount", fixedCashbackAmount);
    }
    formData.append("currency", currency);
    if (minPurchaseAmount) formData.append("min_purchase_amount", minPurchaseAmount);
    if (maxCashbackAmount) formData.append("max_cashback_amount", maxCashbackAmount);
    if (terms.trim()) formData.append("terms", terms.trim());
    if (startAt) formData.append("start_at", startAt);
    if (endAt) formData.append("end_at", endAt);
    formData.append("is_active", isActive);
    formData.append("redirect_url", redirectUrl.trim());
    images.forEach((img) => formData.append("images", img.file));

    if (isEditMode) {
      formData.append("existing_images", JSON.stringify(existingImages));
    }

    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/offers/${offerId}`
        : `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/offers/add`;

      const res = await authenticatedFetch(url, {
        method: isEditMode ? "PUT" : "POST",
        body: formData,
      });
       const json = await res.json().catch(() => null);
        if (!res.ok) {
            throw new Error(json?.error || `Request failed with status ${res.status}`);
        }
 
      setStatus("success");
    //   if (!isEditMode) resetForm();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  const isSubmitting = status === "submitting";
  const isLoading = status === "loading";

  const activeError = missingIdError ? "Missing offer id for edit mode." : errorMessage;
  const isErrorState = status === "error" || missingIdError;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-xl text-sm text-slate-500">Loading offer…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditMode ? "Edit offer" : "Add an offer"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "Update the details below and save your changes."
              : "Fill in the details below to publish a new affiliate offer."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 15% back at Acme Store"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

               {/* Merchant */}

          <div>
        <label htmlFor="merchant_id" className="block text-sm font-medium text-slate-700">
            Merchant
        </label>
        <select
            id="merchant_id"
            required
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
            <option value="" disabled>Select a merchant</option>
            {merchants.map((m) => (
            <option key={m.id} value={m.id}>
                {m.name}
            </option>
            ))}
        </select>
        </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the offer and any terms that apply"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Cashback type */}
          <div>
            <label htmlFor="cashback_type" className="block text-sm font-medium text-slate-700">
              Cashback type
            </label>
            <select
              id="cashback_type"
              required
              value={cashbackType}
              onChange={(e) => setCashbackType(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {CASHBACK_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cashback rate / fixed amount */}
          {cashbackType === "percentage" ? (
            <div>
              <label htmlFor="cashback_rate" className="block text-sm font-medium text-slate-700">
                Cashback rate (%)
              </label>
              <input
                id="cashback_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={cashbackRate}
                onChange={(e) => setCashbackRate(e.target.value)}
                placeholder="e.g. 15"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="fixed_cashback_amount" className="block text-sm font-medium text-slate-700">
                Fixed cashback amount
              </label>
              <input
                id="fixed_cashback_amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={fixedCashbackAmount}
                onChange={(e) => setFixedCashbackAmount(e.target.value)}
                placeholder="e.g. 5.00"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          )}

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-700">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Min purchase / max cashback */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="min_purchase_amount" className="block text-sm font-medium text-slate-700">
                Min. purchase amount
              </label>
              <input
                id="min_purchase_amount"
                type="number"
                step="0.01"
                min="0"
                value={minPurchaseAmount}
                onChange={(e) => setMinPurchaseAmount(e.target.value)}
                placeholder="Optional"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="max_cashback_amount" className="block text-sm font-medium text-slate-700">
                Max. cashback amount
              </label>
              <input
                id="max_cashback_amount"
                type="number"
                step="0.01"
                min="0"
                value={maxCashbackAmount}
                onChange={(e) => setMaxCashbackAmount(e.target.value)}
                placeholder="Optional"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* Start / end dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_at" className="block text-sm font-medium text-slate-700">
                Start date
              </label>
              <input
                id="start_at"
                type="date"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="end_at" className="block text-sm font-medium text-slate-700">
                End date
              </label>
              <input
                id="end_at"
                type="date"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
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

          {/* Redirect URL */}
          <div>
            <label htmlFor="redirect_url" className="block text-sm font-medium text-slate-700">
              Redirect URL
            </label>
            <textarea
              id="redirect_url"
              type="url"
              rows={3}
              required
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://example.com/ref=..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Images
              <span className="ml-1 font-normal text-slate-400">
                ({totalImageCount}/{MAX_IMAGES})
              </span>
            </label>

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
              <p className="mt-1 text-xs text-slate-400">PNG, JPG, or WEBP — up to {MAX_IMAGES} images</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {(existingImages.length > 0 || images.length > 0) && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {existingImages.map((url, index) => (
                  <div
                    key={`existing-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img src={url} alt={`Existing image ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExistingImage(index);
                      }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {images.map((img, index) => (
                  <div key={`new-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={img.previewUrl}
                      alt={`Upload preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
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
              Offer is active
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
              {isEditMode ? "Offer updated successfully." : "Offer added successfully."}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || missingIdError}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? isEditMode ? "Saving…" : "Adding offer…"
              : isEditMode ? "Save changes" : "Add offer"}
          </button>
        </form>
      </div>
    </main>
  );
}