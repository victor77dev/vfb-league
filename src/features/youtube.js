import {useState, useEffect} from 'react';

import {supabase} from './supabaseClient';

import {injectScript} from '../utils/injectScript';
import {Upload} from '../components/upload';

const channel = 'VfB Kiefholz Badminton League';

export const Youtube = ({profile, user}) => {
    const [accessToken, setAccessToken] = useState(null);
    const [name, setName] = useState(null);

    useEffect(() => {
        injectScript('https://apis.google.com/js/api.js');

        (async () => {
            setName(profile?.email || user?.email);
            if (profile?.player) {
                await supabase.from('players').select('*').eq('id', profile?.player).single()
                    .then(async ({data}) => {
                        setName(data?.name || profile?.email || user?.email);
                    });
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const getToken = () => {
            return supabase.from('youtube').select('*').eq('id', `${channel} access`)
                .then(({ data, error, status }) => {
                    if (data.length > 0) {
                        return data[0];
                    }
                });
        }

        (async () => {
            let accessToken = await getToken();
            if (!accessToken.expire) return;

            if (new Date(accessToken.expire) < new Date()) {
                console.log('Token expired. Request renew!')
                await renewToken();
                accessToken = await getToken();
            }
            setAccessToken(accessToken.token);
        })();
    }, []);

    useEffect(() => {
        if (!accessToken) return;

        injectScript('https://apis.google.com/js/api.js').then(() => {
            loadClient();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    async function renewToken() {
        const data = {
            type: 'renewToken',
        };
        
        return fetch('https://cpbxcfnzmgnrurwxespl.functions.supabase.co/hello', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(data), 
        });
    }

    async function loadClient() {
        await new Promise((resolve, reject) => {
            // NOTE: the 'auth2' module is no longer loaded.
            window.gapi.load('client', {callback: resolve, onerror: reject});
        });
        await window.gapi.client.init({
            // NOTE: OAuth2 'scope' and 'client_id' parameters have moved to initTokenClient().
        })
        .then(async function() {
            if (!window.gapi.client.getToken()) {
                window.gapi.client.setToken({access_token: accessToken});
            }

            await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest');
        });
    }

    return (
        <>
            <h3>Youtube</h3>
            <Upload accessToken={accessToken} user={name} id={user.id}/>
        </>
    );
}
