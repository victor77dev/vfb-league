import {useState, useEffect} from 'react';
import Spinner from 'react-bootstrap/Spinner';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import {supabase} from './supabaseClient';

export const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);

    const [players, setPlayers] = useState(null);

    useEffect(() => {
        supabase.from('players').select('*')
            .then(({ data, error, status }) => {
                setPlayers(data);
            });
    }, []);


    const handleSignup = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const {data, error} = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error

            const {user} = data;

            const playerId = players.find((player) => player.name === name).id;

            await supabase.from('profiles').upsert({
                id: user.id,
                player: playerId,
                email: user.email,
            });

        } catch (error) {
            alert(error.error_description || error.message)
            setValidated(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form validated={validated} onSubmit={handleSignup}>
            <Form.Group className="mb-3" controlId="SignupEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>
  
            <Form.Group className="mb-3" controlId="SignupPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="SignupName">
                <Form.Label>Username</Form.Label>
                <Form.Select
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                >
                    <option>Select</option>
                    {
                        players?.sort((a, b) => (a.name < b.name ? -1 : 1))
                            .map((player) => (
                                <option key={player.id}>{player.name}</option>
                            ))
                    }
                </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">
                {loading ? <Spinner animation="border" /> : 'SignUp'}
            </Button>
        </Form>
    );
}
  