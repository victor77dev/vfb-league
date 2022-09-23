import {useState, useEffect} from 'react';

import {Matches} from './matches';
import {supabase} from './supabaseClient';

export const Home = () => {
    const [players, setPlayers] = useState(null);
    const [matches, setMatches] = useState(null);

    useEffect(() => {
        // supabase.auth.getSession().then(({ data: { session } }) => {
        //   setSession(session)
        // });
    
        // supabase.auth.onAuthStateChange((_event, session) => {
        //   setSession(session)
        // });

        supabase.from('players').select('*')
            .then(({ data, error, status }) => {
                setPlayers(data);
            });

        supabase.from('matches').select('*')
            .then(({ data, error, status }) => {
                setMatches(data);
            });

    }, []);


    return (
        <>
            <Matches matches={matches}/>
        </>
    );
}
