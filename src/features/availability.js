import {useState, useEffect} from 'react';
import Alert from 'react-bootstrap/Alert';

import {Filter} from '../components/filter';
import {TeamFilter} from '../components/teamFilter';

import {Matches} from './matches';
import {supabase} from './supabaseClient';

export const Availability = ({session, matches, team, setFilteredTeam}) => {
    const [profile, setProfile] = useState(null);
    const [availability, setAvailability] = useState({});

    useEffect(() => {
        const getProfile = async (session) => {
            const {user} = session;

            const {data} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(data);

            if (data?.availability) {
                setAvailability(data?.availability);
            }
        };

        if (!session) return;

        getProfile(session)
    }, [session]);

    const updateAvailability = async (update) => {
        if (profile) {
            console.log('updating')
            await supabase.from('profiles').upsert({
                id: profile?.id,
                availability: update,
            });

            setAvailability(update);
        }

    };

    if (!session) {
        return (
        <Alert key="danger" variant="danger">
            Please login before editing.
        </Alert>
        );
    }

    return (
        <>
            <Filter>
                <TeamFilter team={team} setFilteredTeam={setFilteredTeam} />
            </Filter>
            <Matches
                id="availability"
                matches={matches?.filter((match) => team[match.team - 1])}
                availability={availability}
                setAvailability={updateAvailability}
            />
        </>
    );
}
