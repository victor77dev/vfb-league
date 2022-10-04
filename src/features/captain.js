import {useState, useEffect} from 'react';
import Alert from 'react-bootstrap/Alert';

import {Filter} from '../components/filter';
import {PlayerList} from '../components/playerList';
import {TeamFilter} from '../components/teamFilter';

import {supabase} from './supabaseClient';

export const Captain = ({session, matches, team, setFilteredTeam}) => {
    const [players, setPlayers] = useState(null);
    const [profiles, setProfiles] = useState(null);

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
                matches={matches?.filter((match) => team[match.team - 1])}
                players={players}
                profiles={profiles}
            />
        </>
    );
}
