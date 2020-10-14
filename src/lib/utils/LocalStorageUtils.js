/**
 * Stringifies an object and stores it in the localStorage
 * @param {string} key key
 * @param {Object} obj JSON compatible object
 */
export function storeObjectInLocalStorage(key, obj) {
    const str = JSON.stringify(obj);
    localStorage.setItem(key, str);
}

/**
 * Retrieves a stringified object from the localStorage and parses it.
 * @param {string} key key
 * @returns {Object|null} object or null of not possible
 */
export function getObjectFromLocalStorage(key) {
    try {
        const str = localStorage.getItem(key);
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}
