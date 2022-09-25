import {useState, useEffect} from 'react';
import Alert from 'react-bootstrap/Alert';

import {Filter} from '../components/filter';
import {TeamFilter} from '../components/teamFilter';

import {Matches} from './matches';
import {supabase} from './supabaseClient';

export const Availability = ({team, setFilteredTeam}) => {
    const [session, setSession] = useState(null);
    const [matches, setMatches] = useState(null);

    useEffect(() => {
        const getProfile = async (session) => {
            const { user } = session;

            const {data: profile, error, status} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
          getProfile(session);
        });
    
        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
          getProfile(session);
        });

        supabase.from('matches').select('*')
            .then(({ data, error, status }) => {
                const count = new Array(6).fill(0)

                const modified = data.map((match) => {
                    count[match.team - 1]++;
                    return {
                        ...match,
                        code: `T${match.team}.${count[match.team - 1]}`,
                    }
                });
                setMatches(modified);
            });

    }, []);

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
            <Matches availability matches={matches?.filter((match) => team[match.team - 1])}/>
        </>
    );
}
