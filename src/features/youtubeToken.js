import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import {supabase} from './supabaseClient';

const redirectUri = `${window.location.origin}/vfb-league/youtubeToken`;
const SCOPE = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
];

let playlistId;

const channel = 'VfB Kiefholz Badminton League';

export const YoutubeToken = () => {
    const navigate = useNavigate();
    const [accessToken, setAccessToken] = useState(null);
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    useEffect(() => {
        const getAccessToken = () => {
            return supabase.from('youtube').select('*').eq('id', `${channel} access`)
                .then(({ data, error, status }) => {
                    if (data.length > 0) {
                        return data[0];
                    }
                });
        }

        (async () => {
            let accessToken = await getAccessToken();
            if (!accessToken.expire) return;

            if (new Date(accessToken.expire) < new Date()) {
                console.log('Token expired. Request renew!')
                await renewToken();
                accessToken = await getAccessToken();
            }
            setAccessToken(accessToken.token);
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (code) {
            getToken();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    async function getToken() {
        const data = {
            code,
            type: 'getToken',
            redirectUri,
        };
        
        await fetch('https://cpbxcfnzmgnrurwxespl.functions.supabase.co/hello', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(data), 
        });

        setTimeout(() => {
            const origin = window.location.origin;
            const pathname = '/vfb-league#';
            window.location.href = `${origin}${pathname}`;
            navigate('/youtubeToken');
        }, 2000);
    }

    async function renewToken() {
        const data = {
            type: 'renewToken',
        };
        
        await fetch('https://cpbxcfnzmgnrurwxespl.functions.supabase.co/hello', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(data), 
        });

        setTimeout(() => {
            const origin = window.location.origin;
            const pathname = '/vfb-league#';
            window.location.href = `${origin}${pathname}`;
            navigate('/youtubeToken');
        }, 2000);
    }

    function loginGoogle() {
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

        url.searchParams.append('scope', SCOPE.join(' '));
        url.searchParams.append('client_id', process.env.REACT_APP_YOUTUBE_CLIENT_ID);
        url.searchParams.append('redirect_uri', redirectUri);
        url.searchParams.append('access_type', 'offline');
        url.searchParams.append('include_granted_scopes', 'true');
        url.searchParams.append('response_type', 'code');
        url.searchParams.append('state', 'youtubeToken');

        window.location.href = url.href;
    }

    function revokeToken() {
        const data = {
            type: 'revokeToken',
        };

        fetch('https://cpbxcfnzmgnrurwxespl.functions.supabase.co/hello', {
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
            execute();
        });
    }

    function requestVideoPlaylist(playlistId) {
        const requestOptions = {
            playlistId: playlistId,
            part: 'snippet',
            maxResults: 10
        };

        const request = window.gapi.client.youtube.playlistItems.list(requestOptions);
        request.execute(function(response) {
            console.log(response);
        });
    }

    function getUploads() {
        requestVideoPlaylist(playlistId);
    }

    // Make sure the client is loaded and sign-in is complete before calling this method.
    function execute() {
        return window.gapi.client.youtube.channels.list({
            "part": [
                "snippet,contentDetails,statistics"
            ],
            "mine": true
        })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
                playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
                requestVideoPlaylist(playlistId);
            },
            function(err) { console.error("Execute error", err); });
    }

    return (
        <>
            <h3>Youtube</h3>
            <Button onClick={loginGoogle}>Login Google</Button>
            <Button onClick={getToken}>Get token</Button>
            <Button onClick={renewToken}>Renew token</Button>
            <Button onClick={loadClient}>Test</Button>
            <Button onClick={getUploads}>Get uploads</Button>
            <Button onClick={revokeToken}>Revoke token</Button>
        </>
    );
}
