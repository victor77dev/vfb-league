import {useState, useEffect} from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';

import {supabase} from './supabaseClient';

const logout = () => {
    supabase.auth.signOut();
}

export const Profile = ({session}) => {
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState(null);
    const [gender, setGender] = useState(null);
    const [email, setEmail] = useState(null);
    const [team, setTeam] = useState(null);

    useEffect(() => {
        const getProfile = async () => {
            try {
                setLoading(true);
                const { user } = session;

                const {data: profile, error, status} = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && status !== 406) {
                    throw error
                }

                if (profile) {
                    setEmail(profile.email);
                    const {data: player, error, status} = await supabase
                        .from('players')
                        .select('*')
                        .eq('id', profile.player)
                        .single();

                    setName(player.name);
                    setGender(player.gender);
                    setTeam(player.team);
                }
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        }

        getProfile();
    }, [session])

    return (
        <>
            {loading && <Spinner animation="border" />}
            <h3>Email</h3>
            <p>{email}</p>
            <h3>Name</h3>
            <p>{name}</p>
            {
                team &&
                <>
                    <h3>Team</h3>
                    <p>{team}</p>
                </>
            }
            <h3>Gender</h3>
            <p>{gender}</p>
            <Button onClick={logout}>Logout</Button>
        </>
    );
}
