'use client';

import Link from 'next/link';
import { Mail, Lock, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from "@/lib/axios";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/login', { email, password });
            const data = res.data;

            // Save user info for UI logic (role-based access)
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // Redirect to admin dashboard
            router.push('/admin/dashboard');
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Login failed';
            setError(errorMsg);
            setLoading(false);
        }
    };


    return (
        <div dir="ltr" className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans">

            {/* Left Side - Admin Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-[#0a0a0a] items-center justify-center overflow-hidden border-r border-[#222]">

                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                />

                <div className="relative z-10 p-16 max-w-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-[#E31E24]/10 p-3 rounded-2xl border border-[#E31E24]/20">
                            <ShieldCheck className="w-8 h-8 text-[#E31E24]" />
                        </div>
                        <span className="text-sm font-bold tracking-[0.2em] text-[#E31E24] uppercase">Secure Gateway</span>
                    </div>

                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                        Access Your <br />
                        <span className="text-gray-500">Command Center</span>
                    </h1>

                    <p className="text-lg text-gray-400 font-light leading-relaxed mb-10">
                        Log in to monitor real-time orders, manage inventory, and analyze performance metrics across all branches.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="w-full max-w-sm space-y-8 z-10">

                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex justify-center mb-6 lg:hidden">
                            <div className="bg-[#E31E24]/10 p-3 rounded-2xl border border-[#E31E24]/20">
                                <KeyRound className="w-8 h-8 text-[#E31E24]" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2 tracking-tight">Admin Login</h2>
                        <p className="text-gray-400 text-sm">Enter your credentials to continue</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 mt-8">

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Admin Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@hotncool.com"
                                    className="w-full bg-[#111] border border-[#222] text-white rounded-lg py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all placeholder:text-gray-700"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#111] border border-[#222] text-white rounded-lg py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all placeholder:text-gray-700"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-white hover:bg-gray-200 text-black font-bold py-3.5 rounded-lg transition-all duration-300 mt-2 flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign in to Dashboard'}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>

                    </form>

                    {/* Footer/Register Link */}


                </div>
            </div>
        </div>
    );
}
