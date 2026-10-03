import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import {
    Animated,
    Linking,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { DAYS, formatTime } from './model';
import {
    availableOptions,
    deriveGroups,
    deriveSections,
    filterEntries,
    scheduleFor,
} from './selectors';
import { getLocalTimetable } from './timetableAdapter';
import { checkForTimetableUpdate, initializeTimetable } from './timetableService';

const COLORS = {
    ink: '#1f2b35',
    muted: '#74808a',
    paper: '#f7f8f6',
    white: '#ffffff',
    line: '#dfe5e3',
    lecture: '#d9e9f8',
    online: '#e5e4fa',
    td: '#dff0df',
    tp: '#f9e5d2',
    navy: '#29445c',
    accent: '#2d7d78',
};

const TIME_COLUMN = 58;
const DAY_COLUMN = 128;
const SLOT_HEIGHT = 94;
function typeStyle(entry) {
    if (entry.typeRaw === 'Lecture (online)') return { backgroundColor: COLORS.online, accent: '#7772bd' };
    if (entry.type === 'TD') return { backgroundColor: COLORS.td, accent: '#5b9d61' };
    if (entry.type === 'TP') return { backgroundColor: COLORS.tp, accent: '#d1884d' };
    return { backgroundColor: COLORS.lecture, accent: '#6699c9' };
}

function CompactSelector({ label, value, onPress }) {
    return <Pressable accessibilityRole="button" onPress={onPress} style={styles.selector}>
        <Text style={styles.selectorLabel}>{label}</Text>
        <Text style={styles.selectorValue}>{value} <Text style={styles.selectorChevron}>⌄</Text></Text>
    </Pressable>;
}

function TopBar({ section, group, sections, groups, onSection, onGroup, onExplore }) {
    return <View style={styles.topBar}>
        <View style={styles.selectors}>
            <CompactSelector label="SECTION" value={section} onPress={onSection} />
            <CompactSelector label="GROUP" value={group} onPress={onGroup} />
        </View>
        <Pressable accessibilityLabel="Explore timetable" accessibilityRole="button" onPress={onExplore} style={styles.searchButton}>
            <Text style={styles.searchIcon}>⌕</Text>
        </Pressable>
        <View style={styles.dropdownMenu} pointerEvents="none">
            {sections.length + groups.length === 0 ? null : null}
        </View>
    </View>;
}

function ChoiceMenu({ title, options, value, onChoose, onClose }) {
    return <Modal transparent visible animationType="fade" onRequestClose={onClose}>
        <View style={styles.choiceOverlay}>
            <Pressable onPress={onClose} style={styles.choiceDismiss} />
            <View style={styles.choiceMenu}><Text style={styles.choiceTitle}>{title}</Text>{options.map((option) => <Pressable key={option.key} onPress={() => { onChoose(option.label); onClose(); }} style={[styles.choiceItem, value === option.label && styles.choiceItemActive]}><Text style={[styles.choiceText, value === option.label && styles.choiceTextActive]}>{option.label}</Text>{value === option.label && <Text style={styles.choiceCheck}>✓</Text>}</Pressable>)}</View>
        </View>
    </Modal>;
}

function ClassBlock({ entry, onPress, slots }) {
    const tone = typeStyle(entry);
    const slotIndex = slots.findIndex((slot) => slot.startMin === entry.startMin);
    const top = Math.max(0, slotIndex) * SLOT_HEIGHT;
    const height = Math.max(62, ((entry.endMin - entry.startMin) / 90) * SLOT_HEIGHT - 6);
    return <Pressable onPress={() => onPress(entry)} style={[styles.classBlock, { top, height, backgroundColor: tone.backgroundColor, borderLeftColor: tone.accent }]}>
        <Text numberOfLines={2} style={styles.blockSubject}>{entry.subject}</Text>
        <Text numberOfLines={1} style={styles.blockTeacher}>{entry.teacher || 'Instructor not assigned'}</Text>
        <Text numberOfLines={1} style={styles.blockRoom}>{entry.room}</Text>
        <Text style={[styles.blockType, { color: tone.accent }]}>{entry.type === 'LECTURE' ? entry.typeRaw === 'Lecture (online)' ? 'ONLINE' : 'COURS' : entry.type}</Text>
    </Pressable>;
}

function TimetableGrid({ entries, days, slots, onEntryPress }) {
    return <View style={styles.tableViewport}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableContent}>
        <View>
            <View style={styles.dayHeaderRow}><View style={styles.timeHeader}><Text style={styles.timeHeaderText}>TIME</Text></View>{days.map(({ label, day }) => <View key={label} style={styles.dayHeader}><Text style={styles.dayHeaderText}>{label.slice(0, 3).toUpperCase()}</Text><Text style={styles.dayHeaderFull}>{label}</Text></View>)}</View>
            <View style={styles.gridBody}><View style={styles.timeRail}>{slots.map((slot) => <View key={slot.startMin} style={styles.timeSlot}><Text style={styles.timeText}>{formatTime(slot.startMin)}</Text></View>)}</View>{days.map(({ label, day }) => <View key={label} style={styles.dayColumn}>{slots.map((slot) => <View key={slot.startMin} style={styles.gridCell} />)}{entries.filter((entry) => entry.day === day).map((entry) => <ClassBlock key={entry.id} entry={entry} slots={slots} onPress={onEntryPress} />)}</View>)}</View>
        </View>
    </ScrollView></View>;
}

function SheetShell({ visible, onClose, children, title, eyebrow }) {
    const { height } = useWindowDimensions();
    const slide = useRef(new Animated.Value(0)).current;
    useEffect(() => { Animated.spring(slide, { toValue: visible ? 1 : 0, damping: 20, stiffness: 150, useNativeDriver: true }).start(); }, [slide, visible]);
    return <View pointerEvents={visible ? 'box-none' : 'none'} style={StyleSheet.absoluteFill}>
        {visible && <Pressable onPress={onClose} style={styles.sheetBackdrop} />}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] }]}>
            <View style={styles.sheetHandle} /><View style={styles.sheetHeader}><View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.sheetTitle}>{title}</Text></View><Pressable accessibilityLabel="Close" onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable></View>{children}
        </Animated.View>
    </View>;
}

function EntryDetails({ entry, visible, onClose }) {
    if (!entry) return null;
    return <SheetShell visible={visible} onClose={onClose} eyebrow="SESSION DETAILS" title={entry.subject}><ScrollView contentContainerStyle={styles.detailContent}><View style={[styles.detailType, { backgroundColor: typeStyle(entry).backgroundColor }]}><Text style={styles.detailTypeText}>{entry.typeRaw}</Text></View>{[['Teacher', entry.teacher || 'Instructor not assigned'], ['Room', entry.room], ['Day', DAYS[entry.day]], ['Time', `${formatTime(entry.startMin)} - ${formatTime(entry.endMin)}`], ['Section', entry.section], ['Group', entry.group]].map(([label, value]) => <View key={label} style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>)}</ScrollView></SheetShell>;
}

function FilterGroup({ title, options, value, onChoose }) {
    return <View style={styles.filterGroup}><Text style={styles.filterTitle}>{title}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>{options.map((option) => <Pressable key={option.key} onPress={() => onChoose(option.key)} style={[styles.filterPill, value === option.key && styles.filterPillActive]}><Text style={[styles.filterPillText, value === option.key && styles.filterPillTextActive]}>{option.label}</Text></Pressable>)}</ScrollView></View>;
}

function Explorer({ entries, section, visible, onClose }) {
    const [filters, setFilters] = useState({});
    const scopedFilters = { ...filters, section };
    useEffect(() => setFilters({}), [section]);
    const options = useMemo(() => availableOptions(entries, scopedFilters), [entries, section, filters]);
    const results = useMemo(() => filterEntries(entries, scopedFilters), [entries, section, filters]);
    const choose = (key, value) => setFilters((current) => ({ ...current, [key]: current[key] === value ? undefined : value }));
    return <SheetShell visible={visible} onClose={onClose} eyebrow="GLOBAL VIEW" title="Explore timetable"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.explorerContent}><FilterGroup title="Teacher" options={options.teachers} value={filters.teacher} onChoose={(value) => choose('teacher', value)} /><FilterGroup title="Subject" options={options.subjects} value={filters.subject} onChoose={(value) => choose('subject', value)} /><FilterGroup title="Session type" options={options.types} value={filters.type} onChoose={(value) => choose('type', value)} /><View style={styles.resultsHeader}><Text style={styles.sectionLabel}>RESULTS</Text><Text style={styles.resultCount}>{results.length} sessions</Text></View>{results.map((entry) => <View key={entry.id} style={styles.resultRow}><View style={styles.resultTime}><Text style={styles.resultDay}>{DAYS[entry.day].slice(0, 3).toUpperCase()}</Text><Text style={styles.resultTimeText}>{formatTime(entry.startMin)}</Text></View><View style={styles.resultInfo}><Text style={styles.resultSubject}>{entry.subject}</Text><Text style={styles.resultMeta}>{entry.teacher || 'Instructor not assigned'} · {entry.room}</Text><Text style={styles.resultMeta}>{entry.typeRaw} · {entry.section} · {entry.group} · {formatTime(entry.endMin)}</Text></View></View>)}</ScrollView></SheetShell>;
}

function AppContent() {
    const [timetable, setTimetable] = useState(() => getLocalTimetable());
    const ALL_TIMETABLE_ENTRIES = timetable.entries;
    const sections = deriveSections(ALL_TIMETABLE_ENTRIES);
    const initialSection = ALL_TIMETABLE_ENTRIES[0]?.section || sections[0]?.label || '';
    const [section, setSection] = useState(initialSection);
    const [group, setGroup] = useState(() => deriveGroups(ALL_TIMETABLE_ENTRIES, initialSection)[0]?.label || '');
    const [menu, setMenu] = useState(null);
    const [explorerVisible, setExplorerVisible] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const groups = deriveGroups(ALL_TIMETABLE_ENTRIES, section);
    const entries = scheduleFor(ALL_TIMETABLE_ENTRIES, section, group);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const active = await initializeTimetable();
            if (cancelled) return;
            setTimetable(active);
            const updated = await checkForTimetableUpdate(active);
            if (!cancelled && updated) setTimetable(updated);
        })();
        return () => { cancelled = true; };
    }, []);
    useEffect(() => {
        setGroup((currentGroup) => groups.some((option) => option.label === currentGroup) ? currentGroup : groups[0]?.label || '');
    }, [section]);
    const chooseSection = (value) => { setSection(value); setGroup(deriveGroups(ALL_TIMETABLE_ENTRIES, value)[0]?.label || ''); };
    return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} /><View style={styles.screen}><View style={styles.appHeader}><View><Text style={styles.eyebrow}>JADWLI · L3 COMPUTER SCIENCE</Text><Text style={styles.appTitle}>My timetable</Text></View><Text style={styles.term}>2026—27</Text></View><TopBar section={section} group={group} sections={sections} groups={groups} onSection={() => setMenu('section')} onGroup={() => setMenu('group')} onExplore={() => setExplorerVisible(true)} /><View style={styles.legend}><LegendDot color={COLORS.lecture} label="Cours" /><LegendDot color={COLORS.td} label="TD" /><LegendDot color={COLORS.tp} label="TP" /><LegendDot color={COLORS.online} label="Online" /></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mainScroll}><TimetableGrid entries={entries} days={timetable.days} slots={timetable.slots} onEntryPress={setSelectedEntry} /><Text style={styles.gridHint}>Tap a class to see full details · swipe horizontally to see the week</Text><SocialFooter /></ScrollView></View><EntryDetails entry={selectedEntry} visible={Boolean(selectedEntry)} onClose={() => setSelectedEntry(null)} /><Explorer entries={ALL_TIMETABLE_ENTRIES} section={section} visible={explorerVisible} onClose={() => setExplorerVisible(false)} />{menu === 'section' && <ChoiceMenu title="Choose section" options={sections} value={section} onChoose={chooseSection} onClose={() => setMenu(null)} />}{menu === 'group' && <ChoiceMenu title="Choose group" options={groups} value={group} onChoose={setGroup} onClose={() => setMenu(null)} />}</SafeAreaView>;
}

function LegendDot({ color, label }) { return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>; }

function SocialFooter() {
    return <View style={styles.footer}>
        <View style={styles.socialLinks}>
            <Pressable accessibilityLabel="Open GitHub profile" onPress={() => Linking.openURL('https://github.com/AFfares')} style={[styles.socialIcon, styles.githubIcon]}>
                <FontAwesome name="github" size={17} color={COLORS.white} />
            </Pressable>
            <Pressable accessibilityLabel="Open LinkedIn profile" onPress={() => Linking.openURL('https://www.linkedin.com/in/affares')} style={[styles.socialIcon, styles.linkedinIcon]}>
                <FontAwesome name="linkedin" size={17} color={COLORS.white} />
            </Pressable>
        </View>
        <Text style={styles.footerSignature}>by AFfares</Text>
    </View>;
}

export default function App() { return <AppContent />; }

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.paper },
    screen: { flex: 1, backgroundColor: COLORS.paper, paddingTop: 12 },
    appHeader: { paddingHorizontal: 18, paddingBottom: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    eyebrow: { color: COLORS.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
    appTitle: { color: COLORS.ink, fontSize: 27, fontWeight: '800', marginTop: 5 },
    term: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginBottom: 4 },
    topBar: { marginHorizontal: 14, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 16, padding: 8, flexDirection: 'row', alignItems: 'center' },
    selectors: { flex: 1, flexDirection: 'row', gap: 7 },
    selector: { flex: 1, minWidth: 108, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: COLORS.paper, borderRadius: 10 },
    selectorLabel: { color: COLORS.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
    selectorValue: { color: COLORS.ink, fontSize: 14, fontWeight: '800', marginTop: 3 },
    selectorChevron: { color: COLORS.accent, fontSize: 15 },
    searchButton: { width: 43, height: 43, marginLeft: 8, borderRadius: 12, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' },
    searchIcon: { color: COLORS.white, fontSize: 26, lineHeight: 27 },
    dropdownMenu: { display: 'none' },
    legend: { flexDirection: 'row', gap: 14, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 9, height: 9, borderRadius: 3, borderWidth: 1, borderColor: COLORS.line },
    legendText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
    mainScroll: { paddingBottom: 22 },
    tableViewport: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
    tableContent: { paddingRight: 18 },
    dayHeaderRow: { height: 50, flexDirection: 'row', backgroundColor: COLORS.navy },
    timeHeader: { width: TIME_COLUMN, justifyContent: 'center', paddingLeft: 8, borderRightWidth: 1, borderRightColor: '#5a6d7d' },
    timeHeaderText: { color: '#b7c5ce', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    dayHeader: { width: DAY_COLUMN, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#5a6d7d' },
    dayHeaderText: { color: COLORS.white, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    dayHeaderFull: { color: '#b7c5ce', fontSize: 9, marginTop: 2 },
    gridBody: { flexDirection: 'row', height: GRID_HEIGHT },
    timeRail: { width: TIME_COLUMN, backgroundColor: '#f0f3f2' },
    timeSlot: { height: SLOT_HEIGHT, borderRightWidth: 1, borderBottomWidth: 1, borderColor: COLORS.line, paddingTop: 8, paddingLeft: 7 },
    timeText: { color: COLORS.muted, fontSize: 10, fontWeight: '800' },
    dayColumn: { width: DAY_COLUMN, height: GRID_HEIGHT, position: 'relative', backgroundColor: COLORS.white, borderRightWidth: 1, borderColor: COLORS.line },
    gridCell: { height: SLOT_HEIGHT, borderBottomWidth: 1, borderColor: COLORS.line },
    classBlock: { position: 'absolute', left: 4, right: 4, borderRadius: 9, borderLeftWidth: 4, paddingHorizontal: 7, paddingTop: 7, paddingBottom: 5, overflow: 'hidden' },
    blockSubject: { color: COLORS.ink, fontSize: 11, lineHeight: 13, fontWeight: '900' },
    blockTeacher: { color: '#43505a', fontSize: 9, lineHeight: 11, marginTop: 4 },
    blockRoom: { color: '#53616a', fontSize: 9, lineHeight: 11, marginTop: 2 },
    blockType: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginTop: 5 },
    gridHint: { color: COLORS.muted, textAlign: 'center', fontSize: 10, marginTop: 12 },
    footer: { alignItems: 'center', paddingTop: 28, paddingBottom: 8 },
    socialLinks: { flexDirection: 'row', gap: 10 },
    socialIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    githubIcon: { backgroundColor: COLORS.ink },
    linkedinIcon: { backgroundColor: '#2867a8' },
    footerSignature: { color: COLORS.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, marginTop: 8 },
    choiceOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
    choiceDismiss: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31,43,53,0.18)' },
    choiceMenu: { position: 'absolute', top: 132, left: 18, right: 18, backgroundColor: COLORS.white, borderRadius: 16, padding: 8, borderWidth: 1, borderColor: COLORS.line, shadowColor: '#18232b', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
    choiceTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, padding: 10 },
    choiceItem: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
    choiceItemActive: { backgroundColor: '#edf4f2' },
    choiceText: { color: COLORS.ink, fontSize: 14, fontWeight: '700' },
    choiceTextActive: { color: COLORS.accent },
    choiceCheck: { color: COLORS.accent, fontWeight: '900' },
    sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31,43,53,0.4)' },
    sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '87%', backgroundColor: COLORS.paper, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 10, overflow: 'hidden', zIndex: 10 },
    sheetHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: COLORS.line, alignSelf: 'center', marginBottom: 14 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingBottom: 16 },
    sheetTitle: { color: COLORS.ink, fontSize: 25, fontWeight: '800', marginTop: 4 },
    closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
    closeText: { color: COLORS.ink, fontSize: 25, lineHeight: 25 },
    detailContent: { paddingHorizontal: 22, paddingBottom: 30 },
    detailType: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 12 },
    detailTypeText: { color: COLORS.ink, fontSize: 11, fontWeight: '900' },
    detailRow: { borderTopWidth: 1, borderTopColor: COLORS.line, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
    detailLabel: { color: COLORS.muted, fontSize: 13 },
    detailValue: { color: COLORS.ink, fontSize: 13, fontWeight: '800', flexShrink: 1, textAlign: 'right' },
    explorerContent: { paddingHorizontal: 22, paddingBottom: 30 },
    filterGroup: { marginBottom: 16 },
    filterTitle: { color: COLORS.ink, fontSize: 13, fontWeight: '800', marginBottom: 8 },
    filterScroll: { gap: 7 },
    filterPill: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
    filterPillActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
    filterPillText: { color: COLORS.muted, fontSize: 11, fontWeight: '800' },
    filterPillTextActive: { color: COLORS.white },
    resultsHeader: { paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
    resultCount: { color: COLORS.accent, fontSize: 11, fontWeight: '900' },
    resultRow: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, flexDirection: 'row', marginTop: 8 },
    resultTime: { width: 50, borderRightWidth: 1, borderRightColor: COLORS.line },
    resultDay: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    resultTimeText: { color: COLORS.ink, fontSize: 12, fontWeight: '900', marginTop: 6 },
    resultInfo: { flex: 1, paddingLeft: 12 },
    resultSubject: { color: COLORS.ink, fontSize: 12, fontWeight: '900' },
    resultMeta: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
});
