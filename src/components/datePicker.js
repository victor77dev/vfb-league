const styles = {
    padding: 3,
};

export const DatePicker = ({setDate, date}) => {
    return (
        <div style={styles}>
            From <input
                type="date"
                value={date}
                onChange={(e) => {
                    setDate(e.target.value);
                }}
            />
        </div>
    );
}
