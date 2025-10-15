import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro';
          created_at?: string;
          updated_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          user_id: string;
          platform: 'instagram' | 'facebook' | 'whatsapp' | 'tiktok';
          account_name: string;
          access_token: string | null;
          status: 'active' | 'inactive';
          created_at: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          connection_id: string | null;
          name: string;
          platform_id: string;
          tags: string[];
          last_interaction: string | null;
          created_at: string;
        };
      };
      automations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          type: 'message_response' | 'sequence' | 'custom_rules';
          trigger_type: string;
          flow_data: any;
          status: 'active' | 'inactive';
          runs: number;
          ctr: number;
          created_at: string;
          updated_at: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string;
          connection_id: string | null;
          status: 'bot' | 'human' | 'closed';
          last_message_at: string;
          created_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: 'bot' | 'human' | 'contact';
          content: string;
          metadata: any;
          created_at: string;
        };
      };
      broadcasts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          content: string;
          segment_tags: string[];
          scheduled_at: string | null;
          status: 'draft' | 'scheduled' | 'sent';
          sent_count: number;
          created_at: string;
        };
      };
    };
  };
};
