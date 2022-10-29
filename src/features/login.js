import {useState} from 'react';
import Spinner from 'react-bootstrap/Spinner';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import {supabase} from './supabaseClient';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const {error} = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error
        } catch (error) {
            alert(error.error_description || error.message)
            setValidated(false);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://victor77dev.github.io/vfb-league/',
        });
    }

    return (
        <>
            <Form validated={validated} onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="LoginEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
    
                <Form.Group className="mb-3" controlId="LoginPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    {loading ? <Spinner animation="border" /> : 'Login'}
                </Button>
            </Form>
            <Button style={{marginTop: 16}} variant="outline-primary" onClick={resetPassword}>
                {loading ? <Spinner animation="border" /> : 'Reset password'}
            </Button>
        </>
    );
}
