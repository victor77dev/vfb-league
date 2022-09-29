import {useState, useEffect} from 'react';

import {Filter} from '../components/filter';
import {TeamFilter} from '../components/teamFilter';

import {Matches} from './matches';
import {supabase} from './supabaseClient';

export const Home = ({team, matches, setFilteredTeam}) => {
    return (
        <>
            <Filter>
                <TeamFilter team={team} setFilteredTeam={setFilteredTeam} />
            </Filter>
            <Matches id="home" matches={matches?.filter((match) => team[match.team - 1])}/>
        </>
    );
}
