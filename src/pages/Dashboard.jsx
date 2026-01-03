import { startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { ChevronDown, TrendingUp, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ActivityCard from '../components/ActivityCard';
import { getActivities } from '../services/activityStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateStats } from '../services/recapService';
import WeeklyRecapCard from '../components/WeeklyRecapCard';

const Dashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get authenticated user
    const [activities, setActivities] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState(null); // State for Recap
    const [stats, setStats] = useState(null); // Unified stats object
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week'); // week, month, year, all
    const [showRangeMenu, setShowRangeMenu] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const stored = await getActivities();
            setActivities(stored || []);

            // Fetch Weekly Recap Stats
            if (user) {
                const stats = await getWeeklyStats(user.id);
                setWeeklyStats(stats);
            }

            setLoading(false);
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!activities.length) {
            setStats(null);
            return;
        }

        const now = new Date();
        let startPeriod;
        let titleLabel = "All Time Wrap";

        switch (timeRange) {
            case 'week':
                startPeriod = startOfWeek(now, { weekStartsOn: 1 });
                titleLabel = "Weekly Wrap";
                break;
            case 'month':
                startPeriod = startOfMonth(now);
                titleLabel = "Monthly Wrap";
                break;
            case 'year':
                startPeriod = startOfYear(now);
                titleLabel = "Yearly Wrap";
                break;
            default:
                startPeriod = null;
        }

        const filtered = activities.filter(act => {
            if (!startPeriod) return true;
            return isAfter(new Date(act.startTime), startPeriod);
        });

        // Use helper to calculate everything
        const calculated = calculateStats(filtered);
        setStats({ ...calculated, title: titleLabel });

    }, [activities, timeRange]);

    const getRangeLabel = () => {
        switch (timeRange) {
            case 'week': return t('this_week') || 'Minggu Ini';
            case 'month': return t('this_month') || 'Bulan Ini';
            case 'year': return t('this_year') || 'Tahun Ini';
            default: return t('all_time') || 'Semua Waktu';
        }
    };

    return (
        <Layout>
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-40 -mx-4 -mt-6 px-4 pt-2 pb-4 mb-4 transition-all">
                <div className="relative inline-block z-50 mb-4">
                    <button
                        onClick={() => setShowRangeMenu(!showRangeMenu)}
                        className="bg-navy-950/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 text-white active:scale-95 transition-transform"
                    >
                        <span className="text-lg font-bold leading-none">{getRangeLabel()}</span>
                        <ChevronDown size={16} className={`transition-transformDuration-200 ${showRangeMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showRangeMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowRangeMenu(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-navy-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 border border-gray-100 dark:border-navy-700">
                                {['week', 'month', 'year', 'all'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => {
                                            setTimeRange(range);
                                            setShowRangeMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 dark:border-navy-700 last:border-0
                                            ${timeRange === range
                                                ? 'bg-navy-50 dark:bg-navy-700 text-navy-900 dark:text-white'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'
                                            }`}
                                    >
                                        {range === 'week' ? (t('this_week') || 'Minggu Ini') :
                                            range === 'month' ? (t('this_month') || 'Bulan Ini') :
                                                range === 'year' ? (t('this_year') || 'Tahun Ini') :
                                                    (t('all_time') || 'Semua Waktu')}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* NEW: Compact Stats Banner (Replaces Total Distance) */}
                {stats ? (
                    <WeeklyRecapCard stats={stats} title={stats.title} />
                ) : (
                    /* Empty State or Zero Banner */
                    <div className="bg-navy-800 rounded-2xl p-6 text-white text-center opacity-80">
                        <p>No activity in this period</p>
                    </div>
                )}
            </div>


            <div className="mb-4 flex justify-between items-end">
                <h3 className="font-bold text-navy-900 dark:text-white text-lg">{t('last_activity')}</h3>
                <span className="text-xs text-navy-600 dark:text-navy-400 font-medium cursor-pointer hover:underline">{t('view_all')}</span>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-navy-600" size={32} />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-navy-900 rounded-xl border border-dashed border-gray-300 dark:border-navy-700">
                        <p className="text-gray-400">{t('no_activities')}</p>
                    </div>
                ) : (
                    activities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))
                )}
            </div>
        </Layout >
    );
};

export default Dashboard;
