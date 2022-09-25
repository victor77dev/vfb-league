import ToggleButton from 'react-bootstrap/ToggleButton';

import {columnName} from "../features/matches";

export const TableFilter = ({id, columns, setFilteredColumns}) => {
    return (
        columns.map((value, index) => {
            return (
                <ToggleButton
                    className="mb-2"
                    id={`${id}-${columnName[index]}`}
                    key={`${id}-${columnName[index]}`}
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

