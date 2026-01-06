
import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Clock, Flame, Zap } from 'lucide-react';

const WeeklyRecapCard = ({ stats, title = "Weekly Wrap" }) => {
    if (!stats) return null;

    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0m";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatPace = (pace) => {
        if (!pace || isNaN(pace) || !isFinite(pace)) return "-'--\"";
        const m = Math.floor(pace);
        const s = Math.round((pace - m) * 60);
        return `${m}'${s < 10 ? '0' : ''}${s}"`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-xl bg-gradient-to-br ${stats.personaColor} mb-6`}
        >
            {/* Background Pattern (Subtler) */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>

            <div className="relative z-10 flex flex-col gap-4">
                {/* Top Row: Title & Persona */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider">{title}</p>
                        <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
                            Your Activity {stats.personaEmoji}
                        </h2>
                    </div>
                    {/* Persona Badge */}
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold">
                        {stats.persona}
                    </div>
                </div>

                {/* Middle Row: Main Stat (Distance) */}
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">
                        {(stats.totalDistance || 0).toFixed(1)}
                    </span>
                    <span className="text-base font-medium opacity-90">km</span>
                </div>

                {/* Bottom Row: Grid Stats (Compact) */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 opacity-80 mb-0.5">
                            <Clock size={12} />
                            <span className="text-[10px] uppercase">Time</span>
                        </div>
                        <p className="font-bold text-sm">{formatDuration(stats.totalDuration)}</p>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-3">
                        <div className="flex items-center gap-1 opacity-80 mb-0.5">
                            <Flame size={12} />
                            <span className="text-[10px] uppercase">Cals</span>
                        </div>
                        <p className="font-bold text-sm">{Math.round(stats.totalCalories || 0)}</p>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-3">
                        <div className="flex items-center gap-1 opacity-80 mb-0.5">
                            <Zap size={12} />
                            <span className="text-[10px] uppercase">Pace</span>
                        </div>
                        <p className="font-bold text-sm">{formatPace(stats.bestPace)}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default WeeklyRecapCard;
