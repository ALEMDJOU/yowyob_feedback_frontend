import { supabase } from '@/lib/supabase';

export const fileService = {
    /**
     * Uploads a file to Supabase storage in a given bucket and folder.
     * @param file The file to upload
     * @param bucket The name of the Supabase bucket
     * @param folder The folder path within the bucket
     * @returns The public URL of the uploaded file
     */
    uploadFile: async (file: File, bucket: string = 'yowyob_feedback', folder: string = 'feedbacks'): Promise<string> => {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading file to Supabase:', error);
            throw new Error(`Erreur d'upload : ${error.message}`);
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    },

    /**
     * Uploads multiple files and returns an array of public URLs.
     */
    uploadMultipleFiles: async (files: File[], bucket: string = 'yowyob_feedback', folder: string = 'feedbacks'): Promise<string[]> => {
        const uploadPromises = files.map(file => fileService.uploadFile(file, bucket, folder));
        return Promise.all(uploadPromises);
    }
};
