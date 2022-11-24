import {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';

import {supabase} from './supabaseClient';

const redirectUri = 'http://localhost:3000/vfb-league';
const SCOPE = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtubepartner',
    'https://www.googleapis.com/auth/youtube.force-ssl',
];

let playlistId;

const channel = 'VfB Kiefholz Badminton League';

export const YoutubeToken = () => {
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        supabase.from('youtube').select('token').eq('id', `${channel} access`)
            .then(({ data, error, status }) => {
                if (data.length > 0) {
                    setAccessToken(data[0].token);
                }
            });
    }, []);

    function getToken() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        console.log(code)
        fetch(, code, redirectUri);

        window.location.search = '';

    }

    async function renewToken() {
        const refreshToken = await supabase.from('youtube').select('token').eq('id', `${channel} refresh`)
            .then(({ data }) => {
                console.log(data)
                if (data.length > 0) {
                    return data[0].token;
                }
            });
        const data = new URLSearchParams();

        data.append('client_id', process.env.REACT_APP_YOUTUBE_CLIENT_ID);
        data.append('client_secret', process.env.REACT_APP_YOUTUBE_CLIENT_SECRET);
        data.append('refresh_token', refreshToken);
        data.append('grant_type', 'refresh_token');

        fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            body: data,
        }).then(async (response) => {
            const json = await response.json();

            console.log(json)
        });

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
        window.google.accounts.oauth2.revoke(accessToken, () => {console.log('access token revoked')});
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
            <Button onClick={loadClient}>Load</Button>
            <Button onClick={getUploads}>Get uploads</Button>
            <Button onClick={revokeToken}>Revoke token</Button>
        </>
    );
}

