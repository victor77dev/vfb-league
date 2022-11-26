import {useState, useEffect} from 'react';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import {getDateString} from '../utils/date';
import {Filter} from './filter';
import {TableFilter} from './tableFilter';
import {DatePicker} from '../components/datePicker';

export const columnName = ['#', 'Team', 'Date', 'Time', 'Venue', 'Home', 'Guest'];

const highlightVenue = (match) => {
    if (!match.isHome) return null;

    if (match.venue.search('Plänterwald') >= 0) {
        return 'table-primary';
    } else {
        return 'table-warning';
    }
}

const AvailabilityButtons = ({match, availability, pickPlayer, player, selected}) => {
    const [value, setValue] = useState(availability);

    const white = {
        color: 'white',
    };

    useEffect(() => {
        setValue(availability);
    }, [availability]);

    return (
        <>
            <p style={availability !== 'Maybe' ? white : null}>{value}</p>
            <Button
                onClick={() => {pickPlayer({match, player, pick: !selected})}}
                variant={selected ? 'success': 'primary'}
            >
                {selected ? 'Selected': 'Select'}
            </Button>
        </>
    );
}

const MatchHeader = ({children}) => {
    const styles = {
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        width: 150,
        height: 50,
        overflow: 'hidden',
    };
    return (
        <div style={styles}>{children}</div>

    );
}

const ColumnHeader = ({children, className}) => {
    const styles = {
        padding: 0,
    };

    return (
        <th valign="top" style={styles} className={className}>
            {children}
        </th>
    );
};


const Column = ({match, columns}) => {
    const {code, team, date, time, venue, home, guest} = match;
    const array = {
        code, team, date: getDateString(date),
        time, venue, home, guest,
    };

    const styles = {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    };

    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    return (
        <ColumnHeader className={highlightVenue(match)}>
            <div style={styles}>
                {
                    Object.keys(array).map((key, index) => {
                        const value = array[key];

                        if (!columns[index]) return null;

                        switch (key) {
                            case 'code':
                                return (
                                    <MatchHeader key={value}>
                                        <a
                                            href={`${baseUrl}/match/${match.id}`}
                                        >
                                            {value}
                                        </a>
                                    </MatchHeader>
                                );

                            case 'venue':
                                return (
                                    <MatchHeader key={value}>
                                        <a
                                            href={match.map}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {value}
                                        </a>
                                    </MatchHeader>
                                );

                            default:
                                return <MatchHeader key={value}>{value}</MatchHeader>;
                        }
                    })
                }
            </div>
        </ColumnHeader>
    );
};

const Row = ({matches, columns, player, profile, pickPlayer}) => {
    const array = [
        player.name, player.single, player.double, player.team === 0 ? '' : player.team,
    ];

    const green = {
        backgroundColor: 'green',
    }

    const red = {
        backgroundColor: 'red',
    }

    const yellow = {
        backgroundColor: 'yellow',
    }

    const availability = profile?.availability;

    return (
        <>
            <tr key={player.id} >
                {
                    array.map((value, index) => {
                        if (!columns[index]) return null;

                        return <td key={`${player.id}-${index}`}>{value}</td>;
                    })
                }
                {
                    matches && matches.map((match) => {
                        const playerAvailability = availability ? availability[match.id] : null;
                        const selected = match?.players?.[player.id];

                        let styles;
                        switch (playerAvailability) {
                            case 'Yes':
                                styles = green;
                                break;

                            case 'No':
                                styles = red;
                                break;

                            case 'Maybe':
                                styles = yellow;
                                break;

                            default:
                                styles = null;
                        }

                        return (
                            <td
                                key={`${player.id}-${match.id}`}
                                style={styles}
                            >
                                <AvailabilityButtons
                                    match={match.id}
                                    availability={playerAvailability}
                                    player={player.id}
                                    pickPlayer={pickPlayer}
                                    selected={selected}
                                />
                            </td>
                        );
                    })
                }
            </tr>
        </>
    );
};

export const PlayerList = ({matches, players, profiles, pickPlayer}) => {
    const id = 'CAPTAIN';
    const TABLE_FILTER = `TABLE_FILTER-${id}`;
    const storedTeam = localStorage.getItem(TABLE_FILTER);

    const [columns, setFilteredColumns] = useState(storedTeam ? JSON.parse(storedTeam) : Array(columnName.length).fill(true));
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [filteredMatches, setFilteredMatches] = useState(matches);

    useEffect(() => {
        const stored = localStorage.getItem(TABLE_FILTER);
        const current = JSON.stringify(columns);

        if (!stored || stored !== current) {
            localStorage.setItem(TABLE_FILTER, current);
        }
    }, [columns, TABLE_FILTER]);

    useEffect(() => {
        setFilteredMatches(matches.filter((match) => match.date >= new Date(date)));
    }, [date, matches]);

    const female = players?.filter((a) => (a.gender === 'F'));
    const male = players?.filter((a) => (a.gender === 'M'));

    const columnSpan = matches.length + 3;

    return (
        <>
            <h2>Matches</h2>
            <DatePicker setDate={setDate} date={date} />
            <h4>Select column ↓</h4>
            <Filter>
                <TableFilter id={id} columns={columns} setFilteredColumns={setFilteredColumns} />
            </Filter>
            <Table bordered responsive hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Single</th>
                        <th>Double</th>
                        <th>Team</th>
                        {filteredMatches && filteredMatches
                            .map((match) => (
                                <Column
                                    key={`row-${match.id}`}
                                    match={match}
                                    columns={columns}
                                />
                            ))}
                    </tr>
                </thead>
                <tbody>
                    <tr><td colSpan={columnSpan}><b>Female</b></td></tr>
                    {
                        female?.sort((a, b) => (a.single > b.single ? 1 : -1))
                            .map((player) => {
                                const profile = profiles?.find((obj) => player.id === obj.player);

                                return (
                                    <Row
                                        key={`row-${player.id}`}
                                        columns={columns}
                                        player={player}
                                        profile={profile}
                                        matches={filteredMatches}
                                        pickPlayer={pickPlayer}
                                    />
                                );
                            })
                    }
                    <tr><td colSpan={columnSpan}><b>Male</b></td></tr>
                    {
                        male?.sort((a, b) => (a.single > b.single ? 1 : -1))
                            .map((player) => {
                                const profile = profiles?.find((obj) => player.id === obj.player);

                                return (
                                    <Row
                                        key={`row-${player.id}`}
                                        matches={filteredMatches}
                                        columns={columns}
                                        player={player}
                                        profile={profile}
                                        pickPlayer={pickPlayer}
                                    />
                                );
                            })
                    }
                </tbody>
            </Table>
        </>
    );
}
