import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { searchPlaces } from '../services/geocoding';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTimer } from '../hooks/useTimer';
import { haversineDistance } from '../utils/haversine';
import { calculatePace, formatTime } from '../utils/paceCalculator';
import { saveActivity } from '../services/activityStorage';
import { Play, Pause, Square, Map as MapIcon, Loader2, ChevronLeft } from 'lucide-react';

const StartActivity = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [distance, setDistance] = useState(0);
    const [currentActivityType, setCurrentActivityType] = useState('running');

    // Save Modal State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);

    // GPS Logic: Always track location (for display), but only record when isTracking && !isPaused
    const isRecording = isTracking && !isPaused;
    const { location, error, routePath, setRoutePath, status, startTracking } = useGeolocation(isRecording);

    const { time, resetTimer } = useTimer(isRecording);
    const navigate = useNavigate();

    // Distance Calculation Logic 
    useEffect(() => {
        if (isRecording && routePath.length > 1) {
            const lastPoint = routePath[routePath.length - 1];
            const prevPoint = routePath[routePath.length - 2];

            const dist = haversineDistance(prevPoint, lastPoint);
            setDistance(prev => prev + dist);
        }
    }, [routePath, isRecording]);

    const handleStart = () => {
        setIsTracking(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        setIsPaused(true);
    };

    const handleResume = () => {
        setIsPaused(false);
    };

    const getDefaultTitle = () => {
        const hour = new Date().getHours();
        let timeOfDay = 'Pagi';
        if (hour >= 11 && hour < 15) timeOfDay = 'Siang';
        else if (hour >= 15 && hour < 18) timeOfDay = 'Sore';
        else if (hour >= 18) timeOfDay = 'Malam';
        return `Lari ${timeOfDay}`;
    };

    const handleStopClick = () => {
        setTitleInput(getDefaultTitle());
        setLocationInput('');
        setSearchResults([]);
        setShowSaveModal(true);
    };

    // Location Search Effect
    useEffect(() => {
        if (!locationInput || locationInput.length < 3) {
            setSearchResults([]);
            return;
        }
        if (showSaveModal) {
            const timeoutId = setTimeout(async () => {
                setIsSearchingLocation(true);
                const results = await searchPlaces(locationInput);
                setSearchResults(results);
                setIsSearchingLocation(false);
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [locationInput, showSaveModal]);

    const handleSelectLocation = (place) => {
        setLocationInput(place.display_name);
        setSearchResults([]);
    };

    const handleConfirmSave = async () => {
        setIsTracking(false);
        setIsSaving(true);
        setShowSaveModal(false);

        const activityData = {
            startTime: Date.now() - (time * 1000),
            duration: time,
            distance: distance,
            pace: calculatePace(distance, time),
            routePath: routePath,
            type: currentActivityType,
            title: titleInput,
            location: locationInput,
        };

        const saved = await saveActivity(activityData);
        setIsSaving(false);

        if (saved) {
            navigate(`/activity/${saved.id}`);
        } else {
            alert("Gagal menyimpan aktivitas ke database!");
        }
    };

    const currentPace = calculatePace(distance, time);

    return (
        <div className="h-screen flex flex-col bg-navy-950 relative">

            {/* --- INITIAL STATE / ERROR STATE --- */}
            {status !== 'ready' && status !== 'searching' && (
                <div className="absolute inset-0 z-30 bg-navy-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                    <div className="bg-navy-800 p-6 rounded-full mb-6 relative">
                        <div className="absolute inset-0 bg-navy-500 rounded-full animate-ping opacity-20"></div>
                        <MapIcon size={48} className="text-white relative z-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Siapkan GPS</h1>
                    <p className="text-navy-200 mb-8 max-w-xs">
                        {status === 'error' ? (error || "Gagal mendapatkan lokasi.") : "Kami perlu akses lokasi untuk melacak rute lari kamu dengan akurat."}
                    </p>
                    <button
                        onClick={startTracking}
                        className="w-full max-w-xs bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {status === 'error' ? 'Coba Lagi' : '📡 Aktifkan GPS'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 text-navy-400 text-sm hover:text-white"
                    >
                        Kembali
                    </button>
                </div>
            )}

            {/* --- LOADING STATE --- */}
            {status === 'searching' && (
                <div className="absolute inset-0 z-30 bg-navy-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                    <Loader2 size={48} className="text-emerald-400 animate-spin mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2">Mencari Satelit...</h2>
                    <p className="text-navy-300">Mohon tunggu sebentar ya.</p>
                </div>
            )}

            {/* --- READY STATE --- */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}>
                <MapView routePath={routePath} currentPos={location} zoom={18} interactive={false} />
            </div>

            {/* Overlay Gradient */}
            {status === 'ready' && <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-transparent to-navy-950/90 pointer-events-none z-0" />}

            {/* Top Bar (Only show when ready/recording) */}
            {status === 'ready' && (
                <div className="absolute top-0 w-full p-4 pt-[max(1rem,env(safe-area-inset-top))] z-10 flex justify-between items-center text-white animate-in slide-in-from-top">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-navy-900/50 backdrop-blur-md p-2 rounded-full hover:bg-navy-800 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="bg-navy-900/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        GPS: {Math.round(location?.accuracy || 0)}m
                    </div>

                    <select
                        value={currentActivityType}
                        onChange={(e) => setCurrentActivityType(e.target.value)}
                        className="bg-navy-900/50 backdrop-blur-md text-white border border-white/20 rounded-full px-3 py-1 text-xs outline-none"
                        disabled={isTracking}
                    >
                        <option value="running">Lari</option>
                        <option value="walking">Jalan</option>
                        <option value="cycling">Sepeda</option>
                    </select>
                </div>
            )}

            {/* Main Stats Display */}
            {status === 'ready' && (
                <div className="absolute top-[20%] w-full flex flex-col items-center z-10 text-white transition-all duration-500"
                    style={{ transform: isTracking ? 'translateY(0)' : 'translateY(20px)' }}
                >
                    <h1 className="text-7xl font-bold font-mono tracking-tighter drop-shadow-lg">
                        {distance.toFixed(2)}<span className="text-2xl ml-2 font-sans font-medium opacity-80">km</span>
                    </h1>
                    <div className="text-xl opacity-90 mt-2 font-medium bg-navy-900/60 backdrop-blur px-4 py-1 rounded-full">
                        {formatTime(time)}
                    </div>
                </div>
            )}

            {/* Secondary Stats */}
            {status === 'ready' && (
                <div className="absolute bottom-[25%] w-full flex justify-around px-8 z-10">
                    <div className="bg-navy-900/60 backdrop-blur-sm p-3 rounded-xl min-w-[100px] text-center">
                        <p className="text-xs text-navy-200 uppercase tracking-widest">Pace</p>
                        <p className="text-xl font-bold text-white">{currentPace}</p>
                    </div>
                    <div className="bg-navy-900/60 backdrop-blur-sm p-3 rounded-xl min-w-[100px] text-center">
                        <p className="text-xs text-navy-200 uppercase tracking-widest">Kcal</p>
                        <p className="text-xl font-bold text-white">{(distance * 60).toFixed(0)}</p>
                    </div>
                </div>
            )}

            {/* --- SAVE MODAL OVERLAY --- */}
            {showSaveModal && (
                <div className="absolute inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white dark:bg-navy-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-navy-800">
                        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-6 text-center">Simpan Aktivitas</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Judul</label>
                                <input
                                    type="text"
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-navy-500"
                                    placeholder="Lari Pagi"
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Lokasi</label>
                                <input
                                    type="text"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-navy-500"
                                    placeholder="Cari lokasi..."
                                />
                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="absolute bottom-full mb-2 left-0 w-full bg-white dark:bg-navy-800 rounded-xl shadow-xl max-h-40 overflow-y-auto border border-gray-100 dark:border-navy-700 z-50">
                                        {searchResults.map((place, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectLocation(place)}
                                                className="w-full text-left p-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700 border-b border-gray-50 dark:border-navy-700 last:border-0"
                                            >
                                                {place.display_name.split(',')[0]} <span className="text-xs text-gray-400 block truncate">{place.display_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-3 gap-2 py-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase">Jarak</p>
                                    <p className="font-bold text-navy-900 dark:text-white">{distance.toFixed(2)} km</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase">Waktu</p>
                                    <p className="font-bold text-navy-900 dark:text-white">{formatTime(time)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase">Pace</p>
                                    <p className="font-bold text-navy-900 dark:text-white">{currentPace}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmSave}
                                    className="flex-1 py-3 bg-navy-900 text-white rounded-xl font-bold shadow-lg hover:bg-navy-800 transition-colors"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {status === 'ready' && (
                <div className="absolute bottom-0 w-full p-8 pb-[max(3rem,env(safe-area-inset-bottom))] z-20 flex justify-center items-center gap-6 animate-in slide-in-from-bottom">
                    {!isTracking && !isSaving ? (
                        <button
                            onClick={handleStart}
                            className="w-24 h-24 bg-navy-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-navy-500/50 hover:scale-105 transition-all active:scale-95 group"
                        >
                            <Play size={40} className="ml-2 group-hover:text-navy-50" fill="currentColor" />
                        </button>
                    ) : isSaving ? (
                        <div className="w-20 h-20 bg-navy-800 rounded-full flex items-center justify-center text-white">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        <>
                            {isPaused ? (
                                <>
                                    <button
                                        onClick={handleResume}
                                        className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                                    >
                                        <Play size={28} fill="currentColor" className="ml-1" />
                                    </button>
                                    <button
                                        onClick={handleStopClick}
                                        className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                                    >
                                        <Square size={24} fill="currentColor" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handlePause}
                                    className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-400/40 hover:scale-105 transition-transform active:scale-95 animate-pulse"
                                >
                                    <Pause size={32} fill="currentColor" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default StartActivity;
