import {useState} from 'react';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import {supabase} from './supabaseClient';

export const Recovery = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validated, setValidated] = useState(false);

    const handleRecovery = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Password incorrect!');
            return;
        }

        try {
            setLoading(true)
            const {error} = await supabase.auth.updateUser({
                password,
            });

            if (error) throw error
        } catch (error) {
            alert(error.error_description || error.message)
            setValidated(false);
        } finally {
            setError(null);
            setLoading(false);
        }
    };

    return (
        <>
            { error && 
                <Alert key="danger" variant="danger">
                    error
                </Alert>
            }
            <Form validated={validated} onSubmit={handleRecovery}>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    {loading ? <Spinner animation="border" /> : 'Login'}
                </Button>
            </Form>
        </>
    );
}
