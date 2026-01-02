import { supabase } from '../lib/supabaseClient';

export const BADGES = [
    {
        id: 'first_step',
        name: 'First Step',
        description: 'Menyelesaikan aktivitas pertama Anda.',
        icon: '🥇', // Simple emoji for now, can be replaced with images later
        color: 'from-yellow-400 to-orange-500',
        condition: (activity, userStats) => true // Always true if they finish one
    },
    {
        id: '5k_finisher',
        name: '5K Finisher',
        description: 'Lari sejauh minimal 5 kilometer.',
        icon: '🏃',
        color: 'from-blue-400 to-indigo-500',
        condition: (activity) => activity.distance >= 5
    },
    {
        id: '10k_finisher',
        name: '10K Finisher',
        description: 'Lari sejauh minimal 10 kilometer.',
        icon: '🔥',
        color: 'from-red-400 to-rose-500',
        condition: (activity) => activity.distance >= 10
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Menyelesaikan lari sebelum jam 7 pagi.',
        icon: '🌅',
        color: 'from-sky-300 to-blue-400',
        condition: (activity) => {
            const hour = new Date(activity.startTime).getHours();
            return hour < 7 && hour >= 4; // Between 4 AM and 7 AM
        }
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Lari di malam hari (setelah jam 8 malam).',
        icon: '🦉',
        color: 'from-indigo-900 to-purple-900',
        condition: (activity) => {
            const hour = new Date(activity.startTime).getHours();
            return hour >= 20;
        }
    },
    {
        id: 'speedster',
        name: 'Speedster',
        description: 'Pace rata-rata di bawah 5:00 min/km (min 1km).',
        icon: '⚡',
        color: 'from-yellow-300 to-yellow-500',
        condition: (activity) => {
            // pace format is "MM:SS" string. Need to parse.
            if (activity.distance < 1) return false;
            const [min, sec] = activity.pace.split(':').map(Number);
            return min < 5;
        }
    }
];

export const getUserBadges = async (userId) => {
    const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching badges:', error);
        return [];
    }
    return data;
};

export const checkActivityBadges = async (activity, userId) => {
    if (!userId || !activity) return [];

    // 1. Get existing badges
    const existingBadges = await getUserBadges(userId);
    const existingIds = new Set(existingBadges.map(b => b.badge_id));

    // 2. Check conditions
    const newUnlockedBadges = [];

    for (const badge of BADGES) {
        if (existingIds.has(badge.id)) continue; // Already have it

        if (badge.condition(activity)) {
            newUnlockedBadges.push(badge);
        }
    }

    // 3. Save new badges
    if (newUnlockedBadges.length > 0) {
        const records = newUnlockedBadges.map(b => ({
            user_id: userId,
            badge_id: b.id
        }));

        const { error } = await supabase
            .from('user_badges')
            .insert(records);

        if (error) {
            console.error("Error unlocking badges:", error);
            return [];
        }
    }

    return newUnlockedBadges; // Return unlocked badges to show in UI
};
