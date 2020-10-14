import { group } from "d3-array";
import { hsl } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
import { flattenArray } from "./utils/ArrayUtils";


/**
 * Converts beats per minute to seconds per beat
 * @param {number} bpm tempo in beats per minute
 * @returns {number} seconds per beat
 */
export function bpmToSecondsPerBeat(bpm) {
    return 1 / (bpm / 60);
}

/**
 * Clones a map where the values are flat objects,
 * i.e. values do not contain objects themselfes.
 * @param {Map} map a map with object values
 * @returns {Map} a copy of the map with copies of the value objects
 */
export function deepCloneFlatObjectMap(map) {
    const result = new Map();
    map.forEach((value, key) => {
        result.set(key, { ...value });
    });
    return result;
}

/**
 * Groups the Notes from multiple tracks
 * @param {Note[][]} tracks array of arrays of Note objects
 * @returns {Map} grouping
 */
export function groupNotesByPitch(tracks) {
    let allNotes = flattenArray(tracks);
    return group(allNotes, d => d.pitch);
}

/**
 * Formats a time in seconds to <minutes>:<seconds>.<milliseconds>
 * @param {number|null} seconds in seconds
 * @param {boolean} includeMillis include milli seconds in string?
 * @returns {string} 0-padded time string <minutes>:<seconds>.<milliseconds>
 */
export function formatTime(seconds, includeMillis = true) {
    if (seconds === undefined || seconds === null) {
        return includeMillis ? '--:--.---' : '--:--';
    }
    const s = Math.floor(seconds);
    let min = (Math.floor(s / 60)).toString();
    let sec = (s % 60).toString();
    min = min.length < 2 ? `0${min}` : min;
    sec = sec.length < 2 ? `0${sec}` : sec;
    if (!includeMillis) {
        return `${min}:${sec}`;
    }
    let ms = (Math.floor((seconds - s) * 1000)).toString();
    if (ms.length < 2) {
        ms = `00${ms}`;
    } else if (ms.length < 3) {
        ms = `0${ms}`;
    }
    return `${min}:${sec}.${ms}`;
}

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

/**
 * Formats the song title (e.g. remove file extension and shorten)
 * @param {string} title song title
 * @param {number} maxLength shorten to this length
 * @returns {string} formatted song title
 */
export function formatSongTitle(title, maxLength = 30) {
    if (!title) {
        return '[No Song]';
    }
    // Remove file extension
    if (title.lastIndexOf('.') !== -1) {
        title = title.slice(0, title.lastIndexOf('.'));
    }
    // Shorten
    if (title.length > maxLength) {
        title = `${title.slice(0, maxLength - 3)}...`;
    }
    return title;
}

/**
 * From an array of Notes, kepp only the highest pitched note of each 'chord'
 * of notes where a chord is simply all notes that start at the same time.
 * @param {Note[]} notes array with Note objects
 * @returns {Note[]} notes array with filtered Note objects
 */
export function keepOnlyHighestConcurrentNotes(notes) {
    const grp = Array.from(group(notes, d => d.start));
    grp.sort((a, b) => a.start - b.start);

}

/**
 * Sorts notes by time and pitch, then maps them to an array of their pitches.
 * @param {Note[]} notes array with Note objects
 * @returns {number[]} array of note pitches
 */
export function noteArrayToPitchSequence(notes) {
    return notes
        .sort((a, b) => {
            if (a.start === b.start) {
                return a.pitch - b.pitch;
            }
            return a.start - b.start;
        })
        .map(d => d.pitch);
}

/**
 * Sorts notes by time and pitch, then turns them into a string by turning each
 * note's pitch into a character (based on Unicode index).
 * @param {Note[]} notes array with Note objects
 * @returns {string} string representation of note pitches
 */
export function noteArrayToString(notes) {
    const sequence = noteArrayToPitchSequence(notes);
    return String.fromCharCode(...sequence);
}

/**
 * Takes a sequence of MIDI pitches and nomralizes them to be in [0, 11]
 * @param {number[]} pitchSequence array with MIDI pitches
 * @returns {number[]} intervals
 */
export function pitchSequenceWithoutOctaves(pitchSequence) {
    return pitchSequence.map(d => d % 12);
}

/**
 * Transforms note pitches to intervals, i.e. diffrences between to subsequent
 * notes: C, C#, C, D => 1, -1, 2
 * @param {number[]} pitchSequence array with MIDI pitches
 * @returns {number[]} intervals
 */
export function pitchSequenceToInvervals(pitchSequence) {
    const result = new Array(pitchSequence.length - 1);
    for (let i = 1; i < pitchSequence.length; i++) {
        result.push(pitchSequence[i] - pitchSequence[i - 1]);
    }
    return result;
}



/**
 * Maps each note to a color
 * Colors from https://www.svpwiki.com/music+note+or+sound+colors
 * Order is C, C#, ... B
 */
const noteColormap = [
    '#ff0000',
    '#ff4e00',
    '#db7b00',
    '#ffcc00',
    '#e4ed00',
    '#81d700',
    '#00ffb4',
    '#00ffea',
    '#00baff',
    '#3c00ff',
    '#a800ff',
    '#ff00fd',
].map(d => {
    // Make colors less saturated
    const c = hsl(d);
    c.s = 0.5;
    return c.toString();
});
/**
 * Colorblind save colors from
 * Malandrino et al. - Visualization and Music Harmony: Design, Implementation,
 * and Evaluation https://ieeexplore.ieee.org/abstract/document/8564210
 * Order is C, C#, ... B
 */
// export const noteColormapAccessible = new Map([
//     ['C', '#9AEBFF'],
//     ['C#', '#ADD5FF'],
//     ['D', '#D6D6FF'],
//     ['D#', '#EBD5FF'],
//     ['E', '#FFC2EB'],
//     ['F', '#FFCBCC'],
//     ['F#', '#FFD5C2'],
//     ['G', '#FFEBC2'],
//     ['G#', '#EBFFC2'],
//     ['A', '#C2D599'],
//     ['A#', '#99EBBE'],
//     ['B', '#ADEBEB'],
// ]);
const noteColormapAccessible = [
    '#6699FF',
    '#66FFFF',
    '#000000',
    '#647878',
    '#993366',
    '#FF0000',
    '#FFCC99',
    '#FFFF01',
    '#FF9900',
    '#009900',
    '#66FF99',
    '#0000CC',
];
// Gradient color map from black to steelblue
const colorInterpolator = interpolateRgb('black', 'steelblue');
const noteColormapGradientArray = new Array(12).fill(0).map((d, i) => colorInterpolator(i / 11));

/**
 * Returns the note color depending on the given pitch.
 * (Simplifies note color lookup by looking up the color for pitch%12.)
 * @param {number} pitch MIDI pitch in [0, 127]
 * @param {string} colormap one of 'default', 'accessible', 'gradient'
 * @returns {string} color code
 */
export function noteColorFromPitch(pitch, colormap = 'default') {
    switch (colormap) {
        case 'accessible':
            return noteColormapAccessible[pitch % 12];
        case 'gradient':
            return noteColormapGradientArray[pitch % 12];
        default:
            return noteColormap[pitch % 12];
    }
}

/**
 * Reverses a given string.
 * @param {string} s string
 * @returns {string} reversed string
 */
export function reverseString(s) {
    return s.split('').reverse().join('');
}

/**
 * Given some notes and a target note, finds
 * the note that has its start time closest to
 * the one of targetNote
 * @param {Note[]} notes
 * @param {Note} targetNote
 * @returns {Note} closest note to targetNote
 */
export function findNearest(notes, targetNote) {
    let nearest = null;
    let dist = Infinity;
    const targetStart = targetNote.start;
    for (let n of notes) {
        const newDist = Math.abs(n.start - targetStart);
        if (newDist < dist) {
            dist = newDist;
            nearest = n;
        }
    }
    return nearest;
}
