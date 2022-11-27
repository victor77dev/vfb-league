import {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Alert from 'react-bootstrap/Alert';

import {UploadVideo} from './uploadVideo';
import {supabase} from '../features/supabaseClient';

export const Upload = ({accessToken}) => {
    const [file, setFile] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [validated, setValidated] = useState(false);
    const [progress, setProgress] = useState(-1);
    const [videoId, setVideoId] = useState(null);
    const [privacy, setPrivacy] = useState('unlisted');
    const [message, setMessage] = useState(null);
    const [warning, setWarning] = useState(false);

    useEffect(() => {
        if (!accessToken) {
            return;
        }
        supabase.from('youtube').select('*').eq('id', 'quota').single().then(({data}) => {
            if (data.used >= data.max) {
                setWarning(true);
            }
        });
    }, [accessToken])

    const submitVideo = () => {
        const uploader = new UploadVideo(setProgress, setVideoId, setMessage);
        uploader.ready(accessToken);

        uploader.handleUploadClicked(file, {
            title,
            description,
            privacy,
        });
        supabase.from('youtube').select('*').eq('id', 'quota').single().then(async ({data}) => {
            await supabase.from('youtube').update({
                id: 'quota',
                used: data.used + 1610,
            });
        });
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        try {
            if (title && file && description) {
                if (validated) {
                    submitVideo();
                }

                setMessage(null);
                if (privacy === 'public') {
                    setMessage(
                        'This video will be publicly available!' + 
                        ' Please confirm everyone on the video agree to set this public!'
                    );
                }
                setValidated(true);
            } else {
                setMessage('Please fill in all the fields!');
                setValidated(false);
            }
        } catch (error) {
            alert(error.error_description || error.message)
            setValidated(false);
        }
    };

    return (
        <>
            <Form validated={validated} onSubmit={handleUpload}>
                {
                    warning &&
                    <Form.Group className="mb-3" controlId="Warning">
                        <Alert key="warning" variant="warning">
                            Please aware we have YouTube upload quota limit (max 8 per day).
                            <br/>
                            It is close to the limit now. The upload might fail due to the limit.
                            <br/>
                            Please try again tomorrow if it fails.
                        </Alert>
                    </Form.Group>
                }
                <Form.Group className="mb-3" controlId="Title">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter video title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="Description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        as="textarea"
                        rows={3}
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="Privacy">
                    <Form.Label>Select privacy policy</Form.Label>
                    <Form.Select
                        aria-label="Select privacy policy"
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                    >
                        <option value="private">Private</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="public">Public</option>
                    </Form.Select>
                </Form.Group>
                {
                    privacy === 'private' &&
                    <Form.Group className="mb-3" controlId="PrivacyAlert">
                        <Alert key="danger" variant="danger">
                            Please be aware you won't be able to access
                            if you are not YouTube channel manager!
                            <br/>
                            You need to contact the channel manager to share the video.
                            <br/>
                            Please consider to use Unlisted which is only available for people with url.
                        </Alert>
                    </Form.Group>
                }

                <Form.Group className="mb-3" controlId="File">
                    <Form.Control
                        type="file"
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </Form.Group>

                {
                    progress >= 0 &&
                    <Form.Group className="mb-3" controlId="Progress">
                        <ProgressBar now={progress} label={`${progress}%`} />
                    </Form.Group>
                }

                {
                    message &&
                    <Form.Group className="mb-3" controlId="Message">
                        <Alert key="danger" variant="danger">
                        {message}
                        </Alert>
                    </Form.Group>
                }


                {
                    videoId &&
                    <Form.Group className="mb-3" controlId="Video">
                        <iframe
                            title="video"
                            width="420"
                            height="315"
                            src={`https://www.youtube.com/embed/${videoId}`}
                        />
                    </Form.Group>
                }

                {
                    progress < 100 &&
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={progress >= 0}
                    >
                        {progress >= 0 ? <Spinner animation="border" /> :
                            (
                                validated ?
                                'Confirm to upload' :
                                'Upload Video'
                            )}
                    </Button>
                }
            </Form>
        </>
    )
}
