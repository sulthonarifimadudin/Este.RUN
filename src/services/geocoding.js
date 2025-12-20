/**
 * Search places using OpenStreetMap Nominatim API (Free, No Key)
 * @param {string} query - The search query (e.g. "Alun-alun Bandung")
 * @returns {Promise<Array>} - List of places
 */
export const searchPlaces = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        // Limited to Indonesia (countrycodes=id) to make it more relevant, remove if global needed
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'EsteRun/1.0' // Nominatim requires a User-Agent
            }
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        return data.map(place => ({
            display_name: place.display_name.split(',')[0], // Take only the first part (e.g. "Alun-alun Bandung")
            full_name: place.display_name,
            lat: place.lat,
            lon: place.lon
        }));

    } catch (error) {
        console.error("Geocoding error:", error);
        return [];
    }
};
