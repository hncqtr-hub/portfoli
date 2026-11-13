"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import MixGrillSlides from "@/components/admin/MixGrillSlides";
import {
    Upload,
    ImageIcon,
    Save,
    Loader2
} from "lucide-react";

export default function AdminHomePage() {
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);

    // Mobile Responsive Banner States
    const [mobileBannerFile, setMobileBannerFile] = useState<File | null>(null);
    const [mobilePreviewUrl, setMobilePreviewUrl] = useState<string | null>(null);
    const [currentMobileBannerUrl, setCurrentMobileBannerUrl] = useState<string | null>(null);
    const [isMobileBannerLoading, setIsMobileBannerLoading] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Loading states
    const [isBannerLoading, setIsBannerLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [message, setMessage] = useState("");



    useEffect(() => {
        fetchCurrentSettings();
    }, []);

    const fetchCurrentSettings = async () => {
        try {
            const res = await axios.get("/api/hero");
            if (res.data) {
                if (res.data.bannerImageUrl) setCurrentBannerUrl(res.data.bannerImageUrl);
                if (res.data.mobileBannerImageUrl) setCurrentMobileBannerUrl(res.data.mobileBannerImageUrl);
            }
        } catch (error) {
            console.error("Failed to fetch hero settings:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setMessage("Desktop banner must be less than 2MB");
                return;
            }

            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                if (width <= height) {
                    setMessage("Warning: Desktop banner should be landscape/widescreen (width > height). Recommended ratio: 16:9.");
                } else {
                    setMessage("");
                }
                setBannerFile(file);
                setPreviewUrl(img.src);
            };
        }
    };

    const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setValidationError("Mobile banner must be less than 2MB");
                return;
            }

            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                if (width >= height) {
                    setValidationError("Warning: Mobile banner should be portrait/vertical (height > width). Recommended ratio: 9:16.");
                } else {
                    setValidationError("");
                }
                setMobileBannerFile(file);
                setMobilePreviewUrl(img.src);
            };
        }
    };





    const handleSaveBanner = async () => {
        if (!bannerFile) {
            setMessage("Please select a banner image first.");
            return;
        }

        setIsBannerLoading(true);
        setMessage("");

        try {
            // Upload to Cloudinary
            setMessage("Preparing upload...");

            // Get Signature
            const signRes = await axios.post('/api/cloudinary/sign', {
                folder: 'hero-banners'
            });
            const { signature, timestamp } = signRes.data;
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

            if (!cloudName || !apiKey) {
                throw new Error("Cloudinary configuration missing");
            }

            // Upload to Cloudinary
            const uploadFormData = new FormData();
            uploadFormData.append('file', bannerFile);
            uploadFormData.append('signature', signature);
            uploadFormData.append('timestamp', timestamp.toString());
            uploadFormData.append('api_key', apiKey);
            uploadFormData.append('folder', 'hero-banners');

            setMessage("Uploading banner...");

            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                uploadFormData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setMessage(`Uploading: ${percent}%`);
                        }
                    }
                }
            );

            const bannerImageUrl = uploadRes.data.secure_url;

            // Update Backend with new URL
            setMessage("Finalizing...");
            const settingsFormData = new FormData();
            settingsFormData.append("bannerImageUrl", bannerImageUrl);

            await axios.post("/api/hero", settingsFormData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setCurrentBannerUrl(bannerImageUrl);
            setMessage("Banner image updated!");
            setBannerFile(null);
            setPreviewUrl(null);

        } catch (error: any) {
            console.error(error);
            const errorMsg = typeof error.response?.data?.error === 'string'
                ? error.response.data.error
                : error.message || "Failed to upload banner.";
            setMessage(errorMsg);
        } finally {
            setIsBannerLoading(false);
        }
    };

    const handleSaveMobileBanner = async () => {
        if (!mobileBannerFile) {
            setValidationError("Please select a mobile banner image first.");
            return;
        }

        setIsMobileBannerLoading(true);
        setValidationError("");

        try {
            setValidationError("Preparing upload...");

            // Get Signature
            const signRes = await axios.post('/api/cloudinary/sign', {
                folder: 'hero-banners'
            });
            const { signature, timestamp } = signRes.data;
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

            if (!cloudName || !apiKey) {
                throw new Error("Cloudinary configuration missing");
            }

            // Upload to Cloudinary
            const uploadFormData = new FormData();
            uploadFormData.append('file', mobileBannerFile);
            uploadFormData.append('signature', signature);
            uploadFormData.append('timestamp', timestamp.toString());
            uploadFormData.append('api_key', apiKey);
            uploadFormData.append('folder', 'hero-banners');

            setValidationError("Uploading mobile banner...");

            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                uploadFormData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setValidationError(`Uploading: ${percent}%`);
                        }
                    }
                }
            );

            const mobileBannerImageUrl = uploadRes.data.secure_url;

            // Update Backend with new URL
            setValidationError("Finalizing...");
            const settingsFormData = new FormData();
            settingsFormData.append("mobileBannerImageUrl", mobileBannerImageUrl);

            await axios.post("/api/hero", settingsFormData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setCurrentMobileBannerUrl(mobileBannerImageUrl);
            setValidationError("Mobile banner image updated!");
            setMobileBannerFile(null);
            setMobilePreviewUrl(null);

        } catch (error: any) {
            console.error(error);
            const errorMsg = typeof error.response?.data?.error === 'string'
                ? error.response.data.error
                : error.message || "Failed to upload mobile banner.";
            setValidationError(errorMsg);
        } finally {
            setIsMobileBannerLoading(false);
        }
    };



    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Home Page Settings</h1>
                <p className="text-gray-400">Manage the hero banner and other home page elements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Upload size={20} />
                        Update Hero Banner
                    </h2>

                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-[#333] rounded-lg p-8 text-center hover:border-[#E31E24] transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-400">Click to upload a banner image</p>
                            <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP (Max 2MB)</p>
                        </div>

                        {previewUrl && (
                            <div className="relative rounded-lg overflow-hidden border border-[#333]">
                                <p className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">Preview</p>
                                <div className="flex justify-center bg-black">
                                    <img
                                        src={previewUrl}
                                        alt="Banner preview"
                                        className="w-full h-auto object-cover max-h-[300px]"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSaveBanner}
                            disabled={isBannerLoading || isFetching || !bannerFile}
                            className="w-full flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c4191f] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isBannerLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            {isBannerLoading ? "Uploading Banner..." : "Save Banner Image"}
                        </button>

                        {message && (
                            <p className={`text-center ${message.includes("Failed") || message.includes("must be") ? "text-red-500" : "text-green-500"}`}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Current Banner Section */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ImageIcon size={20} />
                        Current Hero Banner
                    </h2>

                    {isFetching ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-gray-500" />
                        </div>
                    ) : currentBannerUrl ? (
                        <div className="relative rounded-lg overflow-hidden border border-[#333] group">
                            <div className="flex justify-center bg-black">
                                <img
                                    src={currentBannerUrl}
                                    alt="Current Hero Banner"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 bg-[#0a0a0a] rounded-lg border border-[#222]">
                            <p>No banner image set. Upload one to display on the hero section.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Responsive Banner Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* Mobile Upload Section */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Upload size={20} />
                        Update Mobile Responsive Banner
                    </h2>

                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-[#333] rounded-lg p-8 text-center hover:border-[#E31E24] transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleMobileFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-400">Click to upload a mobile banner image</p>
                            <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP (Max 2MB, Portrait 9:16)</p>
                        </div>

                        {mobilePreviewUrl && (
                            <div className="relative rounded-lg overflow-hidden border border-[#333]">
                                <p className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">Preview</p>
                                <div className="flex justify-center bg-black">
                                    <img
                                        src={mobilePreviewUrl}
                                        alt="Mobile Banner preview"
                                        className="w-auto h-auto object-cover max-h-[300px]"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSaveMobileBanner}
                            disabled={isMobileBannerLoading || isFetching || !mobileBannerFile}
                            className="w-full flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c4191f] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isMobileBannerLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            {isMobileBannerLoading ? "Uploading Mobile Banner..." : "Save Mobile Banner Image"}
                        </button>

                        {validationError && (
                            <p className={`text-center ${validationError.includes("Failed") || validationError.includes("Warning") || validationError.includes("must be") ? "text-red-500" : "text-green-500"}`}>
                                {validationError}
                            </p>
                        )}
                    </div>
                </div>

                {/* Current Mobile Banner Section */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ImageIcon size={20} />
                        Current Mobile Responsive Banner
                    </h2>

                    {isFetching ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-gray-500" />
                        </div>
                    ) : currentMobileBannerUrl ? (
                        <div className="relative rounded-lg overflow-hidden border border-[#333] group">
                            <div className="flex justify-center bg-black">
                                <img
                                    src={currentMobileBannerUrl}
                                    alt="Current Mobile Banner"
                                    className="w-auto h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 bg-[#0a0a0a] rounded-lg border border-[#222]">
                            <p>No mobile responsive banner set. Upload one to display on mobile devices.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mix Grill slider: the Home page section's slides live here so the
                whole Home page is managed from one screen. */}
            <MixGrillSlides />

        </div>
    );
}
