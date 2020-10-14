/**
 * Formats a Date to a string with format
 *      YYYY-mm-DDTHH:MM:SS
 * or when replaceT == true
 *      YYYY-mm-DD HH:MM:SS
 * @param {Date} date
 * @returns {string} formatted date
 */
export function formatDate(date, replaceT = false, keepMillis = true) {
    let str = date.toISOString()
        .split(':').join('-');
    if (!keepMillis) {
        str = str.slice(0, str.indexOf('.'));
    }
    if (replaceT) {
        str = str.replace('T', ' ');
    }
    return str;
}
