import { useState, useEffect } from 'react';
import { getWeather, getWeatherIcon } from '../services/weatherService';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudSun, Loader2 } from 'lucide-react';

const WeatherWidget = ({ latitude, longitude }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!latitude || !longitude) return;

        const fetchData = async () => {
            const data = await getWeather(latitude, longitude);
            setWeather(data);
            setLoading(false);
        };

        fetchData();

        // Refresh every 15 minutes
        const interval = setInterval(fetchData, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, [latitude, longitude]);

    if (!latitude || !longitude) return null;

    if (loading) {
        return (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm animate-pulse">
                <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                <div className="w-8 h-3 bg-white/20 rounded-full"></div>
            </div>
        );
    }

    if (!weather) return null; // Error or no data

    const iconType = getWeatherIcon(weather.code);

    const IconComponent = () => {
        switch (iconType) {
            case 'sun': return <Sun size={16} className="text-yellow-400 fill-current" />;
            case 'cloud-sun': return <CloudSun size={16} className="text-orange-300" />;
            case 'rain': return <CloudRain size={16} className="text-blue-300" />;
            case 'lightning': return <CloudLightning size={16} className="text-purple-300" />;
            case 'snow': return <Snowflake size={16} className="text-cyan-200" />;
            default: return <Cloud size={16} className="text-gray-300" />;
        }
    };

    return (
        <div className="flex items-center gap-2 bg-navy-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm transition-all hover:bg-navy-950/60 animate-in fade-in zoom-in-95 duration-500">
            <IconComponent />
            <span className="text-xs font-bold text-white tracking-wide">{weather.temp}°C</span>
        </div>
    );
};

export default WeatherWidget;
