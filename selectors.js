import { keyOf } from './model';

const byLabel = (a, b) => a.label.localeCompare(b.label, undefined, { numeric: true });

// Collects unique values from entries. Unique by normalized key, displays the first spelling seen.
function uniqueBy(entries, pick) {
  const map = new Map();
  for (const e of entries) {
    const v = pick(e);
    if (v == null || v === '') continue; // "Not assigned" is not a selectable value
    const k = keyOf(v);
    if (!map.has(k)) map.set(k, { key: k, label: v });
  }
  return [...map.values()].sort(byLabel);
}

// Only what really exists in the file. No sequential guessing.
export const deriveSections = (entries) => uniqueBy(entries, (e) => e.section);

export const deriveGroups = (entries, section) =>
  uniqueBy(
    entries.filter((e) => keyOf(e.section ?? '') === keyOf(section ?? '')),
    (e) => e.group
  );

export const deriveTeachers = (entries) => uniqueBy(entries, (e) => e.teacher);
export const deriveSubjects = (entries) => uniqueBy(entries, (e) => e.subject);
export const deriveTypes = (entries) => uniqueBy(entries, (e) => e.type);

export function scheduleFor(entries, section, group) {
  return entries
    .filter(
      (e) => keyOf(e.section ?? '') === keyOf(section) && keyOf(e.group ?? '') === keyOf(group)
    )
    .sort(chronological);
}

export const chronological = (a, b) => a.day - b.day || a.startMin - b.startMin;

function lectureSessionKey(entry) {
  return [
    entry.section,
    entry.subject,
    entry.day,
    entry.startMin,
    entry.endMin,
    entry.teacher,
    entry.room,
    entry.type,
    entry.typeRaw,
  ].map((value) => keyOf(value ?? '')).join('|');
}

function deduplicateSharedLectures(entries) {
  const seenLectures = new Set();
  return entries.filter((entry) => {
    if (entry.type !== 'LECTURE') return true;
    const key = lectureSessionKey(entry);
    if (seenLectures.has(key)) return false;
    seenLectures.add(key);
    return true;
  });
}

// filters = { section?: label, teacher?: key, subject?: key, type?: key }. Every provided filter must match (AND).
export function filterEntries(entries, { section, teacher, subject, type } = {}) {
  const filtered = entries
    .filter(
      (e) =>
        (!section || keyOf(e.section ?? '') === keyOf(section)) &&
        (!teacher || (e.teacher && keyOf(e.teacher) === teacher)) &&
        (!subject || (e.subject && keyOf(e.subject) === subject)) &&
        (!type || (e.type && keyOf(e.type) === type))
    )
    .sort(chronological);
  return deduplicateSharedLectures(filtered);
}

// Cascading options: choices are narrowed by the OTHER active filters, so the user
// can never pick a combination that returns zero results.
export function availableOptions(entries, filters = {}) {
  const without = (k) => filterEntries(entries, { ...filters, [k]: undefined });
  return {
    teachers: deriveTeachers(without('teacher')),
    subjects: deriveSubjects(without('subject')),
    types: deriveTypes(without('type')),
  };
}
