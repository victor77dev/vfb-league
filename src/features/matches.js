import {useState} from 'react';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

import {convertGermanDate, getDateString} from '../utils/date';

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

const row = (match, availability) => {
    return (
        <tr key={match.id} className={highlightVenue(match)}>
            <td>{match.code}</td>
            <td>{match.team}</td>
            <td>{getDateString(match.date)}</td>
            <td>{match.time}</td>
            <td>{match.venue}</td>
            <td>{match.home}</td>
            <td>{match.guest}</td>
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

export const Matches = ({matches, availability}) => {
    return (
        <>
        <h2>Matches</h2>
        <Table bordered responsive hover>
            <thead>
                <tr>
                <th>#</th>
                <th>Team</th>
                <th>Date</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Home</th>
                <th>Guest</th>
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
                    .map((match) => row(match, availability))}
            </tbody>
        </Table>
        </>
    );
}