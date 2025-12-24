
import React, { useState } from 'react';
import { Property, PropertyType, LandlordType, PropertyStatus } from '../types';
import { generateSalesPitch } from '../services/geminiService';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, isFavorite = false, onToggleFavorite }) => {
  const [pitch, setPitch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // View mode for the image area: 'IMAGE' or 'FLOOR_PLAN'
  const [viewMode, setViewMode] = useState<'IMAGE' | 'FLOOR_PLAN'>('IMAGE');

  const handleGeneratePitch = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setLoading(true);
    const text = await generateSalesPitch(property);
    setPitch(text);
    setLoading(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const mapUrl = `https://map.baidu.com/search/${encodeURIComponent(property.address)}`;

  // Price formatting logic
  const renderPrice = () => {
    // Logic for Corporate/Multi-unit Properties
    if (property.landlordType === LandlordType.CORPORATE) {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-rose-600">
            <span className="text-sm font-normal text-slate-500 mr-1">起</span>
            ¥{property.price}
            <span className="text-sm">/月</span>
          </span>
          <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full mt-1 w-fit">
            剩余部分房间
          </span>
        </div>
      );
    }

    // Logic for Commercial Properties (Office, Factory, Shop)
    const isCommercial = ['写字楼', '工厂', '商铺'].includes(property.category);

    // Rent Only Logic
    if (isCommercial) {
      // Assume 30 days per month for calculation demo
      const pricePerDayPerSqm = (property.price / property.area / 30).toFixed(1);
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-rose-600">¥{pricePerDayPerSqm}<span className="text-sm">/㎡/天</span></span>
          <span className="text-xs text-slate-400">月租: ¥{property.price}</span>
        </div>
      );
    }
    return <span className="text-2xl font-bold text-rose-600">¥{property.price}/月</span>;
  };

  // Check if has videos
  const hasVideos = property.videoUrls && property.videoUrls.length > 0;

  // Status Overlay
  const isUnavailable = property.status === PropertyStatus.RENTED;
  const isLocked = property.status === PropertyStatus.LOCKED;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer group/card ${isUnavailable ? 'opacity-70 grayscale-[0.5]' : ''}`}
    >
      {/* Media Area */}
      <div className="relative h-48 bg-slate-100 group">
        <img
          src={viewMode === 'IMAGE' ? property.imageUrl : (property.floorPlanUrl || property.imageUrl)}
          alt={property.title}
          className={`w-full h-full ${viewMode === 'FLOOR_PLAN' ? 'object-contain bg-slate-900' : 'object-cover'} group-hover/card:scale-105 transition-transform duration-500`}
        />

        {/* Status Overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <span className="border-4 border-white text-white font-bold text-2xl px-4 py-2 transform -rotate-12 uppercase tracking-widest">
              已出租
            </span>
          </div>
        )}
        {isLocked && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <span className="bg-orange-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg">
              签约中
            </span>
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors focus:outline-none"
            title={isFavorite ? '取消收藏' : '收藏'}
          >
            <svg
              className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-white stroke-current fill-none'}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Media Controls */}
        <div className="absolute bottom-2 right-2 flex space-x-2 z-10" onClick={e => e.stopPropagation()}>
          {property.floorPlanUrl && (
            <button
              onClick={() => setViewMode(viewMode === 'IMAGE' ? 'FLOOR_PLAN' : 'IMAGE')}
              className="bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition-colors"
            >
              {viewMode === 'IMAGE' ? '看户型' : '看实拍'}
            </button>
          )}
          {property.vrUrl && (
            <a
              href={property.vrUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-indigo-600/90 text-white text-xs px-2 py-1 rounded hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span className="mr-1">👓</span> VR看房
            </a>
          )}
        </div>

        <div className="absolute top-2 left-2 flex gap-1 flex-wrap z-10">
          <span className="px-2 py-1 text-xs font-bold text-white rounded bg-indigo-500">
            出租
          </span>
          <span className="px-2 py-1 text-xs font-bold text-white bg-slate-600 rounded">
            {property.category}
          </span>
          {hasVideos && (
            <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center shadow-md border border-white/20">
              <span className="mr-1">🎬</span> 视频
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover/card:text-indigo-600 transition-colors" title={property.title}>{property.title}</h3>
        </div>

        <div className="flex justify-between items-center mb-3">
          {renderPrice()}
          <span className="text-sm text-slate-500">{property.layout} | {property.area}㎡</span>
        </div>

        {/* Lease Terms Tags (Only for Rent) */}
        {property.leaseTerms && property.leaseTerms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {property.leaseTerms.map(term => (
              <span key={term} className="px-1.5 py-0.5 text-[10px] border border-indigo-200 text-indigo-600 rounded bg-indigo-50">
                {term}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {(property.tags || []).slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-2 flex items-center truncate">
          <span className="mr-1">📍</span> {property.location}
        </p>

        {property.commuteInfo && (
          <p className="text-xs text-green-600 mb-3 bg-green-50 px-2 py-1 rounded border border-green-100 truncate">
            🚇 {property.commuteInfo}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            onClick={handleMapClick}
            className="flex items-center justify-center py-2 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 rounded transition-colors"
          >
            地图位置
          </a>
          <button
            onClick={handleGeneratePitch}
            disabled={loading}
            className="flex items-center justify-center py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
          >
            {loading ? '生成中...' : '生成销售话术'}
          </button>
        </div>

        {pitch && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-slate-700 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h4 className="font-bold text-indigo-800 mb-1 flex justify-between">
              <span>💬 AI 话术助手</span>
              <button onClick={() => setPitch(null)} className="text-xs text-indigo-400 hover:text-indigo-600">关闭</button>
            </h4>
            <p className="whitespace-pre-wrap leading-relaxed text-xs">{pitch}</p>
            <button
              onClick={() => navigator.clipboard.writeText(pitch)}
              className="mt-2 w-full py-1 bg-white border border-indigo-200 text-indigo-600 text-xs rounded hover:bg-indigo-50"
            >
              复制话术
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
