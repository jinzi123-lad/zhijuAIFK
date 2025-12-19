-- 1. Create the 'properties' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow Public Access (Policies)
-- Note: In production, you might want to restrict INSERT/UPDATE to authenticated users.
-- For this setup (as requested), we enable full access for easier demo usage.

-- Policy: Allow Public Read (SELECT)
CREATE POLICY "Public Access Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'properties' );

-- Policy: Allow Public Insert (Upload)
CREATE POLICY "Public Access Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'properties' );

-- Policy: Allow Public Update
CREATE POLICY "Public Access Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'properties' );

-- Policy: Allow Public Delete
CREATE POLICY "Public Access Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'properties' );
