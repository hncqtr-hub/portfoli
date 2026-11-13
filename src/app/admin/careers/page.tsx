"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import {
    Briefcase,
    Search,
    FileText,
    Mail,
    Phone,
    Calendar,
    Loader2,
    Download,
    Trash2
} from "lucide-react";

export default function AdminCareersPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await axios.get("/api/careers");
            setApplications(res.data);
        } catch (error) {
            console.error("Failed to fetch applications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this application?")) return;

        try {
            await axios.delete(`/api/careers/${id}`);
            // Remove from state
            setApplications(prev => prev.filter(app => app._id !== id));
        } catch (error) {
            console.error("Failed to delete application:", error);
            alert("Failed to delete application. Please try again.");
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.position && app.position.toLowerCase().includes(searchQuery.toLowerCase()));

        const applicationDate = new Date(app.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (end) {
            end.setHours(23, 59, 59, 999);
        }

        const matchesDate = (!start || applicationDate >= start) && (!end || applicationDate <= end);

        return matchesSearch && matchesDate;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Career Applications</h1>
                    <p className="text-gray-400">Manage job applications and resumes</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search by position, name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-[#0a0a0a] border border-[#333] rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-[#0a0a0a] border border-[#333] rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Applications List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="text-center py-20 bg-[#111] border border-[#222] rounded-xl">
                    <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
                    <p className="text-gray-500">
                        {searchQuery ? "Try adjusting your search query" : "No career applications received yet"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredApplications.map((app) => (
                        <div
                            key={app._id}
                            className="bg-[#111] border border-[#222] rounded-xl p-6 hover:border-[#333] transition-all"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Left: Applicant Info */}
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            {app.name}
                                            <span className="text-sm font-normal text-gray-500">|</span>
                                            <span className="text-sm font-medium text-blue-400">{app.position}</span>
                                            {app.status === 'new' && (
                                                <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">New</span>
                                            )}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Mail size={14} />
                                                <span>{app.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} />
                                                <span>{app.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                                        <p className="text-gray-300 text-sm whitespace-pre-line">{app.message}</p>
                                    </div>
                                </div>

                                {/* Right: Actions (Resume & Delete) */}
                                <div className="flex flex-col justify-start md:items-end gap-3 min-w-[200px]">
                                    {app.resume ? (
                                        <a
                                            href={app.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-[#E31E24] text-white rounded-lg hover:bg-[#c4191f] transition-colors"
                                        >
                                            <FileText size={18} />
                                            <span>View Resume</span>
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-500 px-4 py-2 border border-[#333] rounded-lg bg-[#0a0a0a]">
                                            <FileText size={18} />
                                            <span className="text-sm">No Resume</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleDelete(app._id)}
                                        className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Delete Application"
                                    >
                                        <Trash2 size={18} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
