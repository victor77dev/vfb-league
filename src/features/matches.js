import {useState, useEffect} from 'react';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

import {convertGermanDate, getDateString} from '../utils/date';
import {Filter} from '../components/filter';

const columnName = ['#', 'Team', 'Date', 'Time', 'Venue', 'Home', 'Guest'];

const TableFilter = ({columns, setFilteredColumns}) => {
    return (
        columns.map((value, index) => {
            return (
                <ToggleButton
                    className="mb-2"
                    id={columnName[index]}
                    key={columnName[index]}
                    variant="outline-primary"
                    type="checkbox"
                    value={index}
                    checked={value}
                    onChange={(e) => {
                        columns[index] = !columns[index];
                        setFilteredColumns([...columns]);
                    }}
                >
                    {columnName[index]}
                </ToggleButton>
            );
        })
    );
}

const highlightVenue = (match) => {
    if (!match.isHome) return null;

    if (match.venue.search('Plänterwald') >= 0) {
        return 'table-primary';
    } else {
        return 'table-warning';
    }
}

const AvailabilityButtons = ({match}) => {
    const [value, setValue] = useState(null);

    return (
        ['Yes', 'No', 'Maybe'].map((option, index) => {
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
                    }}
                >
                    {option}
                </ToggleButton>
            );
        })
    );
}

const row = (match, availability, columns) => {
    const array = [
        match.code, match.team, getDateString(match.date),
        match.time, match.venue, match.home, match.guest,
    ];

    return (
        <tr key={match.id} className={highlightVenue(match)}>
            {
                array.map((value, index) => {
                    if (!columns[index]) return null;

                    return <td key={value}>{value}</td>;
                })
            }
            { availability &&
                <td>
                    <ButtonGroup className="mb-2">
                        <AvailabilityButtons match={match.code}/>
                    </ButtonGroup>
                </td>
            }
        </tr>
    );
};

const TABLE_FILTER = 'TABLE_FILTER';

export const Matches = ({matches, availability}) => {
    const storedTeam = localStorage.getItem(TABLE_FILTER);

    const [columns, setFilteredColumns] = useState(storedTeam ? JSON.parse(storedTeam) : Array(columnName.length).fill(true));

    useEffect(() => {
        const stored = localStorage.getItem(TABLE_FILTER);
        const current = JSON.stringify(columns);

        if (!stored || stored !== current) {
            localStorage.setItem(TABLE_FILTER, current);
        }
    }, [columns]);

    return (
        <>
        <h2>Matches</h2>
        <h4>Select column ↓</h4>
        <Filter>
            <TableFilter columns={columns} setFilteredColumns={setFilteredColumns} />
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
                {matches && matches.map((match) => ({
                    ...match,
                    date: convertGermanDate(match.date),
                }))
                    .sort((a, b) => (a.date > b.date ? 1 : -1))
                    .map((match) => row(match, availability, columns))}
            </tbody>
        </Table>
        </>
    );
}