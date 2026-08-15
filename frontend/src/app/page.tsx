"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, Thermometer, Droplets, Wind, Car, MapPin, Activity } from 'lucide-react';
import axios from 'axios';

// Dynamically import the Globe to prevent Server-Side Rendering (SSR) issues with WebGL
const Earth = dynamic(() => import('./components/Earth'), { ssr: false, loading: () => <div className="absolute inset-0 flex items-center justify-center text-blue-500 animate-pulse">Initializing Geospatial Engine...</div> });

export default function Home() {
  const [cityInput, setCityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/environment?city=${encodeURIComponent(cityInput)}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch environmental data');
    }
    setLoading(false);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden text-slate-100 font-sans">
      {/* 3D WebGL Background */}
      <div className="absolute inset-0 z-0 cursor-move">
        <Earth location={data?.location} aqiColor={data?.aqi?.color || 'rgba(0, 255, 0, 1)'} />
      </div>

      {/* Floating UI Layer */}
      <div className="relative z-10 p-6 md:p-12 pointer-events-none w-full h-full flex flex-col justify-between">
        
        {/* Top Header & Search Input */}
        <div className="w-full max-w-xl mx-auto flex flex-col gap-6 pointer-events-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-2xl text-white">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Environment</span>
            </h1>
            <p className="text-slate-300 mt-3 font-medium drop-shadow-lg text-lg">Monitor real-time AQI, Weather, and Traffic.</p>
          </div>

          <form onSubmit={handleSearch} className="relative group w-full mt-2">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="block w-full pl-14 pr-36 py-4 bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-2xl transition-all text-lg font-medium"
              placeholder="Search Tokyo, London..."
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute inset-y-2 right-2 px-6 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 text-white tracking-wide"
            >
              {loading ? 'Scanning...' : 'Explore'}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-900/40 backdrop-blur-xl border border-red-500/50 rounded-xl text-red-200 text-center font-medium shadow-2xl animate-pulse">
              {error}
            </div>
          )}
        </div>

        {/* Bottom Data Dashboard */}
        {data && (
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 pointer-events-auto animate-fade-in-up pb-4">
            
            {/* Location Module */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl flex flex-col gap-2 hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-5 w-5 group-hover:text-emerald-400 transition-colors" />
                <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-300">Location</h3>
              </div>
              <p className="text-3xl font-bold text-white truncate mt-2">{data.location.name}</p>
              <p className="text-sm text-slate-400 font-mono mt-1 opacity-80">{data.location.lat.toFixed(4)}°, {data.location.lon.toFixed(4)}°</p>
            </div>

            {/* Air Quality Module */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-10 transition-opacity duration-500 group-hover:opacity-30" style={{ backgroundColor: data.aqi.color }}></div>
              <div className="flex items-center gap-2 text-slate-400 relative z-10">
                <Activity className="h-5 w-5 group-hover:text-emerald-400 transition-colors" />
                <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-300">Air Quality</h3>
              </div>
              <div className="relative z-10 flex items-end gap-2 mt-2">
                <p className="text-5xl font-black drop-shadow-md" style={{ color: data.aqi.color, textShadow: `0 0 20px ${data.aqi.color}80` }}>
                  {data.aqi.value ?? 'N/A'}
                </p>
                <p className="text-sm text-slate-300 font-bold pb-2 opacity-80 uppercase tracking-widest">AQI</p>
              </div>
            </div>

            {/* Weather Module */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl flex flex-col justify-between hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-2 text-slate-400">
                <Wind className="h-5 w-5 group-hover:text-emerald-400 transition-colors" />
                <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-300">Weather</h3>
              </div>
              <div className="flex items-end justify-between mt-2">
                <div>
                  <p className="text-4xl font-black text-white tracking-tight">{data.weather.temp}°<span className="text-2xl text-slate-400">C</span></p>
                  <p className="text-sm text-emerald-400 font-bold mt-1 tracking-wide">{data.weather.condition}</p>
                </div>
                <div className="flex flex-col items-end gap-2 pb-1">
                  <Thermometer className="h-7 w-7 text-orange-400 drop-shadow-lg" />
                  <div className="flex items-center gap-1 text-xs text-blue-300 font-bold bg-blue-900/30 px-2 py-1 rounded-full">
                    <Droplets className="h-3 w-3" />
                    <span>{data.weather.humidity}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Module */}
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl flex flex-col gap-2 hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-2 text-slate-400">
                <Car className="h-5 w-5 group-hover:text-emerald-400 transition-colors" />
                <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-300">Traffic Status</h3>
              </div>
              <div className="flex flex-col justify-between h-full mt-2">
                <p className="text-2xl font-bold text-white flex items-center gap-2">
                  {data.traffic.status}
                </p>
                <div className="mt-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex justify-between text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">
                    <span>Current</span>
                    <span>Free Flow</span>
                  </div>
                  <div className="flex justify-between items-end font-mono">
                    <span className="text-lg text-emerald-400">{data.traffic.currentSpeed} <span className="text-xs text-slate-500">km/h</span></span>
                    <span className="text-lg text-slate-300">{data.traffic.freeFlowSpeed} <span className="text-xs text-slate-500">km/h</span></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
