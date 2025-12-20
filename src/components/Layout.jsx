import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, User, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

const Layout = ({ children }) => {
    const location = useLocation();

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
            <header className="bg-navy-950 text-white p-4 shadow-md z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold italic tracking-tighter">Este.RUN</h1>
                <div className="w-8 h-8 rounded-full bg-navy-800 border-2 border-navy-600 flex items-center justify-center text-xs font-bold">
                    Est
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar bg-gray-50 dark:bg-navy-950 transition-colors">
                {children}
            </main>

            <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-navy-900 border-t border-gray-100 dark:border-navy-800 flex justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none z-20 pb-safe transition-colors">
                <NavItem to="/" icon={Home} label="Home" />
                <NavItem to="/stats" icon={BarChart2} label="Recap" />
                <NavItem to="/start" icon={PlusCircle} label="Rekam" />
                <NavItem to="/profile" icon={User} label="Profil" />
            </nav>
        </div>
    );
};

export default Layout;
