// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wxmtfsexxhkjwgrejmji.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bXRmc2V4eGhrandncmVqbWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTgzMTksImV4cCI6MjA2MDMzNDMxOX0.P9xm7DsruoMdPeiF6edCgUul8GObOLte5_OO6HFG9wA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);