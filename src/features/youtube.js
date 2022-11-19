import {useState, useEffect} from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';

import {injectScript} from '../utils/injectScript';
import {Uplaod} from '../components/upload';

const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

let playlistId;

export const Youtube = ({profile, session}) => {
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    function initClient() {
        let gClient = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.REACT_APP_YOUTUBE_CLIENT_ID,
            scope: SCOPE,
            callback: (tokenResponse) => {
                setAccessToken(tokenResponse.access_token);
            },
        });
        setClient(gClient);
    }

    function getToken() {
        console.log(client)
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
            await window.gapi.client.setApiKey(process.env.REACT_APP_YOUTUBE_API_KEY);
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

        var request = window.gapi.client.youtube.playlistItems.list(requestOptions);
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

    useEffect(() => {
        injectScript('https://accounts.google.com/gsi/client', true)
            .then(() => {
                initClient();
            });
        injectScript('https://apis.google.com/js/api.js');
    }, []);

    useEffect(() => {
        const getProfile = async () => {
            try {
                setLoading(true);

            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        }

        getProfile();
    }, [profile, session]);

    return (
        <>
            {loading && <Spinner animation="border" />}
            <h3>Youtube</h3>
            <Button onClick={getToken}>Get token</Button>
            <Button onClick={loadClient}>Load</Button>
            <Button onClick={getUploads}>Get uploads</Button>
            <Button onClick={revokeToken}>Revoke token</Button>
            <Uplaod accessToken={accessToken}/>
        </>
    );
}
