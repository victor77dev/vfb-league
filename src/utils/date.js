export const convertGermanDate = (date) => {
    const updated = date.split('.').reverse().join('-');

    return new Date(updated);
}

export const getDateString = (date) => {
    let locale = navigator.language || 'de';

    return `${date.toLocaleDateString(locale, {weekday: 'short'})} ${date.toLocaleDateString(locale)}`;
}
