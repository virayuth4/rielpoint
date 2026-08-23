"use client";

import authenticatedFetch from "@/app/auth/authenticatedFetch";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORY_OPTIONS } from "@/app/utils/categoryOptions";

const MAX_IMAGES = 10;



export default function AddRewardPage() {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const rewardId = searchParams.get("id");

  // Derive validation state directly during render
  const missingIdError = isEditMode && !rewardId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [cashbackReward, setCashbackReward] = useState("");
  const [category, setCategory] = useState("");
  const [affiliator, setAffiliator] = useState("");

  const [images, setImages] = useState([]); // [{ file, previewUrl }]
  const [existingImages, setExistingImages] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState(isEditMode && rewardId ? "loading" : "idle"); // loading | idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  // Fetch existing reward data when in edit mode
  useEffect(() => {
    // Return early if not in edit mode or missing required ID
    if (!isEditMode || !rewardId) return;

    let cancelled = false;

    async function loadReward() {
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/rewards/${rewardId}`,
          { method: "GET" }
        );
        const json = await res.json();
        const reward = json.data;

        if (cancelled) return;

        setTitle(reward.title || "");
        setDescription(reward.description || "");
        setAffiliateLink(reward.affiliate_link || "");
        setCashbackReward(
          reward.cashback_reward !== undefined && reward.cashback_reward !== null
            ? String(reward.cashback_reward)
            : ""
        );
        setCategory(reward.category || "");
        setAffiliator(reward.affiliator || "");

        const paths =
          typeof reward.image_paths === "string"
            ? JSON.parse(reward.image_paths)
            : reward.image_paths || [];
        setExistingImages(paths);

        setStatus("idle");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err.message || "Failed to load reward for editing.");
      }
    }

    loadReward();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, rewardId]);

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
    setAffiliateLink("");
    setCashbackReward("");
    setCategory("");
    setAffiliator("");
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
    formData.append("affiliate_link", affiliateLink.trim());
    formData.append("cashback_reward", cashbackReward);
    formData.append("category", category);
    formData.append("affiliator", affiliator.trim());
    images.forEach((img) => formData.append("images", img.file));

    if (isEditMode) {
      formData.append("existing_images", JSON.stringify(existingImages));
    }

    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/rewards/${rewardId}`
        : `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/rewards/add`;

      await authenticatedFetch(url, {
        method: isEditMode ? "PUT" : "POST",
        body: formData,
      });

        setStatus("success");
      if (!isEditMode) resetForm();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  const isSubmitting = status === "submitting";
  const isLoading = status === "loading";

  // Combine state error with derived validation error
  const activeError = missingIdError ? "Missing reward id for edit mode." : errorMessage;
  const isErrorState = status === "error" || missingIdError;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-xl text-sm text-slate-500">Loading reward…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditMode ? "Edit reward" : "Add a reward"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "Update the details below and save your changes."
              : "Fill in the details below to publish a new cashback reward."}
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
              placeholder="e.g. 10% back at Acme Store"
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
              placeholder="Describe the reward and any terms that apply"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Affiliator */}
          <div>
            <label htmlFor="affiliator" className="block text-sm font-medium text-slate-700">
              Affiliator
            </label>
            <input
              id="affiliator"
              type="text"
              required
              value={affiliator}
              onChange={(e) => setAffiliator(e.target.value)}
              placeholder="e.g. Rakuten, Impact, direct partner name"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Affiliate link */}
          <div>
            <label htmlFor="affiliate_link" className="block text-sm font-medium text-slate-700">
              Affiliate link
            </label>
            <input
              id="affiliate_link"
              type="url"
              required
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              placeholder="https://example.com/ref=..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Cashback reward */}
          <div>
            <label htmlFor="cashback_reward" className="block text-sm font-medium text-slate-700">
              Cashback reward (%)
            </label>
            <input
              id="cashback_reward"
              type="number"
              step="0.01"
              min="0"
              required
              value={cashbackReward}
              onChange={(e) => setCashbackReward(e.target.value)}
              placeholder="e.g. 10"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Images - drag & drop */}
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

          {/* Status messages */}
          {isErrorState && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {activeError}
            </p>
          )}
          {status === "success" && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {isEditMode ? "Reward updated successfully." : "Reward added successfully."}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || missingIdError}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? isEditMode ? "Saving…" : "Adding reward…"
              : isEditMode ? "Save changes" : "Add reward"}
          </button>
        </form>
      </div>
    </main>
  );
}