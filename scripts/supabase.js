if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

module.exports = async () => {
    const supabase = await import('@supabase/supabase-js');
    return supabase.createClient(supabaseUrl, supabaseAnonKey);
};
