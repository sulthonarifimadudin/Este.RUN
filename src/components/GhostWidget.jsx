import { Ghost } from 'lucide-react';

const GhostWidget = ({ diff, targetPace }) => {
    // diff = userDistance - ghostDistance (in km)
    const diffMeters = diff * 1000;
    const isAhead = diffMeters >= 0;
    const absDiff = Math.abs(diffMeters).toFixed(0);

    let statusColor = isAhead ? 'text-emerald-400' : 'text-rose-400';
    let bgColor = isAhead ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';
    let message = isAhead ? `Ahead by ${absDiff}m` : `Behind by ${absDiff}m`;

    if (Math.abs(diffMeters) < 5) {
        statusColor = 'text-blue-400';
        bgColor = 'bg-blue-500/10 border-blue-500/20';
        message = 'On Track';
    }

    return (
        <div className={`absolute top-[16%] w-auto left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md border ${bgColor} animate-in fade-in slide-in-from-top-4`}>
            <div className={`p-1.5 rounded-full ${isAhead ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                <Ghost size={16} className={statusColor} />
            </div>
            <div className="flex flex-col">
                <span className={`text-sm font-bold ${statusColor} leading-none`}>
                    {message}
                </span>
                <span className="text-[10px] text-white/60 font-medium mt-0.5">
                    Target: {targetPace} /km
                </span>
            </div>
        </div>
    );
};

export default GhostWidget;
