import ButtonGroup from 'react-bootstrap/ButtonGroup';

export const Filter = ({children}) => {
    return (
        <ButtonGroup className="mb-2">
            {children}
        </ButtonGroup>
    );
}
