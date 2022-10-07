import {useState, useEffect} from 'react';
import Alert from 'react-bootstrap/Alert';

import {Filter} from '../components/filter';
import {PlayerList} from '../components/playerList';
import {TeamFilter} from '../components/teamFilter';

import {supabase} from './supabaseClient';

export const Captain = ({session, matches, team, setFilteredTeam}) => {
    const [players, setPlayers] = useState(null);
    const [profiles, setProfiles] = useState(null);
    const [filteredMatches, setFilteredMatches] = useState(matches);

    useEffect(() => {
        supabase.from('players').select('*')
            .then(({ data }) => {
                setPlayers(data);
            });
    }, []);

    useEffect(() => {
        const getData = async (update) => {
            const {data} = await supabase.from('profiles').select('*');

            setProfiles(data);
        };

        getData();
    }, [])

    useEffect(() => {
        setFilteredMatches(matches?.filter((match) => team[match.team - 1]));
    }, [matches, team])

    const pickPlayer = async ({player, match, pick}) => {
        const {data: oldPlayers} = await supabase.from('matches')
            .select('players').eq('id', match);

        const {data} = await supabase.from('matches')
            .update({
                players: {...oldPlayers?.[0].players, [player]: pick},
            }).eq('id', match).select();

        const updatedMatch = data?.[0];
        setFilteredMatches( 
            filteredMatches.map((match) => {
            if (match.id === updatedMatch.id)
                return {...match, players: updatedMatch.players};
            else
                return match;
        }));
    }

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
            <PlayerList
                matches={filteredMatches}
                players={players}
                profiles={profiles}
                pickPlayer={pickPlayer}
            />
        </>
    );
}
