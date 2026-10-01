// Normalized internal model. The UI only ever sees this shape.
//
// ScheduleEntry {
//   id, section, group, day, startMin, endMin,
//   subject, teacher, room, type, typeRaw, raw, warnings[]
// }
// - day: 0..6 (0 = Saturday ... 6 = Friday) -> sortable, locale-independent
// - startMin/endMin: minutes from midnight -> trivially sortable/comparable
// - teacher/room/subject: string or null. null means "Not assigned" (shown by the UI,
//   never replaced by a guess)
// - type: LECTURE | TD | TP | OTHER ; typeRaw keeps the original wording ("Cours")
// - raw: original cell text, kept for debugging and the review screen

export const NOT_ASSIGNED = 'Not assigned';

export const SESSION_TYPES = {
  LECTURE: { label: 'Cours' },
  TD: { label: 'TD' },
  TP: { label: 'TP' },
  OTHER: { label: 'Other' },
};

export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Accepts "11H10", "11h10", "11:10", "8h", "08.30" -> minutes, or null.
export function parseTime(str) {
  const m = /^(\d{1,2})\s*[hH:.]\s*(\d{2})?$/.exec(String(str).trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatTime(min) {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// Used for deduplicating dropdown values: "Temam  Kamal" == "temam kamal".
export function keyOf(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function normalizeType(raw) {
  if (!raw) return { type: null, typeRaw: null };
  const k = keyOf(raw);
  if (/^(cours?|lecture|course|cm)$/.test(k)) return { type: 'LECTURE', typeRaw: raw };
  if (/^td$/.test(k)) return { type: 'TD', typeRaw: raw };
  if (/^tp$/.test(k)) return { type: 'TP', typeRaw: raw };
  return { type: 'OTHER', typeRaw: raw };
}

// Keeps the timetable identity intact when an instructor is assigned later.
export function withTeacher(entry, teacher) {
  return { ...entry, teacher: teacher?.trim() || null };
}
