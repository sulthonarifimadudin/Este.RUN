import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/paceCalculator';
import MapView from './MapView';

const ActivityCard = ({ activity }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/activity/${activity.id}`)}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
        >
            {/* Header: User & Date */}
            <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm">
                        E
                    </div>
                    <div>
                        <h4 className="font-bold text-navy-900 leading-tight">{activity.title || 'Lari Santuy'}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <span>{new Date(activity.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            {activity.location && (
                                <>
                                    <span>•</span>
                                    <span>{activity.location.split(',')[0]}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-50 text-gray-500 capitalize">
                    {activity.type}
                </div>
            </div>

            {/* Visual: Map or Photo */}
            <div className="w-full aspect-[4/3] bg-gray-50 relative overflow-hidden">
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
            <div className="px-5 py-4 grid grid-cols-3 divide-x divide-gray-100">
                <div className="pr-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Jarak</p>
                    <p className="text-xl font-black text-navy-900">{activity.distance.toFixed(2)} <span className="text-xs font-normal text-gray-500">km</span></p>
                </div>
                <div className="px-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Waktu</p>
                    <p className="text-xl font-black text-navy-900">{formatTime(activity.duration)}</p>
                </div>
                <div className="pl-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Pace</p>
                    <p className="text-xl font-black text-navy-900">{activity.pace}</p>
                </div>
            </div>
        </div>
    );
};

export default ActivityCard;
