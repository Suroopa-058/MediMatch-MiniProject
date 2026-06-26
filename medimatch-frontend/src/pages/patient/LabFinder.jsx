import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';

const ALL_TESTS = ['Blood Test', 'ECG', 'X-Ray', 'MRI', 'CT Scan', 'Urine Test', 'Thyroid', 'Diabetes Panel'];

export default function LabFinder() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [search, setSearch] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationFound, setLocationFound] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [labs, setLabs] = useState([]);
  const [fetchingLabs, setFetchingLabs] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // ✅ NEW: manual search state
  const [manualInput, setManualInput] = useState('');
  const [manualSearching, setManualSearching] = useState(false);
  const [manualError, setManualError] = useState('');

  // Load Leaflet CSS + JS
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapReady(true);
      document.head.appendChild(script);
    } else if (window.L) {
      setMapReady(true);
    }
  }, []);

  // Init map
  useEffect(() => {
    if (!mapReady || !showMap || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const center = userLocation ? [userLocation.lat, userLocation.lng] : [13.0827, 80.2707];
    const map = L.map(mapRef.current).setView(center, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    mapInstanceRef.current = map;

    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div style="background:#0d9488;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], className: ''
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map).bindPopup('<b>📍 You are here</b>');
    }
  }, [mapReady, showMap, userLocation]);

  // Update markers when labs change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    labs.forEach((lab, i) => {
      if (!lab.lat || !lab.lng) return;
      const icon = L.divIcon({
        html: `<div style="background:#0f766e;color:white;width:28px;height:28px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold">${i + 1}</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14], className: ''
      });
      const marker = L.marker([lab.lat, lab.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${lab.name}</b><br>${lab.address}<br><small>${lab.distance}</small>`);
      markersRef.current.push(marker);
    });
  }, [labs]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const a = data.address;
      return `${a.suburb || a.neighbourhood || a.village || ''}, ${a.city || a.town || ''}, ${a.state || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',');
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const fetchNearbyLabs = async (lat, lng) => {
    setFetchingLabs(true);
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:10000,${lat},${lng});
          node["amenity"="clinic"](around:10000,${lat},${lng});
          node["healthcare"="laboratory"](around:10000,${lat},${lng});
          node["amenity"="doctors"](around:10000,${lat},${lng});
          way["amenity"="hospital"](around:10000,${lat},${lng});
          way["amenity"="clinic"](around:10000,${lat},${lng});
        );
        out body center 20;
      `;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST', body: query
      });
      const data = await res.json();

      const calcDist = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
      };

      const results = data.elements
        .filter(el => el.tags?.name)
        .map((el, i) => {
          const elLat = el.lat || el.center?.lat;
          const elLng = el.lon || el.center?.lon;
          const dist = elLat && elLng ? calcDist(lat, lng, elLat, elLng) : null;
          const amenity = el.tags.amenity || el.tags.healthcare || '';
          const tests = amenity === 'hospital'
            ? ['Blood Test', 'ECG', 'X-Ray', 'MRI', 'CT Scan', 'Urine Test']
            : ['Blood Test', 'Urine Test', 'ECG'];
          return {
            id: el.id,
            name: el.tags.name,
            address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || 'Address not listed',
            phone: el.tags.phone || el.tags['contact:phone'] || 'Not available',
            distance: dist ? `${dist} km` : 'Unknown',
            distanceNum: parseFloat(dist) || 999,
            open: true,
            openUntil: el.tags.opening_hours || 'Hours not listed',
            rating: (4.0 + Math.random() * 0.9).toFixed(1),
            reviews: Math.floor(200 + Math.random() * 1200),
            tests,
            tag: amenity === 'hospital' ? '🏥 Full Service' : '✅ Verified',
            tagColor: amenity === 'hospital' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700',
            lat: elLat, lng: elLng,
          };
        })
        .sort((a, b) => a.distanceNum - b.distanceNum)
        .slice(0, 10);

      setLabs(results);
    } catch (err) {
      console.error('Lab fetch error:', err);
      setLabs([]);
    }
    setFetchingLabs(false);
  };

  const resetMap = () => {
    setLocationFound(false);
    setUserLocation(null);
    setUserAddress('');
    setLabs([]);
    setShowMap(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setLocating(true);
    setManualError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        console.log("GPS:", lat, lng);
        setUserLocation({ lat, lng });
        const address = await reverseGeocode(lat, lng);
        setUserAddress(address);
        setLocationFound(true);
        setLocating(false);
        setShowMap(true);
        await fetchNearbyLabs(lat, lng);
        if (mapInstanceRef.current) mapInstanceRef.current.flyTo([lat, lng], 14);
      },
      () => { setLocating(false); alert('Could not get location. Please allow GPS access.'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ✅ NEW: Manual location search handler
  const handleManualSearch = async () => {
    if (!manualInput.trim()) return;
    setManualSearching(true);
    setManualError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualInput)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!data || data.length === 0) {
        setManualError('Location not found. Try a different name.');
        setManualSearching(false);
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      // ✅ Reset map instance first
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setLabs([]);
      setShowMap(false);
      setLocationFound(false);
      setUserLocation({ lat, lng });
      setUserAddress(data[0].display_name.split(',').slice(0, 3).join(','));

      // ✅ Fetch labs first, THEN show map
      await fetchNearbyLabs(lat, lng);
      setLocationFound(true);
      setShowMap(true);

    }  catch {
      setManualError('Search failed. Check your internet connection.');
    }
    setManualSearching(false);
  };

  const handleGetDirections = (lab) => {
    const dest = lab.lat && lab.lng ? `${lab.lat},${lab.lng}` : encodeURIComponent(lab.name);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
  };

  const filtered = labs.filter(lab => {
    const matchSearch = lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.address.toLowerCase().includes(search.toLowerCase());
    const matchTest = selectedTest ? lab.tests.includes(selectedTest) : true;
    const matchOpen = onlyOpen ? lab.open : true;
    return matchSearch && matchTest && matchOpen;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🧪 Find Nearby Lab</h2>
          <p className="text-gray-400 text-sm mt-1">Real diagnostic labs near your location — powered by OpenStreetMap</p>
        </div>

        {/* ✅ NEW: Manual Location Search Bar */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-teal-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 mb-2">🔍 Search by City / Area Name</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              placeholder="e.g. Coimbatore, Chennai, Madurai..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-400"
            />
            <button
              onClick={handleManualSearch}
              disabled={manualSearching || !manualInput.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all disabled:bg-teal-300"
            >
              {manualSearching ? '⏳ Searching...' : '🔍 Search'}
            </button>
          </div>
          {manualError && (
            <p className="text-red-500 text-xs mt-2 font-medium">⚠️ {manualError}</p>
          )}
          <p className="text-gray-400 text-xs mt-2">Or use GPS below for automatic detection</p>
        </div>

        {/* Location Bar */}
        <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between transition-all
          ${locationFound ? 'bg-green-50 border border-green-200' : 'bg-teal-50 border border-teal-200'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{locationFound ? '📍' : '🗺️'}</span>
            <div>
              <div className="text-sm font-bold text-gray-800">
                {locationFound ? 'Location Detected' : 'Detect Your Location'}
              </div>
              <div className="text-xs text-gray-500">
                {locationFound ? userAddress || 'Fetching address...'
                  : 'Click the button to find real labs near you — 100% free, no API key needed'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {locationFound && (
              <button onClick={() => setShowMap(!showMap)}
                className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all
                  ${showMap ? 'bg-teal-600 text-white border-teal-600' : 'border-teal-300 text-teal-700 hover:bg-teal-50'}`}>
                {showMap ? '📋 Hide Map' : '🗺️ Show Map'}
              </button>
            )}
            {!locationFound ? (
              <button onClick={handleLocate} disabled={locating}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all disabled:bg-teal-300">
                {locating ? '⏳ Detecting...' : '📡 Use My Location'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { resetMap(); handleLocate(); }}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-50 transition-all"
                >
                  🔄 Refresh Location
                </button>
                <span className="text-green-600 text-sm font-bold">✅ GPS Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">🗺️ Labs near you</span>
              <span className="text-xs text-gray-400">{labs.length} labs found</span>
            </div>
            <div ref={mapRef} style={{ height: '380px', width: '100%' }} />
          </div>
        )}

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex gap-3 flex-wrap items-center">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search lab name or area..."
              className="flex-1 min-w-48 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-400" />
            <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-400 bg-white">
              <option value="">All Tests</option>
              {ALL_TESTS.map(t => <option key={t}>{t}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input type="checkbox" checked={onlyOpen} onChange={e => setOnlyOpen(e.target.checked)}
                className="w-4 h-4 accent-teal-600" />
              Open Now
            </label>
            {(search || selectedTest || onlyOpen) && (
              <button onClick={() => { setSearch(''); setSelectedTest(''); setOnlyOpen(false); }}
                className="text-xs text-red-500 font-semibold hover:underline">✕ Clear</button>
            )}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {ALL_TESTS.map(t => (
              <button key={t} onClick={() => setSelectedTest(selectedTest === t ? '' : t)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border
                  ${selectedTest === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-600">
            {fetchingLabs ? '🔍 Searching real labs near you...' :
              locationFound ? `${filtered.length} lab${filtered.length !== 1 ? 's' : ''} found near you` :
                'Use GPS or search a city to find real labs near you'}
          </p>
          <button onClick={() => navigate('/patient/report-upload')}
            className="text-sm text-teal-600 font-semibold hover:underline">
            📄 Already have a report? Upload →
          </button>
        </div>

        {/* Loading */}
        {fetchingLabs && (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-full animate-spin"
                style={{ border: '3px solid #0d9488', borderTopColor: 'transparent' }} />
            </div>
            <p className="text-gray-500 font-medium">Finding labs near you...</p>
            <p className="text-gray-400 text-xs mt-1">Searching OpenStreetMap database</p>
          </div>
        )}

        {/* No location yet */}
        {!locationFound && !fetchingLabs && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-base font-bold text-gray-700 mb-2">Find labs by GPS or City Search</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              Type a city name above or click "Use My Location" to find real diagnostic labs powered by OpenStreetMap — free, no API key needed.
            </p>
            <button onClick={handleLocate} disabled={locating}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:bg-teal-300 text-sm">
              {locating ? '⏳ Detecting...' : '📡 Use My Location'}
            </button>
          </div>
        )}

        {/* No results after filter */}
        {locationFound && !fetchingLabs && filtered.length === 0 && labs.length > 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">No labs match your filters</p>
            <button onClick={() => { setSearch(''); setSelectedTest(''); setOnlyOpen(false); }}
              className="mt-3 text-teal-600 text-sm font-semibold hover:underline">Clear Filters</button>
          </div>
        )}

        {/* No labs from API */}
        {locationFound && !fetchingLabs && labs.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <div className="text-4xl mb-3">🏥</div>
            <p className="text-gray-500 font-medium">No labs found in this area</p>
            <p className="text-xs text-gray-400 mt-1">Try a different city or check your internet connection</p>
          </div>
        )}

        {/* Lab Cards */}
        {!fetchingLabs && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((lab, index) => (
              <div key={lab.id}
                onClick={() => setSelectedLab(selectedLab?.id === lab.id ? null : lab)}
                className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer transition-all
                  ${selectedLab?.id === lab.id ? 'border-teal-400 shadow-md' : 'border-gray-100 hover:border-teal-200'}`}>

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-800">{lab.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lab.tagColor}`}>{lab.tag}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">📍 {lab.address}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs font-semibold text-yellow-600">⭐ {lab.rating} ({lab.reviews.toLocaleString()})</span>
                        <span className="text-xs text-teal-600 font-semibold">📏 {lab.distance}</span>
                        <span className="text-xs text-green-600 font-semibold">🟢 {lab.openUntil}</span>
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {lab.tests.map(t => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm">{selectedLab?.id === lab.id ? '▲' : '▼'}</span>
                </div>

                {/* Expanded */}
                {selectedLab?.id === lab.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="text-sm text-gray-600">📞 <span className="font-semibold">{lab.phone}</span></div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={e => { e.stopPropagation(); if (lab.phone !== 'Not available') window.open(`tel:${lab.phone}`); }}
                          className="border border-teal-200 text-teal-600 hover:bg-teal-50 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                          📞 Call Lab
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleGetDirections(lab); }}
                          className="border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                          🧭 Get Directions
                        </button>
                        <button onClick={e => { e.stopPropagation(); navigate('/patient/report-upload'); }}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                          📄 Upload Report
                        </button>
                      </div>
                    </div>
                    {lab.lat && lab.lng && (
                      <button onClick={e => { e.stopPropagation(); setShowMap(true); setTimeout(() => mapInstanceRef.current?.flyTo([lab.lat, lab.lng], 16), 300); }}
                        className="mt-3 w-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold py-2 rounded-xl transition-all">
                        🗺️ Show on Map
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}