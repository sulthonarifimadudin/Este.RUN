import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, User, BarChart2, Plus, Users, Bell, AlarmClock } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../services/profileService';
import { useLanguage } from '../contexts/LanguageContext'; // Import translation hook
import { useEffect, useState } from 'react';
import ReminderSheet from './ReminderSheet';
import CoachChat from './CoachChat';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [showReminder, setShowReminder] = useState(false);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (user) {
                const profile = await getProfile(user.id);
                if (profile?.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                }
            }
        }
        fetchAvatar();
    }, [user]);

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={clsx(
                    "flex flex-col items-center justify-center w-full py-3 text-xs font-medium transition-colors",
                    isActive ? "text-navy-900 dark:text-white" : "text-gray-400 dark:text-gray-500 hover:text-navy-700 dark:hover:text-gray-300"
                )}
            >
                <Icon size={24} className="mb-1" />
                {label}
            </Link>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-navy-950 max-w-md mx-auto shadow-2xl overflow-hidden border-x border-gray-200 dark:border-navy-900">
            <header className="bg-navy-950 text-white pt-[max(1rem,env(safe-area-inset-top))] pb-4 px-4 z-50 flex justify-between items-center relative">
                <img src="/ESTE_LOGO.png" alt="Este.RUN" className="h-8 w-auto object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowReminder(true)}
                        className="w-8 h-8 rounded-full bg-navy-800 border-2 border-navy-600 flex items-center justify-center text-white active:scale-95 transition-transform"
                    >
                        <AlarmClock size={16} />
                    </button>

                    <Link to="/profile" className="w-8 h-8 rounded-full bg-navy-800 border-2 border-navy-600 flex items-center justify-center text-xs font-bold overflow-hidden transition-transform active:scale-95">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            user?.email?.[0].toUpperCase() || 'U'
                        )}
                    </Link>
                </div>
            </header>

            <ReminderSheet isOpen={showReminder} onClose={() => setShowReminder(false)} />

            <main className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar bg-gray-50 dark:bg-navy-950 transition-colors relative">
                {children}
            </main>

            <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-navy-900 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none z-20 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 transition-colors">
                <NavItem to="/" icon={Home} label={t('home')} />
                <NavItem to="/social" icon={Users} label={t('social')} />

                {/* Prominent Rekam Button */}
                <div className="relative -top-6">
                    <Link to="/start" className="w-16 h-16 rounded-full bg-navy-600 hover:bg-navy-700 text-white flex flex-col items-center justify-center shadow-lg shadow-navy-600/40 border-4 border-gray-50 dark:border-navy-950 transition-all active:scale-95">
                        <Plus size={32} />
                        <span className="text-[9px] font-bold mt-0.5">{t('record')}</span>
                    </Link>
                </div>

                <NavItem to="/stats" icon={BarChart2} label={t('recap')} />
                <NavItem to="/profile" icon={User} label={t('profile')} />
            </nav>

            <CoachChat />

        </div>
    );
};

export default Layout;
