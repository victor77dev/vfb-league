import {MediaUploader} from './corsUpload';

const STATUS_POLLING_INTERVAL_MILLIS = 60 * 1000; // One minute.

/**
 * YouTube video uploader class
 *
 * @constructor
 */
export const UploadVideo = function(setProgress, setVideoId, setMessage) {
    /**
     * The array of tags for the new YouTube video.
     *
     * @attribute tags
     * @type Array.<string>
     * @default ['google-cors-upload']
     */
    this.tags = ['youtube-upload'];

    /**
     * The numeric YouTube
     * [category id](https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.videoCategories.list?part=snippet&regionCode=us).
     *
     * @attribute categoryId
     * @type number
     * @default 17
     */
    this.categoryId = 17;

    /**
     * The id of the new video.
     *
     * @attribute videoId
     * @type string
     * @default ''
     */
    this.videoId = '';

    this.uploadStartTime = 0;

    this.setProgress = setProgress;
    this.setVideoId = setVideoId;
    this.setMessage = setMessage;
};


UploadVideo.prototype.ready = function(accessToken) {
    if (!accessToken || !window.gapi) {
        return;
    }

    this.accessToken = accessToken;
    this.gapi = window.gapi;
    this.authenticated = true;
    this.gapi.client.request({
            path: '/youtube/v3/channels',
            params: {
            part: 'snippet',
            mine: true
        },
        callback: function(response) {
            if (response.error) {
                console.log(response.error.message);
            } else {
                console.log(response);
                console.log('channel name', response.items[0].snippet.title);
                console.log('channel thumbnail', response.items[0].snippet.thumbnails.default.url);
            }
        },
    });
};

/**
 * Uploads a video file to YouTube.
 *
 * @method uploadFile
 * @param {object} file File object corresponding to the video to upload.
 * @param {object} data
 */
UploadVideo.prototype.uploadFile = function(file, data) {
    console.log(file, data)
    const metadata = {
        snippet: {
            title: data.title,
            description: data.description,
            tags: this.tags,
            categoryId: this.categoryId
        },
        status: {
            privacyStatus: data.privacy || 'private',
        }
    };

    const uploader = new MediaUploader({
        baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
        file: file,
        token: this.accessToken,
        metadata: metadata,
        params: {
            part: Object.keys(metadata).join(',')
        },
        onError: function(data) {
            let message = data;
            // Assuming the error is raised by the YouTube API, data will be
            // a JSON string with error.message set. That may not be the
            // only time onError will be raised, though.
            try {
                console.log(data)
                const errorResponse = JSON.parse(data);
                message = errorResponse.error.message;
            } finally {
                console.log(message)
                alert(message);
            }
        },
        onProgress: function(data) {
            const currentTime = Date.now();
            const bytesUploaded = data.loaded;
            const totalBytes = data.total;
            // The times are in millis, so we need to divide by 1000 to get seconds.
            const bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
            const estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
            const percentageComplete = (bytesUploaded * 100) / totalBytes;

            console.log('upload-progress', bytesUploaded, totalBytes);
            console.log('percent-transferred', percentageComplete);
            this.setProgress(percentageComplete);
            console.log('estimatedSecondsRemaining', estimatedSecondsRemaining);

            console.log('bytes-transferred', bytesUploaded);
            console.log('total-bytes', totalBytes);

            // $('.during-upload').show();
        }.bind(this),
        onComplete: function(data) {
            const uploadResponse = JSON.parse(data);
            this.videoId = uploadResponse.id;
            this.setVideoId(this.videoId);
            console.log('video-id', this.videoId);
            this.pollForVideoStatus();
        }.bind(this)
    });
    // This won't correspond to the *exact* start of the upload, but it should be close enough.
    this.uploadStartTime = Date.now();
    uploader.upload();
};

UploadVideo.prototype.handleUploadClicked = function(file, data) {
    console.log('upload handle')
    console.log(file);
    return this.uploadFile(file, data);
};

UploadVideo.prototype.pollForVideoStatus = function() {
    this.gapi.client.request({
        path: '/youtube/v3/videos',
        params: {
            part: 'status,player',
            id: this.videoId
        },
        callback: function(response) {
            if (response.error) {
                // The status polling failed.
                console.log(response.error.message);
                alert(response.error.message)
                setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
            } else {
                const uploadStatus = response.items[0].status.uploadStatus;
                switch (uploadStatus) {
                // This is a non-final status, so we need to poll again.
                case 'uploaded':
                    console.log('post-upload-status', 'Upload status: ' + uploadStatus);
                    setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                    break;
                // The video was successfully transcoded and is available.
                case 'processed':
                    console.log('player', response.items[0].player.embedHtml);
                    console.log('post-upload-status', 'Final status.');
                    break;
                // All other statuses indicate a permanent transcoding failure.
                default:
                    console.log('post-upload-status', 'Transcoding failed.');
                    break;
                }
            }
        }.bind(this)
    });
};
