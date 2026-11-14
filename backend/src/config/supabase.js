const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://vtpdjthdqlpathniuqvu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ZaKtKrXUB-9kHag-E5y6sA_P-FHGuZ4';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase, supabaseUrl, supabaseKey };
