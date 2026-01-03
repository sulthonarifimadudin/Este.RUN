
import { useParams, useNavigate } from 'react-router-dom';
import { getActivityById, updateActivityPhoto, updateActivityTitle, deleteActivity, updateActivityLocation } from '../services/activityStorage';
import { searchPlaces } from '../services/geocoding';
import { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import MapView from '../components/MapView';
import RouteSvgRenderer from '../components/RouteSvgRenderer';
import { formatTime } from '../utils/paceCalculator';
import { Share2, ChevronLeft, Download, Loader2, Camera, Image as ImageIcon, Pencil, Trash2, X, Check, MapPin, Search } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, language } = useLanguage();

    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleInput, setEditTitleInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Location State
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Export Refs
    const standardExportRef = useRef(null);
    const transparentExportRef = useRef(null);

    const [isExporting, setIsExporting] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            const data = await getActivityById(id);
            if (data) {
                setActivity(data);
                setEditTitleInput(data.title || 'Lari Santuy');
                setLocationInput(data.location || '');
            } else {
                console.error("Activity not found");
            }
            setLoading(false);
        };
        fetchDetail();
    }, [id, navigate]);

    // Search Places Handler
    useEffect(() => {
        if (!locationInput || locationInput.length < 3) {
            setSearchResults([]);
            return;
        }

        if (isEditingLocation) {
            const timeoutId = setTimeout(async () => {
                setIsSearching(true);
                const results = await searchPlaces(locationInput);
                setSearchResults(results);
                setIsSearching(false);
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [locationInput, isEditingLocation]);

    const handleSelectLocation = async (place) => {
        const placeName = place.display_name;
        const success = await updateActivityLocation(activity.id, placeName);
        if (success) {
            setActivity(prev => ({ ...prev, location: placeName }));
            setLocationInput(placeName);
            setIsEditingLocation(false);
            setSearchResults([]);
        } else {
            alert("Gagal menyimpan lokasi.");
        }
    };

    const [exportBgMode, setExportBgMode] = useState('photo'); // 'photo' | 'map'

    useEffect(() => {
        if (activity && !activity.photoUrl) {
            setExportBgMode('map');
        }
    }, [activity]);

    const handleSaveTitle = async () => {
        if (!editTitleInput.trim()) return;
        const success = await updateActivityTitle(activity.id, editTitleInput);
        if (success) {
            setActivity(prev => ({ ...prev, title: editTitleInput }));
            setIsEditingTitle(false);
        } else {
            alert("Gagal menyimpan judul.");
        }
    };

    const handleDeleteActivity = async () => {
        if (window.confirm("Yakin ingin menghapus aktivitas ini? Data tidak bisa dikembalikan.")) {
            setIsDeleting(true);
            const success = await deleteActivity(activity.id);
            if (success) {
                navigate('/');
            } else {
                alert("Gagal menghapus aktivitas.");
                setIsDeleting(false);
            }
        }
    };

    const handlePhotoUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file || !user) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${activity.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('activity-photos')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('activity-photos')
                .getPublicUrl(fileName);

            await updateActivityPhoto(activity.id, publicUrl);

            setActivity(prev => ({ ...prev, photoUrl: publicUrl }));
            setExportBgMode('photo');
            alert("Foto berhasil diupload!");

        } catch (error) {
            console.error(error);
            alert("Gagal upload foto.");
        } finally {
            setUploading(false);
        }
    };

    const handleStandardExport = async () => {
        if (!standardExportRef.current) return;
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const canvas = await html2canvas(standardExportRef.current, {
                useCORS: true,
                scale: 3,
                allowTaint: true,
                backgroundColor: null,
                ignoreElements: (element) => element.classList.contains('no-export')
            });
            downloadImage(canvas.toDataURL('image/png'), `este-run-post-${activity.title || activity.id}.png`);
        } catch (err) {
            console.error(err);
            alert("Export gagal.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleTransparentExport = async () => {
        if (!transparentExportRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(transparentExportRef.current, {
                backgroundColor: null,
                scale: 3,
                ignoreElements: (element) => element.classList.contains('no-export')
            });
            downloadImage(canvas.toDataURL('image/png'), `este-run-overlay-${activity.title || activity.id}.png`);
        } catch (err) {
            console.error(err);
            alert("Export transparent gagal.");
        } finally {
            setIsExporting(false);
        }
    };

    const downloadImage = async (dataUrl, filename) => {
        if (Capacitor.isNativePlatform()) {
            try {
                const base64Data = dataUrl.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64Data,
                    directory: Directory.Cache
                });

                await Share.share({
                    files: [savedFile.uri],
                });
            } catch (error) {
                console.error("Native export failed:", error);
                alert("Gagal membagikan gambar.");
            }
        } else {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
        }
    };

    const handleShareLink = async () => {
        setIsExporting(true);
        const shareUrl = window.location.href;
        const shareTitle = `Lihat lari gue: ${activity.title} (${activity.distance.toFixed(1)}km)`;
        const shareText = `Gue baru aja lari sejauh ${activity.distance.toFixed(2)}km di Este.RUN! Cek detailnya:`;

        try {
            if (!standardExportRef.current) return;
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(standardExportRef.current, {
                useCORS: true,
                scale: 2,
                allowTaint: true,
                backgroundColor: null,
                ignoreElements: (element) => element.classList.contains('no-export')
            });

            const dataUrl = canvas.toDataURL('image/png');
            const blob = await (await fetch(dataUrl)).blob();
            const fileName = `este-run-${activity.id}.png`;

            if (Capacitor.isNativePlatform()) {
                const base64Data = dataUrl.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                await Share.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                    files: [savedFile.uri],
                    dialogTitle: 'Bagikan Aktivitas',
                });
            } else {
                const file = new File([blob], fileName, { type: 'image/png' });
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: shareTitle,
                        text: shareText,
                        url: shareUrl,
                        files: [file]
                    });
                } else if (navigator.share) {
                    await navigator.share({
                        title: shareTitle,
                        text: shareText,
                        url: shareUrl
                    });
                } else {
                    await navigator.clipboard.writeText(shareUrl);
                    alert("Link disalin!");
                }
            }
        } catch (error) {
            console.error("Error sharing:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) return <Layout><div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-navy-900" /></div></Layout>;
    if (!activity) return <Layout>Data tidak ditemukan.</Layout>;

    return (
        <Layout>
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate('/stats')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronLeft className="text-navy-900" />
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleShareLink}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 text-navy-600 dark:text-gray-300 rounded-full transition-colors"
                        title="Bagikan Link"
                    >
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={handleDeleteActivity}
                        disabled={isDeleting}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                        title="Hapus Aktivitas"
                    >
                        {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                    </button>
                    <label className="p-2 hover:bg-gray-100 rounded-full text-navy-600 cursor-pointer">
                        {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                </div>
            </div>

            {/* --- STANDARD VIEW (With Map/Photo) --- */}
            <div ref={standardExportRef} className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-8 max-w-md mx-auto">
                <div className="absolute inset-0 z-0">
                    {exportBgMode === 'photo' && activity.photoUrl ? (
                        <img src={activity.photoUrl} className="w-full h-full object-cover" alt="Activity" crossOrigin="anonymous" />
                    ) : (
                        <div className="w-full h-full relative">
                            <MapView routePath={activity.routePath} interactive={false} zoom={15} />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-900/20 to-navy-950/40 pointer-events-none" />
                        </div>
                    )}
                    {exportBgMode === 'photo' && <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />}
                </div>

                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-20" />
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-20" />
                </div>

                <div className="absolute inset-0 z-30 flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col items-start gap-1">
                            <h1 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">Este.RUN</h1>
                            <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center gap-2">
                                    {isEditingTitle ? (
                                        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-lg p-1">
                                            <input
                                                type="text"
                                                value={editTitleInput}
                                                onChange={(e) => setEditTitleInput(e.target.value)}
                                                className="bg-transparent border-b border-white/50 text-white font-bold italic text-sm focus:outline-none w-40 px-1"
                                                autoFocus
                                            />
                                            <button onClick={handleSaveTitle} className="p-1 hover:bg-white/20 rounded-full text-green-400"><Check size={14} /></button>
                                            <button onClick={() => setIsEditingTitle(false)} className="p-1 hover:bg-white/20 rounded-full text-red-400"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group">
                                            <h2 className="text-xl font-bold text-white/90 italic tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                                {activity.title}
                                            </h2>
                                            <button
                                                onClick={() => { setEditTitleInput(activity.title); setIsEditingTitle(true); }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-full text-white/70 no-export"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    {isEditingLocation ? (
                                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 absolute top-0 left-0 z-50 w-64 border border-white/20 shadow-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Search size={14} className="text-white/70" />
                                                <input
                                                    type="text"
                                                    value={locationInput}
                                                    onChange={(e) => setLocationInput(e.target.value)}
                                                    placeholder="Cari tempat..."
                                                    className="bg-transparent text-white text-xs w-full focus:outline-none placeholder-white/30"
                                                    autoFocus
                                                />
                                                <button onClick={() => setIsEditingLocation(false)} className="text-white/50 hover:text-white"><X size={14} /></button>
                                            </div>
                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                                {searchResults.map((place, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSelectLocation(place)}
                                                        className="w-full text-left text-white text-[10px] hover:bg-white/20 p-1.5 rounded truncate"
                                                    >
                                                        {place.display_name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 group cursor-pointer" onClick={() => { setIsEditingLocation(true); setLocationInput(''); }}>
                                            <MapPin size={12} className="text-orange-500 drop-shadow-md" />
                                            <p className="text-white/80 font-bold text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] hover:text-orange-400 transition-colors">
                                                {activity.location || t('location')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-white/80 font-bold text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">
                                {new Date(activity.startTime).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                        <div className="text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-right text-[10px] bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 uppercase tracking-widest">
                            {activity.type}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="flex items-baseline mb-4">
                            <span className="text-[100px] leading-none font-black text-white italic tracking-tighter drop-shadow-2xl" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
                                {activity.distance.toFixed(2)}
                            </span>
                            <span className="text-3xl font-bold text-white italic ml-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-90">KM</span>
                        </div>
                        <div className="flex gap-8 border-t border-white/30 pt-4">
                            <div>
                                <p className="text-white/90 font-bold text-lg uppercase tracking-widest mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{t('duration')}</p>
                                <p className="text-2xl font-black text-white italic tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{formatTime(activity.duration)}</p>
                            </div>
                            <div>
                                <p className="text-white/90 font-bold text-lg uppercase tracking-widest mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                    {activity.type === 'walking' ? t('steps') : t('pace')}
                                </p>
                                <p className="text-2xl font-black text-white italic tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {activity.type === 'walking' ? activity.steps : activity.pace}
                                </p>
                            </div>
                            <div>
                                <p className="text-white/90 font-bold text-lg uppercase tracking-widest mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{t('cal')}</p>
                                <p className="text-2xl font-black text-white italic tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{(activity.distance * 60).toFixed(0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- HIDDEN TRANSPARENT OVERLAY --- */}
            <div className="absolute top-[-9999px] left-[-9999px]">
                <div ref={transparentExportRef} className="w-[600px] h-[750px] relative bg-transparent flex flex-col justify-between overflow-hidden p-8">
                    <div className="absolute z-0 inset-x-8 top-64 bottom-80 flex items-center justify-center opacity-90">
                        <div className="absolute inset-0 flex items-center justify-center drop-shadow-2xl">
                            <RouteSvgRenderer
                                routePath={activity.routePath}
                                strokeColor="#ffffff"
                                strokeWidth={14}
                            />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RouteSvgRenderer
                                routePath={activity.routePath}
                                strokeColor="#3730a3"
                                strokeWidth={8}
                            />
                        </div>
                    </div>

                    <div className="absolute inset-0 z-10 flex flex-col justify-between p-10">
                        <div className="z-10 mt-2 flex justify-between items-start">
                            <div className='flex flex-col gap-2'>
                                <img src="/ESTE_LOGO.png" alt="Este.RUN" className="h-16 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] mb-2" />
                                <h2 className="text-3xl font-bold text-white/90 italic tracking-tight drop-shadow-md">{activity.title}</h2>
                                {activity.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={24} className="text-orange-500 drop-shadow-md" />
                                        <p className="text-white/90 font-bold text-lg drop-shadow-md">{activity.location}</p>
                                    </div>
                                )}
                                <p className="text-white/80 font-bold text-lg drop-shadow-md">{new Date(activity.startTime).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                            </div>
                        </div>

                        <div className="z-10 mt-auto">
                            <div className="flex items-baseline mb-6">
                                <span className="text-[140px] leading-none font-black text-white italic tracking-tighter drop-shadow-2xl" style={{ textShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                                    {activity.distance.toFixed(2)}
                                </span>
                                <span className="text-5xl font-bold text-white italic ml-4 drop-shadow-xl">KM</span>
                            </div>

                            <div className="flex gap-16 items-end border-t-4 border-white/50 pt-6">
                                <div>
                                    <p className="text-white/90 font-bold text-sm uppercase tracking-widest mb-1 drop-shadow-md">{t('duration')}</p>
                                    <p className="text-4xl font-black text-white italic tracking-tight drop-shadow-lg">{formatTime(activity.duration)}</p>
                                </div>
                                <div>
                                    <p className="text-white/90 font-bold text-sm uppercase tracking-widest mb-1 drop-shadow-md">
                                        {activity.type === 'walking' ? t('steps') : t('pace')}
                                    </p>
                                    <p className="text-4xl font-black text-white italic tracking-tight drop-shadow-lg">
                                        {activity.type === 'walking' ? activity.steps : activity.pace}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/90 font-bold text-sm uppercase tracking-widest mb-1 drop-shadow-md">{t('cal')}</p>
                                    <p className="text-4xl font-black text-white italic tracking-tight drop-shadow-lg">{(activity.distance * 60).toFixed(0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <button onClick={handleStandardExport} disabled={isExporting} className="w-full bg-navy-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform hover:bg-navy-800">
                    <Download size={20} />
                    {t('save')} (Full)
                </button>
                <button onClick={handleTransparentExport} disabled={isExporting} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform hover:bg-orange-700">
                    <ImageIcon size={20} />
                    {t('save')} (Overlay / Transparent)
                </button>
            </div>
        </Layout>
    );
};

export default ActivityDetail;
