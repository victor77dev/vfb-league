import {useState, useEffect} from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';

import {Filter} from '../components/filter';

import {Matches} from './matches';
import {supabase} from './supabaseClient';

const TeamFilter = ({team, setFilteredTeam}) => {
    return (
        team.map((checked, index) => {
            return (
                <ToggleButton
                    className="mb-2"
                    id={`team-${index}`}
                    key={`team-${index}`}
                    variant="outline-primary"
                    type="checkbox"
                    value={index}
                    checked={checked}
                    onChange={(e) => {
                        team[index] = !team[index];
                        setFilteredTeam([...team]);
                    }}
                >
                    {`Team ${index + 1}`}
                </ToggleButton>
            );
        })
    );
}

const TEAM_FILTER = 'TeamFilter';

export const Home = () => {
    const storedTeam = localStorage.getItem(TEAM_FILTER);

    const [players, setPlayers] = useState(null);
    const [matches, setMatches] = useState(null);
    const [team, setFilteredTeam] = useState(storedTeam ? JSON.parse(storedTeam) : Array(6).fill(true));

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

    useEffect(() => {
        const stored = localStorage.getItem(TEAM_FILTER);
        const current = JSON.stringify(team);
        console.log(stored, current)

        if (!stored || stored !== current) {
            localStorage.setItem(TEAM_FILTER, current);
        }
    }, [team]);

    return (
        <>
            <Filter>
                <TeamFilter team={team} setFilteredTeam={setFilteredTeam} />
            </Filter>
            <Matches matches={matches?.filter((match) => team[match.team - 1])}/>
        </>
    );
}
