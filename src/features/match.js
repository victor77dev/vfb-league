import {useState, useEffect} from 'react';

import {supabase} from './supabaseClient';

import {getDateString} from '../utils/date';

import {PickPlayer} from '../components/pickPlayer';

export const DisplayDetail = ({match, value, id}) => {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    switch (id) {
        case 'code':
            return (
                <p key={value}>
                    <a
                        href={`${baseUrl}/#/match/${match.id}`}
                    >
                        {value}
                    </a>
                </p>
            );

        case 'venue':
            return (
                <p key={value}>
                    {value}
                    (
                        <a
                            href={match.map}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <b>Map</b>
                        </a>
                    )
                </p>
            );

        default:
            return <p key={value}>{value}</p>;
    }
};

export const Match = ({match, isCaptain}) => {
    const [players, setPlayers] = useState(null);

    useEffect(() => {
        supabase.from('players').select('*')
            .then(({ data }) => {
                setPlayers(data);
            });
    }, []);

    if (!match) return null;

    const {code, team, date, time, venue, home, guest} = match;
    const array = {
        code, team, date: getDateString(date),
        time, venue, home, guest,
    };

    const headerStyles = {
        textTransform: 'capitalize',
    }

    return (
        <>
            {
                Object.keys(array).map((key) => {
                    const value = array[key];
                    return (
                        <div key={`${match.id}-${key}`}>
                            <h3
                                style={headerStyles}
                            >
                                {key}
                            </h3>
                            <DisplayDetail
                                match={match}
                                value={value}
                                id={key}
                            />
                        </div>
                    );
                })
            }
            <PickPlayer
                match={match}
                players={players}
                isCaptain={isCaptain}
            />
        </>
    );
}
