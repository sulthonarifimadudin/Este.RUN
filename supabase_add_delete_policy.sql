-- POLICY: Izinkan user menghapus data miliknya sendiri
-- Jalankan ini di SQL Editor Supabase

create policy "Users can delete their own activities"
on activities for delete
using (auth.uid() = user_id);

-- Optional: Verify existing policies
-- select * from pg_policies where tablename = 'activities';
