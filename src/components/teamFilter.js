import ToggleButton from 'react-bootstrap/ToggleButton';

export const TeamFilter = ({team, setFilteredTeam}) => {
    return (
        team.map((checked, index) => {
            return (
                <ToggleButton
                    className="mb-2"
                    id={`team-${index}`}
                    key={`team-${index}`}
                    variant="outline-primary"
                    type="checkbox"
                    value={index}
                    checked={checked}
                    onChange={(e) => {
                        team[index] = !team[index];
                        setFilteredTeam([...team]);
                    }}
                >
                    {`Team ${index + 1}`}
                </ToggleButton>
            );
        })
    );
}

