"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "@/lib/axios";
import { loaderFor } from "@/lib/cloudinaryLoader";
import {
    ArrowDown,
    ArrowUp,
    CircleAlert,
    CircleCheck,
    ExternalLink,
    ImagePlus,
    ImageUp,
    Loader2,
    Trash2,
    X,
} from "lucide-react";

interface Photo {
    _id: string;
    imageUrl: string;
    alt?: { en?: string; ar?: string };
    order: number;
}
type Alt = { en: string; ar: string };
type Staged = { file: File; url: string; mode: "add" | "replace" };
type Notice = { kind: "ok" | "error"; text: string };

/* The Franchise page gallery's four positions, named as they read on the page,
   with that section's own box ratios so the map below is a true miniature. */
const SLOTS = [
    { name: "Wide, top", box: "aspect-[532/319]" },
    { name: "Tall, left", box: "aspect-[301/282]" },
    { name: "Upper right", box: "aspect-[210/131]" },
    { name: "Lower right", box: "aspect-[210/131]" },
];

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;
const FILE_RULES = `JPG, PNG or WebP, up to ${MAX_MB} MB.`;

function fileProblem(file: File) {
    if (!TYPES.includes(file.type)) {
        return `"${file.name}" isn't a JPG, PNG or WebP image. Choose one of those formats.`;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
        return `"${file.name}" is ${(file.size / 1048576).toFixed(1)} MB. Choose an image under ${MAX_MB} MB.`;
    }
    return null;
}

/* Our API answers { error: string }, Cloudinary { error: { message } }. */
function errorText(err: unknown, fallback: string): string {
    const e = err as { message?: string; response?: { data?: { error?: string | { message?: string } } } };
    const error = e?.response?.data?.error;
    if (typeof error === "string") return error;
    if (typeof error?.message === "string") return `Upload failed: ${error.message}`;
    return e?.message || fallback;
}

/* The signed direct upload the Home page banners and Mix Grill use, so the file
   goes straight to Cloudinary and never through our server or the database. */
async function uploadToCloudinary(file: File, onProgress: (pct: number) => void) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    if (!cloudName || !apiKey) throw new Error("Image uploads aren't configured: the Cloudinary keys are missing.");

    const { data } = await axios.post("/api/cloudinary/sign", { folder: "franchise" });
    const body = new FormData();
    body.append("file", file);
    body.append("signature", data.signature);
    body.append("timestamp", String(data.timestamp));
    body.append("api_key", apiKey);
    body.append("folder", "franchise");
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, body, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
            if (e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
    });
    return res.data.secure_url as string;
}

/* Saved photos load resized through next/image, since the bundled originals
   run to 19 MB each. A staged file is a local blob: URL, which it can't load. */
function Preview({ src, sizes }: { src: string; sizes: string }) {
    if (src.startsWith("blob:")) {
        // biome-ignore lint/performance/noImgElement: next/image cannot load blob: URLs
        return <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />;
    }
    return <Image src={src} alt="" fill draggable={false} sizes={sizes} loader={loaderFor(src)} className="object-cover" />;
}

const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31E24]";
const primaryBtn = `inline-flex items-center justify-center gap-2 rounded-lg bg-[#E31E24] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#c4191f] disabled:cursor-not-allowed disabled:bg-[#1f1f1f] disabled:text-gray-500 ${focusRing}`;
const secondaryBtn = `inline-flex items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-gray-200 transition-colors duration-200 hover:border-[#555] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;
const input = "w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white caret-[#E31E24] focus:border-[#E31E24] focus:outline-none disabled:opacity-50";

export default function FranchiseAdminPage() {
    const [photos, setPhotos] = useState<Photo[] | null>(null);
    const [loadError, setLoadError] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [staged, setStaged] = useState<Staged | null>(null);
    const [altDraft, setAltDraft] = useState<Alt | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [dragFrom, setDragFrom] = useState<number | null>(null);
    const [dropOn, setDropOn] = useState<number | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const pickMode = useRef<Staged["mode"]>("add");
    const confirmDialog = useRef<HTMLDialogElement>(null);
    const panel = useRef<HTMLElement>(null);

    const count = photos?.length ?? 0;
    const full = count >= SLOTS.length;
    const selectedIndex = photos?.findIndex((p) => p._id === selectedId) ?? -1;
    const selected = selectedIndex >= 0 && photos ? photos[selectedIndex] : null;
    const adding = staged?.mode === "add";

    /* Alt text being edited; null means untouched, so it shows what is saved. */
    const savedAlt: Alt = { en: selected?.alt?.en ?? "", ar: selected?.alt?.ar ?? "" };
    const alt = altDraft ?? (adding ? { en: "", ar: "" } : savedAlt);
    const altDirty =
        altDraft !== null && (altDraft.en.trim() !== savedAlt.en || altDraft.ar.trim() !== savedAlt.ar);

    const load = useCallback(async () => {
        setLoadError("");
        try {
            const res = await axios.get("/api/franchise-images");
            const list: Photo[] = Array.isArray(res.data) ? res.data : [];
            setPhotos(list);
            return list;
        } catch (err) {
            setLoadError(errorText(err, "Could not load the gallery."));
            return null;
        }
    }, []);

    useEffect(() => {
        load().then((list) => setSelectedId(list?.[0]?._id ?? null));
    }, [load]);

    /* A staged file's preview URL is only needed until it is saved or dropped. */
    useEffect(() => () => { if (staged) URL.revokeObjectURL(staged.url); }, [staged]);

    /* Confirmations clear themselves; errors stay until dismissed. */
    useEffect(() => {
        if (notice?.kind !== "ok") return;
        const timer = setTimeout(() => setNotice(null), 5000);
        return () => clearTimeout(timer);
    }, [notice]);

    const select = (id: string | null) => {
        setSelectedId(id);
        setStaged(null);
        setAltDraft(null);
    };

    /* Below lg the panel sits under the map, so bring it into view. */
    const revealPanel = () => {
        if (!window.matchMedia("(max-width: 1023px)").matches) return;
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" }));
    };

    const okToLeave = () =>
        !(staged || altDirty) || window.confirm("Discard your unsaved changes to this photo?");

    const refresh = async (keepId?: string) => {
        const list = await load();
        if (!list) return list;
        select(list.find((p) => p._id === keepId)?._id ?? list[0]?._id ?? null);
        return list;
    };

    const run = async (label: string, work: () => Promise<void>) => {
        setBusy(label);
        setNotice(null);
        try {
            await work();
        } catch (err) {
            setNotice({ kind: "error", text: errorText(err, "Something went wrong. Try again.") });
        } finally {
            setBusy(null);
            setProgress(null);
        }
    };

    const openPicker = (mode: Staged["mode"]) => {
        if (mode === "add" && !okToLeave()) return;
        pickMode.current = mode;
        fileInput.current?.click();
    };

    const stage = (file: File | undefined, mode: Staged["mode"], photoId?: string) => {
        if (!file || busy) return;
        const problem = fileProblem(file);
        if (problem) {
            setNotice({ kind: "error", text: problem });
            return;
        }
        setNotice(null);
        if (mode === "add") setSelectedId(null);
        else if (photoId) setSelectedId(photoId);
        /* A new photo needs its own description, not the old one's. */
        setAltDraft({ en: "", ar: "" });
        setStaged({ file, url: URL.createObjectURL(file), mode });
        revealPanel();
    };

    const saveStaged = () => {
        if (!staged) return;
        const target = selected;
        run(adding ? "Adding photo" : "Replacing photo", async () => {
            const imageUrl = await uploadToCloudinary(staged.file, setProgress);
            setProgress(null);
            if (staged.mode === "add") {
                const { data } = await axios.post("/api/franchise-images", { imageUrl, alt });
                const list = await refresh(data._id);
                const at = (list?.findIndex((p) => p._id === data._id) ?? 0) + 1;
                setNotice({ kind: "ok", text: `Photo added at position ${at}. It's live on the Franchise page.` });
            } else if (target) {
                await axios.put(`/api/franchise-images/${target._id}`, { imageUrl, alt });
                await refresh(target._id);
                setNotice({ kind: "ok", text: `Photo ${selectedIndex + 1} replaced on the Franchise page.` });
            }
        });
    };

    const saveAlt = () => {
        if (!selected) return;
        run("Saving", async () => {
            await axios.put(`/api/franchise-images/${selected._id}`, { alt });
            await refresh(selected._id);
            setNotice({ kind: "ok", text: "Alt text saved." });
        });
    };

    /* Swapping keeps every other photo where it is, which is what a drop onto a
       position means in a fixed layout; moving by one is the same swap. */
    const swap = (from: number, to: number) => {
        if (!photos || busy || to < 0 || to >= photos.length || from === to) return;
        const before = photos;
        const next = [...photos];
        [next[from], next[to]] = [next[to], next[from]];
        setPhotos(next);
        run("Saving order", async () => {
            try {
                const { data } = await axios.patch("/api/franchise-images", { ids: next.map((p) => p._id) });
                setPhotos(data);
                setNotice({ kind: "ok", text: `Order saved. Photos ${from + 1} and ${to + 1} swapped places.` });
            } catch (err) {
                setPhotos(before);
                throw err;
            }
        });
    };

    const remove = () => {
        if (!selected || !photos) return;
        confirmDialog.current?.close();
        const neighbour = photos[selectedIndex + 1] ?? photos[selectedIndex - 1];
        run("Deleting", async () => {
            await axios.delete(`/api/franchise-images/${selected._id}`);
            await refresh(neighbour?._id);
            setNotice({ kind: "ok", text: "Photo deleted. The photos after it moved up one position." });
        });
    };

    const dropTargetProps = (index: number, photo?: Photo) => ({
        onDragOver: (e: React.DragEvent) => {
            const reorder = photo && dragFrom !== null && dragFrom !== index;
            const file = e.dataTransfer.types.includes("Files") && (photo || index === count);
            if (busy || (!reorder && !file)) return;
            e.preventDefault();
            setDropOn(index);
        },
        onDragLeave: () => setDropOn((d) => (d === index ? null : d)),
        onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            setDropOn(null);
            if (dragFrom !== null) {
                swap(dragFrom, index);
                setDragFrom(null);
            } else if (okToLeave()) {
                stage(e.dataTransfer.files[0], photo ? "replace" : "add", photo?._id);
            }
        },
    });

    const renderSlot = (index: number) => {
        const slot = SLOTS[index];
        const photo = photos?.[index];
        const isSelected = !!photo && photo._id === selectedId;
        const stagedHere = staged && ((adding && index === count) || (!adding && isSelected));
        const src = stagedHere ? staged.url : photo?.imageUrl;
        const dropping = dropOn === index;
        const frame = `relative w-full rounded-lg ${slot.box}`;

        if (!photos) return <div className={`${frame} animate-pulse bg-[#1a1a1a]`} />;

        if (!photo && !stagedHere) {
            if (index !== count) {
                return (
                    <div className={`${frame} flex items-center justify-center border border-dashed border-[#2a2a2a]`}>
                        <span className="text-xs text-gray-400">Position {index + 1}</span>
                    </div>
                );
            }
            return (
                <button
                    type="button"
                    onClick={() => openPicker("add")}
                    disabled={!!busy}
                    {...dropTargetProps(index)}
                    className={`${frame} flex flex-col items-center justify-center gap-1.5 border-2 border-dashed text-gray-300 transition-colors duration-200 hover:border-[#E31E24] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${dropping ? "border-[#E31E24] bg-[#E31E24]/10" : "border-[#3a3a3a]"} ${focusRing}`}
                >
                    <ImagePlus size={22} aria-hidden="true" />
                    <span className="text-sm font-medium">Add photo</span>
                    <span className="hidden text-xs text-gray-400 lg:block">or drop a file here</span>
                </button>
            );
        }

        const label = photo
            ? `Photo ${index + 1}, ${slot.name}${photo.alt?.en ? `: ${photo.alt.en}` : ""}`
            : `New photo, ${slot.name}`;
        /* No overflow clipping on this wrapper: the button's selection ring and
           focus outline sit outside its box. The button clips the photo itself. */
        return (
            <div className={frame} {...dropTargetProps(index, photo)}>
                <button
                    type="button"
                    aria-label={label}
                    aria-pressed={photo ? isSelected : undefined}
                    onClick={() => {
                        if (!photo || isSelected || !okToLeave()) return;
                        select(photo._id);
                        revealPanel();
                    }}
                    draggable={!!photo && !busy && !staged}
                    onDragStart={(e) => {
                        setDragFrom(index);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", photo?._id ?? "");
                    }}
                    onDragEnd={() => {
                        setDragFrom(null);
                        setDropOn(null);
                    }}
                    className={`group absolute inset-0 overflow-hidden rounded-lg transition-[opacity,box-shadow] duration-200 ${photo && !staged ? "cursor-grab active:cursor-grabbing" : ""} ${dragFrom === index ? "opacity-40" : ""} ${isSelected || (stagedHere && adding) ? "ring-2 ring-[#E31E24] ring-offset-2 ring-offset-[#111]" : "hover:ring-1 hover:ring-[#555]"} ${focusRing}`}
                >
                    {/* Keyed by photo, so a swap or replacement fades in where it lands. */}
                    {src && (
                        <span key={src} className="absolute inset-0 motion-safe:animate-[animAccent_200ms_cubic-bezier(0.16,1,0.3,1)]">
                            <Preview src={src} sizes="(min-width: 1024px) 420px, 90vw" />
                        </span>
                    )}
                    <span className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
                        {index + 1}
                    </span>
                    {stagedHere && (
                        <span className="absolute right-2 top-2 rounded-md bg-[#E31E24] px-2 py-0.5 text-xs font-medium text-white">
                            Not saved
                        </span>
                    )}
                    {dropping && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-medium text-white">
                            {dragFrom !== null ? `Swap with photo ${dragFrom + 1}` : "Drop to replace"}
                        </span>
                    )}
                </button>
            </div>
        );
    };

    const panelIndex = adding ? count : selectedIndex;

    const altFields = (
        <fieldset disabled={!!busy} className="space-y-3">
            <legend className="text-sm font-medium text-white">
                {staged ? "Alt text for the new photo" : "Alt text"}
            </legend>
            <div>
                <label htmlFor="alt-en" className="mb-1 block text-xs text-gray-400">English</label>
                <input
                    id="alt-en"
                    className={input}
                    maxLength={200}
                    value={alt.en}
                    onChange={(e) => setAltDraft({ ...alt, en: e.target.value })}
                />
            </div>
            <div>
                <label htmlFor="alt-ar" className="mb-1 block text-xs text-gray-400">Arabic</label>
                <input
                    id="alt-ar"
                    dir="rtl"
                    className={input}
                    maxLength={200}
                    value={alt.ar}
                    onChange={(e) => setAltDraft({ ...alt, ar: e.target.value })}
                />
            </div>
            <p className="text-xs text-gray-400">
                Describes the photo for screen readers and search. Leave both empty if it&apos;s only decoration.
            </p>
        </fieldset>
    );

    return (
        <div className="space-y-6 selection:bg-[#E31E24]/40 selection:text-white">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-white">Franchise Page</h1>
                    <p className="max-w-[60ch] text-gray-400">
                        Photos in the gallery below Digital Presence. Changes go live on the Franchise page as soon as they&apos;re saved.
                    </p>
                </div>
                <a
                    href="/franchise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${secondaryBtn} shrink-0`}
                >
                    View Franchise page <ExternalLink size={15} aria-hidden="true" />
                </a>
            </div>

            {/* A toast, so messages never push the editor around under the pointer. */}
            <output
                aria-live="polite"
                className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6"
            >
                {notice && (
                    <div
                        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border bg-[#111] px-4 py-3 text-sm shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8)] ${notice.kind === "ok" ? "border-green-900 text-green-300" : "border-red-900 text-red-300"}`}
                    >
                        {notice.kind === "ok"
                            ? <CircleCheck size={18} className="mt-px shrink-0" aria-hidden="true" />
                            : <CircleAlert size={18} className="mt-px shrink-0" aria-hidden="true" />}
                        <p className="flex-1">{notice.text}</p>
                        <button
                            type="button"
                            onClick={() => setNotice(null)}
                            aria-label="Dismiss message"
                            className={`-m-1 rounded p-1 opacity-70 hover:opacity-100 ${focusRing}`}
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </div>
                )}
            </output>

            <input
                ref={fileInput}
                type="file"
                accept={TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                    stage(e.target.files?.[0], pickMode.current);
                    e.target.value = "";
                }}
            />

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <section aria-labelledby="layout-heading" className="rounded-xl border border-[#222] bg-[#111] p-5 sm:p-6">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                        <h2 id="layout-heading" className="text-xl font-bold text-white">
                            Gallery layout
                        </h2>
                        {photos && (
                            <span className="text-sm tabular-nums text-gray-400">
                                {count} of {SLOTS.length} photos
                            </span>
                        )}
                    </div>
                    <p className="mb-5 text-sm text-gray-400">
                        <span className="lg:hidden">Tap a photo to move, replace or delete it.</span>
                        <span className="hidden lg:inline">
                            Drag a photo onto another to swap them, or drop an image file on one to replace it.
                        </span>
                    </p>

                    {loadError ? (
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-[#222] bg-[#0a0a0a] px-6 py-14 text-center">
                            <CircleAlert className="text-red-400" aria-hidden="true" />
                            <p className="text-sm text-gray-300">{loadError}</p>
                            <button type="button" onClick={() => refresh()} className={secondaryBtn}>
                                Try again
                            </button>
                        </div>
                    ) : (
                        /* The map is about 1.19x as tall as it is wide; from lg up its width
                           also follows the viewport height so all four positions stay in view. */
                        <div className="max-w-[460px] lg:max-w-[min(460px,max(280px,calc((100dvh_-_300px)/1.19)))]">
                            {renderSlot(0)}
                            <div className="mt-[6.2%] grid grid-cols-[301fr_210fr] gap-[4.1%]">
                                {renderSlot(1)}
                                <div className="flex flex-col justify-between">
                                    {renderSlot(2)}
                                    {renderSlot(3)}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section
                    ref={panel}
                    aria-labelledby="panel-heading"
                    className="scroll-mt-6 rounded-xl border border-[#222] bg-[#111] p-5 sm:p-6 lg:sticky lg:top-6"
                >
                    {!photos && !loadError ? (
                        <div className="space-y-4" aria-hidden="true">
                            <div className="h-6 w-40 animate-pulse rounded bg-[#1a1a1a]" />
                            <div className="h-10 animate-pulse rounded-lg bg-[#1a1a1a]" />
                            <div className="h-24 animate-pulse rounded-lg bg-[#1a1a1a]" />
                        </div>
                    ) : !selected && !adding ? (
                        <div className="py-6 text-center">
                            <h2 id="panel-heading" className="text-lg font-semibold text-white">
                                {count ? "Select a photo" : "No photos yet"}
                            </h2>
                            <p className="mx-auto mt-2 max-w-[34ch] text-sm text-gray-400">
                                {count
                                    ? "Choose a photo in the layout to replace it, move it or edit its alt text."
                                    : `The gallery is hidden on the Franchise page until it has a photo. ${FILE_RULES}`}
                            </p>
                            {!count && !loadError && (
                                <button type="button" onClick={() => openPicker("add")} className={`${primaryBtn} mt-5`}>
                                    <ImagePlus size={17} aria-hidden="true" /> Add the first photo
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                {!staged && selected && (
                                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-[#222]">
                                        <Preview src={selected.imageUrl} sizes="80px" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h2 id="panel-heading" className="text-lg font-semibold text-white">
                                        {adding ? "New photo" : `Photo ${selectedIndex + 1}`}
                                        <span className="font-normal text-gray-400"> · {SLOTS[panelIndex]?.name}</span>
                                    </h2>
                                    {staged && (
                                        <p className="mt-0.5 truncate text-xs tabular-nums text-gray-400">
                                            {staged.file.name} · {(staged.file.size / 1048576).toFixed(1)} MB · not saved yet
                                        </p>
                                    )}
                                </div>
                            </div>

                            {staged && (
                                <div className={`relative overflow-hidden rounded-lg border border-[#222] bg-black ${SLOTS[panelIndex]?.box ?? ""}`}>
                                    <Preview src={staged.url} sizes="380px" />
                                </div>
                            )}

                            {busy && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                                        {progress !== null ? `Uploading… ${progress}%` : `${busy}…`}
                                    </div>
                                    {progress !== null && (
                                        <progress
                                            value={progress}
                                            max={100}
                                            aria-label="Upload progress"
                                            className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-[#222] [&::-moz-progress-bar]:bg-[#E31E24] [&::-webkit-progress-bar]:bg-[#222] [&::-webkit-progress-value]:bg-[#E31E24] [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-200"
                                        />
                                    )}
                                </div>
                            )}

                            {staged ? (
                                <>
                                    {altFields}
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={saveStaged} disabled={!!busy} className={`${primaryBtn} flex-1`}>
                                            <ImageUp size={17} aria-hidden="true" />
                                            {adding ? "Upload and add" : "Upload and replace"}
                                        </button>
                                        <button type="button" onClick={() => select(adding ? (photos?.[0]?._id ?? null) : selectedId)} disabled={!!busy} className={secondaryBtn}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                selected && (
                                    <>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <button type="button" onClick={() => swap(selectedIndex, selectedIndex - 1)} disabled={selectedIndex === 0 || !!busy} className={secondaryBtn}>
                                                    <ArrowUp size={15} aria-hidden="true" /> Move earlier
                                                </button>
                                                <button type="button" onClick={() => swap(selectedIndex, selectedIndex + 1)} disabled={selectedIndex === count - 1 || !!busy} className={secondaryBtn}>
                                                    <ArrowDown size={15} aria-hidden="true" /> Move later
                                                </button>
                                                <button type="button" onClick={() => openPicker("replace")} disabled={!!busy} className={secondaryBtn}>
                                                    <ImageUp size={15} aria-hidden="true" /> Replace
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => confirmDialog.current?.showModal()}
                                                    disabled={!!busy}
                                                    className={`${secondaryBtn} text-red-300 hover:border-red-900 hover:text-red-200`}
                                                >
                                                    <Trash2 size={15} aria-hidden="true" /> Delete
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400">Replacement photos: {FILE_RULES}</p>
                                        </div>
                                        {altFields}
                                        {altDirty && (
                                            <div className="flex gap-2">
                                                <button type="button" onClick={saveAlt} disabled={!!busy} className={`${primaryBtn} flex-1`}>
                                                    Save alt text
                                                </button>
                                                <button type="button" onClick={() => setAltDraft(null)} disabled={!!busy} className={secondaryBtn}>
                                                    Undo
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )
                            )}

                            {!adding && !staged && (
                                full ? (
                                    <p className="text-xs text-gray-400">All four positions are filled. Replace or delete a photo to change one.</p>
                                ) : (
                                    <div className="space-y-2 border-t border-[#222] pt-5">
                                        <button type="button" onClick={() => openPicker("add")} disabled={!!busy} className={`${secondaryBtn} w-full`}>
                                            <ImagePlus size={15} aria-hidden="true" /> Add photo at position {count + 1}
                                        </button>
                                        <p className="text-xs text-gray-400">
                                            {FILE_RULES} With fewer than four photos, the Franchise page closes up the empty positions.
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>

            <dialog
                ref={confirmDialog}
                aria-labelledby="delete-heading"
                className="m-auto w-[min(92vw,420px)] rounded-xl border border-[#2a2a2a] bg-[#111] p-6 text-gray-100 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] backdrop:bg-black/70"
            >
                <h2 id="delete-heading" className="text-lg font-semibold text-white">
                    Delete photo {selectedIndex + 1}?
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                    It disappears from the Franchise page straight away, and the photos after it move up one position.
                </p>
                {selected && (
                    <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-lg">
                        <Preview src={selected.imageUrl} sizes="420px" />
                    </div>
                )}
                <div className="mt-6 flex justify-end gap-2">
                    {/* biome-ignore lint/a11y/noAutofocus: the safe choice takes focus in a destructive dialog */}
                    <button type="button" autoFocus onClick={() => confirmDialog.current?.close()} className={secondaryBtn}>
                        Keep photo
                    </button>
                    <button type="button" onClick={remove} className={`${primaryBtn} py-2`}>
                        <Trash2 size={15} aria-hidden="true" /> Delete photo
                    </button>
                </div>
            </dialog>
        </div>
    );
}
