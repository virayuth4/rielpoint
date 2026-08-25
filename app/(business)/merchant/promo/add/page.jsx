"use client";

import authenticatedFetch from "@/app/auth/authenticatedFetch";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORY_OPTIONS } from "@/app/utils/categoryOptions";



const MAX_IMAGES = 10;

export default function AddPromoPage() {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const promoId = searchParams.get("id");

  const missingIdError = isEditMode && !promoId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [promo, setPromo] = useState("");
  const [isInternational, setIsInternational] = useState(false);
  const [terms, setTerms] = useState("");
  const [map, setMap] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [foodpanda, setFoodpanda] = useState(false);
  const [grabfood, setGrabfood] = useState(false);

  const [merchants, setMerchants] = useState([]);
  const [merchantName, setMerchantName] = useState("");

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState(
    isEditMode && promoId ? "loading" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");



  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  // Load existing promo when editing
  useEffect(() => {
    if (!isEditMode || !promoId) return;

    let cancelled = false;

    async function loadPromo() {
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/promos/${promoId}`,
          { method: "GET" }
        );

        const json = await res.json();
        const promoData = json.data;
        console.log("promodata", promoData)

        if (cancelled) return;

        setTitle(promoData.title || "");
        setDescription(promoData.description || "");
        setCategory(promoData.category || "");
        setMerchantName(promoData.merchant_name || "")
        setPromo(promoData.promo || "");
        setMap(promoData.map || "");
        setIsInternational(Boolean(promoData.is_international));
        setTerms(promoData.terms || "");
        setFoodpanda(Boolean(promoData.foodpanda));
        setGrabfood(Boolean(promoData.grabfood));

        setStartAt(
          promoData.start_at ? promoData.start_at.slice(0, 10) : ""
        );

        setEndAt(
          promoData.end_at ? promoData.end_at.slice(0, 10) : ""
        );

        const paths =
          typeof promoData.image_paths === "string"
            ? JSON.parse(promoData.image_paths)
            : promoData.image_paths || [];

        setExistingImages(paths);
        setStatus("idle");
      } catch (err) {
        if (cancelled) return;

        setStatus("error");
        setErrorMessage(
          err.message || "Failed to load promo for editing."
        );
      }
    }

    loadPromo();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, promoId]);

  const totalImageCount = images.length + existingImages.length;

  function addFiles(fileList) {
    const incoming = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/")
    );

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

      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingImage(index) {
    setExistingImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer?.files?.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [existingImages.length]
  );

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
    setMerchantName("");
    setPromo("");
    setMap("")
    setIsInternational(false);
    setTerms("");
    setStartAt("");
    setEndAt("");
    setImages([]);
    setExistingImages([]);
    setFoodpanda(false);
    setGrabfood(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    formData.append("merchant_name", merchantName.trim());
    formData.append("map", map);
    formData.append("promo", promo.trim());
    formData.append("is_international", isInternational);
    formData.append("foodpanda", foodpanda);
    formData.append("grabfood", grabfood);

    if (terms.trim()) {
      formData.append("terms", terms.trim());
    }

    if (startAt) {
      formData.append("start_at", startAt);
    }

    if (endAt) {
      formData.append("end_at", endAt);
    }

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    if (isEditMode) {
      formData.append(
        "existing_images",
        JSON.stringify(existingImages)
      );
    }

    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/promos/${promoId}`
        : `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/promos/add`;

      const res = await authenticatedFetch(url, {
        method: isEditMode ? "PUT" : "POST",
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          json?.error || `Request failed with status ${res.status}`
        );
      }

      setStatus("success");

      if (!isEditMode) {
        resetForm();
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.message || "Something went wrong. Please try again."
      );
    }
  }

  const isSubmitting = status === "submitting";
  const isLoading = status === "loading";

  const activeError = missingIdError
    ? "Missing promo id for edit mode."
    : errorMessage;

  const isErrorState = status === "error" || missingIdError;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-xl text-sm text-slate-500">
          Loading promo…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditMode ? "Edit promo" : "Add a promo"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "Update the details below and save your changes."
              : "Fill in the details below to publish a new promo."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700"
            >
              Title
            </label>

            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Sale at Acme"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-slate-700"
            >
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
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.value === ""}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Merchant */}
        <div>
          <label
            htmlFor="merchant_name"
            className="block text-sm font-medium text-slate-700"
          >
            Merchant
          </label>

          <input
            id="merchant_name"
            type="text"
            required
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            placeholder="e.g. Uniqlo"
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the promo"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Promo */}
          <div>
            <label
              htmlFor="promo"
              className="block text-sm font-medium text-slate-700"
            >
              Promo
            </label>

            <input
              id="promo"
              type="text"
              required
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="e.g. 15% off"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />

            <p className="mt-1 text-xs text-slate-400">
              Enter the promotion exactly as you want it displayed.
            </p>
          </div>

                    {/* Delivery platforms */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Delivery platforms
            </label>

            <div className="mt-1.5 flex gap-4">
              <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foodpanda}
                  onChange={(e) => setFoodpanda(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                Foodpanda
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grabfood}
                  onChange={(e) => setGrabfood(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                GrabFood
              </label>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Select any platforms this promo is available on.
            </p>
          </div>

          {/* Local / International */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Availability
            </label>

            <div className="mt-1.5 flex rounded-lg border border-slate-300 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setIsInternational(false)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                  !isInternational
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Local
              </button>

              <button
                type="button"
                onClick={() => setIsInternational(true)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isInternational
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                International
              </button>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              {isInternational
                ? "This promo is available internationally."
                : "This promo is for local customers."}
            </p>
          </div>

           <div>
            <label
              htmlFor="map"
              className="block text-sm font-medium text-slate-700"
            >
              Google Map
            </label>

            <input
              id="map"
              type="text"
         
              value={map}
              onChange={(e) => setMap(e.target.value)}
              placeholder=""
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />

            <p className="mt-1 text-xs text-slate-400">
              Optional: Enter google map
            </p>
          </div>

          {/* Start / End dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start_at"
                className="block text-sm font-medium text-slate-700"
              >
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
              <label
                htmlFor="end_at"
                className="block text-sm font-medium text-slate-700"
              >
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
            <label
              htmlFor="terms"
              className="block text-sm font-medium text-slate-700"
            >
              Terms
            </label>

            <textarea
              id="terms"
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Any additional terms and conditions"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                <span className="font-medium text-slate-900">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>

              <p className="mt-1 text-xs text-slate-400">
                PNG, JPG, or WEBP, up to {MAX_IMAGES} images
              </p>

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
                    <img
                      src={url}
                      alt={`Existing image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

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
                  <div
                    key={`new-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
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

          {/* Status */}
          {isErrorState && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {activeError}
            </p>
          )}

          {status === "success" && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {isEditMode
                ? "Promo updated successfully."
                : "Promo added successfully."}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || missingIdError}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? isEditMode
                ? "Saving…"
                : "Adding promo…"
              : isEditMode
              ? "Save changes"
              : "Add promo"}
          </button>
        </form>
      </div>
    </main>
  );
}