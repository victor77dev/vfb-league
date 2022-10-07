import {getDateString} from '../utils/date';

export const DisplayDetail = ({match, value, id}) => {
    switch (id) {
        case 'code':
            return (
                <p key={value}>
                    <a
                        href={`?match=${match.id}`}
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

export const Match = ({match, session}) => {
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
    );
}
