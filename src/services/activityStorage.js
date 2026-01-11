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
            title: activity.title || getDefaultTitle(activity.type, new Date(activity.startTime)),
            location: activity.location, // Add location
            steps: activity.steps || 0, // Add steps
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

// ... (getDefaultTitle stays here) ...

export const getActivities = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('activities')
            .select('*, profiles(username, full_name, avatar_url)')
            .eq('user_id', user.id)
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
    title: record.title || 'Lari Santuy',
    location: record.location || '', // Handle null location
    distance: record.distance,
    duration: record.duration,
    duration: record.duration,
    pace: record.pace,
    steps: record.steps || 0,
    routePath: record.route_path,
    startTime: record.start_time,
    createdAt: record.created_at,
    photoUrl: record.photo_url,
    user: record.profiles ? {
        username: record.profiles.username || 'Runner',
        fullName: record.profiles.full_name || 'Este Runner',
        avatarUrl: record.profiles.avatar_url
    } : null
});

export const updateActivityLocation = async (id, location) => {
    try {
        const { error } = await supabase
            .from('activities')
            .update({ location: location })
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Gagal update lokasi:", error);
        return false;
    }
};

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

// NEW: Fetch activities for a specific user (Public Profile)
export const getActivitiesByUserId = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId)
            .order('start_time', { ascending: false });

        if (error) throw error;
        return data.map(transformActivity);
    } catch (error) {
        console.error(`Error fetching activities for user ${userId}:`, error);
        return [];
    }
};
