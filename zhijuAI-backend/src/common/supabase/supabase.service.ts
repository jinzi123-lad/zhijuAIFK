import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
    public client: SupabaseClient;

    onModuleInit() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.warn('⚠️ Supabase credentials not found in environment variables. Backend running in detached mode.');
            // Create a dummy client or handle error gracefully during dev
            // For now, we'll try to create it anyway which might throw or just fail later
            this.client = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
        } else {
            this.client = createClient(supabaseUrl, supabaseKey);
        }
    }

    getClient() {
        return this.client;
    }
}
