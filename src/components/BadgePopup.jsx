import { useEffect } from 'react';
import { X, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const BadgePopup = ({ badge, onClose }) => {
    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FFD700', '#FFA500', '#FF4500']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FFD700', '#FFA500', '#FF4500']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    if (!badge) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-6" onClick={onClose}>
            <div className="bg-navy-900 border border-navy-700 w-full max-w-sm rounded-[2rem] p-8 text-center relative shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Glow Effect */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b ${badge.color} opacity-20 blur-3xl rounded-full pointer-events-none`}></div>

                <div className="relative z-10">
                    <h2 className="text-white font-bold text-xl mb-1 uppercase tracking-widest text-opacity-80">Achievement Unlocked!</h2>

                    <div className="my-8 relative inline-block">
                        <div className={`text-8xl filter drop-shadow-[0_0_30px_rgba(255,215,0,0.3)] animate-bounce`}>
                            {badge.icon}
                        </div>
                    </div>

                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                        {badge.name}
                    </h3>
                    <p className="text-navy-200 text-sm font-medium leading-relaxed mb-8">
                        {badge.description}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-500 hover:to-navy-700 text-white font-bold rounded-xl shadow-lg shadow-navy-900/50 transition-all active:scale-95 border border-navy-600"
                    >
                        Mantap! 🚀
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BadgePopup;
