import {serve} from 'https://deno.land/std@0.131.0/http/server.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
    'Access-Control-Allow-Headers': 'apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization',
};

const channel = 'VfB Kiefholz Badminton League';

async function getToken(code, redirectUri) {
    const supabase = createClient(
        // Supabase API URL - env var exported by default.
        Deno.env.get('SUPABASE_URL') ?? '',
        // Supabase API ANON KEY - env var exported by default.
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        // Create client with Auth context of the user that called the function.
        // This way your row-level-security (RLS) policies are applied.
        // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    console.log('getToken request');

    const data = new URLSearchParams();

    data.append('code', code);
    data.append('client_id', Deno.env.get('REACT_APP_YOUTUBE_CLIENT_ID'));
    data.append('client_secret', Deno.env.get('REACT_APP_YOUTUBE_CLIENT_SECRET'));
    data.append('redirect_uri', redirectUri);
    data.append('grant_type', 'authorization_code');

    return fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: data,
    }).then(async (response) => {
        const json = await response.json();
        const {
            access_token,
            expires_in,
            refresh_token,
        } = json;

        if (access_token && expires_in && refresh_token) {
            await supabase.from('youtube').upsert([
                {
                    id: `${channel} access`,
                    token: access_token,
                    expire: new Date((Date.now() + expires_in * 1000)).toISOString(),
                    type: 'access',
                },
                {
                    id: `${channel} refresh`,
                    token: refresh_token,
                    expire: null,
                    type: 'refresh',
                },
            ]);

            return 'Updated';
        }
    }).catch(() => {
        console.log('failed')
    });
}

async function renewToken() {
    const supabase = createClient(
        // Supabase API URL - env var exported by default.
        Deno.env.get('SUPABASE_URL') ?? '',
        // Supabase API ANON KEY - env var exported by default.
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        // Create client with Auth context of the user that called the function.
        // This way your row-level-security (RLS) policies are applied.
        // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    let accessToken, refreshToken;
    await supabase.from('youtube').select('*').eq('id', `${channel} access`)
        .then(({data}) => {
            if (data.length > 0) {
                accessToken = data[0];
            }
        });

    if (new Date(accessToken.expire) > new Date()) {
        console.log('Access Token is still valid!', new Date());
        return 'Token is still valid';
    }
    console.log('Access Token expired! Renew token', new Date());

    await supabase.from('youtube').select('*').eq('id', `${channel} refresh`)
        .then(({ data }) => {
            if (data.length > 0) {
                refreshToken = data[0];
            }
        });

    const data = new URLSearchParams();

    data.append('client_id', Deno.env.get('REACT_APP_YOUTUBE_CLIENT_ID'));
    data.append('client_secret', Deno.env.get('REACT_APP_YOUTUBE_CLIENT_SECRET'));
    data.append('refresh_token', refreshToken.token);
    data.append('grant_type', 'refresh_token');

    return fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: data,
    }).then(async (response) => {
        const json = await response.json();
        const {
            access_token,
            expires_in,
        } = json;

        if (access_token && expires_in) {
            await supabase.from('youtube').upsert([
                {
                    id: `${channel} access`,
                    token: access_token,
                    expire: new Date((Date.now() + expires_in * 1000)).toISOString(),
                    type: 'access',
                },
            ]);

            console.log('Token updated');

            return 'Token refreshed';
        }
    });
}

async function revokeToken() {
    const supabase = createClient(
        // Supabase API URL - env var exported by default.
        Deno.env.get('SUPABASE_URL') ?? '',
        // Supabase API ANON KEY - env var exported by default.
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        // Create client with Auth context of the user that called the function.
        // This way your row-level-security (RLS) policies are applied.
        // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    let refreshToken;

    await supabase.from('youtube').select('*').eq('id', `${channel} refresh`)
        .then(({ data }) => {
            if (data.length > 0) {
                refreshToken = data[0];
            }
        });

    const data = new URLSearchParams();

    data.append('token', refreshToken.token);

    await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        body: data,
    });

    await supabase.from('youtube').upsert([
        {
            id: `${channel} access`,
            token: null,
            expire: null,
            type: 'access',
        },
        {
            id: `${channel} refresh`,
            token: null,
            expire: null,
            type: 'refresh',
        },
    ]);

    return 'Token revoked';
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    let data;

    try {
        const {
            code,
            type,
            redirectUri,
        } = await req.json();

        if (type === 'renewToken') {
            const message = await renewToken();

            data = {message};
        } else if (type === 'getToken') {
            await getToken(code, redirectUri);
        } else if (type === 'revokeToken') {
            await revokeToken();
        } else {
            data = {message: 'Unknown request'};
        }

        return new Response(JSON.stringify(data), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            status: 400,
        });
    }
});
