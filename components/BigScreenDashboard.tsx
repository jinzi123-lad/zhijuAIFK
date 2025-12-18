
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Property, Order, PropertyStatus, OrderStatus, PropertyType, SystemLog, Client, ClientStatus } from '../types';
import { CASCADING_REGIONS } from '../constants';

interface BigScreenDashboardProps {
    properties: Property[];
    orders: Order[];
    logs: SystemLog[];
    clients: Client[];
    onExit: () => void;
}

// --- Constants ---
const REGION_COORDINATES: Record<string, { lat: number, lng: number, zoom: number }> = {
    '北京': { lat: 39.9042, lng: 116.4074, zoom: 11 },
    '上海': { lat: 31.2304, lng: 121.4737, zoom: 11 },
    '广州': { lat: 23.1291, lng: 113.2644, zoom: 11 },
    '深圳': { lat: 22.5431, lng: 114.0579, zoom: 11 },
    '杭州': { lat: 30.2741, lng: 120.1551, zoom: 11 },
    '成都': { lat: 30.5728, lng: 104.0668, zoom: 11 },
    '武汉': { lat: 30.5928, lng: 114.3055, zoom: 11 },
    '南京': { lat: 32.0603, lng: 118.7969, zoom: 11 },
    '苏州': { lat: 31.2989, lng: 120.5853, zoom: 11 },
    '天津': { lat: 39.0842, lng: 117.2009, zoom: 11 },
    '重庆': { lat: 29.5630, lng: 106.5516, zoom: 10 },
};

// --- Helpers ---
const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};

const isInCurrentMonth = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
};

const getDaysDiff = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- Sub Components ---

// Glass Card Container
const GlassCard = ({ title, children, className = '', active = false }: { title?: React.ReactNode, children?: React.ReactNode, className?: string, active?: boolean }) => (
    <div className={`relative bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden flex flex-col ${className} group`}>
        {/* Animated Border Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${active ? 'from-cyan-500/20 to-blue-600/20' : 'from-slate-800/20 to-transparent'} opacity-50 pointer-events-none`}></div>

        {/* Glowing Corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/50 rounded-tl"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/50 rounded-tr"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/50 rounded-bl"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/50 rounded-br"></div>

        {/* Title Bar */}
        {title && (
            <div className="relative z-10 px-4 py-3 border-b border-slate-700/50 flex items-center bg-gradient-to-r from-slate-800/50 to-transparent">
                <div className={`w-1 h-4 mr-2 rounded-full shadow-[0_0_8px_currentColor] ${active ? 'bg-cyan-400 text-cyan-400' : 'bg-blue-500 text-blue-500'}`}></div>
                <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase">{title}</h3>
            </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex-1 min-h-0 p-4">{children}</div>
    </div>
);

// Animated Counter
const Counter = ({ value, prefix = '', suffix = '', decimal = 0 }: { value: number, prefix?: string, suffix?: string, decimal?: number }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);

            const currentVal = start + (end - start) * ease;
            setDisplay(currentVal);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [value]);

    return (
        <span className="font-mono tabular-nums tracking-tight">
            {prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimal, maximumFractionDigits: decimal })}{suffix}
        </span>
    );
};

// Smooth Line Chart
const TrendChart = ({ data, color = '#22d3ee' }: { data: number[], color?: string }) => {
    const safeData = data && data.length > 0 ? data : [0, 0];
    const max = Math.max(...safeData, 1);
    const min = Math.min(...safeData) * 0.8;
    const range = max - min || 1;
    const count = safeData.length > 1 ? safeData.length - 1 : 1;

    const points = safeData.map((val, i) => {
        const x = (i / count) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,100 L${points} L100,100 Z`} fill={`url(#grad-${color})`} stroke="none" />
                <path d={`M${points}`} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                {safeData.map((val, i) => (
                    <circle key={i} cx={(i / count) * 100} cy={100 - ((val - min) / range) * 100} r="1.5" fill="#fff" className="opacity-0 hover:opacity-100 transition-opacity" />
                ))}
            </svg>
        </div>
    );
};


// --- Main Component ---
const BigScreenDashboard: React.FC<BigScreenDashboardProps> = ({ properties, orders, logs, clients, onExit }) => {
    const [time, setTime] = useState(new Date());
    const [isFullScreen, setIsFullScreen] = useState(false);
    const currentMonth = new Date().getMonth() + 1;
    const [mapRegion, setMapRegion] = useState('全国');

    const availableProvinces = useMemo(() => {
        const provs = new Set<string>();
        properties.forEach(p => {
            const found = Object.keys(CASCADING_REGIONS).find(region => p.location.includes(region));
            if (found) provs.add(found);
        });
        return Array.from(provs);
    }, [properties]);

    // Safe Leaflet access
    const L = (window as any).L;
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    // --- Real Data Calculation ---
    const { todayGMV, todayViewings, avgCycle, agentRanking, activeUserCount, funnelData } = useMemo(() => {
        let gmv = 0;
        let viewingsCount = 0;
        let totalCycleDays = 0;
        let completedCount = 0;
        const agentStats: Record<string, { count: number, areas: Record<string, number> }> = {};

        // Funnel Counters (This Month)
        let monthlyLeads = 0;
        let monthlyIntention = 0;
        let monthlyViewings = 0;
        let monthlyDeals = 0;

        // 1. Process Orders
        orders.forEach(o => {
            const isCompleted = o.status === OrderStatus.COMPLETED;
            const isViewing = o.status === OrderStatus.VIEWING;
            const dateRef = isCompleted ? o.contractDate : o.createdAt;

            if (isToday(dateRef || '')) {
                if (isCompleted) gmv += (o.price || 0);
                if (isViewing) viewingsCount++;
            }

            if (isCompleted && o.createdAt && o.contractDate) {
                totalCycleDays += getDaysDiff(o.createdAt, o.contractDate);
                completedCount++;
            }

            if (isCompleted) {
                if (!agentStats[o.agentName]) agentStats[o.agentName] = { count: 0, areas: {} };
                agentStats[o.agentName].count++;
                const prop = properties.find(p => p.id === o.propertyId);
                const area = prop ? prop.location.substring(0, 3) : '未知';
                agentStats[o.agentName].areas[area] = (agentStats[o.agentName].areas[area] || 0) + 1;
            }

            // Funnel: Viewings & Deals
            if (isInCurrentMonth(o.createdAt)) {
                monthlyViewings++;
            }
            if (isCompleted && isInCurrentMonth(o.contractDate || '')) {
                monthlyDeals++;
            }
        });

        // 2. Process Clients (Leads & Intention)
        clients.forEach(c => {
            monthlyLeads++;
            if (c.status !== ClientStatus.ARCHIVED) {
                monthlyIntention++;
            }
        });

        const ranking = Object.entries(agentStats).map(([name, stat]) => {
            const topArea = Object.entries(stat.areas).sort((a, b) => b[1] - a[1])[0]?.[0] || '未知';
            return { name, count: stat.count, area: topArea };
        }).sort((a, b) => b.count - a.count).slice(0, 10);

        const activeUsers = new Set<string>();
        logs.forEach(l => {
            if (isToday(l.time)) activeUsers.add(l.user);
        });

        return {
            todayGMV: gmv,
            todayViewings: viewingsCount,
            avgCycle: completedCount > 0 ? (totalCycleDays / completedCount) : 0,
            agentRanking: ranking,
            activeUserCount: activeUsers.size || 1,
            funnelData: [
                { label: '客源总数', count: monthlyLeads, color: 'bg-blue-600' },
                { label: '意向客户', count: monthlyIntention, color: 'bg-indigo-600' },
                { label: '本月带看', count: monthlyViewings, color: 'bg-violet-600' },
                { label: '本月成交', count: monthlyDeals, color: 'bg-fuchsia-600' },
            ]
        };
    }, [orders, properties, logs, clients]);

    // Stats Logic (Existing)
    const totalProperties = properties.length;

    // Calculate category stats
    const categoryStats = properties.reduce((acc: Record<string, number>, curr: Property) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedCategories = (Object.entries(categoryStats) as [string, number][]).sort((a, b) => b[1] - a[1]);

    // Calculate Region Stats
    const regionStats = properties.reduce((acc: Record<string, number>, curr: Property) => {
        let region = curr.location;
        ['北京', '上海', '广州', '深圳'].forEach(city => {
            region = region.replace(city, '');
        });
        if (!region) region = '其他';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedRegions = (Object.entries(regionStats) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    const maxRegionCount = sortedRegions.length > 0 ? sortedRegions[0][1] : 1;

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => { clearInterval(timer); };
    }, []);

    // 1. Initialize Map Instance
    useEffect(() => {
        if (!mapContainerRef.current || !L || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [36.5, 105],
            zoom: 4,
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false
        });

        // Use GaoDe Map (AutoNavi)
        L.tileLayer('https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            minZoom: 3,
            maxZoom: 18,
            attribution: '&copy; <a href="https://ditu.amap.com/">高德地图</a>',
            className: 'map-tiles-dark'
        }).addTo(map);

        mapInstanceRef.current = map;

        setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [L]);

    // 2. Update Markers & View
    useEffect(() => {
        if (!mapInstanceRef.current || !L) return;
        const map = mapInstanceRef.current;

        const displayProps = mapRegion === '全国' ? properties : properties.filter(p => p.location.includes(mapRegion));

        markersRef.current.forEach((m: any) => map.removeLayer(m));
        markersRef.current = [];

        displayProps.forEach((p) => {
            const iconHtml = `
            <div class="relative flex items-center justify-center w-4 h-4">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </div>
        `;
            const icon = L.divIcon({
                className: 'bg-transparent',
                html: iconHtml,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            const marker = L.marker([p.coordinates.lat, p.coordinates.lng], { icon }).addTo(map);

            const popupContent = `
            <div style="font-family: monospace; color: #fff; background: rgba(15, 23, 42, 0.9); border: 1px solid #06b6d4; padding: 8px; border-radius: 4px; font-size: 12px; min-width: 150px;">
                <div style="font-weight: bold; color: #22d3ee; margin-bottom: 4px;">${p.title}</div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #94a3b8;">状态:</span>
                    <span style="color: #fff;">${p.status === PropertyStatus.RENTED ? '已租' : '在租'}</span>
                </div>
                 <div style="display: flex; justify-content: space-between;">
                    <span style="color: #94a3b8;">价格:</span>
                    <span style="color: #fbbf24;">¥${p.price}</span>
                </div>
            </div>
        `;
            marker.bindPopup(popupContent, {
                closeButton: false,
                className: 'tech-popup',
                offset: [0, -10]
            });

            markersRef.current.push(marker);
        });

        // Update View Bounds
        const targetRegionConfig = REGION_COORDINATES[mapRegion];

        if (mapRegion === '全国') {
            map.setView([36.5, 105], 4, { animate: true });
        } else if (targetRegionConfig) {
            map.setView([targetRegionConfig.lat, targetRegionConfig.lng], targetRegionConfig.zoom, { animate: true });
        } else {
            if (markersRef.current.length > 0) {
                const group = L.featureGroup(markersRef.current);
                map.fitBounds(group.getBounds(), { padding: [50, 50], animate: true, maxZoom: 13 });
            } else {
                map.setView([36.5, 105], 4);
            }
        }

    }, [mapRegion, properties, L]);

    // 3. Cycle Popups
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        let currentIndex = 0;
        const popupInterval = setInterval(() => {
            if (markersRef.current.length > 0) {
                mapInstanceRef.current.closePopup();
                const marker = markersRef.current[currentIndex];
                marker.openPopup();
                currentIndex = (currentIndex + 1) % markersRef.current.length;
            }
        }, 4000);
        return () => clearInterval(popupInterval);
    }, [L, mapRegion]);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0b1121] text-white z-[9999] overflow-hidden font-sans select-none flex flex-col">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0b1121] to-[#0b1121] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"></div>

            {/* --- Header --- */}
            <header className="relative z-20 h-20 px-6 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 w-1/3">
                    <div className="relative group cursor-pointer" onClick={onExit}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200"></div>
                        <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-600">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">
                            SMART HOME BRAIN
                        </h1>
                        <p className="text-[10px] text-cyan-500/80 uppercase tracking-[0.3em]">Intelligent Real Estate Control</p>
                    </div>
                </div>

                <div className="w-1/3 flex justify-center">
                    <div className="bg-slate-800/80 border border-slate-600/50 px-6 py-1 rounded-full flex items-center gap-4 shadow-lg shadow-cyan-900/20">
                        <span className="text-2xl font-mono font-bold text-white">{time.toLocaleTimeString('zh-CN')}</span>
                        <span className="h-4 w-[1px] bg-slate-500"></span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">{time.toLocaleDateString('zh-CN')}</span>
                    </div>
                </div>

                <div className="w-1/3 flex justify-end gap-3">
                    <button onClick={toggleFullScreen} className="px-3 py-1.5 rounded border border-slate-600 hover:border-cyan-400 hover:bg-cyan-500/10 text-xs text-slate-300 hover:text-cyan-300 transition-all uppercase tracking-wider">
                        {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
                    <button onClick={onExit} className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-xs text-red-400 transition-all uppercase tracking-wider font-bold">
                        Exit System
                    </button>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 p-6 grid grid-cols-12 gap-6 relative z-10 overflow-hidden">

                {/* === LEFT COLUMN: Market Overview === */}
                <div className="col-span-3 flex flex-col gap-4 h-full min-h-0">

                    {/* Key Asset Stats */}
                    <GlassCard title="核心资产监控" className="flex-[3] min-h-0">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-2 border-b border-slate-700/50 pb-2">
                                <div>
                                    <div className="text-slate-400 text-xs mb-1">管理房源总数</div>
                                    <div className="text-4xl font-black text-white"><Counter value={totalProperties} /> <span className="text-sm font-normal text-slate-500">套</span></div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                <h4 className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wider">各类型房源统计</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {sortedCategories.map(([cat, count], i) => (
                                        <div key={cat} className="bg-slate-800/50 p-2 rounded-lg border-l-2 border-cyan-500/50 hover:bg-slate-800 transition-colors flex justify-between items-center group">
                                            <div className="text-slate-400 text-xs group-hover:text-cyan-400 transition-colors">{cat}</div>
                                            <div className="text-lg font-bold text-white font-mono"><Counter value={count} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Hot Regions (Replaces Trend Analysis) */}
                    <GlassCard title="热门区域分布" className="flex-[2] min-h-0">
                        <div className="h-full flex flex-col justify-center gap-2 px-1">
                            {sortedRegions.map(([region, count], i) => (
                                <div key={region} className="flex items-center gap-2 group">
                                    <span className={`w-5 text-xs font-bold ${i < 3 ? 'text-amber-400' : 'text-slate-600'}`}>NO.{i + 1}</span>
                                    <span className="w-12 text-xs text-slate-400 text-right truncate">{region}</span>
                                    <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full relative overflow-hidden ${i === 0 ? 'bg-gradient-to-r from-red-500 to-amber-500' : i === 1 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-slate-600'}`}
                                            style={{ width: `${(count / maxRegionCount) * 100}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-300 w-8 text-right">{count}套</span>
                                </div>
                            ))}
                            {sortedRegions.length === 0 && (
                                <div className="flex h-full items-center justify-center text-slate-500 text-xs">暂无区域数据</div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Conversion Funnel */}
                    <GlassCard title="转化漏斗 (实时)" className="flex-[2] min-h-0">
                        <div className="flex flex-col gap-2 justify-center h-full sm:py-2">
                            {funnelData.map((step, idx) => (
                                <div key={idx} className="flex items-center group">
                                    <span className="w-16 text-right text-xs text-slate-400 mr-3 group-hover:text-white transition-colors">{step.label}</span>
                                    <div className="flex-1 bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full ${step.color} rounded-full relative overflow-hidden`} style={{ width: `${(step.count / (funnelData[0].count || 1)) * 100}%` }}>
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                    <span className="w-10 text-right text-xs font-mono text-slate-300">{step.count}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* === CENTER COLUMN: DIGITIZED MAP === */}
                <div className="col-span-6 flex flex-col gap-4 h-full min-h-0 relative">

                    {/* Map Container */}
                    <div className="flex-1 relative rounded-2xl border border-slate-700/50 bg-[#0f172a] overflow-hidden group shadow-2xl min-h-0">
                        <div ref={mapContainerRef} className="w-full h-full z-0 opacity-80" />

                        {/* Grid Overlay for "Digital" Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1121] via-transparent to-transparent pointer-events-none"></div>

                        {/* Central Data Overlay */}
                        <div className="absolute top-6 left-6 z-20 pointer-events-none">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                </span>
                                <span className="text-sm font-bold text-slate-300 tracking-wider">SYSTEM ACTIVITY • TODAY</span>
                            </div>
                            <div className="mt-2 text-4xl font-black text-white font-mono tracking-tight">
                                <Counter value={activeUserCount} /> <span className="text-sm font-normal text-slate-500">人次 (今日活跃)</span>
                            </div>
                        </div>

                        {/* Region Selector */}
                        <div className="absolute top-6 right-6 z-30 pointer-events-auto">
                            <div className="relative group">
                                <select
                                    value={mapRegion}
                                    onChange={(e) => setMapRegion(e.target.value)}
                                    className="appearance-none bg-slate-900/80 border border-cyan-500/50 text-cyan-400 text-sm font-bold py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer backdrop-blur-md"
                                >
                                    <option value="全国">中国地图 (China)</option>
                                    {availableProvinces.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Metrics Bar */}
                    <div className="h-24 grid grid-cols-3 gap-4 shrink-0">
                        <GlassCard className="justify-center items-center" active>
                            <div className="text-slate-400 text-xs uppercase mb-1">今日成交总额 (GMV)</div>
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 font-mono">
                                ¥<Counter value={todayGMV} />
                            </div>
                        </GlassCard>
                        <GlassCard className="justify-center items-center">
                            <div className="text-slate-400 text-xs uppercase mb-1">今日新增带看</div>
                            <div className="text-3xl font-black text-cyan-400 font-mono">
                                <Counter value={todayViewings} /> <span className="text-sm text-slate-600">组</span>
                            </div>
                        </GlassCard>
                        <GlassCard className="justify-center items-center">
                            <div className="text-slate-400 text-xs uppercase mb-1">平均成交周期</div>
                            <div className="text-3xl font-black text-indigo-400 font-mono">
                                {avgCycle.toFixed(1)} <span className="text-sm text-slate-600">天</span>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* === RIGHT COLUMN: List & Logs === */}
                <div className="col-span-3 flex flex-col gap-4 h-full min-h-0">

                    {/* Ranking */}
                    <GlassCard title={`全员业绩排行榜 (${currentMonth}月)`} className="flex-[2] min-h-0" active>
                        <div className="flex flex-col gap-2 overflow-y-auto h-full pr-2 custom-scrollbar">
                            {agentRanking.length > 0 ? agentRanking.map((agent, i) => (
                                <div key={i} className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-slate-700 shrink-0">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm mr-3 ${i < 3 ? 'bg-gradient-to-br from-yellow-500/20 to-amber-700/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-200">{agent.name}</div>
                                        <div className="text-[10px] text-slate-500">{agent.area}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-mono font-bold text-cyan-400">{agent.count} <span className="text-[10px] text-slate-500 font-normal">套</span></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-slate-500 text-center text-xs mt-10">暂无成交数据</div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Real-time Order Feed */}
                    <GlassCard title="实时交易动态" className="flex-1 min-h-0">
                        <div className="relative h-full overflow-hidden">
                            <div className="absolute inset-0 flex flex-col gap-3 animate-[scroll-up_20s_linear_infinite]">
                                {[...orders, ...orders].slice(0, 10).map((order, i) => ( // Repeat orders for scrolling effect
                                    <div key={i} className="flex items-start gap-3 p-2 border-b border-slate-800/50">
                                        <div className={`w-2 h-2 mt-1.5 rounded-full ${order.status === OrderStatus.COMPLETED ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-orange-500'}`}></div>
                                        <div>
                                            <div className="text-xs text-slate-300">
                                                <span className="font-bold text-slate-100">{order.agentName}</span>
                                                {order.status === OrderStatus.COMPLETED ? ' 成交了 ' : ' 正在带看 '}
                                                <span className="text-cyan-400">[{order.propertyTitle.substring(0, 6)}...]</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between w-full">
                                                <span>{order.createdAt}</span>
                                                <span className="font-mono">¥{order.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Fade Masks */}
                            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0f1523] to-transparent pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0f1523] to-transparent pointer-events-none"></div>
                        </div>
                    </GlassCard>

                </div>
            </main>

            {/* Global CSS for Animations */}
            <style>{`
        @keyframes scroll-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 0 40px; }
        }
        .tech-popup .leaflet-popup-content-wrapper {
            background: transparent;
            box-shadow: none;
            padding: 0;
        }
        .tech-popup .leaflet-popup-tip {
            background: #06b6d4;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
        }
        /* Dark Map Filter for GaoDe */
        .map-tiles-dark {
            filter: invert(100%) hue-rotate(180deg) brightness(0.6) contrast(1.5) grayscale(20%);
        }
      `}</style>
        </div>
    );
};

export default BigScreenDashboard;
