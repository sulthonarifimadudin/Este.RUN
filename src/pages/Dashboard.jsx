import Layout from '../components/Layout';
import ActivityCard from '../components/ActivityCard';
import { getActivities } from '../services/activityStorage';
import { useEffect, useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';

const Dashboard = () => {
    const [activities, setActivities] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const stored = await getActivities();
            setActivities(stored || []);

            if (stored) {
                const total = stored.reduce((acc, curr) => acc + (curr.distance || 0), 0);
                setTotalDistance(total);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <Layout>
            {/* Sticky Header Section */}
            {/* Sticky Header Section */}
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-[5000] bg-gray-50 dark:bg-navy-950 -mx-4 -mt-4 px-4 pt-[max(0px,env(safe-area-inset-top))] pb-2 mb-2 transition-all">
                <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2 pt-4">Minggu Ini</h2>
                <div className="bg-gradient-to-br from-navy-800 to-navy-950 rounded-2xl p-6 text-white shadow-lg shadow-navy-900/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-navy-100 font-medium text-sm">Total Jarak</p>
                            <h3 className="text-4xl font-bold tracking-tight">{totalDistance.toFixed(1)} <span className="text-lg font-normal text-navy-200">km</span></h3>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-end">
                <h3 className="font-bold text-navy-900 dark:text-white text-lg">Aktivitas Terakhir</h3>
                <span className="text-xs text-navy-600 dark:text-navy-400 font-medium cursor-pointer hover:underline">Lihat Semua</span>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-navy-600" size={32} />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-navy-900 rounded-xl border border-dashed border-gray-300 dark:border-navy-700">
                        <p className="text-gray-400">Belum ada aktivitas.</p>
                        <p className="text-sm text-gray-400 mt-1">Ayo mulai bergerak!</p>
                    </div>
                ) : (
                    activities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
