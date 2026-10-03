import { File, Paths } from 'expo-file-system';
import { REMOTE_TIMETABLE_URL } from './timetableConfig';
import {
    CURRENT_TIMETABLE_VERSION,
    getLocalTimetable,
    TIMETABLE_DAYS,
    TIMETABLE_SLOTS,
} from './timetableAdapter';
import { validateTimetable } from './timetableValidator';

const CACHE_FILE = new File(Paths.document, 'jadwli-timetable.json');
const TEMP_CACHE_FILE = new File(Paths.document, 'jadwli-timetable.json.tmp');
const REQUEST_TIMEOUT_MS = 8000;

function compareVersions(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function asTimetable(value) {
    return {
        version: value.timetableVersion,
        entries: value.entries,
        days: value.days,
        slots: value.slots,
    };
}

async function readCachedTimetable() {
    try {
        if (!CACHE_FILE.exists) return null;
        const cached = JSON.parse(await CACHE_FILE.text());
        if (!validateTimetable(cached) || compareVersions(cached.timetableVersion, CURRENT_TIMETABLE_VERSION) <= 0) return null;
        return asTimetable(cached);
    } catch {
        return null;
    }
}

async function saveTimetable(value) {
    TEMP_CACHE_FILE.write(JSON.stringify(value));
    await TEMP_CACHE_FILE.move(CACHE_FILE, { overwrite: true });
}

export async function initializeTimetable() {
    const bundled = getLocalTimetable();
    const cached = await readCachedTimetable();
    return cached || {
        ...bundled,
        days: TIMETABLE_DAYS,
        slots: TIMETABLE_SLOTS,
    };
}

export async function checkForTimetableUpdate(current) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(REMOTE_TIMETABLE_URL, { signal: controller.signal });
        if (!response.ok) return null;
        const remote = await response.json();
        if (!validateTimetable(remote) || compareVersions(remote.timetableVersion, current.version) <= 0) return null;
        await saveTimetable(remote);
        return asTimetable(remote);
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}
