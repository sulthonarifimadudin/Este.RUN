
export const getWeather = async (lat, lon) => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch weather');
        }

        const data = await response.json();
        return {
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code
        };
    } catch (error) {
        console.error("Weather fetch error:", error);
        return null; // Return null on error so the widget handles it gracefully
    }
};

// WMO Weather interpretation codes (http://www.wmo.int/pages/prog/www/IMOP/publications/CIMO-Guide/Agro-Guide/WMO49-AGNO/WMO49-AGNO.html)
export const getWeatherIcon = (code) => {
    // 0: Clear sky
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    // 45, 48: Fog
    // 51, 53, 55: Drizzle
    // 61, 63, 65: Rain
    // 80, 81, 82: Rain showers
    // 95, 96, 99: Thunderstorm

    if (code === 0) return 'sun';
    if (code >= 1 && code <= 3) return 'cloud-sun';
    if (code >= 45 && code <= 48) return 'cloud';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if (code >= 71 && code <= 77) return 'snow'; // Rare but possible
    if (code >= 95) return 'lightning';

    return 'cloud'; // Default
};
