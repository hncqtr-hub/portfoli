"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import {
    Store,
    TrendingUp,
    AlertCircle,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
    const router = useRouter();
    const [branches, setBranches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const branchesRes = await axios.get('/api/branches');
                setBranches(branchesRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = [
        {
            title: "Total Branches",
            count: branches.length,
            icon: Store,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            trend: "+ New",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-[#111] border border-[#222] rounded-xl hover:border-[#333] transition-colors group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="bg-[#222] text-xs text-gray-400 px-2 py-1 rounded-full flex items-center gap-1">
                                <TrendingUp size={12} />
                                {stat.trend}
                            </span>
                        </div>

                        <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                            {stat.count}
                        </h3>
                        <p className="text-gray-500 font-medium">{stat.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity / Quick Actions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Quick Actions */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <AlertCircle className="text-yellow-500" size={20} />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => router.push('/admin/branches?action=new')}
                            className="p-4 bg-[#0a0a0a] border border-[#222] rounded-lg hover:border-[#444] hover:bg-[#151515] transition-all text-left"
                        >
                            <Store className="w-5 h-5 text-blue-500 mb-3" />
                            <span className="block text-white font-medium">Add Branch</span>
                            <span className="text-xs text-gray-500">Create new location</span>
                        </button>
                    </div>
                </div>

                {/* System Status / Mini List */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Recent Branches</h2>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                            </div>
                        ) : (
                            <>
                                {branches.slice(0, 3).map((branch) => (
                                    <div key={branch._id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-[#222]">
                                        <div>
                                            <h4 className="text-white font-medium text-sm">{branch.name?.en || 'Branch Name'}</h4>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{branch.address?.en || 'Address'}</p>
                                        </div>
                                        <div className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">Active</div>
                                    </div>
                                ))}
                                {branches.length > 3 && (
                                    <div className="text-center pt-2">
                                        <span className="text-xs text-gray-500">+{branches.length - 3} more branches</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}