"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import {
    Users,
    UserPlus,
    Trash2,
    Loader2,
    Shield,
    Phone,
    Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminStaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "staff"
    });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState("");

    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role !== 'superadmin') {
                router.push('/admin/dashboard');
                return;
            }
        } else {
            router.push('/auth/signin');
            return;
        }

        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await axios.get("/api/users");
            setStaff(res.data);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus('loading');

        try {
            await axios.post("/api/users", formData);
            setSubmitStatus('success');
            setStatusMessage("Staff member added successfully!");
            setFormData({ name: "", email: "", password: "", phone: "", role: "staff" });
            setIsAdding(false);
            fetchStaff();
        } catch (error: any) {
            setSubmitStatus('error');
            setStatusMessage(error.response?.data?.error || "Failed to add staff");
        } finally {
            setTimeout(() => {
                setSubmitStatus('idle');
                setStatusMessage("");
            }, 3000);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;

        try {
            await axios.delete(`/api/users/${id}`);
            setStaff(staff.filter(user => user._id !== id));
        } catch (error) {
            console.error("Failed to delete staff:", error);
            alert("Failed to delete staff member");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Staff Management</h1>
                    <p className="text-gray-400">Manage admin access and staff members</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E31E24] text-white rounded-lg hover:bg-[#c4191f] transition-colors"
                >
                    <UserPlus size={20} />
                    <span>{isAdding ? "Cancel" : "Add New Staff"}</span>
                </button>
            </div>

            {/* Add Staff Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-8">
                            <h2 className="text-xl font-bold text-white mb-6">Add New Staff Member</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#E31E24]"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#E31E24]"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#E31E24]"
                                        placeholder="+974 1234 5678"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#E31E24]"
                                        placeholder="Create a password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#E31E24]"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitStatus === 'loading'}
                                        className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {submitStatus === 'loading' ? 'Creating...' : 'Create Staff Member'}
                                    </button>
                                    {statusMessage && (
                                        <p className={`mt-4 text-center ${submitStatus === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                            {statusMessage}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Staff List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map((user) => (
                        <div key={user._id} className="bg-[#111] border border-[#222] rounded-xl p-6 hover:border-[#333] transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Shield size={24} />
                                </div>
                                <button
                                    onClick={() => handleDelete(user._id)}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                            <p className="text-sm text-blue-400 font-medium bg-blue-500/10 inline-block px-2 py-1 rounded mb-4 uppercase text-xs tracking-wider">
                                {user.role || 'Staff'}
                            </p>

                            <div className="space-y-3 text-gray-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>{user.phoneNumber || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
