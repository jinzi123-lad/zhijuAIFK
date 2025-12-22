import React, { useState } from 'react';
import { Property, PropertyType, PropertyViewConfig, LandlordType, PropertyStatus, PropertyUnit } from '../types';

interface PropertyDetailProps {
    property: Property;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onOrderAction: (action: 'VIEWING' | 'SIGN') => void;
    viewConfig?: PropertyViewConfig;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack, onEdit, onDelete, onOrderAction, viewConfig }) => {
    const [activeImage, setActiveImage] = useState(property.imageUrl);
    const cardRef = React.useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Share Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareConfig, setShareConfig] = useState<PropertyViewConfig>({
        showPrice: true,
        showAddress: true,
        showMedia: true,
        showDescription: true,
        showCommission: false
    });
    const [linkCopied, setLinkCopied] = useState(false);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxScale, setLightboxScale] = useState(1);
    const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const [viewingUnit, setViewingUnit] = useState<PropertyUnit | null>(null);

    const config = viewConfig || {
        showPrice: true,
        showAddress: true,
        showMedia: true,
        showDescription: true,
        showCommission: true
    };
    const isGuestMode = !!viewConfig;

    const allImages = [property.imageUrl, ...(property.imageUrls || [])];

    const handleDeleteClick = () => {
        if (window.confirm('确定要删除此房源吗？此操作无法撤销。')) {
            onDelete();
        }
    };

    const handleCopyLink = () => {
        const configParam = btoa(JSON.stringify(shareConfig));
        const baseUrl = window.location.origin;
        const mockLink = `${baseUrl}/?shareId=${property.id}&c=${configParam}`;

        navigator.clipboard.writeText(mockLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const toggleShareConfig = (key: keyof PropertyViewConfig) => {
        setShareConfig(prev => ({ ...prev, [key]: !prev[key] }));
        setLinkCopied(false);
    };

    const handleExportCard = async () => {
        if (!cardRef.current) return;
        setIsExporting(true);
        try {
            const html2canvas = (window as any).html2canvas;
            if (!html2canvas) {
                alert('Export module loading, please try again...');
                return;
            }

            // 1. Pre-process images to Base64 to bypass CORS issues in html2canvas
            const images = cardRef.current.getElementsByTagName('img');
            const originalSrcs: string[] = [];

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                originalSrcs.push(img.src);
                try {
                    const response = await fetch(img.src);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    await new Promise((resolve) => {
                        reader.onloadend = () => {
                            img.src = reader.result as string;
                            resolve(null);
                        };
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    console.warn('Failed to convert image to Base64', img.src, e);
                }
            }

            // 2. Wait for a moment for layout to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Capture
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2, // High Res
                backgroundColor: '#ffffff',
                logging: false
            });

            // 4. Restore original srcs (optional, but good practice if logic re-uses DOM)
            for (let i = 0; i < images.length; i++) {
                images[i].src = originalSrcs[i];
            }

            const link = document.createElement('a');
            link.download = `智居房产长图-${property.title}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
            alert('生成长图失败，请检查网络或稍后重试');
        } finally {
            setIsExporting(false);
        }
    };

    // Lightbox Handlers
    const openLightbox = () => {
        const index = allImages.indexOf(activeImage);
        setLightboxIndex(index >= 0 ? index : 0);
        setLightboxScale(1);
        setLightboxPos({ x: 0, y: 0 });
        setIsLightboxOpen(true);
    };
    const closeLightbox = () => setIsLightboxOpen(false);
    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLightboxIndex((prev) => (prev + 1) % allImages.length);
        setLightboxScale(1);
        setLightboxPos({ x: 0, y: 0 });
    };
    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
        setLightboxScale(1);
        setLightboxPos({ x: 0, y: 0 });
    };

    // Wheel Zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.5, lightboxScale + delta), 5);
        setLightboxScale(newScale);
    };

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (lightboxScale > 1) {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({ x: e.clientX - lightboxPos.x, y: e.clientY - lightboxPos.y });
        }
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            setLightboxPos({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const isAvailable = !property.status || property.status === PropertyStatus.AVAILABLE;

    // Map Implementation
    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const mapInstanceRef = React.useRef<any>(null);

    React.useEffect(() => {
        const L = (window as any).L;
        if (!L || !mapContainerRef.current || !property.coordinates) return;

        // Cleanup previous instance
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const { lat, lng } = property.coordinates;
        const map = L.map(mapContainerRef.current, {
            center: [lat, lng],
            zoom: 15,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile,
            tap: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        L.marker([lat, lng]).addTo(map)
            .bindPopup(property.title)
            .openPopup();

        mapInstanceRef.current = map;

        setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [property]);

    return (
        <div className="bg-white min-h-full p-4 md:p-8 animate-fade-in relative">
            {/* Header / Navigation */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                {!isGuestMode ? (
                    <>
                        <button
                            onClick={onBack}
                            className="flex items-center px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all shadow-md font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            返回房源库
                        </button>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => onOrderAction('VIEWING')}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm shadow-indigo-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                预约看房
                            </button>

                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm shadow-green-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                一键分享
                            </button>
                            <button
                                onClick={handleExportCard}
                                disabled={isExporting}
                                className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isExporting ? '生成中...' : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        生成房源卡
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onEdit}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors border border-indigo-200"
                            >
                                编辑
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors border border-red-200"
                            >
                                删除
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-slate-800">智居房产 · 精选房源</span>
                        </div>
                        <a href="/" className="text-sm text-indigo-600 hover:underline">返回首页</a>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {config.showMedia ? (
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative h-[400px] bg-slate-100 rounded-2xl overflow-hidden group shadow-inner cursor-pointer" onClick={openLightbox}>
                            <img src={activeImage} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">🔍 查看大图</span>
                            </div>
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className={`px-3 py-1 text-sm font-bold text-white rounded shadow-sm ${property.type === PropertyType.RENT ? 'bg-indigo-600' : 'bg-rose-600'}`}>
                                    {property.type === PropertyType.RENT ? '出租' : '出售'}
                                </span>
                                <span className="px-3 py-1 text-sm font-bold text-white bg-slate-700 rounded shadow-sm">
                                    {property.category}
                                </span>
                            </div>
                            {!isAvailable && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                                    <span className="border-4 border-white text-white font-bold text-3xl px-8 py-4 transform -rotate-12 uppercase">
                                        {property.status === PropertyStatus.RENTED ? '已出租' : property.status === PropertyStatus.SOLD ? '已售出' : '交易中'}
                                    </span>
                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                        {property.videoUrls && property.videoUrls.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                                    <span className="mr-2">🎬</span> 房源视频
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {property.videoUrls.map((video, idx) => (
                                        <div key={idx} className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm">
                                            <video controls playsInline crossOrigin="anonymous" className="w-full h-full" preload="metadata">
                                                <source src={video} type="video/mp4" />
                                                您的浏览器不支持视频播放。
                                            </video>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {property.floorPlanUrl && (
                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                                    <span className="mr-2">📐</span> 户型图
                                </h3>
                                <div className="h-64 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-4 hover:shadow-md transition-shadow">
                                    <img src={property.floorPlanUrl} alt="Floor Plan" className="w-full h-full object-contain" loading="lazy" />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="lg:col-span-2 flex items-center justify-center bg-slate-100 rounded-2xl h-64 text-slate-400">
                        该房源暂未公开图片
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{property.title}</h1>
                        <p className="text-slate-500 mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {config.showAddress ? (
                                <>{property.location} · {property.address}</>
                            ) : (
                                <>{property.location} <span className="text-xs bg-slate-200 px-1 rounded ml-2">详细地址请咨询顾问</span></>
                            )}
                        </p>

                        {config.showPrice ? (
                            <div className="flex items-baseline gap-2 pb-4 border-b border-slate-100">
                                <span className="text-3xl font-bold text-rose-600">
                                    {property.landlordType === LandlordType.CORPORATE ? (
                                        <span className="flex items-baseline">
                                            <span className="text-sm text-slate-500 font-normal mr-1">起价</span>
                                            ¥{property.price}
                                            <span className="text-sm text-slate-500 font-normal ml-1">/月</span>
                                        </span>
                                    ) : (
                                        <>
                                            {property.type === PropertyType.RENT ? `¥${property.price}` : `¥${(property.price / 10000).toFixed(0)}万`}
                                        </>
                                    )}
                                </span>
                                <span className="text-slate-500">
                                    {property.landlordType !== LandlordType.CORPORATE && (property.type === PropertyType.RENT ? '/月' : '(总价)')}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-2 pb-4 border-b border-slate-100">
                                <span className="text-2xl font-bold text-rose-600">价格面议</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                            <div className="text-slate-400 text-xs mb-1">面积</div>
                            <div className="text-slate-800 font-bold">{property.area}㎡</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                            <div className="text-slate-400 text-xs mb-1">户型</div>
                            <div className="text-slate-800 font-bold">{property.layout}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                            <div className="text-slate-400 text-xs mb-1">类型</div>
                            <div className="text-slate-800 font-bold">{property.category}</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {property.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium border border-indigo-100">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {!isGuestMode && property.landlordContacts && property.landlordContacts.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 text-sm flex items-center">
                                    <span className="mr-2 text-lg">👤</span> 房东信息卡
                                </h4>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${property.landlordType === LandlordType.CORPORATE
                                    ? 'bg-orange-50 text-orange-600 border-orange-200'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                    {property.landlordType === LandlordType.CORPORATE ? '企业公寓' : '个人房东'}
                                </span>
                            </div>
                            <div className="p-4 space-y-4">
                                {property.landlordContacts.map((contact, idx) => (
                                    <div key={idx} className="flex flex-col gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-slate-800 text-base flex items-center gap-2">
                                                    {contact.name || '未命名房东'}
                                                    {idx === 0 && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded">主要</span>}
                                                </div>
                                                {contact.note && <div className="text-xs text-slate-400 mt-1 italic">{contact.note}</div>}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-slate-400 mb-0.5">信任分</div>
                                                <div className="text-sm font-bold text-emerald-600">98.5</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(contact.phone);
                                                    alert('✅ 电话已复制: ' + contact.phone);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                                            >
                                                <span>📞</span> {contact.phone}
                                            </button>
                                            {contact.wechat && (
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(contact.wechat || '');
                                                        alert('✅ 微信已复制: ' + contact.wechat);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                                                >
                                                    <span>💬</span> 复制微信
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-50 p-2 text-center text-xs text-slate-400 border-t border-slate-100">
                                <span className="flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    智居AI已完成房东实名认证
                                </span>
                            </div>
                        </div>
                    )}

                    {property.landlordType === LandlordType.CORPORATE && property.units && (
                        <div className="bg-white border-2 border-orange-100 rounded-xl overflow-hidden">
                            <div className="bg-orange-50 p-3 border-b border-orange-100 flex justify-between items-center">
                                <h4 className="font-bold text-orange-800 text-sm">🏡 可选户型 / 房间列表</h4>
                                <span className="text-xs text-orange-600">{property.units.length} 个户型在租</span>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                {property.units.map(unit => (
                                    <div key={unit.id} className="p-3 flex items-center hover:bg-slate-50 transition-colors" onClick={() => setViewingUnit(unit)}>
                                        <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden mr-3 flex-shrink-0">
                                            {unit.imageUrl ? (
                                                <img src={unit.imageUrl} className="w-full h-full object-cover" alt="" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">无图</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h5 className="font-bold text-slate-800 text-sm truncate">{unit.name}</h5>
                                                {config.showPrice ? (
                                                    <span className="font-bold text-rose-600 text-sm">¥{unit.price}</span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">面议</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">{unit.layout} · {unit.area}㎡</span>
                                                <button className="text-xs text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-50">查看</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {property.type === PropertyType.RENT && property.leaseTerms && (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <h4 className="text-xs font-bold text-orange-800 uppercase mb-3">租赁方式与佣金</h4>
                            <div className="flex flex-col gap-2">
                                {property.leaseTerms.map(term => {
                                    const commission = property.leaseCommissions?.[term];
                                    return (
                                        <div key={term} className="flex items-center justify-between bg-white p-2 rounded-lg border border-orange-200">
                                            <span className="text-sm font-bold text-orange-700">{term}</span>
                                            {config.showCommission ? (
                                                commission ? (
                                                    <span className="text-xs text-orange-600 font-medium">佣金: {commission}</span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">未设置佣金</span>
                                                )
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {config.showDescription && (
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">房源介绍</h3>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                                {property.description}
                            </p>
                        </div>
                    )}

                    {property.commuteInfo && config.showAddress && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start">
                            <span className="mr-2 text-xl">🚇</span>
                            <div>
                                <h4 className="font-bold text-green-800 text-sm">交通通勤</h4>
                                <p className="text-green-700 text-xs mt-1">{property.commuteInfo}</p>
                            </div>
                        </div>
                    )}

                    {property.vrUrl && config.showMedia && (
                        <a href={property.vrUrl} target="_blank" rel="noreferrer" className="block w-full py-3 bg-slate-900 text-white text-center rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center">
                            <span className="mr-2 text-lg">👓</span> 进入 VR 全景看房
                        </a>
                    )}

                    {config.showAddress && (
                        <div className="relative h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
                            <div ref={mapContainerRef} className="w-full h-full z-0" style={{ minHeight: '100%' }} />
                            <a
                                href={`https://www.amap.com/search?query=${encodeURIComponent(property.address)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-3 right-3 z-[400] bg-white/90 hover:bg-white text-indigo-600 text-xs font-bold px-3 py-2 rounded-lg shadow-md flex items-center transition-all"
                            >
                                <span className="mr-1">🗺️</span> 打开高德地图
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {isShareModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsShareModalOpen(false)}>
                    <div className="bg-white rounded-xl w-[400px] max-w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">分享房源</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                                    <span className="text-sm font-bold text-slate-700">💰 显示价格信息</span>
                                    <input type="checkbox" checked={shareConfig.showPrice} onChange={() => toggleShareConfig('showPrice')} className="toggle-checkbox" />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                                    <span className="text-sm font-bold text-slate-700">📍 显示详细地段</span>
                                    <input type="checkbox" checked={shareConfig.showAddress} onChange={() => toggleShareConfig('showAddress')} className="toggle-checkbox" />
                                </label>
                            </div>

                            <button onClick={handleCopyLink} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center">
                                {linkCopied ? (
                                    <><span>✅</span> <span className="ml-2">链接已复制!</span></>
                                ) : (
                                    <><span>🔗</span> <span className="ml-2">复制分享链接</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLightboxOpen && (
                <div
                    className="fixed inset-0 bg-black/95 z-[80] flex items-center justify-center overflow-hidden"
                    onClick={closeLightbox}
                    onWheel={handleWheel}
                >
                    <div className="absolute top-4 right-4 z-[90]">
                        <button onClick={closeLightbox} className="text-white/70 hover:text-white text-4xl leading-none">&times;</button>
                    </div>

                    <button className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[90]" onClick={viewingUnit ? (e) => {
                        e.stopPropagation();
                        const unitImages = viewingUnit.imageUrls || [viewingUnit.imageUrl || ''];
                        const currIdx = unitImages.indexOf(activeImage || '');
                        const prevIdx = (currIdx - 1 + unitImages.length) % unitImages.length;
                        setActiveImage(unitImages[prevIdx] || '');
                    } : prevImage}>
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[90]" onClick={viewingUnit ? (e) => {
                        e.stopPropagation();
                        const unitImages = viewingUnit.imageUrls || [viewingUnit.imageUrl || ''];
                        const currIdx = unitImages.indexOf(activeImage || '');
                        const nextIdx = (currIdx + 1) % unitImages.length;
                        setActiveImage(unitImages[nextIdx] || '');
                    } : nextImage}>
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    <div
                        className="relative overflow-hidden cursor-grab active:cursor-grabbing transition-transform duration-75"
                        style={{ transform: `scale(${lightboxScale}) translate(${lightboxPos.x}px, ${lightboxPos.y}px)` }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={e => e.stopPropagation()}
                    >
                        {activeImage && <img src={activeImage} className="max-w-[90vw] max-h-[90vh] object-contain select-none" draggable={false} />}
                    </div>
                </div>
            )}

            {viewingUnit && (
                <div className="fixed inset-0 bg-black/60 z-[65] flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingUnit(null)}>
                    <div className="bg-white rounded-2xl w-[900px] max-w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{property.title} - {viewingUnit.name}</h3>
                                <div className="text-sm text-slate-500 mt-1">{viewingUnit.layout} · {viewingUnit.area}㎡</div>
                            </div>
                            <button onClick={() => setViewingUnit(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden cursor-pointer shadow-sm relative group" onClick={() => { setActiveImage(viewingUnit.imageUrls?.[0] || viewingUnit.imageUrl || property.imageUrl || ''); setIsLightboxOpen(true); }}>
                                        {viewingUnit.imageUrls?.[0] || viewingUnit.imageUrl || property.imageUrl ? (
                                            <img src={viewingUnit.imageUrls?.[0] || viewingUnit.imageUrl || property.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">暂无图片</div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm">点击查看大图</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(viewingUnit.imageUrls || [viewingUnit.imageUrl]).slice(1, 5).map((url, i) => (
                                            url ? (
                                                <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer" onClick={() => { setActiveImage(url); setIsLightboxOpen(true); }}>
                                                    <img src={url} className="w-full h-full object-cover hover:opacity-90" />
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-sm mb-1">租金报价</div>
                                        <div className="text-3xl font-bold text-indigo-600">¥{viewingUnit.price}<span className="text-base font-normal text-slate-500">/月</span></div>
                                        <div className="mt-4 flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${viewingUnit.status === PropertyStatus.AVAILABLE ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {viewingUnit.status === PropertyStatus.AVAILABLE ? '空置招租' : '非空置'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-2">房间描述</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {viewingUnit.description || '暂无详细描述...'}
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100">
                                        <button onClick={() => { onOrderAction('VIEWING'); setViewingUnit(null); }} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                                            预约看房 (此房间)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Hidden Export Long Poster Template --- */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
                <div ref={cardRef} className="w-[480px] bg-slate-50 overflow-hidden relative font-sans text-slate-900 pb-12">
                    {/* 1. Header Cover */}
                    <div className="relative h-[320px]">
                        <img src={property.imageUrl} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                            <div className="flex gap-2 mb-2">
                                <span className="bg-indigo-600 text-white px-2 py-0.5 text-xs rounded font-bold">{property.category}</span>
                                {property.tags.slice(0, 2).map(t => <span key={t} className="bg-white/20 text-white px-2 py-0.5 text-xs rounded backdrop-blur-sm">{t}</span>)}
                            </div>
                            <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{property.title}</h1>
                        </div>
                    </div>

                    {/* 2. Basic Info Grid (Gold/Premium Style) */}
                    <div className="px-6 py-6 bg-white rounded-b-3xl shadow-sm mb-4 relative z-10 -mt-4 mx-2">
                        <div className="flex justify-between items-center text-slate-500 text-sm mb-4 border-b border-slate-100 pb-4">
                            <span className="flex items-center gap-1">📍 {property.location}</span>
                            <span className="font-mono text-xs opacity-50">{new Date().toLocaleDateString()} 更新</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-slate-400 text-xs mb-1">建筑面积</div>
                                <div className="text-lg font-bold text-slate-800">{property.area}㎡</div>
                            </div>
                            <div className="border-l border-r border-slate-100">
                                <div className="text-slate-400 text-xs mb-1">户型格局</div>
                                <div className="text-lg font-bold text-slate-800">{property.layout}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-xs mb-1">当前状态</div>
                                <div className="text-lg font-bold text-emerald-600">
                                    {property.status === PropertyStatus.AVAILABLE ? '待租/售' : '已预订'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Image Gallery (Montage) */}
                    {allImages.length > 0 && (
                        <div className="px-4 mb-6">
                            <div className="grid grid-cols-3 gap-2">
                                {allImages.slice(0, 3).map((img, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-200">
                                        <img src={img} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. Detailed Description */}
                    <div className="bg-white mx-4 p-5 rounded-xl shadow-sm mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                            <h3 className="font-bold text-slate-800">房源详细介绍</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-7 text-justify whitespace-pre-line">
                            {property.description || '暂无详细描述，请联系房东咨询更多细节。'}
                        </p>
                    </div>

                    {/* 5. Amenities / Highlights */}
                    <div className="bg-white mx-4 p-5 rounded-xl shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                            <h3 className="font-bold text-slate-800">配套与亮点</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {property.tags.map(tag => (
                                <span key={tag} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs rounded-lg border border-slate-100">
                                    ✅ {tag}
                                </span>
                            ))}
                            {(property.leaseTerms || []).map(term => (
                                <span key={term} className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs rounded-lg border border-orange-100">
                                    📄 {term}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 6. Footer / Call to Action */}
                    <div className="mt-8 flex flex-col items-center justify-center text-center p-8 bg-slate-900 text-white">
                        <div className="w-24 h-24 bg-white p-2 rounded-xl mb-4">
                            {/* Mock QR Code Pattern */}
                            <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v2h-3v-2zm-3 0h2v3h2v-3h1v2h-2v1h3v2h-3v2h-3v-2h1v-2h-1v-2zm-3-1v3h3v-3h-3zm1 4v1h1v-1h-1z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-1">扫码查看房源详情</h2>
                        <p className="text-slate-400 text-xs tracking-widest uppercase">ZHIJU AI PROPERTY ERP</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
