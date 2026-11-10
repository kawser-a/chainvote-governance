'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-3 shadow-lg">
                <p className="text-white font-medium">{`Seat: ${label}`}</p>
                <p className="text-[#C9F300]">{`Total: ${payload[0].value}`}</p>
                <p className="text-[#9EFF00]">{`Registered: ${payload[1].value}`}</p>
            </div>
        );
    }
    return null;
};

// Custom legend for charts
const renderCustomizedLegend = (props) => {
    const { payload } = props;
    return (
        <div className="flex justify-center space-x-4 mt-4">
            {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                    <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-[#A1A1A1]">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function DashboardClient() {
    const [stats, setStats] = useState(null);
    const [err, setErr] = useState('');
    const [activeTab, setActiveTab] = useState('seats');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const r = await fetch('/api/admin/stats', { cache: 'no-store' });
                const j = await r.json();
                if (!j.ok) throw new Error(j.error || 'Failed to load stats');
                setStats(j);
            } catch (e) {
                setErr(e.message);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (err) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-red-400 bg-[#1E1E1E] border border-red-500/20 rounded-xl p-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {err}
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9F300]"></div>
                <p className="text-[#A1A1A1] mt-3">Loading dashboard data...</p>
            </div>
        </div>
    );

    const { total, registered, remaining, seats } = stats;

    // Calculate percentage for pie chart
    const pieData = [
        { name: 'Registered', value: registered },
        { name: 'Remaining', value: remaining }
    ];

    const COLORS = ['#C9F300', '#2A2A2A'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Election Dashboard</h2>
                <div className="text-sm text-[#A1A1A1]">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card
                    k="Total Voters"
                    v={total}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    trend="up"
                    percent={`${Math.round((registered / total) * 100)}% registered`}
                />
                <Card
                    k="Registered"
                    v={registered}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    }
                    trend="up"
                    percent={`+${Math.round((registered / total) * 100)}%`}
                />
                <Card
                    k="Remaining"
                    v={remaining}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    trend="down"
                    percent={`${Math.round((remaining / total) * 100)}% remaining`}
                />
            </div>

            {/* Chart Tabs */}
            <div className="bg-[#171717] border border-[#232323] rounded-2xl overflow-hidden">
                <div className="border-b border-[#232323]">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('seats')}
                            className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'seats'
                                    ? 'border-[#C9F300] text-[#C9F300]'
                                    : 'border-transparent text-[#A1A1A1] hover:text-[#EDEDED]'
                                }`}
                        >
                            Seat-wise Statistics
                        </button>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'overview'
                                    ? 'border-[#C9F300] text-[#C9F300]'
                                    : 'border-transparent text-[#A1A1A1] hover:text-[#EDEDED]'
                                }`}
                        >
                            Overview
                        </button>
                    </nav>
                </div>

                <div className="p-5">
                    {activeTab === 'seats' ? (
                        <div>
                            <h3 className="text-white font-semibold mb-5 text-lg">Seat-wise Voter Statistics</h3>
                            <div className="overflow-x-auto">
                                <div style={{ minWidth: Math.max(800, seats.length * 80) }}>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={seats}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                                                barSize={40} // Increased bar size
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                                                <XAxis
                                                    dataKey="seat"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                    tick={{ fill: '#A1A1A1', fontSize: 12 }}
                                                    interval={0}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{ fill: '#A1A1A1', fontSize: 12 }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend content={renderCustomizedLegend} />
                                                <Bar
                                                    dataKey="total"
                                                    name="Total Voters"
                                                    fill="#2A2A2A"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                                <Bar
                                                    dataKey="registered"
                                                    name="Registered Voters"
                                                    fill="#C9F300"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/2">
                                <h3 className="text-white font-semibold mb-5 text-lg">Registration Status</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend content={renderCustomizedLegend} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <h3 className="text-white font-semibold mb-5 text-lg">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-4 bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded-xl border border-[#232323] transition-colors">
                                        <span className="text-white font-medium">Generate Reports</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded-xl border border-[#232323] transition-colors">
                                        <span className="text-white font-medium">Export Data</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded-xl border border-[#232323] transition-colors">
                                        <span className="text-white font-medium">Send Notifications</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Card({ k, v, icon, trend, percent }) {
    return (
        <div className="rounded-2xl border border-[#232323] bg-gradient-to-b from-[#171717] to-[#141414] p-6 hover:border-[#2A2A2A] transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="text-[#A1A1A1] text-sm font-medium">{k}</div>
                <div className="p-2 rounded-lg bg-[#1E1E1E] text-[#C9F300]">
                    {icon}
                </div>
            </div>
            <div className="text-white text-3xl font-bold mb-2">{v.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-[#9EFF00]' : 'text-[#A1A1A1]'}`}>
                {trend === 'up' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                )}
                {percent}
            </div>
        </div>
    );
}
