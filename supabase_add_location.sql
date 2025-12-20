-- Menambahkan kolom 'location' ke tabel activities
ALTER TABLE activities
ADD COLUMN location text DEFAULT 'Belum set lokasi';

-- Optional: Update data lama
UPDATE activities SET location = 'Lokasi tidak diketahui' WHERE location IS NULL;
