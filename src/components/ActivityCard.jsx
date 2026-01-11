import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/paceCalculator';
import MapView from './MapView';
import { Heart, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toggleLike, getLikeStatus } from '../services/socialService';
import CommentSheet from './CommentSheet';

const ActivityCard = ({ activity, userProfile }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        const fetchLikes = async () => {
            const status = await getLikeStatus(activity.id, user?.id);
            setLikes(status.count);
            setIsLiked(status.isLiked);
        };
        fetchLikes();
    }, [activity.id, user?.id]);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) return;

        // Optimistic
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);

        const result = await toggleLike(activity.id, user.id);
        if (result === null) {
            // Revert on error
            setIsLiked(isLiked);
            setLikes(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleCommentClick = (e) => {
        e.stopPropagation();
        setShowComments(true);
    };

    // Determine user to display (Priority: activity.user > userProfile > default)
    const displayUser = activity.user || userProfile || {
        username: 'Runner',
        avatar_url: null,
        full_name: 'Este Runner'
    };

    return (
        <div
            onClick={() => navigate(`/activity/${activity.id}`)}
            className="bg-white dark:bg-navy-900 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-800 overflow-hidden mb-6 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group relative z-0"
        >
            {/* Header: User & Date */}
            <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    {displayUser.avatar_url ? (
                        <img
                            src={displayUser.avatar_url}
                            alt={displayUser.username}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-navy-700"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center text-navy-700 dark:text-navy-200 font-bold text-sm">
                            {displayUser.username?.[0]?.toUpperCase() || 'R'}
                        </div>
                    )}

                    {/* USERNAME & DETAILS */}
                    <div>
                        <h4 className="font-bold text-navy-900 dark:text-white leading-tight">
                            {displayUser.username || 'Runner'}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            {/* Activity Title */}
                            <span className="font-medium text-navy-600 dark:text-navy-300">
                                {activity.title || 'Lari Santuy'}
                            </span>

                            <span>•</span>

                            {/* Date */}
                            <span>{new Date(activity.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>

                            {activity.location && (
                                <>
                                    <span>•</span>
                                    {/* Truncate location if too long */}
                                    <span className="max-w-[100px] truncate">{activity.location.split(',')[0]}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-50 dark:bg-navy-800 text-gray-500 dark:text-gray-400 capitalize">
                    {activity.type}
                </div>
            </div>

            {/* Visual: Map or Photo */}
            <div className="w-full aspect-[4/3] bg-gray-50 dark:bg-navy-950 relative overflow-hidden">
                {activity.photoUrl ? (
                    <img src={activity.photoUrl} alt="Activity" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full relative opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <MapView
                            routePath={activity.routePath}
                            interactive={false}
                            zoom={13}
                            centerOnLoad={true}
                        />
                    </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-sm font-bold">Lihat Detail</span>
                </div>
            </div>

            {/* Stats Footer */}
            <div className="px-5 py-4 grid grid-cols-3 divide-x divide-gray-100 dark:divide-navy-800">
                <div className="pr-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Jarak</p>
                    <p className="text-xl font-black text-navy-900 dark:text-white">{(activity.distance || 0).toFixed(2)} <span className="text-xs font-normal text-gray-500">km</span></p>
                </div>
                <div className="px-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Waktu</p>
                    <p className="text-xl font-black text-navy-900 dark:text-white">{formatTime(activity.duration)}</p>
                </div>
                <div className="pl-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                        {activity.type === 'walking' ? 'Langkah' : 'Pace'}
                    </p>
                    <p className="text-xl font-black text-navy-900 dark:text-white">
                        {activity.type === 'walking' ? activity.steps : activity.pace}
                    </p>
                </div>
            </div>

            {/* Interaction Bar */}
            <div className="px-5 pb-4 pt-0 flex items-center gap-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-navy-600'}`}
                >
                    <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                    <span>{likes > 0 ? likes : ''}</span>
                </button>
                <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-navy-600 transition-colors"
                >
                    <MessageCircle size={20} />
                    <span>Komentar</span>
                </button>
            </div>

            {showComments && <CommentSheet activityId={activity.id} onClose={(e) => { e?.stopPropagation(); setShowComments(false); }} />}
        </div>
    );
};

export default ActivityCard;
