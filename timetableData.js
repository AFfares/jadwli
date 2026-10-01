import { formatTime } from './model';

const SECTION = 'L3 - SI';
const SLOT_TIMES = [
    [8 * 60, 9 * 60 + 30],
    [9 * 60 + 35, 11 * 60 + 5],
    [11 * 60 + 10, 12 * 60 + 40],
    [12 * 60 + 45, 14 * 60 + 15],
    [14 * 60 + 20, 15 * 60 + 50],
];

const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export const CURRENT_TIMETABLE_VERSION = '2026-10-01-v1';

function entry(group, day, slot, subject, teacher, room, type, typeRaw) {
    const [startMin, endMin] = SLOT_TIMES[slot];
    return {
        id: `${group}-${day}-${slot}-${subject}`,
        section: SECTION,
        group,
        day,
        startMin,
        endMin,
        subject,
        teacher: teacher === 'Not assigned' ? null : teacher,
        room,
        type,
        typeRaw,
        raw: `${dayNames[day]} ${formatTime(startMin)}-${formatTime(endMin)}\n${subject}\n${teacher}\n${room}\n${typeRaw}`,
        warnings: teacher === 'Not assigned' ? ['teacher not assigned in source timetable'] : [],
    };
}

const LECTURE = ['LECTURE', 'Lecture (in person)'];
const ONLINE = ['LECTURE', 'Lecture (online)'];
const TD = ['TD', 'Tutorial (TD)'];
const TP = ['TP', 'Lab (TP)'];

// Transcribed from all five supplied timetable pages. Empty PDF cells are intentionally absent.
const sourceRows = [
    ['G1', 0, 0, 'Operating Systems 2', 'Tilmatine Anis', 'LAB 5', TP],
    ['G1', 0, 1, 'Probability and Statistics', 'Temam Kamal', 'ROOM 2', TD],
    ['G1', 1, 0, 'Operating Systems 2', 'Not assigned', 'science B', LECTURE],
    ['G1', 1, 2, 'Probability and Statistics', 'Temam Kamal', 'Geology', LECTURE],
    ['G1', 1, 3, 'Operating Systems 2', 'Not assigned', 'ROOM 6', TD],
    ['G1', 2, 0, 'Compiler Design', 'Not assigned', 'No room', TP],
    ['G1', 2, 1, 'Software Engineering', 'Djaghbellou Soumia', 'ROOM 3', TD],
    ['G1', 3, 1, 'Software Engineering', 'Not assigned', 'No room', TP],
    ['G1', 3, 2, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G1', 3, 3, 'Human-Computer Interaction', 'Not assigned', 'No room', TP],
    ['G1', 4, 0, 'Compiler Design', 'Baghli Raouida', 'Hygiene', LECTURE],
    ['G1', 4, 1, 'Human-Computer Interaction', 'Not assigned', 'Benbadis', LECTURE],
    ['G1', 4, 3, 'Compiler Design', 'Baghli Raouida', 'ROOM 1', TD],
    ['G1', 4, 4, 'Human-Computer Interaction', 'Not assigned', 'ROOM 5', TD],
    ['G1', 5, 0, 'Linear Programming', 'Ait abdesslam Maya', 'Benbadis', LECTURE],
    ['G1', 5, 1, 'Software Engineering', 'Djaghbellou Soumia', 'A', LECTURE],
    ['G1', 5, 2, 'Linear Programming', 'Not assigned', 'ROOM 5', TD],

    ['G2', 0, 0, 'Probability and Statistics', 'Temam Kamal', 'ROOM 6M', TD],
    ['G2', 0, 2, 'Operating Systems 2', 'Marouf Mohamed Rachid', 'LAB 1', TP],
    ['G2', 1, 0, 'Operating Systems 2', 'Not assigned', 'science B', LECTURE],
    ['G2', 1, 1, 'Operating Systems 2', 'Not assigned', 'ROOM 6', TD],
    ['G2', 1, 2, 'Probability and Statistics', 'Temam Kamal', 'Geology', LECTURE],
    ['G2', 2, 0, 'Linear Programming', 'Not assigned', 'ROOM 5M', TD],
    ['G2', 2, 1, 'Compiler Design', 'Not assigned', 'No room', TP],
    ['G2', 2, 3, 'Software Engineering', 'Djaghbellou Soumia', 'ROOM 5M', TD],
    ['G2', 3, 1, 'Software Engineering', 'Not assigned', 'No room', TP],
    ['G2', 3, 2, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G2', 3, 3, 'Human-Computer Interaction', 'Not assigned', 'No room', TP],
    ['G2', 4, 0, 'Compiler Design', 'Baghli Raouida', 'Hygiene', LECTURE],
    ['G2', 4, 1, 'Human-Computer Interaction', 'Not assigned', 'Benbadis', LECTURE],
    ['G2', 4, 2, 'Compiler Design', 'Baghli Raouida', 'ROOM 1', TD],
    ['G2', 4, 4, 'Human-Computer Interaction', 'Not assigned', 'ROOM 5', TD],
    ['G2', 5, 0, 'Linear Programming', 'Ait abdesslam Maya', 'Benbadis', LECTURE],
    ['G2', 5, 1, 'Software Engineering', 'Djaghbellou Soumia', 'A', LECTURE],

    ['G3', 0, 0, 'Linear Programming', 'Not assigned', 'ROOM 6', TD],
    ['G3', 0, 2, 'Operating Systems 2', 'Tilmatine Anis', 'ROOM 3', TD],
    ['G3', 0, 3, 'Probability and Statistics', 'Temam Kamal', 'ROOM 2', TD],
    ['G3', 0, 4, 'Operating Systems 2', 'Marouf Mohamed Rachid', 'LAB 1', TP],
    ['G3', 1, 0, 'Operating Systems 2', 'Not assigned', 'science B', LECTURE],
    ['G3', 1, 2, 'Probability and Statistics', 'Temam Kamal', 'Geology', LECTURE],
    ['G3', 2, 0, 'Compiler Design', 'Baghli Raouida', 'ROOM 6M', TD],
    ['G3', 2, 2, 'Compiler Design', 'Not assigned', 'No room', TP],
    ['G3', 3, 1, 'Software Engineering', 'Not assigned', 'No room', TP],
    ['G3', 3, 2, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G3', 3, 3, 'Human-Computer Interaction', 'Not assigned', 'No room', TP],
    ['G3', 4, 0, 'Compiler Design', 'Baghli Raouida', 'Hygiene', LECTURE],
    ['G3', 4, 1, 'Human-Computer Interaction', 'Not assigned', 'Benbadis', LECTURE],
    ['G3', 4, 2, 'Human-Computer Interaction', 'Not assigned', 'ROOM 5', TD],
    ['G3', 5, 0, 'Linear Programming', 'Ait abdesslam Maya', 'Benbadis', LECTURE],
    ['G3', 5, 1, 'Software Engineering', 'Djaghbellou Soumia', 'A', LECTURE],
    ['G3', 5, 2, 'Software Engineering', 'Djaghbellou Soumia', 'ROOM 1', TD],

    ['G4', 0, 0, 'Operating Systems 2', 'Marouf Mohamed Rachid', 'LAB 4', TP],
    ['G4', 0, 1, 'Linear Programming', 'Not assigned', 'ROOM 5', TD],
    ['G4', 0, 2, 'Compiler Design', 'Not assigned', 'No room', TP],
    ['G4', 0, 4, 'Operating Systems 2', 'Tilmatine Anis', 'ROOM 3', TD],
    ['G4', 1, 0, 'Operating Systems 2', 'Not assigned', 'science B', LECTURE],
    ['G4', 1, 1, 'Probability and Statistics', 'Temam Kamal', 'ROOM 2', TD],
    ['G4', 1, 2, 'Probability and Statistics', 'Temam Kamal', 'Geology', LECTURE],
    ['G4', 3, 1, 'Software Engineering', 'Not assigned', 'No room', TP],
    ['G4', 3, 2, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G4', 3, 3, 'Human-Computer Interaction', 'Not assigned', 'No room', TP],
    ['G4', 4, 0, 'Compiler Design', 'Baghli Raouida', 'Hygiene', LECTURE],
    ['G4', 4, 1, 'Human-Computer Interaction', 'Not assigned', 'Benbadis', LECTURE],
    ['G4', 4, 2, 'Human-Computer Interaction', 'Not assigned', 'ROOM 5', TD],
    ['G4', 4, 4, 'Compiler Design', 'Baghli Raouida', 'ROOM 1', TD],
    ['G4', 5, 0, 'Linear Programming', 'Ait abdesslam Maya', 'Benbadis', LECTURE],
    ['G4', 5, 1, 'Software Engineering', 'Djaghbellou Soumia', 'A', LECTURE],
    ['G4', 5, 3, 'Software Engineering', 'Djaghbellou Soumia', 'ROOM 1', TD],

    ['G5', 0, 0, 'Compiler Design', 'Not assigned', 'No room', TP],
    ['G5', 0, 1, 'Operating Systems 2', 'Marouf Mohamed Rachid', 'LAB 4', TP],
    ['G5', 0, 3, 'Operating Systems 2', 'Tilmatine Anis', 'ROOM 3', TD],
    ['G5', 0, 4, 'Probability and Statistics', 'Temam Kamal', 'ROOM 2', TD],
    ['G5', 1, 0, 'Operating Systems 2', 'Not assigned', 'science B', LECTURE],
    ['G5', 1, 2, 'Probability and Statistics', 'Temam Kamal', 'Geology', LECTURE],
    ['G5', 2, 0, 'Software Engineering', 'Djaghbellou Soumia', 'ROOM 3', TD],
    ['G5', 2, 1, 'Linear Programming', 'Not assigned', 'ROOM 1', TD],
    ['G5', 2, 2, 'Compiler Design', 'Baghli Raouida', 'ROOM 5M', TD],
    ['G5', 3, 1, 'Software Engineering', 'Not assigned', 'No room', TP],
    ['G5', 3, 2, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G5', 3, 3, 'Human-Computer Interaction', 'Not assigned', 'No room', TP],
    ['G5', 4, 0, 'Compiler Design', 'Baghli Raouida', 'Hygiene', LECTURE],
    ['G5', 4, 1, 'Human-Computer Interaction', 'Not assigned', 'Benbadis', LECTURE],
    ['G5', 4, 2, 'Human-Computer Interaction', 'Not assigned', 'ROOM 5', TD],
    ['G5', 5, 0, 'Linear Programming', 'Ait abdesslam Maya', 'Benbadis', LECTURE],
    ['G5', 5, 1, 'Software Engineering', 'Djaghbellou Soumia', 'A', LECTURE],
];

export const TIMETABLE_DAYS = dayNames.map((label, day) => ({ label, day }));
export const TIMETABLE_SLOTS = SLOT_TIMES.map(([startMin, endMin]) => ({ startMin, endMin }));
export const TIMETABLE_ENTRIES = sourceRows.map(([group, day, slot, subject, teacher, room, [type, typeRaw]]) =>
    entry(group, day, slot, subject, teacher, room, type, typeRaw)
);

export function getLocalTimetable() {
    return { version: CURRENT_TIMETABLE_VERSION, entries: TIMETABLE_ENTRIES };
}
