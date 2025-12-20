import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <Layout>
            <div className="bg-navy-950 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-navy-900/20">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-navy-500">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Halo, Runners!</h2>
                        <p className="text-navy-200 text-sm">{user?.email}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-xl shadow-sm border border-gray-100 dark:border-navy-800 divide-y divide-gray-100 dark:divide-navy-800">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-4 text-navy-900 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        <span className="font-medium">Mode {theme === 'dark' ? 'Gelap' : 'Terang'}</span>
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
                    <span className="font-medium">Keluar Akun</span>
                </button>
            </div>

            <p className="text-center text-gray-400 text-xs mt-8">Este.RUN v1.0.0</p>
        </Layout>
    );
};

export default Profile;
