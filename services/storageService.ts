import { supabase } from './supabaseClient';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file The file object to upload
 * @param bucket The storage bucket name (default: 'properties')
 * @returns Promise<string> The public URL of the uploaded file
 */
export const uploadFile = async (file: File, bucket: string = 'properties'): Promise<string> => {
    try {
        // 1. Sanitize filename (timestamp + random + safe name)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 2. Upload
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            throw uploadError;
        }

        // 3. Get Public URL
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('File upload failed:', error);
        alert('文件上传失败！请检查：\n1. Supabase后台是否创建了名为 "properties" 的Storage Bucket？\n2. Bucket是否设置为 Public？');
        throw error;
    }
};
