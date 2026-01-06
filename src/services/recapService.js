
import { supabase } from '../lib/supabaseClient';
import { startOfWeek, endOfWeek, getHours, parseISO } from 'date-fns';

// Helper to calculate stats from an array of activities (Synchronous)
export const calculateStats = (activities) => {
    if (!activities || activities.length === 0) {
        return {
            totalDistance: 0,
            totalDuration: 0,
            totalCalories: 0,
            bestPace: 0,
            activityCount: 0,
            persona: "Ready to Start",
            personaEmoji: "👟",
            personaColor: "from-navy-700 to-navy-900" // Este.RUN Navy Default
        };
    }

    // 1. Calculate Aggregates
    const totalDistance = activities.reduce((acc, curr) => acc + (curr.distance || 0), 0);
    const totalDuration = activities.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const totalCalories = activities.reduce((acc, curr) => acc + (curr.calories || 0), 0);

    // Best Pace (Find minimum pace value that is not 0)
    let validPaces = activities.map(a => a.pace).filter(p => p > 0);
    const bestPace = validPaces.length > 0 ? Math.min(...validPaces) : 0;

    // 2. Determine "Runner Persona"
    let morningRuns = 0;
    let nightRuns = 0;
    let weekendRuns = 0;

    activities.forEach(activity => {
        // Handle both ISO strings and Date objects
        const dateStr = activity.startTime || activity.created_at;
        if (!dateStr) return;

        const date = new Date(dateStr);
        const hour = getHours(date);
        const day = date.getDay(); // 0 = Sunday, 6 = Saturday

        if (hour >= 5 && hour < 10) morningRuns++;
        if (hour >= 18 || hour < 4) nightRuns++;
        if (day === 0 || day === 6) weekendRuns++;
    });

    let persona = "Runner"; // Default
    let personaEmoji = "🏃";
    let personaColor = "from-blue-500 to-cyan-400";

    if (morningRuns > 0 && morningRuns >= activities.length * 0.5) {
        persona = "Early Bird";
        personaEmoji = "🌅";
        personaColor = "from-orange-400 to-yellow-400";
    } else if (nightRuns > 0 && nightRuns >= activities.length * 0.5) {
        persona = "Night Owl";
        personaEmoji = "🦉";
        personaColor = "from-indigo-500 to-purple-500";
    } else if (weekendRuns > 0 && weekendRuns >= activities.length * 0.5) {
        persona = "Weekend Warrior";
        personaEmoji = "🔥";
        personaColor = "from-red-500 to-pink-500";
    }

    return {
        totalDistance: totalDistance / 1000, // Convert to km
        totalDuration,
        totalCalories,
        bestPace,
        activityCount: activities.length,
        persona,
        personaEmoji,
        personaColor
    };
};

export const getWeeklyStats = async (userId) => {
    if (!userId) return null;

    const now = new Date();
    const startDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
    const endDate = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

    try {
        const { data: activities, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        if (error) throw error;
        return calculateStats(activities);

    } catch (error) {
        console.error("Error fetching weekly stats:", error);
        return null;
    }
};
