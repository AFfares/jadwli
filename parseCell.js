import { parseTime, normalizeType, keyOf } from './model';

const TIME_RANGE = /(\d{1,2}\s*[hH:.]\s*\d{2})\s*[-–—to]+\s*(\d{1,2}\s*[hH:.]\s*\d{2})/;
const NOT_ASSIGNED_RE = /^(not assigned|non assign[eé]e?|n\/a|-+|—)$/i;
const TYPE_RE = /^(cours?|lecture|course|cm|td|tp)$/i;
const ROOM_HINT = /^(room|salle|lab|amphi(th[eé][aâ]tre)?|labo)\b|\b(room|salle|lab|amphi)\s*\d+$/i;

/**
 * Turns the text lines of ONE timetable cell into a ScheduleEntry (minus section/group/day,
 * which come from the grid layout). Does not rely on the grid, only on the cell content,
 * so it works for any table layout the extractor produces.
 *
 * ctx.knownRooms: Set of keyOf(room) learned from the whole document (rooms repeat a lot);
 * it lets us recognise a room like "Geology" that no regex could.
 */
export function parseCell(lines, ctx = {}) {
  const warnings = [];
  const raw = lines.join('\n');
  const free = [];
  let startMin = null;
  let endMin = null;
  let typeInfo = { type: null, typeRaw: null };

  for (const line of lines.map((l) => l.trim()).filter(Boolean)) {
    const t = TIME_RANGE.exec(line);
    if (t && startMin == null) {
      startMin = parseTime(t[1]);
      endMin = parseTime(t[2]);
      continue;
    }
    if (TYPE_RE.test(line)) {
      typeInfo = normalizeType(line);
      continue;
    }
    free.push(line);
  }

  // Field hints allow missing teacher/room lines without shifting the remaining values.
  const slots = free.map((line) => ({
    value: NOT_ASSIGNED_RE.test(line) ? null : line,
    isRoom: ROOM_HINT.test(line) || ctx.knownRooms?.has(keyOf(line)),
  }));
  const subjectSlot = slots.shift();
  const subject = subjectSlot?.value ?? null;
  let teacher = null;
  let room = null;

  for (const slot of slots) {
    if (slot.value == null) continue;
    if (slot.isRoom && room == null) room = slot.value;
    else if (teacher == null) teacher = slot.value;
    else if (room == null) room = slot.value;
    else warnings.push('extra lines ignored');
  }

  if (slots.length < 2) warnings.push('one of teacher/room missing');

  if (subject == null) warnings.push('subject missing');
  if (startMin == null || endMin == null) warnings.push('time missing');
  if (!typeInfo.type) warnings.push('type missing');

  return { subject, teacher, room, ...typeInfo, startMin, endMin, raw, warnings };
}

// Pass 1 helper: collect repeated tokens so pass 2 can recognise rooms by vocabulary.
export function learnRooms(cells) {
  const counts = new Map();
  for (const lines of cells) {
    const free = lines.map((l) => l.trim()).filter(
      (l) => l && !TIME_RANGE.test(l) && !TYPE_RE.test(l) && !NOT_ASSIGNED_RE.test(l)
    );
    const candidates = free.filter((line) => ROOM_HINT.test(line));
    for (const candidate of candidates) {
      const k = keyOf(candidate);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
  }
  return new Set(counts.keys());
}
