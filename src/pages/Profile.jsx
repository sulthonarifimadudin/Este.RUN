import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import { LogOut, Moon, Sun, UserCog, Loader2, Globe } from 'lucide-react'; // Add Globe identifier
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/profileService';
import { getSocialStats } from '../services/socialService';
import { useEffect, useState } from 'react';
import { Users, List, Activity } from 'lucide-react';
import ActivityCard from '../components/ActivityCard'; // Import ActivityCard
import { getActivitiesByUserId } from '../services/activityStorage'; // Import fetcher
import { BADGES, getUserBadges } from '../services/badgeService';
import { Award } from 'lucide-react';

const Profile = () => {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [myActivities, setMyActivities] = useState([]); // State for activities
    const [userBadges, setUserBadges] = useState([]); // State for badges
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'activities' | 'badges'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const data = await getProfile(user.id);
                setProfile(data);

                const socialStats = await getSocialStats(user.id);
                setStats(socialStats);

                // Fetch My Activities
                const activities = await getActivitiesByUserId(user.id);
                setMyActivities(activities);

                // Fetch Badges
                const earnedBadges = await getUserBadges(user.id);
                setUserBadges(earnedBadges);
            }
            setLoading(false);
        }
        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    if (loading) return <Layout><div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div></Layout>;

    return (
        <Layout>
            <div className="bg-navy-950 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-navy-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <UserCog size={100} />
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-20 h-20 bg-navy-800 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-navy-500 overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.email?.[0].toUpperCase() || 'U'
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{profile?.full_name || 'Halo, Runners!'}</h2>
                        <p className="text-navy-200 text-sm">@{profile?.username || user?.email?.split('@')[0]}</p>
                        {profile?.bio && <p className="text-navy-300 text-xs mt-1 italic line-clamp-2">"{profile.bio}"</p>}
                    </div>
                </div>

                {/* Social Stats */}
                <div className="flex gap-6 mt-6 relative z-10 border-t border-navy-800 pt-4">
                    <div className="text-center">
                        <p className="text-xl font-bold">{stats.following}</p>
                        <p className="text-xs text-navy-300 uppercase tracking-wider">{t('following')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold">{stats.followers}</p>
                        <p className="text-xs text-navy-300 uppercase tracking-wider">{t('followers')}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-navy-900 p-1 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                    ${activeTab === 'menu' ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <List size={16} /> {t('my_profile')}
                </button>
                <button
                    onClick={() => setActiveTab('activities')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                    ${activeTab === 'activities' ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <Activity size={16} /> {t('my_activities')}
                </button>
                <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                    ${activeTab === 'badges' ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <Award size={16} /> Badges
                </button>
            </div>

            {/* Content: Activities */}
            {activeTab === 'activities' && (
                <div className="mb-6 animate-slide-up">
                    <div className="space-y-4">
                        {myActivities.length > 0 ? (
                            myActivities.map(activity => (
                                <ActivityCard key={activity.id} activity={activity} />
                            ))
                        ) : (
                            <div className="text-center py-8 bg-white dark:bg-navy-900 rounded-xl border border-dashed border-gray-300 dark:border-navy-700">
                                <p className="text-gray-400 text-sm">{t('no_activities')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content: Badges */}
            {activeTab === 'badges' && (
                <div className="mb-6 animate-slide-up">
                    <div className="grid grid-cols-2 gap-4">
                        {BADGES.map((badge) => {
                            const isUnlocked = userBadges.some(ub => ub.badge_id === badge.id);
                            return (
                                <div
                                    key={badge.id}
                                    className={`relative p-4 rounded-2xl border transition-all ${isUnlocked
                                        ? 'bg-white dark:bg-navy-800 border-navy-100 dark:border-navy-700 shadow-sm'
                                        : 'bg-gray-100 dark:bg-navy-900 border-transparent opacity-60 grayscale'
                                        }`}
                                >
                                    <div className="text-3xl mb-3">{badge.icon}</div>
                                    <h3 className="font-bold text-navy-900 dark:text-white text-sm">{badge.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{badge.description}</p>

                                    {isUnlocked && (
                                        <div className="absolute top-3 right-3 text-yellow-500">
                                            <Award size={16} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Content: Menu */}
            {activeTab === 'menu' && (
                <div className="bg-white dark:bg-navy-900 rounded-xl shadow-sm border border-gray-100 dark:border-navy-800 divide-y divide-gray-100 dark:divide-navy-800 animate-slide-up">
                    <button
                        onClick={() => navigate('/profile/edit')}
                        className="w-full flex items-center gap-3 p-4 text-navy-900 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors text-left"
                    >
                        <UserCog size={20} className="text-navy-600 dark:text-navy-300" />
                        <div>
                            <span className="font-bold block text-sm">{t('edit_profile')}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{t('edit_profile_desc')}</span>
                        </div>
                        <div className="ml-auto text-gray-400">
                            &rarr;
                        </div>
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-between p-4 text-navy-900 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Globe size={20} />
                            <span className="font-medium">{t('language')}</span>
                        </div>
                        <div className="w-20 pl-4 py-1.5 flex justify-end text-sm font-bold text-navy-500">
                            {language === 'id' ? 'ID 🇮🇩' : 'EN 🇬🇧'}
                        </div>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-4 text-navy-900 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            <span className="font-medium">{theme === 'dark' ? t('dark_mode') : t('light_mode')}</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-navy-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} />
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">{t('logout')}</span>
                    </button>
                </div>
            )}

            <p className="text-center text-gray-400 text-xs mt-8">Este.RUN v1.1.0</p>
        </Layout >
    );
};

export default Profile;
