import timetable from './data/timetable.json';

export const CURRENT_TIMETABLE_SCHEMA_VERSION = timetable.schemaVersion;
export const TIMETABLE_DAYS = timetable.days;
export const TIMETABLE_SLOTS = timetable.slots;
export const TIMETABLE_ENTRIES = timetable.entries;
export const CURRENT_TIMETABLE_VERSION = timetable.timetableVersion;

export function getLocalTimetable() {
    return {
        version: CURRENT_TIMETABLE_VERSION,
        entries: TIMETABLE_ENTRIES,
        days: TIMETABLE_DAYS,
        slots: TIMETABLE_SLOTS,
    };
}
