"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { Lock, Eye, EyeOff, Save, ShieldCheck, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({
        type: null,
        message: ""
    });

    const [emailFormData, setEmailFormData] = useState({
        currentPassword: "",
        newEmail: ""
    });
    const [showEmailPassword, setShowEmailPassword] = useState(false);
    const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({
        type: null,
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const togglePassword = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmailFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setEmailStatus({ type: null, message: "" });

        try {
            await axios.put('/api/auth/change-email', {
                currentPassword: emailFormData.currentPassword,
                newEmail: emailFormData.newEmail
            });

            setEmailStatus({
                type: 'success',
                message: "Email updated successfully"
            });

            setEmailFormData({
                currentPassword: "",
                newEmail: ""
            });

        } catch (error: any) {
            console.error("Failed to update email:", error);
            setEmailStatus({
                type: 'error',
                message: error.response?.data?.error || "Failed to update email"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({
                type: 'error',
                message: "New passwords do not match"
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            setStatus({
                type: 'error',
                message: "Password must be at least 6 characters long"
            });
            return;
        }

        setIsLoading(true);
        setStatus({ type: null, message: "" });

        try {
            await axios.put('/api/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setStatus({
                type: 'success',
                message: "Password updated successfully"
            });

            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (error: any) {
            console.error("Failed to update password:", error);
            setStatus({
                type: 'error',
                message: error.response?.data?.error || "Failed to update password"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account settings</p>
            </div>

            {/* Password Change Card */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-8 max-w-2xl">
                <div className="flex items-center gap-4 mb-6 border-b border-[#222] pb-6">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Change Password</h2>
                        <p className="text-sm text-gray-400">Update your super admin password</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 block">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword.current ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('current')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 block">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('new')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 block">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('confirm')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status.message && (
                        <div className={`p-4 rounded-lg text-sm text-center ${status.type === 'success'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {status.message}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-[#E31E24] hover:bg-[#c4191f] text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {isLoading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Email Change Card */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-8 max-w-2xl">
                <div className="flex items-center gap-4 mb-6 border-b border-[#222] pb-6">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Change Email</h2>
                        <p className="text-sm text-gray-400">Update your administrator email address</p>
                    </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                    {/* New Email */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 block">New Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                name="newEmail"
                                value={emailFormData.newEmail}
                                onChange={handleEmailChange}
                                required
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Enter new email address"
                            />
                        </div>
                    </div>

                    {/* Current Password for Email Change */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 block">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showEmailPassword ? "text" : "password"}
                                name="currentPassword"
                                value={emailFormData.currentPassword}
                                onChange={handleEmailChange}
                                required
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Enter current password to confirm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowEmailPassword(!showEmailPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showEmailPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Email Status Message */}
                    {emailStatus.message && (
                        <div className={`p-4 rounded-lg text-sm text-center ${emailStatus.type === 'success'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {emailStatus.message}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-[#007AFF] hover:bg-[#0062cc] text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {isLoading ? "Updating..." : "Update Email"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
