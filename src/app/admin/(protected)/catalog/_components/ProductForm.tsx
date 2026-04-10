"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  ChevronLeft,
  ChevronRight,
  Eye,
  Film,
  ImageUp,
  Italic,
  Link2,
  List,
  Loader2,
  Maximize2,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { deleteCatalogItem, saveCatalogItem } from "@/app/admin/actions";
import {
  DEFAULT_PRODUCT_CATEGORY,
  PRODUCT_CATEGORY_OPTIONS,
  isKnownProductCategory,
} from "@/lib/catalog/categories";
import type { ProductMedia } from "@/types/product-media";
import Image from "next/image";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL"];
const MAX_MEDIA_ITEMS = 8;

type ProductSize = {
  label: string;
};

type InitialData = {
  id?: string;
  name?: string;
  image?: string;
  images?: ProductMedia[];
  sizes?: ProductSize[];
  materials?: string[];
  options?: string;
  description?: string;
  discountPrice?: string;
  quantity?: number;
  categoryPath?: string;
  category?: string;
  sustainability?: string;
  price?: string;
  hasSizes?: boolean;
};

type ExistingFormMedia = ProductMedia & {
  kind: "existing";
  clientKey: string;
};

type PendingFormMedia = ProductMedia & {
  kind: "pending";
  clientKey: string;
  file: File;
  previewUrl: string;
};

type FormMediaItem = ExistingFormMedia | PendingFormMedia;

function buildMediaLayoutType(index: number) {
  if (index === 1 || index === 2) {
    return "half";
  }

  return "large";
}

function createExistingMedia(initialData?: InitialData): ExistingFormMedia[] {
  const baseMedia =
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : initialData?.image
        ? [
            {
              src: initialData.image,
              alt: initialData.name || "Product image",
              type: "large",
              resourceType: "image" as const,
            },
          ]
        : [];

  return baseMedia
    .filter((item) => Boolean(item?.src))
    .map((item, index) => ({
      ...item,
      kind: "existing" as const,
      clientKey: item.publicId ? `existing:${item.publicId}` : `existing:${index}:${item.src}`,
      resourceType: item.resourceType === "video" ? "video" : "image",
      type: item.type || buildMediaLayoutType(index),
    }));
}

export default function ProductForm({ initialData }: { initialData?: InitialData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<FormMediaItem[]>(() => createExistingMedia(initialData));
  const mediaItemsRef = useRef<FormMediaItem[]>(mediaItems);
  const [sizesValue, setSizesValue] = useState(() => {
    if (initialData?.sizes) {
      return initialData.sizes.map((size) => size.label).join(", ");
    }
    return "S, M, L";
  });
  const [optionsValue, setOptionsValue] = useState(initialData?.options || "");
  const [enableSizes, setEnableSizes] = useState(initialData?.hasSizes ?? true);

  const isEditing = !!initialData?.id;
  const selectedCategory = isKnownProductCategory(initialData?.categoryPath || initialData?.category)
    ? initialData?.categoryPath || initialData?.category
    : DEFAULT_PRODUCT_CATEGORY;

  useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);

  useEffect(() => {
    return () => {
      mediaItemsRef.current.forEach((item) => {
        if (item.kind === "pending") {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const activeSizes = useMemo(
    () =>
      new Set(
        sizesValue
          .split(",")
          .map((value) => value.trim().toUpperCase())
          .filter(Boolean)
      ),
    [sizesValue]
  );

  function toggleSize(size: string) {
    const next = new Set(activeSizes);

    if (next.has(size)) {
      next.delete(size);
    } else {
      next.add(size);
    }

    setSizesValue(Array.from(next).join(", "));
  }

  function updateMediaOrder(nextItems: FormMediaItem[]) {
    setMediaItems(
      nextItems.map((item, index) => ({
        ...item,
        type: buildMediaLayoutType(index),
      }))
    );
  }

  function handleFileSelection(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    setError(null);

    const files = Array.from(fileList);
    const remainingSlots = MAX_MEDIA_ITEMS - mediaItems.length;

    if (remainingSlots <= 0) {
      setError(`You can upload up to ${MAX_MEDIA_ITEMS} assets per product.`);
      return;
    }

    if (files.length > remainingSlots) {
      setError(`Only ${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} remaining.`);
    }

    const nextPendingItems: PendingFormMedia[] = files.slice(0, remainingSlots).map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      const resourceType = file.type.startsWith("video/") ? "video" : "image";

      return {
        kind: "pending",
        clientKey: `pending:${Date.now()}:${index}:${file.name}`,
        file,
        previewUrl,
        src: previewUrl,
        alt: file.name,
        type: buildMediaLayoutType(mediaItems.length + index),
        resourceType,
      };
    });

    updateMediaOrder([...mediaItems, ...nextPendingItems]);
  }

  function removeMedia(clientKey: string) {
    const target = mediaItems.find((item) => item.clientKey === clientKey);

    if (target?.kind === "pending") {
      URL.revokeObjectURL(target.previewUrl);
    }

    updateMediaOrder(mediaItems.filter((item) => item.clientKey !== clientKey));
  }

  function moveMedia(clientKey: string, direction: "left" | "right") {
    const currentIndex = mediaItems.findIndex((item) => item.clientKey === clientKey);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= mediaItems.length) {
      return;
    }

    const nextItems = [...mediaItems];
    const [item] = nextItems.splice(currentIndex, 1);
    nextItems.splice(targetIndex, 0, item);
    updateMediaOrder(nextItems);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const existingMedia = mediaItems
      .filter((item): item is ExistingFormMedia => item.kind === "existing")
      .map((item) => ({
        clientKey: item.clientKey,
        src: item.src,
        alt: item.alt,
        type: item.type,
        resourceType: item.resourceType,
        publicId: item.publicId,
        poster: item.poster,
        format: item.format,
        width: item.width,
        height: item.height,
        bytes: item.bytes,
        duration: item.duration,
      }));
    const pendingMedia = mediaItems.filter((item): item is PendingFormMedia => item.kind === "pending");

    formData.set("existingMedia", JSON.stringify(existingMedia));
    formData.set(
      "pendingMediaKeys",
      JSON.stringify(pendingMedia.map((item) => item.clientKey))
    );
    formData.set(
      "mediaOrder",
      JSON.stringify(mediaItems.map((item) => item.clientKey))
    );

    pendingMedia.forEach((item) => {
      formData.append("mediaFiles", item.file, item.file.name);
    });

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await saveCatalogItem(formData, isEditing ? initialData.id : undefined);
      if (result.success) {
        router.replace("/admin/catalog");
      } else {
        setError(result.error || "Failed to save product.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEditing || !confirm("Are you sure you want to permanently delete this product?")) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await deleteCatalogItem(initialData?.id || "");
      if (result.success) {
        router.replace("/admin/catalog");
      } else {
        setError("Failed to delete product.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
      {error ? (
        <div className="col-span-12 rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error-container)] px-5 py-4 text-sm text-[var(--color-on-error-container)]">
          {error}
        </div>
      ) : null}

      <div className="col-span-12 space-y-16 lg:col-span-7">
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="bg-[var(--color-primary)]/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-[var(--color-primary)]">
              Step 01
            </span>
            <h3 className="font-serif text-2xl font-semibold">Core Identity</h3>
          </div>

          <div className="space-y-10">
            <div className="group">
              <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={initialData?.name}
                placeholder="e.g. L'Heure Bleue Silk Blazer"
                className="w-full border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-4 font-serif text-3xl italic placeholder:text-[var(--color-on-surface-variant)]/20 focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-4 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                The Narrative
              </label>
              <div className="min-h-[300px] rounded-lg border border-[var(--color-outline-variant)]/5 bg-[var(--color-surface-container-lowest)] p-8 shadow-[0px_24px_48px_rgba(27,28,28,0.03)]">
                <div className="mb-6 flex gap-4 border-b border-[var(--color-surface-container)] pb-4 text-[var(--color-on-surface-variant)]">
                  <button type="button" className="transition-colors hover:text-[var(--color-primary)]">
                    <Bold className="size-4" />
                  </button>
                  <button type="button" className="transition-colors hover:text-[var(--color-primary)]">
                    <Italic className="size-4" />
                  </button>
                  <button type="button" className="transition-colors hover:text-[var(--color-primary)]">
                    <List className="size-4" />
                  </button>
                  <button type="button" className="transition-colors hover:text-[var(--color-primary)]">
                    <Link2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="ml-auto transition-colors hover:text-[var(--color-primary)]"
                  >
                    <Maximize2 className="size-4" />
                  </button>
                </div>
                <textarea
                  name="description"
                  required
                  defaultValue={initialData?.description}
                  placeholder="Describe the craftsmanship, materials, and the feeling this piece evokes..."
                  className="min-h-[200px] w-full resize-none border-none bg-transparent p-0 leading-relaxed text-[var(--color-on-surface-variant)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="bg-[var(--color-primary)]/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-[var(--color-primary)]">
              Step 02
            </span>
            <h3 className="font-serif text-2xl font-semibold">Curation &amp; Variants</h3>
          </div>

          <div className="space-y-12 bg-[var(--color-surface-container-low)] p-10">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <label className="block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  Available Dimensions
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Enable Sizes</span>
                  <input
                    type="checkbox"
                    name="enableSizes"
                    checked={enableSizes}
                    onChange={(e) => setEnableSizes(e.target.checked)}
                    className="accent-[var(--color-primary)] pointer-events-auto h-4 w-4"
                  />
                </label>
              </div>
              {enableSizes && (
                <div>
                  <div className="mb-5 flex flex-wrap gap-3">
                    {PRESET_SIZES.map((size) => {
                      const isActive = activeSizes.has(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`px-6 py-2 text-xs font-bold transition-all duration-300 ${
                            isActive
                              ? "border border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                              : "border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary)]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className="flex items-center gap-2 border border-dashed border-[var(--color-outline-variant)]/40 px-6 py-2 text-xs font-bold text-[var(--color-on-surface-variant)] transition-all duration-300 hover:bg-[var(--color-surface-container-high)]"
                    >
                      <Plus className="size-3.5" />
                      Add Custom
                    </button>
                  </div>
                  <input
                    type="text"
                    name="sizes"
                    value={sizesValue}
                    onChange={(event) => setSizesValue(event.target.value)}
                    className="w-full border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none"
                    placeholder="XS, S, M, L"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-6 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Product Options
              </label>
              <input
                type="text"
                name="options"
                value={optionsValue}
                onChange={(event) => setOptionsValue(event.target.value)}
                className="w-full border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="Noir / Ivoire / Hand-finished satin blend"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="col-span-12 space-y-12 lg:col-span-5">
        <section className="space-y-8 rounded-lg bg-[var(--color-surface-container-low)] p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-semibold">Visual Assets</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">
                Upload images and videos to Cloudinary. The first asset becomes the storefront cover.
              </p>
            </div>
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-primary)]">
              {mediaItems.length} / {MAX_MEDIA_ITEMS} slots
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mediaItems.length > 0 ? (
              mediaItems.map((item, index) => {
                const isVideo = item.resourceType === "video";

                return (
                  <div
                    key={item.clientKey}
                    className="group relative aspect-[3/4] overflow-hidden bg-[var(--color-surface-container-lowest)]"
                  >
                    {isVideo ? (
                      <video
                        src={item.kind === "pending" ? item.previewUrl : item.src}
                        poster={item.poster}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={item.kind === "pending" ? item.previewUrl : item.src}
                        alt={item.alt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}

                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      {index === 0 ? (
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                          Cover
                        </span>
                      ) : null}
                      {isVideo ? (
                        <span className="rounded-full bg-black/65 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                          <span className="inline-flex items-center gap-1">
                            <Film className="size-3" />
                            Video
                          </span>
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(item.kind === "pending" ? item.previewUrl : item.src, "_blank")
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMedia(item.clientKey, "left")}
                        disabled={index === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black disabled:opacity-40"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMedia(item.clientKey, "right")}
                        disabled={index === mediaItems.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black disabled:opacity-40"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMedia(item.clientKey)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex aspect-[3/4] items-center justify-center bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)]">
                  <ImageUp className="size-8" />
                </div>
                <div className="flex aspect-[3/4] items-center justify-center bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)]">
                  <Film className="size-8" />
                </div>
              </>
            )}

            <label className="col-span-2 flex aspect-video cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-container-high)]">
              <ImageUp className="mb-2 size-8 text-[var(--color-on-surface-variant)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Upload Cloudinary assets
              </span>
              <span className="mt-1 text-[0.6rem] italic text-[var(--color-on-surface-variant)]/40">
                Images and videos, up to {MAX_MEDIA_ITEMS} assets total
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  handleFileSelection(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </section>

        <section className="space-y-10 rounded-lg border border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container-lowest)] p-8 shadow-[0px_24px_48px_rgba(27,28,28,0.03)]">
          <h3 className="font-serif text-xl font-semibold">Technical Specs</h3>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-serif italic text-[var(--color-on-surface-variant)]">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="price"
                    required
                    defaultValue={initialData?.price || ""}
                    className="w-full border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-2 pl-4 font-serif text-xl focus:border-[var(--color-primary)] focus:outline-none"
                    placeholder="12,500.00"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  SKU Reference
                </label>
                <input
                  type="text"
                  value={isEditing ? `SKU-${(initialData?.id || "").toUpperCase()}` : "Generated on publish"}
                  readOnly
                  className="w-full border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-3 font-mono text-xs text-[var(--color-on-surface-variant)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  Discount Price
                </label>
                <input
                  type="text"
                  name="discountPrice"
                  defaultValue={initialData?.discountPrice || ""}
                  className="w-full border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  Available Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  required
                  defaultValue={initialData?.quantity ?? 0}
                  className="w-full border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Collection Category
              </label>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="w-full cursor-pointer border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-3 text-sm font-medium focus:border-[var(--color-primary)] focus:outline-none"
              >
                {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Sustainability Notes
              </label>
              <input
                type="text"
                name="sustainability"
                defaultValue={initialData?.sustainability || ""}
                className="w-full border-0 border-b border-[var(--color-outline-variant)]/20 bg-transparent py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="Ethical sourcing, atelier-made finishing..."
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-primary)]/10 bg-[#003b93]/5 p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                Status: {isEditing ? "Editing Live Product" : "Pre-Publication"}
              </p>
              <p className="text-xs leading-relaxed italic text-[var(--color-primary)]/70">
                {isEditing
                  ? "Your changes will update the live product once saved."
                  : "Once published, this item will appear in the storefront catalog immediately."}
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 right-0 z-40 flex w-[calc(100%-16rem)] items-center justify-between border-t border-[var(--color-outline-variant)]/10 bg-[#fbf9f8]/90 px-10 py-6 backdrop-blur-lg">
        <div className="flex items-center gap-4 text-[var(--color-on-surface-variant)]">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 text-[0.65rem] font-medium tracking-tight text-[var(--color-error)]"
            >
              <Trash className="size-4" />
              Delete product
            </button>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]/50" />
              <span className="text-[0.65rem] font-medium tracking-tight">
                Ready for atelier publication
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => router.replace("/admin/catalog")}
            className="border-b border-transparent pb-1 text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-on-surface)] hover:text-[var(--color-on-surface)]"
          >
            Discard Changes
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed bg-[var(--color-surface-container-high)] px-8 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-on-surface)] opacity-70"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-w-[170px] items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] px-12 py-3 text-[0.65rem] font-bold uppercase tracking-widest text-white shadow-[0px_8px_24px_rgba(0,59,147,0.2)] transition-all duration-300 hover:shadow-[0px_12px_32px_rgba(0,59,147,0.3)] active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Publish Item"
            )}
          </button>
        </div>
      </footer>
    </form>
  );
}
