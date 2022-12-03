if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

let supabase;

let supabaseClient;

const initClient = async (token) => {
    const options = {
        db: {
            schema: 'public',
        },
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    }

    if (supabaseClient && !token) {
        return supabaseClient;
    }

    if (token) {
        options.global = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    }

    if (!supabase) {
        supabase = await import('@supabase/supabase-js');
    }
    supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey, options);

    return supabaseClient;
};

module.exports = {
    initClient,
}
