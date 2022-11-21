import {useState, useEffect} from 'react';

import {supabase} from './supabaseClient';

import {injectScript} from '../utils/injectScript';
import {Upload} from '../components/upload';

const SCOPE = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtubepartner',
    'https://www.googleapis.com/auth/youtube.force-ssl',
];

const channel = 'VfB Kiefholz Badminton League';

export const Youtube = () => {
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        injectScript('https://apis.google.com/js/api.js');
        injectScript('https://accounts.google.com/gsi/client', true)
            .then(() => {
                initClient();
            });
    }, []);

    useEffect(() => {
        supabase.from('youtube').select('token').eq('id', channel)
            .then(({ data, error, status }) => {
                if (data.length > 0) {
                    setAccessToken(data[0].token);
                }
            });
    }, []);

    function initClient() {
        window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.REACT_APP_YOUTUBE_CLIENT_ID,
            scope: SCOPE.join(' '),
            callback: async (tokenResponse) => {
                await supabase.from('youtube').upsert({
                    id: channel,
                    token: tokenResponse.access_token,
                });
                setAccessToken(tokenResponse.access_token);
                loadClient();
            },
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
            <Upload accessToken={accessToken}/>
        </>
    );
}
