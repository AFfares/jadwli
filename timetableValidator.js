import { CURRENT_TIMETABLE_SCHEMA_VERSION } from './timetableAdapter';

const REQUIRED_ENTRY_FIELDS = [
    'id',
    'section',
    'group',
    'day',
    'startMin',
    'endMin',
    'subject',
    'teacher',
    'room',
    'type',
    'typeRaw',
    'raw',
    'warnings',
];

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function validateEntry(entry) {
    if (!isObject(entry)) return false;
    if (REQUIRED_ENTRY_FIELDS.some((field) => !(field in entry))) return false;
    if (typeof entry.id !== 'string' || !entry.id) return false;
    if (typeof entry.section !== 'string' || !entry.section) return false;
    if (typeof entry.group !== 'string' || !entry.group) return false;
    if (!Number.isInteger(entry.day) || entry.day < 0) return false;
    if (!isFiniteNumber(entry.startMin) || !isFiniteNumber(entry.endMin) || entry.endMin <= entry.startMin) return false;
    if (typeof entry.subject !== 'string' || !entry.subject) return false;
    if (entry.teacher !== null && typeof entry.teacher !== 'string') return false;
    if (typeof entry.room !== 'string' || !['LECTURE', 'TD', 'TP', 'OTHER'].includes(entry.type) || typeof entry.typeRaw !== 'string') return false;
    if (typeof entry.raw !== 'string' || !Array.isArray(entry.warnings)) return false;
    return true;
}

export function validateTimetable(value) {
    if (!isObject(value)) return false;
    if (value.schemaVersion !== CURRENT_TIMETABLE_SCHEMA_VERSION) return false;
    if (!(typeof value.timetableVersion === 'string' || isFiniteNumber(value.timetableVersion))) return false;
    if (!Array.isArray(value.days) || !Array.isArray(value.slots) || !Array.isArray(value.entries)) return false;
    if (value.days.length === 0 || value.slots.length === 0 || value.entries.length === 0) return false;
    if (value.days.some((day) => !isObject(day) || typeof day.label !== 'string' || !Number.isInteger(day.day))) return false;
    if (value.slots.some((slot) => !isObject(slot) || !isFiniteNumber(slot.startMin) || !isFiniteNumber(slot.endMin) || slot.endMin <= slot.startMin)) return false;
    if (value.entries.some((entry) => !validateEntry(entry))) return false;
    const days = new Set(value.days.map((day) => day.day));
    const slots = new Set(value.slots.map((slot) => `${slot.startMin}:${slot.endMin}`));
    if (days.size !== value.days.length || value.entries.some((entry) => !days.has(entry.day) || !slots.has(`${entry.startMin}:${entry.endMin}`))) return false;
    const ids = value.entries.map((entry) => entry.id);
    return new Set(ids).size === ids.length;
}
