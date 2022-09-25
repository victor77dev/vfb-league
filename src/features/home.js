import {useState, useEffect} from 'react';

import {Filter} from '../components/filter';
import {TeamFilter} from '../components/teamFilter';

import {Matches} from './matches';
import {supabase} from './supabaseClient';

export const Home = ({team, setFilteredTeam}) => {
    const [matches, setMatches] = useState(null);

    useEffect(() => {
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

    return (
        <>
            <Filter>
                <TeamFilter team={team} setFilteredTeam={setFilteredTeam} />
            </Filter>
            <Matches id="home" matches={matches?.filter((match) => team[match.team - 1])}/>
        </>
    );
}
