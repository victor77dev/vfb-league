import {useState, useEffect} from 'react';
import Spinner from 'react-bootstrap/Spinner';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import {supabase} from './supabaseClient';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);

    useEffect(() => {
    }, []);


    const handleSignup = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const {data, error} = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log(data)
            if (error) throw error

            const {user} = data;

            // await supabase.from('profiles').upsert({
            //     id: user.id,
            //     player: playerId,
            //     email: user.email,
            // });

        } catch (error) {
            alert(error.error_description || error.message)
            setValidated(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form validated={validated} onSubmit={handleSignup}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>
  
            <Form.Group className="mb-3" controlId="formBasicPassword">
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
    );
}
