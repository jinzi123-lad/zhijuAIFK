
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Property, PropertyType, LandlordType } from '../types';
import { searchPropertiesWithAI, getLocationSuggestions } from '../services/geminiService';
import { CASCADING_REGIONS, LEASE_TERM_OPTIONS } from '../constants';

interface DataScreenProps {
  properties: Property[];
  onViewProperty: (property: Property) => void;
}

type InteractionMode = 'VIEW' | 'PICK_POINT' | 'DRAW_CIRCLE';

const DataScreen: React.FC<DataScreenProps> = ({ properties, onViewProperty }) => {
  // Safe access to Leaflet global
  const L = (window as any).L;

  // Base set of properties (All, or result of AI Search / Circle Search)
  const [baseProperties, setBaseProperties] = useState<Property[]>(properties);

  // Final filtered properties (after applying manual filters on baseProperties)
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // --- 1. View Mode (Top Level) - RENT ONLY NOW ---
  // const [viewMode, setViewMode] = useState<PropertyType | 'ALL'>('ALL'); // Removed Sale Option

  // --- 2. Destination & Map Interaction ---
  const [destination, setDestination] = useState('');
  // Store explicit coordinates if selected via map or dropdown
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number, lng: number } | null>(null);

  const [suggestions, setSuggestions] = useState<Array<{ name: string, address: string, lat: number, lng: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('VIEW');
  const [drawRadius, setDrawRadius] = useState(0);

  // --- 3. Filters ---
  const [filterProvince, setFilterProvince] = useState('全部');
  const [filterCity, setFilterCity] = useState('全部');
  const [filterDistrict, setFilterDistrict] = useState('全部');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [filterPrice, setFilterPrice] = useState('全部');

  // New Filters
  const [filterCommute, setFilterCommute] = useState('不限');
  const [filterLease, setFilterLease] = useState('不限');

  // --- 4. Custom Requirements ---
  const [requirements, setRequirements] = useState('');

  // AI State
  const [isSearching, setIsSearching] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiCommuteInfo, setAiCommuteInfo] = useState<Record<string, string>>({});

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayersRef = useRef<any[]>([]);
  const circleLayerRef = useRef<any>(null);
  const dragStartRef = useRef<{ lat: number, lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || !L) return;

    const map = L.map(mapContainerRef.current).setView([39.9042, 116.4074], 12);
    mapInstanceRef.current = map;

    // Gaode Map
    L.tileLayer('https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      attribution: '&copy; <a href="https://ditu.amap.com/">高德地图</a>',
      minZoom: 3,
      maxZoom: 18
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [L]);

  // Sync Interactions (Click/Drag)
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;
    const map = mapInstanceRef.current;

    map.off('click');
    map.off('mousedown');
    map.off('mousemove');
    map.off('mouseup');

    map.dragging.enable();
    map.getContainer().style.cursor = '';

    if (interactionMode === 'PICK_POINT') {
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        handleDestinationSelect({ name: '地图选点', address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
        setInteractionMode('VIEW');
      });
    } else if (interactionMode === 'DRAW_CIRCLE') {
      // "Humanized" Draw Circle: Click to start, Move to expand, Click to finish
      map.getContainer().style.cursor = 'crosshair';

      // Disable dragging immediately to prevent panning while trying to draw
      map.dragging.disable();

      map.on('click', (e: any) => {
        // Phase 1: Start Drawing
        if (!dragStartRef.current) {
          dragStartRef.current = e.latlng;

          if (circleLayerRef.current) map.removeLayer(circleLayerRef.current);
          circleLayerRef.current = L.circle(e.latlng, { radius: 0, color: '#f59e0b', weight: 2, fillOpacity: 0.2 }).addTo(map);
        }
        // Phase 2: Finish Drawing
        else {
          const center = dragStartRef.current;
          const radius = circleLayerRef.current ? circleLayerRef.current.getRadius() : 0;

          const matched = properties.filter(p => {
            const pLoc = L.latLng(p.coordinates.lat, p.coordinates.lng);
            return map.distance(center, pLoc) <= radius;
          });

          setBaseProperties(matched);
          setAiAnalysis(`已筛选出半径 ${(radius / 1000).toFixed(2)}km 内的 ${matched.length} 套房源。`);

          // Reset
          dragStartRef.current = null;
          setInteractionMode('VIEW');
          map.dragging.enable();
          map.getContainer().style.cursor = '';
        }
      });

      map.on('mousemove', (e: any) => {
        // Only update if we have a center point (Phase 1 active)
        if (!dragStartRef.current || !circleLayerRef.current) return;

        const dist = map.distance(dragStartRef.current, e.latlng);
        circleLayerRef.current.setRadius(dist);
        setDrawRadius(Math.round(dist));
        circleLayerRef.current.bindTooltip(`${(dist / 1000).toFixed(2)} km`, { permanent: true, direction: 'right' }).openTooltip();
      });
    }
  }, [interactionMode, properties, L]);

  // Apply Manual Filters Effect (Client-side filtering for immediate feedback)
  useEffect(() => {
    let result = baseProperties;

    // 1. View Mode (All Rent)
    // result = result.filter(p => p.type === viewMode);

    // 2. Region
    if (filterProvince !== '全部') result = result.filter(p => p.location.includes(filterProvince));
    if (filterCity !== '全部' && filterCity !== filterProvince) result = result.filter(p => p.location.includes(filterCity));
    if (filterDistrict !== '全部') result = result.filter(p => p.location.includes(filterDistrict) || p.address.includes(filterDistrict));

    // 3. Category
    if (filterCategory !== '全部') result = result.filter(p => p.category === filterCategory);

    // 4. Price
    if (filterPrice !== '全部') {
      const getRange = (label: string) => {
        if (label === '1000元以下') return { min: 0, max: 1000 };
        if (label === '1000-2000元') return { min: 1000, max: 2000 };
        if (label === '2000-3000元') return { min: 2000, max: 3000 };
        if (label === '3000-4000元') return { min: 3000, max: 4000 };
        if (label === '4000-5000元') return { min: 4000, max: 5000 };
        if (label === '5000-8000元') return { min: 5000, max: 8000 };
        if (label === '8000-12000元') return { min: 8000, max: 12000 };
        if (label === '12000-15000元') return { min: 12000, max: 15000 };
        if (label === '15000-20000元') return { min: 15000, max: 20000 };
        if (label === '20000元以上') return { min: 20000, max: Infinity };
        return { min: -1, max: -1 };
      };

      result = result.filter(p => {
        const range = getRange(filterPrice);
        if (range.min === -1) return true;

        const factor = 1;
        const pPrice = p.price / factor;
        let matches = pPrice >= range.min && pPrice <= range.max;

        if (!matches && p.landlordType === LandlordType.CORPORATE && p.units) {
          return p.units.some(u => {
            const uPrice = u.price / factor;
            return uPrice >= range.min && uPrice <= range.max;
          });
        }
        return matches;
      });
    }

    setFilteredProperties(result);
  }, [baseProperties, filterProvince, filterCity, filterDistrict, filterCategory, filterPrice]);

  // Handle Property Updates on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    filteredProperties.forEach(p => {
      const color = '#6366f1';
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L2 12H5V20H9V14H15V20H19V12H22L12 3Z" />
            </svg>
          </div>
          <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color};"></div>
        </div>
      `;
      const customIcon = L.divIcon({ className: 'custom-pin-icon', html: iconHtml, iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40] });

      const marker = L.marker([p.coordinates.lat, p.coordinates.lng], { icon: customIcon })
        .addTo(map)
        .on('click', () => { // Reverted to Click
          setSelectedProperty(p);
          map.setView([p.coordinates.lat, p.coordinates.lng], 14); // Restore view jump
        });

      // Removed comic-bubble tooltip logic

      markersRef.current.push(marker);
    });
  }, [filteredProperties, aiCommuteInfo, L]);

  const clearRoutes = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    routeLayersRef.current.forEach(layer => map.removeLayer(layer));
    routeLayersRef.current = [];
    if (circleLayerRef.current) {
      map.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }
  };

  const handleDestinationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDestination(val);
    // Clear explicit coords when user types, as the text might not match the old point anymore
    setDestinationCoords(null);

    if (val.length > 1) {
      getLocationSuggestions(val).then(list => {
        setSuggestions(list);
        setShowSuggestions(true);
      });
    } else {
      setShowSuggestions(false);
    }
  };

  const handleDestinationSelect = (item: { name: string, address?: string, lat: number, lng: number }) => {
    setDestination(item.name);
    setDestinationCoords({ lat: item.lat, lng: item.lng });
    setShowSuggestions(false);

    if (mapInstanceRef.current && L) {
      const map = mapInstanceRef.current;
      map.setView([item.lat, item.lng], 14);
      clearRoutes();

      const destIconHtml = `
            <div style="background-color: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <span style="font-size: 16px;">🏢</span>
            </div>
          `;
      const destIcon = L.divIcon({ className: '', html: destIconHtml, iconSize: [30, 30] });
      const destMarker = L.marker([item.lat, item.lng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>目的地</b><br>${item.name}${item.address ? `<br><span style="font-size:10px;color:#666">${item.address}</span>` : ''}`)
        .openPopup();
      routeLayersRef.current.push(destMarker);
    }
  };

  const handleAISearch = async () => {
    setIsSearching(true);
    setAiAnalysis('');
    if (interactionMode === 'DRAW_CIRCLE') { setIsSearching(false); return; }

    // Don't clear routes immediately if we want to keep the "Map Select" marker until AI replaces it
    // But AI response is fast, so clearing is fine for a clean state
    clearRoutes();

    // Construct a comprehensive query from all sidebar inputs
    const criteria = [];
    criteria.push(`交易类型: 租房`);
    if (filterProvince !== '全部') criteria.push(`区域: ${filterProvince}${filterCity !== '全部' ? filterCity : ''}${filterDistrict !== '全部' ? filterDistrict : ''}`);
    if (filterCategory !== '全部') criteria.push(`房型: ${filterCategory}`);
    if (filterPrice !== '全部') criteria.push(`价格范围: ${filterPrice}`);
    if (filterCommute !== '不限') criteria.push(`通勤时间要求: ${filterCommute}`);
    if (filterLease !== '不限') criteria.push(`租赁方式: ${filterLease}`);
    if (requirements) criteria.push(`其他自定义需求: ${requirements}`);

    // IMPORTANT: Inject explicit coordinates if available
    if (destination) {
      if (destinationCoords) {
        criteria.push(`目的地: ${destination} (坐标: ${destinationCoords.lat}, ${destinationCoords.lng})`);
      } else {
        criteria.push(`目的地: ${destination}`);
      }
    }

    const query = `请根据以下综合条件筛选最佳匹配的房源: ${criteria.join('; ')}。请特别注意目的地通勤时间和价格要求。`;

    const { matchedIds, destinationLocation, reasoning, commuteEstimates } = await searchPropertiesWithAI(query, properties);
    const matched = properties.filter(p => matchedIds.includes(p.id));

    // Fix: Reset all manual filters so the AI results are actually visible!
    setFilterProvince('全部');
    setFilterCity('全部');
    setFilterDistrict('全部');
    setFilterCategory('全部');
    setFilterPrice('全部');
    setFilterCommute('不限');
    setFilterLease('不限');
    setRequirements(''); // Optional: clear custom req input or keep it? Keeping it is fine as it was input.

    setBaseProperties(matched);
    setAiAnalysis(reasoning);
    setAiCommuteInfo(commuteEstimates || {});
    setIsSearching(false);

    if (!mapInstanceRef.current || !L) return;
    const map = mapInstanceRef.current;

    // Use returned destination location from AI (which should reflect our input coords if provided)
    const finalDest = destinationLocation;
    const boundsPoints: any[] = matched.map(p => [p.coordinates.lat, p.coordinates.lng]);

    if (finalDest && finalDest.lat && finalDest.lng) {
      const destIconHtml = `
            <div style="background-color: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <span style="font-size: 16px;">🏢</span>
            </div>
        `;
      const destIcon = L.divIcon({ className: '', html: destIconHtml, iconSize: [30, 30] });
      const destMarker = L.marker([finalDest.lat, finalDest.lng], { icon: destIcon }).addTo(map).bindPopup(`<b>目的地</b><br>${destination || '通勤地点'}`).openPopup();
      routeLayersRef.current.push(destMarker);
      boundsPoints.push([finalDest.lat, finalDest.lng]);

      matched.forEach(p => {
        // Visual Enhancement: Use a gradient-like dashed line or distinct style
        const routeLine = L.polyline([[p.coordinates.lat, p.coordinates.lng], [finalDest.lat, finalDest.lng]], {
          color: '#8b5cf6', // Violet color matching the theme
          weight: 3,
          opacity: 0.8,
          dashArray: '5, 10',
          lineCap: 'round',
          className: 'animate-pulse' // Add a pulse animation class if tailwind supports, or just static
        }).addTo(map);
        // Removed persistent tooltip (moved to hover bubble on marker)
        routeLayersRef.current.push(routeLine);
      });
    }

    if (boundsPoints.length > 0) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  };

  const handleReset = () => {
    setBaseProperties(properties);
    setFilteredProperties(properties);
    setDestination('');
    setDestinationCoords(null);
    setRequirements('');
    setAiAnalysis('');
    setFilterProvince('全部');
    setFilterCity('全部');
    setFilterDistrict('全部');
    setFilterCategory('全部');
    setFilterPrice('全部');
    setFilterCommute('不限');
    setFilterLease('不限');
    setAiCommuteInfo({});
    clearRoutes();
    setInteractionMode('VIEW');
    if (mapInstanceRef.current) mapInstanceRef.current.setView([39.9042, 116.4074], 12);
  };

  const handleOpenGaodeMap = () => {
    if (!selectedProperty) return;

    const pLat = selectedProperty.coordinates.lat;
    const pLng = selectedProperty.coordinates.lng;
    const pName = selectedProperty.address;

    let url = '';

    // If destination is set and coordinates are available, construct a navigation route
    if (destinationCoords) {
      const dLat = destinationCoords.lat;
      const dLng = destinationCoords.lng;
      const dName = destination || '通勤起点';

      // Amap Web URI API for Direction
      // https://www.amap.com/dir?from[lnglat]=...&from[name]=...&to[lnglat]=...&to[name]=...&mode=car
      url = `https://www.amap.com/dir?from[lnglat]=${dLng},${dLat}&from[name]=${encodeURIComponent(dName)}&to[lnglat]=${pLng},${pLat}&to[name]=${encodeURIComponent(pName)}&mode=car`;
    } else {
      // Just open marker
      // https://uri.amap.com/marker?position=lng,lat&name=...
      url = `https://uri.amap.com/marker?position=${pLng},${pLat}&name=${encodeURIComponent(pName)}`;
    }

    window.open(url, '_blank');
  };

  const stats = useMemo(() => {
    const total = filteredProperties.length;
    const avgPrice = total > 0 ? Math.round(filteredProperties.reduce((s, p) => s + p.price, 0) / total) : 0;
    return { total, avgPrice };
  }, [filteredProperties]);

  // Preset Questions
  const PRESET_QUESTIONS = [
    { label: '💰 预算有限', text: '我的预算在 5000元以内，希望性价比高。' },
    { label: '🛏️ 两居室', text: '我需要两室一厅的房子，适合合租。' },
    { label: '🚇 地铁房', text: '希望距离地铁站步行10分钟以内。' },
    { label: '📅 短租', text: '我只需要租3个月，支持短租。' },
  ];

  const addPresetRequirement = (text: string) => {
    setRequirements(prev => prev ? prev + ' ' + text : text);
  };

  return (
    <div className="flex h-full relative overflow-hidden bg-slate-900">

      {/* Sidebar Control Panel */}
      <div className="w-80 bg-slate-800/95 border-r border-slate-700 flex flex-col z-10 shadow-xl backdrop-blur-sm">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            AI 地图找房
          </h2>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-5 custom-scrollbar">

          {/* 2. Destination & Interaction */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">通勤目的地</label>

            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={handleDestinationInput}
                  placeholder="输入地点或使用下方按钮"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-slate-200 max-h-60 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDestinationSelect(item)}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 border-b border-slate-100 last:border-0"
                      >
                        <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500 truncate">{item.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setInteractionMode(interactionMode === 'PICK_POINT' ? 'VIEW' : 'PICK_POINT')}
                  className={`flex-1 py-1.5 rounded border text-xs font-bold transition-all flex items-center justify-center gap-1 ${interactionMode === 'PICK_POINT' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  📍 地图选点
                </button>
                <button
                  onClick={() => setInteractionMode(interactionMode === 'DRAW_CIRCLE' ? 'VIEW' : 'DRAW_CIRCLE')}
                  className={`flex-1 py-1.5 rounded border text-xs font-bold transition-all flex items-center justify-center gap-1 ${interactionMode === 'DRAW_CIRCLE' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  ⭕ 画圈找房
                </button>
              </div>
            </div>
          </div>

          {/* 3. Filters */}
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">综合筛选</label>

            {/* Region */}
            <div className="space-y-2">
              <select value={filterProvince} onChange={(e) => { setFilterProvince(e.target.value); setFilterCity('全部'); setFilterDistrict('全部'); }} className="w-full bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded px-2 py-2 outline-none focus:border-indigo-500">
                <option value="全部">全部省份</option>
                {Object.keys(CASCADING_REGIONS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="flex gap-2">
                <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} disabled={filterProvince === '全部'} className="w-full bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded px-2 py-2 outline-none focus:border-indigo-500">
                  <option value="全部">全部城市</option>
                  {filterProvince !== '全部' && Object.keys(CASCADING_REGIONS[filterProvince]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} disabled={filterCity === '全部'} className="w-full bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded px-2 py-2 outline-none focus:border-indigo-500">
                  <option value="全部">全部区县</option>
                  {filterProvince !== '全部' && filterCity !== '全部' && CASCADING_REGIONS[filterProvince][filterCity]?.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Category */}
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded px-2 py-2 outline-none focus:border-indigo-500">
              <option value="全部">全部房型 (住宅/别墅/商铺...)</option>
              {['住宅', '城市公寓', '城中村公寓', '别墅', '工厂', '写字楼', '商铺', '其他'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Price */}
            <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded px-2 py-2 outline-none focus:border-indigo-500">
              <option value="全部">全部价格</option>
              <option value="1000元以下">1000元以下</option>
              <option value="1000-2000元">1000-2000元</option>
              <option value="2000-3000元">2000-3000元</option>
              <option value="3000-4000元">3000-4000元</option>
              <option value="4000-5000元">4000-5000元</option>
              <option value="5000-8000元">5000-8000元</option>
              <option value="8000-12000元">8000-12000元</option>
              <option value="12000-15000元">12000-15000元</option>
              <option value="15000-20000元">15000-20000元</option>
              <option value="20000元以上">20000元以上</option>
            </select>

            {/* Commute Time (Updated) */}
            <select value={filterCommute} onChange={(e) => setFilterCommute(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded px-2 py-2 outline-none focus:border-indigo-500">
              <option value="不限">不限通勤时间</option>
              <option value="30分钟内">30分钟内</option>
              <option value="45分钟内">45分钟内</option>
              <option value="1小时内">1小时内</option>
              <option value="1.5小时内">1.5小时内</option>
              <option value="2小时内">2小时内</option>
              <option value="2.5小时内">2.5小时内</option>
              <option value="3小时内">3小时内</option>
            </select>

            {/* Lease Terms */}
            <select value={filterLease} onChange={(e) => setFilterLease(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded px-2 py-2 outline-none focus:border-indigo-500">
              <option value="不限">不限租赁方式</option>
              {LEASE_TERM_OPTIONS.map(term => <option key={term} value={term}>{term}</option>)}
            </select>
          </div>

          {/* 4. Custom Requirements */}
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">自定义详细需求</label>

            {/* Preset Chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_QUESTIONS.map(q => (
                <button
                  key={q.label}
                  onClick={() => addPresetRequirement(q.text)}
                  className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-[10px] hover:bg-indigo-600 hover:text-white transition-colors border border-slate-600"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="例如：朝南，有阳台，不要一楼..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none h-20 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3 pb-6">
            <button
              onClick={handleAISearch}
              disabled={isSearching}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center transition-all"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  开始智能匹配
                </>
              ) : '开始智能匹配'}
            </button>

            <button onClick={handleReset} className="w-full text-slate-500 text-xs hover:text-white underline">
              重置所有条件
            </button>
          </div>

          {/* Analysis & Stats */}
          {aiAnalysis && (
            <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4 mb-4">
              <h3 className="text-indigo-300 font-bold text-sm mb-2 flex items-center">
                <span className="mr-1">💡</span> AI 分析报告
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                {aiAnalysis}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="text-slate-400 text-xs">匹配房源</div>
              <div className="text-xl font-bold text-white">{stats.total} <span className="text-xs font-normal">套</span></div>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="text-slate-400 text-xs">平均价格</div>
              <div className="text-lg font-bold text-white">
                {stats.avgPrice > 100000
                  ? `${(stats.avgPrice / 10000).toFixed(0)}万`
                  : `¥${stats.avgPrice}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {selectedProperty && (
          <div className="absolute top-4 right-4 z-[500] w-72 bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="relative h-32 bg-slate-200">
              <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-full object-cover" />
              {/* Removed Close Button as it updates on hover now */}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 leading-tight">{selectedProperty.title}</h4>
                <div className="flex gap-1">
                  <span className={`px-1.5 py-0.5 text-xs rounded text-white bg-indigo-500`}>
                    租
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-3">{selectedProperty.location} · {selectedProperty.address}</p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-red-600">
                  ¥{selectedProperty.price}/月
                </span>
                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">{selectedProperty.layout}</span>
              </div>

              {/* AI Commute Info Integration */}
              {aiCommuteInfo[selectedProperty.id] && (
                <div className="mb-3 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs">🤖</span>
                    <span className="text-xs font-bold text-indigo-700">AI 通勤分析</span>
                  </div>
                  <div className="text-xs text-indigo-600 font-medium">
                    {aiCommuteInfo[selectedProperty.id]}
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onViewProperty(selectedProperty)}
                  className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors"
                >
                  查看详情
                </button>
                <button
                  onClick={handleOpenGaodeMap}
                  className="flex-1 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                >
                  <span className="text-sm">🧭</span> 高德导航
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataScreen;
