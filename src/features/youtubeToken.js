import {useState, useEffect} from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';

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

let playlistId;

const channel = 'VfB Kiefholz Badminton League';

export const YoutubeToken = () => {
    const [client, setClient] = useState(null);
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
        let gClient = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.REACT_APP_YOUTUBE_CLIENT_ID,
            scope: SCOPE.join(' '),
            callback: async (tokenResponse) => {
                await supabase.from('youtube').upsert({
                    id: channel,
                    token: tokenResponse.access_token,
                });
                setAccessToken(tokenResponse.access_token);
            },
        });
        setClient(gClient);
    }

    function getToken() {
        client.requestAccessToken();
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
            <Button onClick={getToken}>Get token</Button>
            <Button onClick={loadClient}>Load</Button>
            <Button onClick={getUploads}>Get uploads</Button>
            <Button onClick={revokeToken}>Revoke token</Button>
        </>
    );
}

