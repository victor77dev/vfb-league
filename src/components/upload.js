import {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import ProgressBar from 'react-bootstrap/ProgressBar';

import {UploadVideo} from './uploadVideo';

export const Upload = ({accessToken}) => {
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [validated, setValidated] = useState(false);
    const [progress, setProgress] = useState(-1);
    const [privacy, setPrivacy] = useState('unlisted');

    useEffect(() => {
        if (!accessToken) {
            return;
        }
    }, [accessToken])

    const submitVideo = () => {
        const uploader = new UploadVideo(setProgress);
        uploader.ready(accessToken);

        // setUploadVideo(uploader);
        setUploading(true);
        uploader.handleUploadClicked(file, {
            title,
            description,
            privacy,
        });
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        try {
            submitVideo();
        } catch (error) {
            alert(error.error_description || error.message)
            setValidated(false);
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Form validated={validated} onSubmit={handleUpload}>
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

                <Button variant="primary" type="submit">
                    {uploading ? <Spinner animation="border" /> : 'Upload Video'}
                </Button>
            </Form>
        </>
    )
}
