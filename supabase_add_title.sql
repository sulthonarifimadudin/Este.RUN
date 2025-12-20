-- Menambahkan kolom 'title' ke tabel activities
-- Default value diset ke 'Lari Santuy' atau bisa dibiarkan null
ALTER TABLE activities
ADD COLUMN title text DEFAULT 'Lari Santuy';

-- Optional: Update data lama biar gak null
UPDATE activities SET title = 'Lari Santuy' WHERE title IS NULL;
