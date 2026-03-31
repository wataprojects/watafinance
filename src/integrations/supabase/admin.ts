import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eoupodozovwxbldzptlp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvdXBvZG96b3Z3eGJsZHpwdGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk4MzUyOSwiZXhwIjoyMDg5NTU5NTI5fQ.1G_Y3H2hPv9_V_6rL9M4Z5cQ8x2dK4mN6pO3sT0uX1yA";

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface Admin {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface AdminSession {
  admin: Admin;
  token: string;
}
