
import React, { useState } from 'react';
import { Property, PropertyType, PropertyViewConfig, LandlordType, PropertyStatus } from '../types';

interface PropertyDetailProps {
    property: Property;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onOrderAction: (action: 'VIEWING' | 'SIGN') => void; // New prop for order actions
    viewConfig?: PropertyViewConfig;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack, onEdit, onDelete, onOrderAction, viewConfig }) => {
    const [activeImage, setActiveImage] = useState(property.imageUrl);

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
            zoomControl: false, // Mini map style
            attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        L.marker([lat, lng]).addTo(map)
            .bindPopup(property.title)
            .openPopup();

        mapInstanceRef.current = map;

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
                {/* ... (Existing Media Logic, no changes) ... */}
                {config.showMedia ? (
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative h-[400px] bg-slate-100 rounded-2xl overflow-hidden group shadow-inner">
                            <img src={activeImage} alt="Main" className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className={`px-3 py-1 text-sm font-bold text-white rounded shadow-sm ${property.type === PropertyType.RENT ? 'bg-indigo-600' : 'bg-rose-600'}`}>
                                    {property.type === PropertyType.RENT ? '出租' : '出售'}
                                </span>
                                <span className="px-3 py-1 text-sm font-bold text-white bg-slate-700 rounded shadow-sm">
                                    {property.category}
                                </span>
                            </div>
                            {/* Status Overlay for Detail View */}
                            {!isAvailable && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                                    <span className="border-4 border-white text-white font-bold text-3xl px-8 py-4 transform -rotate-12 uppercase">
                                        {property.status === PropertyStatus.RENTED ? '已出租' : property.status === PropertyStatus.SOLD ? '已售出' : '交易中'}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* ... (Thumbnails, Video, etc logic remains same) ... */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
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
                                            <video controls className="w-full h-full">
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
                                    <img src={property.floorPlanUrl} alt="Floor Plan" className="w-full h-full object-contain" />
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
                    {/* Title & Price */}
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

                    {/* Key Stats Grid */}
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

                    {/* Landlord Contact Info (Visible only in Internal Mode / Not Guest) */}
                    {!isGuestMode && property.landlordContacts && property.landlordContacts.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <h4 className="font-bold text-purple-800 text-sm mb-3 flex items-center">
                                <span className="mr-2">🔑</span> 房东/业主联系信息 (内部)
                            </h4>
                            <div className="space-y-3">
                                {property.landlordContacts.map((contact, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-800">{contact.name}</span>
                                            <span className="font-mono text-purple-700 font-bold">{contact.phone}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{contact.wechat ? `微信: ${contact.wechat}` : '无微信'}</span>
                                            {contact.note && <span className="text-right italic truncate max-w-[150px]">{contact.note}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CORPORATE UNITS */}
                    {property.landlordType === LandlordType.CORPORATE && property.units && (
                        <div className="bg-white border-2 border-orange-100 rounded-xl overflow-hidden">
                            <div className="bg-orange-50 p-3 border-b border-orange-100 flex justify-between items-center">
                                <h4 className="font-bold text-orange-800 text-sm">🏡 可选户型 / 房间列表</h4>
                                <span className="text-xs text-orange-600">{property.units.length} 个户型在租</span>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                {property.units.map(unit => (
                                    <div key={unit.id} className="p-3 flex items-center hover:bg-slate-50 transition-colors">
                                        <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden mr-3 flex-shrink-0">
                                            {unit.imageUrl ? (
                                                <img src={unit.imageUrl} className="w-full h-full object-cover" alt="" />
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
                                                <button className="text-xs text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-50">咨询</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lease Terms */}
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

                    {/* Embeds */}
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
                            {/* Map Container */}
                            <div ref={mapContainerRef} className="w-full h-full z-0" style={{ minHeight: '100%' }} />

                            {/* Overlay Button for External Map */}
                            <a
                                href={`https://map.baidu.com/search/${encodeURIComponent(property.address)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-3 right-3 z-[400] bg-white/90 hover:bg-white text-indigo-600 text-xs font-bold px-3 py-2 rounded-lg shadow-md flex items-center transition-all backdrop-blur-sm"
                            >
                                <span className="mr-1">🗺️</span> 打开百度地图
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Share Modal (omitted for brevity, same as previous) */}
            {isShareModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-[500px] max-w-full shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">定制分享链接</h3>
                                <p className="text-xs text-slate-500">选择您希望对外展示的房源信息</p>
                            </div>
                            <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Checkboxes logic same as before... */}
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700">显示价格</span>
                                    <input
                                        type="checkbox"
                                        checked={shareConfig.showPrice}
                                        onChange={() => toggleShareConfig('showPrice')}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <div>
                                        <span className="block text-sm font-medium text-slate-700">显示详细地址</span>
                                        {!shareConfig.showAddress && <span className="text-xs text-orange-500">将仅显示: {property.location} (隐藏门牌号)</span>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={shareConfig.showAddress}
                                        onChange={() => toggleShareConfig('showAddress')}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700">包含图库与视频资料</span>
                                    <input
                                        type="checkbox"
                                        checked={shareConfig.showMedia}
                                        onChange={() => toggleShareConfig('showMedia')}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700">显示详细描述</span>
                                    <input
                                        type="checkbox"
                                        checked={shareConfig.showDescription}
                                        onChange={() => toggleShareConfig('showDescription')}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700">显示佣金信息 (仅限同行)</span>
                                    <input
                                        type="checkbox"
                                        checked={shareConfig.showCommission}
                                        onChange={() => toggleShareConfig('showCommission')}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                </label>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <button
                                    onClick={handleCopyLink}
                                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${linkCopied
                                        ? 'bg-green-600 text-white'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                        }`}
                                >
                                    {linkCopied ? (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            链接已复制!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            生成并复制链接
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetail;
