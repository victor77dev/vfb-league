import {useState, useEffect} from 'react';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

import {getDateString} from '../utils/date';
import {Filter} from '../components/filter';
import {TableFilter} from '../components/tableFilter';
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

const AvailabilityButtons = ({match, availability, setMatchAvailability}) => {
    const [value, setValue] = useState(availability);

    useEffect(() => {
        setValue(availability);
    }, [availability]);

    return (
        ['Yes', 'No', 'Maybe'].map((option) => {
            return (
                <ToggleButton
                    className="mb-2"
                    id={`${match}-${option}`}
                    key={`${match}-${option}`}
                    variant="outline-primary"
                    type="radio"
                    value={option}
                    checked={option === value}
                    onChange={(e) => {
                        setValue(option);
                        setMatchAvailability(option);
                    }}
                >
                    {option}
                </ToggleButton>
            );
        })
    );
}

const Row = ({match, availability, columns, setMatchAvailability}) => {
    const {code, team, date, time, venue, home, guest} = match;
    const array = {
        code, team, date: getDateString(date),
        time, venue, home, guest,
    };

    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    return (
        <tr key={match.id} className={highlightVenue(match)}>
            {
                Object.keys(array).map((key, index) => {
                    const value = array[key];

                    if (!columns[index]) return null;

                    switch (key) {
                        case 'code':
                            return (
                                <td key={value}>
                                    <a
                                        href={`${baseUrl}/match/${match.id}`}
                                    >
                                        {value}
                                    </a>
                                </td>
                            );

                        case 'venue':
                            return (
                                <td key={value}>
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
                                </td>
                            );

                        default:
                            return <td key={value}>{value}</td>;
                    }
                })
            }
            { !!setMatchAvailability &&
                <td>
                    <ButtonGroup className="mb-2">
                        <AvailabilityButtons
                            match={match.id}
                            availability={availability}
                            setMatchAvailability={setMatchAvailability}
                        />
                    </ButtonGroup>
                </td>
            }
        </tr>
    );
};

export const Matches = ({matches, availability, id, setAvailability}) => {
    const TABLE_FILTER = `TABLE_FILTER-${id}`;
    const storedTeam = localStorage.getItem(TABLE_FILTER);

    const [columns, setFilteredColumns] = useState(storedTeam ? JSON.parse(storedTeam) : Array(columnName.length).fill(true));
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const setMatchAvailability = (match) => (option) => {
        if (match) {
            setAvailability({
                ...availability,
                [match]: option,
            })
        }
    }

    useEffect(() => {
        const stored = localStorage.getItem(TABLE_FILTER);
        const current = JSON.stringify(columns);

        if (!stored || stored !== current) {
            localStorage.setItem(TABLE_FILTER, current);
        }
    }, [columns, TABLE_FILTER]);

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
                        {
                            columnName.map((column, index) => {
                                if (!columns[index]) return null;

                                return <th key={column}>{column}</th>;
                            })
                        }
                        {
                            availability &&
                            <th>Availability</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {matches && matches
                        .filter((match) => match.date >= new Date(date))
                        .sort((a, b) => {
                            if (a.date.getTime() !== b.date.getTime()) {
                                return a.date > b.date ? 1 : -1;
                            } else {
                                return a.time > b.time ? 1 : -1
                            }
                        })
                        .map((match) => (
                            <Row
                                key={`row-${match.id}`}
                                match={match}
                                availability={availability?.[match.id]}
                                columns={columns}
                                setMatchAvailability={setAvailability ? setMatchAvailability(match.id) : null}
                            />
                        ))}
                </tbody>
            </Table>
        </>
    );
}