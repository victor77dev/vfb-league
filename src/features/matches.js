import Table from 'react-bootstrap/Table';
import {convertGermanDate, getDateString} from '../utils/date';

const highlightVenue = (match) => {
    if (!match.isHome) return null;

    if (match.venue.search('Plänterwald') >= 0) {
        return 'table-primary';
    } else {
        return 'table-warning';
    }
}

const row = (match) => {
    return (
        <tr key={match.id} className={highlightVenue(match)}>
            <td>{match.team}</td>
            <td>{getDateString(match.date)}</td>
            <td>{match.time}</td>
            <td>{match.venue}</td>
            <td>{match.home}</td>
            <td>{match.guest}</td>
        </tr>
    );
};

export const Matches = ({matches}) => {
    return (
        <>
        <div>Matches</div>
        <Table bordered>
            <thead>
                <tr>
                <th>Team</th>
                <th>Date</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Home</th>
                <th>Guest</th>
                </tr>
            </thead>
            <tbody>
                {matches && matches.map((match) => ({
                    ...match,
                    date: convertGermanDate(match.date),
                }))
                    .sort((a, b) => (a.date > b.date ? 1 : -1))
                    .map((match) => row(match))}
            </tbody>
        </Table>
        </>
    );
}