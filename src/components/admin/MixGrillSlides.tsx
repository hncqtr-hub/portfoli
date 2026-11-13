"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "@/lib/axios";

/* The shared axios instance sets Content-Type: application/json by default,
   which sticks to FormData requests too and makes request.formData() throw on
   the server. Axios replaces this with the real multipart type and boundary
   once it sees a FormData body, so every such call passes it. */
const FORM_DATA = { headers: { "Content-Type": "multipart/form-data" } };
import {
    Loader2,
    Plus,
    Save,
    Trash2,
    Pencil,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    X,
} from "lucide-react";

interface Localised { en?: string; ar?: string }
interface Slide {
    _id: string;
    imageUrl: string;
    title?: Localised;
    description?: Localised;
    ctaText?: Localised;
    ctaHref?: string;
    order: number;
    isActive: boolean;
}

const EMPTY = {
    titleEn: "", titleAr: "",
    descriptionEn: "", descriptionAr: "",
    ctaTextEn: "", ctaTextAr: "",
    ctaHref: "/menu",
};

/* Mix Grill slider management, mounted inside the Home Page admin screen.
   Images go to Cloudinary through the same signed-upload flow the hero banner
   uses; if that is not configured the raw file is posted and the API stores it
   with the project's saveFile helper instead. */
export default function MixGrillSlides() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [fields, setFields] = useState({ ...EMPTY });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setIsFetching(true);
        try {
            /* all=1 so inactive slides stay listed here and can be toggled. */
            const res = await axios.get("/api/mixgrill?all=1");
            setSlides(Array.isArray(res.data) ? res.data : []);
        } catch {
            setError("Could not load slides.");
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const resetForm = () => {
        setFields({ ...EMPTY });
        setFile(null);
        setPreview(null);
        setEditingId(null);
        setShowForm(false);
        if (fileRef.current) fileRef.current.value = "";
    };

    const startEdit = (slide: Slide) => {
        setEditingId(slide._id);
        setFields({
            titleEn: slide.title?.en ?? "", titleAr: slide.title?.ar ?? "",
            descriptionEn: slide.description?.en ?? "", descriptionAr: slide.description?.ar ?? "",
            ctaTextEn: slide.ctaText?.en ?? "", ctaTextAr: slide.ctaText?.ar ?? "",
            ctaHref: slide.ctaHref ?? "/menu",
        });
        setPreview(slide.imageUrl);
        setFile(null);
        setShowForm(true);
        setError("");
    };

    const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (!picked) return;
        setFile(picked);
        setPreview(URL.createObjectURL(picked));
        setError("");
    };

    /* The same signed Cloudinary upload the hero banner uses. */
    const uploadToCloudinary = async (picked: File) => {
        const signRes = await axios.post("/api/cloudinary/sign", { folder: "mixgrill" });
        const { signature, timestamp } = signRes.data;
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
        if (!cloudName || !apiKey) return null;

        const body = new FormData();
        body.append("file", picked);
        body.append("signature", signature);
        body.append("timestamp", String(timestamp));
        body.append("api_key", apiKey);
        body.append("folder", "mixgrill");
        const up = await axios.post(
            "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload",
            body,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
        return up.data.secure_url as string;
    };

    const save = async () => {
        setError(""); setMessage("");
        if (!editingId && !file) { setError("A slide image is required."); return; }
        if (fields.ctaTextEn.trim() && !fields.ctaHref.trim()) {
            setError("A button link is required when button text is set."); return;
        }

        setIsSaving(true);
        try {
            const body = new FormData();
            Object.entries(fields).forEach(([k, v]) => body.append(k, v));
            const existingOrder = slides.find((s) => s._id === editingId)?.order ?? 0;
            body.append("order", String(editingId ? existingOrder : slides.length));
            body.append("isActive", "true");

            if (file) {
                const url = await uploadToCloudinary(file).catch(() => null);
                /* Cloudinary unavailable: post the file and let the API store it. */
                if (url) body.append("imageUrl", url);
                else body.append("image", file);
            }

            if (editingId) await axios.put("/api/mixgrill/" + editingId, body, FORM_DATA);
            else await axios.post("/api/mixgrill", body, FORM_DATA);

            setMessage(editingId ? "Slide updated." : "Slide added.");
            resetForm();
            await load();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Could not save the slide.");
        } finally {
            setIsSaving(false);
        }
    };

    /* Resends every field the API expects, so a toggle or a reorder cannot
       blank out copy that this particular action did not touch. */
    const patch = async (slide: Slide, changes: Partial<Slide>) => {
        const next = { ...slide, ...changes };
        const body = new FormData();
        body.append("titleEn", next.title?.en ?? "");
        body.append("titleAr", next.title?.ar ?? "");
        body.append("descriptionEn", next.description?.en ?? "");
        body.append("descriptionAr", next.description?.ar ?? "");
        body.append("ctaTextEn", next.ctaText?.en ?? "");
        body.append("ctaTextAr", next.ctaText?.ar ?? "");
        body.append("ctaHref", next.ctaHref ?? "/menu");
        body.append("order", String(next.order));
        body.append("isActive", String(next.isActive));
        await axios.put("/api/mixgrill/" + slide._id, body, FORM_DATA);
    };

    const move = async (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= slides.length) return;
        const a = slides[index];
        const b = slides[target];
        setIsSaving(true);
        try {
            await patch(a, { order: b.order });
            await patch(b, { order: a.order });
            await load();
        } catch {
            setError("Could not reorder slides.");
        } finally { setIsSaving(false); }
    };

    const toggleActive = async (slide: Slide) => {
        setIsSaving(true);
        try { await patch(slide, { isActive: !slide.isActive }); await load(); }
        catch { setError("Could not change visibility."); }
        finally { setIsSaving(false); }
    };

    const remove = async (slide: Slide) => {
        if (!window.confirm("Delete this slide? It will stop showing on the Home page.")) return;
        setIsSaving(true);
        try {
            await axios.delete("/api/mixgrill/" + slide._id);
            setMessage("Slide deleted.");
            await load();
        } catch { setError("Could not delete the slide."); }
        finally { setIsSaving(false); }
    };

    const input = "w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#E31E24] focus:outline-none";

    return (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-white">Mix Grill Slider</h2>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-[#E31E24] hover:bg-[#c4191f] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus size={16} /> Add Slide
                </button>
            </div>
            <p className="mb-5 text-sm text-gray-500">
                Slides shown in the Mix Grill section of the Home page, in this order.
                Hidden slides stay here but are not shown to visitors.
            </p>

            {error && (
                <div className="mb-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-2 text-sm text-red-300">{error}</div>
            )}
            {message && (
                <div className="mb-4 rounded-lg border border-green-900 bg-green-950/40 px-4 py-2 text-sm text-green-300">{message}</div>
            )}

            {showForm && (
                <div className="mb-6 rounded-lg border border-[#333] bg-[#0a0a0a] p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-medium text-white">{editingId ? "Edit slide" : "New slide"}</h3>
                        <button onClick={resetForm} className="text-gray-500 hover:text-white" aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    <label className="mb-1 block text-xs text-gray-400">
                        Slide image {editingId ? "(leave empty to keep the current one)" : "(required)"}
                    </label>
                    <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile}
                        className="mb-3 w-full text-sm text-gray-400 file:mr-3 file:rounded-md file:border-0 file:bg-[#222] file:px-3 file:py-2 file:text-sm file:text-white" />
                    {preview && (
                        <img src={preview} alt="" className="mb-4 max-h-44 w-full rounded-lg border border-[#333] object-contain" />
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div><label className="mb-1 block text-xs text-gray-400">Title (English)</label>
                            <input className={input} value={fields.titleEn} onChange={(e) => setFields({ ...fields, titleEn: e.target.value })} /></div>
                        <div><label className="mb-1 block text-xs text-gray-400">Title (Arabic)</label>
                            <input dir="rtl" className={input} value={fields.titleAr} onChange={(e) => setFields({ ...fields, titleAr: e.target.value })} /></div>
                        <div><label className="mb-1 block text-xs text-gray-400">Description (English)</label>
                            <input className={input} value={fields.descriptionEn} onChange={(e) => setFields({ ...fields, descriptionEn: e.target.value })} /></div>
                        <div><label className="mb-1 block text-xs text-gray-400">Description (Arabic)</label>
                            <input dir="rtl" className={input} value={fields.descriptionAr} onChange={(e) => setFields({ ...fields, descriptionAr: e.target.value })} /></div>
                        <div><label className="mb-1 block text-xs text-gray-400">Button text (English)</label>
                            <input className={input} placeholder="Order Now" value={fields.ctaTextEn} onChange={(e) => setFields({ ...fields, ctaTextEn: e.target.value })} /></div>
                        <div><label className="mb-1 block text-xs text-gray-400">Button text (Arabic)</label>
                            <input dir="rtl" className={input} value={fields.ctaTextAr} onChange={(e) => setFields({ ...fields, ctaTextAr: e.target.value })} /></div>
                        <div className="sm:col-span-2"><label className="mb-1 block text-xs text-gray-400">Button link</label>
                            <input className={input} placeholder="/menu" value={fields.ctaHref} onChange={(e) => setFields({ ...fields, ctaHref: e.target.value })} /></div>
                    </div>

                    <button onClick={save} disabled={isSaving}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#E31E24] py-3 font-medium text-white transition-colors hover:bg-[#c4191f] disabled:cursor-not-allowed disabled:opacity-50">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isSaving ? "Saving..." : editingId ? "Update slide" : "Add slide"}
                    </button>
                </div>
            )}

            {isFetching ? (
                <div className="flex justify-center py-10 text-gray-500"><Loader2 className="animate-spin" /></div>
            ) : slides.length === 0 ? (
                <div className="rounded-lg border border-[#222] bg-[#0a0a0a] py-12 text-center text-sm text-gray-500">
                    No slides yet. The Home page keeps showing its original Mix Grill artwork until you add one.
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {slides.map((slide, i) => (
                        <li key={slide._id}
                            className={"flex items-center gap-3 rounded-lg border border-[#222] bg-[#0a0a0a] p-3 " + (slide.isActive ? "" : "opacity-55")}>
                            <img src={slide.imageUrl} alt="" className="h-14 w-24 shrink-0 rounded border border-[#333] object-cover" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">
                                    {slide.title?.en || "Untitled slide"}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                    #{i + 1} · {slide.isActive ? "Visible" : "Hidden"}
                                    {slide.ctaText?.en ? " · " + slide.ctaText.en + " -> " + slide.ctaHref : ""}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <button onClick={() => move(i, -1)} disabled={i === 0 || isSaving} title="Move up"
                                    className="rounded p-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"><ArrowUp size={16} /></button>
                                <button onClick={() => move(i, 1)} disabled={i === slides.length - 1 || isSaving} title="Move down"
                                    className="rounded p-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"><ArrowDown size={16} /></button>
                                <button onClick={() => toggleActive(slide)} disabled={isSaving} title={slide.isActive ? "Hide" : "Show"}
                                    className="rounded p-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30">
                                    {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                                <button onClick={() => startEdit(slide)} disabled={isSaving} title="Edit"
                                    className="rounded p-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"><Pencil size={16} /></button>
                                <button onClick={() => remove(slide)} disabled={isSaving} title="Delete"
                                    className="rounded p-2 text-red-400 hover:bg-red-950/40 disabled:opacity-30"><Trash2 size={16} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
