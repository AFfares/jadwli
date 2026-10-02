import { formatTime } from './model';

const SECTION = 'L3 - ISIL';
const SLOT_TIMES = [
    [8 * 60, 9 * 60 + 30],
    [9 * 60 + 35, 11 * 60 + 5],
    [11 * 60 + 10, 12 * 60 + 40],
    [12 * 60 + 45, 14 * 60 + 15],
    [14 * 60 + 20, 15 * 60 + 50],
];

const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

function entry(group, day, slot, subject, teacher, room, type, typeRaw) {
    const [startMin, endMin] = SLOT_TIMES[slot];
    return {
        id: `${SECTION}-${group}-${day}-${slot}-${subject}`,
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

// Transcribed from the supplied L3 ISIL timetable PDF. Empty cells are absent.
const sourceRows = [
    ['G1', 0, 0, 'Decision Support Systems', 'Abbadi Malika', 'Benbadis', LECTURE],
    ['G1', 0, 1, 'Human-Computer Interaction', 'Izountar Yousra', 'Benbadis', LECTURE],
    ['G1', 0, 2, 'Human-Computer Interaction', 'Not assigned', 'No room', TD],
    ['G1', 2, 1, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G1', 2, 2, 'Software Engineering', 'Not assigned', 'Online', ONLINE],
    ['G1', 2, 4, 'Human-Computer Interaction', 'Not assigned', 'Online', ONLINE],
    ['G1', 3, 0, 'Information Systems Administration', 'Not assigned', 'No room', LECTURE],
    ['G1', 3, 1, 'Decision Support Systems', 'Abbadi Malika', 'LAB 1', TP],
    ['G1', 3, 2, 'Software Engineering', 'Benghalia Abderaouf', 'ROOM 5M', TD],
    ['G1', 4, 0, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM 6M', LECTURE],
    ['G1', 4, 1, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM 6M', TD],
    ['G1', 4, 2, 'Distributed Information Systems', 'Not assigned', 'ROOM 3', TP],
    ['G1', 4, 4, 'Information Systems Administration', 'Not assigned', 'ROOM 5M', TD],
    ['G1', 5, 0, 'Software Engineering', 'Benghalia Abderaouf', 'ROOM COURS', LECTURE],
    ['G1', 5, 1, 'Distributed Information Systems', 'Benamara Hadjer', 'ROOM 1', TD],
    ['G1', 5, 2, 'Distributed Information Systems', 'Hemili Mohamed Benbatouche', 'Benbatouche', LECTURE],

    ['G2', 0, 0, 'Decision Support Systems', 'Abbadi Malika', 'Benbadis', LECTURE],
    ['G2', 0, 1, 'Human-Computer Interaction', 'Izountar Yousra', 'Benbadis', LECTURE],
    ['G2', 0, 2, 'Human-Computer Interaction', 'Not assigned', 'No room', TD],
    ['G2', 2, 1, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G2', 2, 2, 'Software Engineering', 'Not assigned', 'Online', ONLINE],
    ['G2', 2, 4, 'Human-Computer Interaction', 'Not assigned', 'Online', ONLINE],
    ['G2', 3, 0, 'Information Systems Administration', 'Not assigned', 'No room', LECTURE],
    ['G2', 3, 2, 'Software Engineering', 'Benghalia Abderaouf', 'ROOM 5M', TD],
    ['G2', 3, 3, 'Decision Support Systems', 'Abbadi Malika', 'LAB 1', TP],
    ['G2', 4, 0, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM 6M', LECTURE],
    ['G2', 4, 1, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM 6M', TD],
    ['G2', 4, 3, 'Distributed Information Systems', 'Not assigned', 'No room', TP],
    ['G2', 4, 4, 'Information Systems Administration', 'Not assigned', 'ROOM 5M', TD],
    ['G2', 5, 0, 'Software Engineering', 'Benghalia Abderaouf', 'ROOM COURS', LECTURE],
    ['G2', 5, 1, 'Distributed Information Systems', 'Benamara Hadjer', 'ROOM 1', TD],
    ['G2', 5, 2, 'Distributed Information Systems', 'Hemili Mohamed Benbatouche', 'Benbatouche', LECTURE],

    ['G3', 0, 0, 'Decision Support Systems', 'Abbadi Malika', 'Benbadis', LECTURE],
    ['G3', 0, 1, 'Human-Computer Interaction', 'Izountar Yousra', 'Benbadis', LECTURE],
    ['G3', 0, 2, 'Decision Support Systems', 'Abbadi Malika', 'LAB 4', TP],
    ['G3', 0, 4, 'Human-Computer Interaction', 'Not assigned', 'ROOM 6', TD],
    ['G3', 2, 1, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G3', 2, 2, 'Software Engineering', 'Not assigned', 'Online', ONLINE],
    ['G3', 2, 4, 'Human-Computer Interaction', 'Not assigned', 'Online', ONLINE],
    ['G3', 3, 0, 'Information Systems Administration', 'Not assigned', 'No room', LECTURE],
    ['G3', 3, 2, 'Information Systems Administration', 'Not assigned', 'ROOM 5', TD],
    ['G3', 3, 3, 'Distributed Information Systems', 'Not assigned', 'ROOM 5', TP],
    ['G3', 4, 0, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM 6M', LECTURE],
    ['G3', 4, 2, 'Software Engineering', 'Not assigned', 'ROOM 4', TD],
    ['G3', 5, 0, 'Software Engineering', 'Benghalia Abderaouf', 'ROOM COURS', LECTURE],
    ['G3', 5, 1, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM COURS', TD],
    ['G3', 5, 2, 'Distributed Information Systems', 'Hemili Mohamed Benbatouche', 'Benbatouche', LECTURE],
    ['G3', 5, 3, 'Distributed Information Systems', 'Benamara Hadjer', 'ROOM 3', TD],

    ['G4', 0, 0, 'Decision Support Systems', 'Abbadi Malika', 'Benbadis', LECTURE],
    ['G4', 0, 1, 'Human-Computer Interaction', 'Izountar Yousra', 'Benbadis', LECTURE],
    ['G4', 0, 3, 'Decision Support Systems', 'Abbadi Malika', 'LAB 4', TP],
    ['G4', 0, 4, 'Human-Computer Interaction', 'Not assigned', 'ROOM 6', TD],
    ['G4', 2, 1, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G4', 2, 2, 'Software Engineering', 'Not assigned', 'Online', ONLINE],
    ['G4', 2, 4, 'Human-Computer Interaction', 'Not assigned', 'Online', ONLINE],
    ['G4', 3, 0, 'Information Systems Administration', 'Not assigned', 'No room', LECTURE],
    ['G4', 3, 2, 'Information Systems Administration', 'Not assigned', 'ROOM 5', TD],
    ['G4', 4, 0, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM 6M', LECTURE],
    ['G4', 4, 1, 'Distributed Information Systems', 'Not assigned', 'ROOM 3', TP],
    ['G4', 4, 2, 'Software Engineering', 'Not assigned', 'ROOM 4', TD],
    ['G4', 5, 0, 'Software Engineering', 'Benghalia Abderaouf', 'ROOM COURS', LECTURE],
    ['G4', 5, 1, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM COURS', TD],
    ['G4', 5, 2, 'Distributed Information Systems', 'Hemili Mohamed Benbatouche', 'Benbatouche', LECTURE],
    ['G4', 5, 3, 'Distributed Information Systems', 'Benamara Hadjer', 'ROOM 3', TD],

    ['G5', 0, 0, 'Decision Support Systems', 'Abbadi Malika', 'Benbadis', LECTURE],
    ['G5', 0, 1, 'Human-Computer Interaction', 'Izountar Yousra', 'Benbadis', LECTURE],
    ['G5', 0, 2, 'Human-Computer Interaction', 'Izountar Yousra', 'ROOM 5', TD],
    ['G5', 0, 4, 'Decision Support Systems', 'Abbadi Malika', 'LAB 4', TP],
    ['G5', 2, 1, 'Digital Economy and Strategic Intelligence', 'Not assigned', 'Online', ONLINE],
    ['G5', 2, 2, 'Software Engineering', 'Not assigned', 'Online', ONLINE],
    ['G5', 2, 4, 'Human-Computer Interaction', 'Not assigned', 'Online', ONLINE],
    ['G5', 3, 0, 'Information Systems Administration', 'Not assigned', 'No room', LECTURE],
    ['G5', 3, 1, 'Distributed Information Systems', 'Not assigned', 'ROOM 5', TP],
    ['G5', 4, 0, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM 6M', LECTURE],
    ['G5', 4, 1, 'Software Engineering', 'Not assigned', 'ROOM 2', TD],
    ['G5', 4, 3, 'Advanced Web Programming', 'Hemili Mohamed', 'ROOM 2', TD],
    ['G5', 5, 0, 'Software Engineering', 'Benghalia Abderaouf', 'ROOM COURS', LECTURE],
    ['G5', 5, 2, 'Distributed Information Systems', 'Hemili Mohamed Benbatouche', 'Benbatouche', LECTURE],
    ['G5', 5, 3, 'Information Systems Administration', 'Not assigned', 'ROOM 4', TD],
    ['G5', 5, 4, 'Distributed Information Systems', 'Benamara Hadjer', 'ROOM 1', TD],
];

export const ISIL_TIMETABLE_ENTRIES = sourceRows.map(([group, day, slot, subject, teacher, room, [type, typeRaw]]) =>
    entry(group, day, slot, subject, teacher, room, type, typeRaw)
);
