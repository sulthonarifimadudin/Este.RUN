import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, Instagram, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import MapView from './MapView';
import RouteSvgRenderer from './RouteSvgRenderer';
import { formatTime } from '../utils/paceCalculator';

const TEMPLATES = [
    { id: 'classic', name: 'Classic', ratio: 'aspect-[4/5]', width: 1080, height: 1350 },
    { id: 'story', name: 'Story', ratio: 'aspect-[9/16]', width: 1080, height: 1920 },
    { id: 'grid', name: 'Grid', ratio: 'aspect-square', width: 1080, height: 1080 },
    { id: 'transparent', name: 'Overlay', ratio: 'aspect-[4/5]', width: 1080, height: 1350, transparent: true },
    { id: 'transparent_story', name: 'Overlay Story', ratio: 'aspect-[9/16]', width: 1080, height: 1920, transparent: true },
];

const ShareModal = ({ isOpen, onClose, activity }) => {
    const [activeTemplate, setActiveTemplate] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const exportRef = useRef(null);
    const [previewScale, setPreviewScale] = useState(0.5);
    const containerRef = useRef(null);

    // Update scale to fit screen
    useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const updateScale = () => {
            const container = containerRef.current;
            const tmpl = TEMPLATES[activeTemplate];
            if (!container) return;

            // Calculate available space (with some padding)
            const availableWidth = container.clientWidth - 32; // 32px padding
            const availableHeight = container.clientHeight - 32;

            const scaleW = availableWidth / tmpl.width;
            const scaleH = availableHeight / tmpl.height;

            // Use the smaller scale to ensure it fits entirely
            setPreviewScale(Math.min(scaleW, scaleH, 1)); // Max scale 1
        };

        const timer = setTimeout(updateScale, 100); // Small delay for layout
        window.addEventListener('resize', updateScale);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScale);
        };
    }, [isOpen, activeTemplate]);


    if (!isOpen || !activity) return null;

    const currentTemplate = TEMPLATES[activeTemplate];

    const handleShare = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);

        try {
            // Wait for map/images to load
            await new Promise(resolve => setTimeout(resolve, 800));

            // CRITICAL: scale: 1 because we are rendering the element at FULL 1080px pixel width in DOM
            // We just scaled it down visually with CSS transform.
            // html2canvas should capture the natural dimensions.
            const canvas = await html2canvas(exportRef.current, {
                useCORS: true,
                scale: 1,
                width: currentTemplate.width,
                height: currentTemplate.height,
                backgroundColor: currentTemplate.transparent ? null : '#111827',
                logging: false,
                onclone: (clonedDoc) => {
                    // Ensure the cloned element has no transform so it captures nicely?
                    // Actually html2canvas captures the element state. The element itself has no transform, its PARENT wrapper does.
                    // We are passing exportRef which is the inner text-1080px element.
                    // So it should be fine.
                    const el = clonedDoc.getElementById('share-export-node');
                    if (el) {
                        el.style.transform = 'none';
                    }
                }
            });

            const dataUrl = canvas.toDataURL('image/png');
            const filename = `este-run-${currentTemplate.id}-${activity.id}.png`;

            if (Capacitor.isNativePlatform()) {
                const base64Data = dataUrl.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64Data,
                    directory: Directory.Cache
                });

                await Share.share({
                    files: [savedFile.uri],
                });
            } else {
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error("Export failed:", error);
            alert("Gagal export gambar.");
        } finally {
            setIsExporting(false);
        }
    };

    // --- TEMPLATE RENDERERS ---

    const renderClassic = () => (
        <div id="share-export-node" className="relative bg-navy-950 text-white overflow-hidden"
            style={{ width: currentTemplate.width, height: currentTemplate.height }}>
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                {activity.photoUrl ? (
                    <img src={activity.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                    <MapView routePath={activity.routePath} interactive={false} zoom={15} />
                )}
                {/* Strong Gradients */}
                <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-black/20 z-0" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 flex flex-col justify-between h-full p-16"> {/* Scaled Padding */}
                {/* Header */}
                <div className="flex justify-between items-start">
                    <h1 className="text-6xl font-black italic tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Este.RUN</h1>
                    <div className="text-right">
                        <h2 className="text-4xl font-bold italic drop-shadow-md">{activity.title}</h2>
                        <p className="text-2xl opacity-90 drop-shadow-md mt-2">{new Date(activity.startTime).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="mt-auto">
                    <div className="flex items-baseline mb-8">
                        <span className="text-[180px] leading-none font-black italic tracking-tighter drop-shadow-2xl" style={{ textShadow: '0 8px 16px rgba(0,0,0,0.8)' }}>
                            {(activity.distance || 0).toFixed(2)}
                        </span>
                        <span className="text-6xl font-bold ml-6 italic opacity-90 drop-shadow-lg">KM</span>
                    </div>

                    <div className="grid grid-cols-3 gap-10 border-t border-white/40 pt-10">
                        <div>
                            <p className="text-2xl font-bold uppercase tracking-widest opacity-90 mb-2 drop-shadow-md">Duration</p>
                            <p className="text-5xl font-black italic drop-shadow-lg">{formatTime(activity.duration)}</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold uppercase tracking-widest opacity-90 mb-2 drop-shadow-md">
                                {activity.type === 'walking' ? 'Steps' : 'Pace'}
                            </p>
                            <p className="text-5xl font-black italic drop-shadow-lg">
                                {activity.type === 'walking' ? activity.steps : activity.pace}
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold uppercase tracking-widest opacity-90 mb-2 drop-shadow-md">Cals</p>
                            <p className="text-5xl font-black italic drop-shadow-lg">{((activity.distance || 0) * 60).toFixed(0)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStory = () => (
        <div id="share-export-node" className="relative bg-navy-950 text-white overflow-hidden"
            style={{ width: currentTemplate.width, height: currentTemplate.height }}>
            {/* Full Height Background */}
            <div className="absolute inset-0 z-0">
                {activity.photoUrl ? (
                    <img src={activity.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                    <div className="w-full h-full relative">
                        <MapView routePath={activity.routePath} interactive={false} zoom={15} />
                        <div className="absolute inset-0 bg-navy-900/30 backdrop-blur-[1px]" />
                        <div className="absolute inset-0 flex items-center justify-center p-12">
                            <RouteSvgRenderer routePath={activity.routePath} strokeColor="#fdba74" strokeWidth={12} />
                        </div>
                    </div>
                )}
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full p-20 py-32">
                <div className="text-center">
                    <h1 className="text-8xl font-black italic tracking-tighter mb-8 drop-shadow-2xl">Este.RUN</h1>
                    <div className="inline-block px-8 py-3 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-lg">
                        <p className="font-bold text-3xl drop-shadow-md">{activity.title}</p>
                    </div>
                </div>

                <div className="text-center mb-20">
                    <div className="flex items-baseline justify-center mb-16">
                        <span className="text-[240px] leading-none font-black italic tracking-tighter drop-shadow-2xl" style={{ textShadow: '0 16px 32px rgba(0,0,0,0.6)' }}>
                            {(activity.distance || 0).toFixed(2)}
                        </span>
                        <span className="text-7xl font-bold ml-8 italic opacity-90 drop-shadow-lg">KM</span>
                    </div>
                    <div className="flex justify-center gap-20">
                        <div className="text-center">
                            <p className="text-6xl font-black italic drop-shadow-xl">{formatTime(activity.duration)}</p>
                            <p className="text-xl font-bold uppercase tracking-widest opacity-80 mt-2 drop-shadow-md">Duration</p>
                        </div>
                        <div className="text-center">
                            <p className="text-6xl font-black italic drop-shadow-xl">{activity.type === 'walking' ? activity.steps : activity.pace}</p>
                            <p className="text-xl font-bold uppercase tracking-widest opacity-80 mt-2 drop-shadow-md">{activity.type === 'walking' ? 'Steps' : 'Pace'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderGrid = () => (
        <div id="share-export-node" className="relative bg-white text-navy-900 overflow-hidden flex flex-col"
            style={{ width: currentTemplate.width, height: currentTemplate.height }}>
            <div className="h-3/5 relative bg-gray-100">
                {activity.photoUrl ? (
                    <img src={activity.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                    <MapView routePath={activity.routePath} interactive={false} zoom={15} />
                )}
                <div className="absolute top-10 left-10 bg-navy-950 text-white px-8 py-3 font-black italic text-3xl -skew-x-12 shadow-xl">
                    Este.RUN
                </div>
            </div>
            <div className="h-2/5 p-16 bg-white flex flex-col justify-center">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-5xl font-bold tracking-tight">{activity.title}</h2>
                    <span className="text-2xl font-medium text-gray-500 bg-gray-100 px-6 py-2 rounded-full">{new Date(activity.startTime).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-12 gap-x-16">
                    <div>
                        <p className="text-xl text-gray-400 uppercase font-black tracking-wider">Distance</p>
                        <p className="text-7xl font-black italic text-navy-950 tracking-tight">{(activity.distance || 0).toFixed(2)} <span className="text-3xl font-bold not-italic text-gray-400">km</span></p>
                    </div>
                    <div>
                        <p className="text-xl text-gray-400 uppercase font-black tracking-wider">Time</p>
                        <p className="text-7xl font-black italic text-navy-950 tracking-tight">{formatTime(activity.duration)}</p>
                    </div>
                    <div>
                        <p className="text-xl text-gray-400 uppercase font-black tracking-wider">Avg Pace</p>
                        <p className="text-7xl font-black italic text-navy-950 tracking-tight">{activity.pace}</p>
                    </div>
                    <div>
                        <p className="text-xl text-gray-400 uppercase font-black tracking-wider">Calories</p>
                        <p className="text-7xl font-black italic text-navy-950 tracking-tight">{((activity.distance || 0) * 60).toFixed(0)}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTransparent = () => (
        <div id="share-export-node" className="relative bg-transparent flex flex-col justify-between p-16"
            style={{ width: currentTemplate.width, height: currentTemplate.height }}>
            {/* Route & Brand Centered */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <h1 className="text-[250px] font-black italic text-white rotate-[-30deg] tracking-tighter drop-shadow-2xl">Este.RUN</h1>
            </div>

            <div className="relative z-10 w-full">
                <img src="/ESTE_LOGO.png" className="h-24 w-auto mb-6 drop-shadow-lg" />
                <h2 className="text-7xl font-black italic text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] tracking-tight leading-tight w-3/4">{activity.title}</h2>
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline">
                    <span className="text-[240px] leading-none font-black italic text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] tracking-tighter">{(activity.distance || 0).toFixed(2)}</span>
                    <span className="text-7xl font-bold text-white ml-8 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] italic">KM</span>
                </div>
                <div className="flex gap-20 mt-10 border-t-4 border-white/40 pt-10 w-max">
                    <div className="text-white">
                        <p className="text-2xl font-bold opacity-100 uppercase drop-shadow-md tracking-widest mb-2">Time</p>
                        <p className="text-6xl font-black italic drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">{formatTime(activity.duration)}</p>
                    </div>
                    <div className="text-white">
                        <p className="text-2xl font-bold opacity-100 uppercase drop-shadow-md tracking-widest mb-2">Pace</p>
                        <p className="text-6xl font-black italic drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">{activity.pace}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
                    {/* Header */}
                    <div className="px-4 py-2 flex justify-between items-center text-white">
                        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                            <X size={20} />
                        </button>
                        <span className="font-bold text-sm uppercase tracking-wider">Share Activity</span>
                        <div className='w-10' />
                    </div>

                    {/* PREVIEW AREA (Scaled) */}
                    <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-gray-900/50" ref={containerRef}>
                        <div
                            style={{
                                width: currentTemplate.width,
                                height: currentTemplate.height,
                                transform: `scale(${previewScale})`,
                                transformOrigin: 'center center',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                            ref={exportRef}
                        >
                            {/* Render Active Template */}
                            {activeTemplate === 0 && renderClassic()}
                            {activeTemplate === 1 && renderStory()}
                            {activeTemplate === 2 && renderGrid()}
                            {(activeTemplate === 3 || activeTemplate === 4) && renderTransparent()}
                        </div>
                    </div>

                    {/* CAROUSEL SELECTOR */}
                    <div className="px-4 py-4 bg-black/40 backdrop-blur-sm">
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x justify-center">
                            {TEMPLATES.map((tmpl, idx) => (
                                <button
                                    key={tmpl.id}
                                    onClick={() => setActiveTemplate(idx)}
                                    className={`snap-center flex-shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                                        ${activeTemplate === idx
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'bg-white/10 border-white/10 text-gray-400 hover:bg-white/20'}`}
                                >
                                    {tmpl.name}
                                </button>
                            ))}
                        </div>

                        {/* ACTION BUTTON */}
                        <button
                            onClick={handleShare}
                            disabled={isExporting}
                            className="w-full mt-3 bg-white text-navy-950 font-black italic py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl"
                        >
                            {isExporting ? (
                                <>Loading...</>
                            ) : (
                                <>
                                    <Share2 size={20} />
                                    SHARE NOW
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
