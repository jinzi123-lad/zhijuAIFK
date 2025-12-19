-- 1. FORCE Update the 'properties' bucket to be Public
-- (In case it already existed as Private)
UPDATE storage.buckets
SET public = true
WHERE id = 'properties';

-- 2. Drop existing policies to avoid conflicts (Clean Slate)
DROP POLICY IF EXISTS "Public Access Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Delete" ON storage.objects;

-- 3. Re-create Permissive Policies
CREATE POLICY "Public Access Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'properties' );

CREATE POLICY "Public Access Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'properties' );

CREATE POLICY "Public Access Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'properties' );

CREATE POLICY "Public Access Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'properties' );
