import NoteArray from "./NoteArray";

/**
 * Class for storing recorded notes alongside
 * meta information.
 */
export class Recording extends NoteArray {

    /**
     * Creates a new Recording
     * @param {string} name name if the song
     * @param {Date} date date of the recording
     * @param {Note[]} notes array of Note objects
     * @param {number} speed relative speed compared to ground truth, e.g. 0.5
     *      for half as fast
     * @param {number} selectedTrack track number of the ground truth to which
     *      this recording belongs
     * @param {number[]|null} timeSelection time selection of the ground truth
     *      to which this recording belongs, or null if full duration
     */
    constructor(name, date, notes, speed = 1, selectedTrack = 0, timeSelection = null) {
        super(notes);
        this.name = name;
        this.date = date;
        // Save formatted date for faster access
        this.dateString = date.toISOString().substring(0, 19).replace('T', ' ');
        this.speed = +speed;
        this.selectedTrack = +selectedTrack;
        this.timeSelection = timeSelection;
        this.sortByTime();
    }

    /**
     * Returns a copy of the Note object
     * @returns {Recording} new recording
     */
    clone() {
        return new Recording(
            this.name,
            this.date,
            this.getNotes(),
            this.speed,
            this.selectedTrack,
            this.timeSelection
        );
    }

    /**
     * Turns the recoring into a simple object with the same properties
     * @returns {Object} simple object representation of the recording
     */
    toSimpleObject() {
        return {
            name: this.name,
            date: this.date,
            notes: this.getNotes(),
            speed: this.speed,
            selectedTrack: this.selectedTrack,
            timeSelection: this.timeSelection
        }
    }

    /**
     * Creates a Note object from an object via destructuring
     * @param {Object} obj object with at least {name, data, notes, speed}
     * @returns {Recording} new note
     */
    static from(obj) {
        let { name, date, notes } = obj;
        // Check for undefined
        const values = [name, date, notes];
        const names = ['name', 'date', 'notes'];
        for (let i = 0; i < values.length; i++) {
            if (values[i] === undefined || values[i] === null) {
                console.error(`Cannot create Recording with undefined ${names[i]}`);
                return null;
            }
        }
        // Parse date if it is a string
        if (typeof (date) === 'string') {
            date = new Date(Date.parse(date));
        }
        return new Recording(
            name,
            date,
            notes,
            obj.speed,
            obj.selectedTrack,
            obj.timeSelection
        );
    }
}
