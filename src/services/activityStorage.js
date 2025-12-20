import { supabase } from '../lib/supabaseClient';

export const saveActivity = async (activity) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // Transform data to snake_case for Supabase
        const payload = {
            user_id: user?.id,
            type: activity.type,
            distance: activity.distance,
            duration: activity.duration,
            pace: activity.pace,
            title: activity.title || getDefaultTitle(activity.type, new Date(activity.startTime)), // Add title
            route_path: activity.routePath, // JSONB supports objects/arrays
            start_time: new Date(activity.startTime).toISOString(),
        };

        const { data, error } = await supabase
            .from('activities')
            .insert([payload])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error("Gagal menyimpan ke Supabase:", error);
        return null;
    }
};

// Helper for default title
const getDefaultTitle = (type, date) => {
    const hour = date.getHours();
    let timeOfDay = 'Pagi';
    if (hour >= 11 && hour < 15) timeOfDay = 'Siang';
    else if (hour >= 15 && hour < 19) timeOfDay = 'Sore';
    else if (hour >= 19) timeOfDay = 'Malam';

    const typeName = type === 'running' ? 'Lari' : type === 'cycling' ? 'Gowes' : 'Jalan';
    return `${typeName} ${timeOfDay}`;
};

export const getActivities = async () => {
    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('start_time', { ascending: false });

        if (error) throw error;

        // Transform back to camelCase for frontend
        return data.map(transformActivity);
    } catch (error) {
        console.error("Gagal fetch activities:", error);
        return [];
    }
};

export const getActivityById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return transformActivity(data);
    } catch (error) {
        console.error("Gagal fetch activity by id:", error);
        return null;
    }
};

const transformActivity = (record) => ({
    id: record.id,
    type: record.type,
    title: record.title || 'Lari Santuy', // Handle null
    distance: record.distance,
    duration: record.duration,
    pace: record.pace,
    routePath: record.route_path,
    startTime: record.start_time,
    createdAt: record.created_at,
    photoUrl: record.photo_url
});

export const updateActivityPhoto = async (id, photoUrl) => {
    try {
        const { error } = await supabase
            .from('activities')
            .update({ photo_url: photoUrl })
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Gagal update foto:", error);
        return false;
    }
};

export const updateActivityTitle = async (id, title) => {
    try {
        const { error } = await supabase
            .from('activities')
            .update({ title: title })
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Gagal update judul:", error);
        return false;
    }
};

export const deleteActivity = async (id) => {
    try {
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Gagal menghapus aktivitas:", error);
        return false;
    }
};
