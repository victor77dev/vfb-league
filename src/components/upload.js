import { getValue } from '@testing-library/user-event/dist/utils';
import {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';

import {UploadVideo} from './uploadVideo';

export const Upload = ({accessToken}) => {
    const [uploadVideo, setUploadVideo] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        const uploader = new UploadVideo();
        uploader.ready(accessToken);

        setUploadVideo(uploader);
        setUploading(false);
    }, [accessToken])

    const onUploadClicked = () => {
        setUploading(true);
        uploadVideo.handleUploadClicked();
    }
      
    return (
        <>
            <div>
                {/* <div>
                    <img id="channel-thumbnail" />
                    <span id="channel-name"></span>
                </div>
                <div>
                    <label for="title">Title:</label>
                    <input id="title" type="text" value="Default Title" />
                </div>
                <div>
                    <label for="description">Description:</label>
                    <textarea id="description">Default description</textarea>
                </div>
                <div>
                    <label for="privacy-status">Privacy Status:</label>
                    <select id="privacy-status">
                        <option>public</option>
                        <option>unlisted</option>
                        <option>private</option>
                    </select>
                </div> */}
                <div>
                    <input
                        // input={value.toString()}
                        type="file"
                        id="file"
                        accept="video/*"
                    />
                    <Button
                        disabled={uploading}
                        onClick={onUploadClicked}
                    >
                        Upload Video
                    </Button>
                    {/* <div class="during-upload">
                        <p>
                            <span id="percent-transferred"></span> % done (
                            <span id="bytes-transferred"></span>/<span id="total-bytes"></span> bytes)
                        </p>
                        <progress id="upload-progress" max="1" value="0"></progress>
                    </div>

                    <div class="post-upload">
                        <p>Uploaded video with id <span id="video-id"></span>. Polling for status...</p>
                        <ul id="post-upload-status"></ul>
                        <div id="player"></div>
                    </div>
                    <p id="disclaimer">
                        By uploading a video, you certify that you own all rights to the content or that you are authorized by the owner to make the content publicly available on YouTube, and that it otherwise complies with the YouTube Terms of Service located at
                        <a href="http://www.youtube.com/t/terms" target="_blank">http://www.youtube.com/t/terms</a>
                    </p> */}
                </div>
            </div>
        </>
    )
}
