// Supabase Configuration
const SUPABASE_URL = 'https://rqgkkrodzqfillmrdikj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZ2trcm9kenFmaWxsbXJkaWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjUyNDEsImV4cCI6MjA3OTc0MTI0MX0.n4Pdzs45pHgLzSfwSvDk3rtbXmRjjk2DhE18HcXrzRk';

// Initialize Client
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Constants
export const ITEMS_PER_PAGE = 10;
