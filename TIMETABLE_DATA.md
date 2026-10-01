# Jadwli timetable data

## Current provider

The current timetable is local and source-controlled in `timetableData.js`.
It exports normalized `ScheduleEntry` objects through `TIMETABLE_ENTRIES`, plus the PDF-derived day and time-slot metadata. Teachers, subjects, groups, rooms, times, and session entries are fields of those entries; they are not separate UI-owned collections.

`App.js` consumes this dataset through `selectors.js` (`deriveSections`, `deriveGroups`, `scheduleFor`, and the Explorer filter selectors). The UI therefore depends on the normalized entry shape, not on the source-row representation used to transcribe the current timetable.

The local provider exposes `CURRENT_TIMETABLE_VERSION` and `getLocalTimetable()`. The current release keeps using the existing `TIMETABLE_ENTRIES` import so no behavior changes in this distribution-preparation task.

## Future central source

A later remote provider should return the same contract:

```js
{
  version: '2026-10-01-v1',
  entries: ScheduleEntry[]
}
```

Replacing the local provider with a remote provider would be a data-loading change at the app boundary. The timetable grid, selectors, search, and navigation can continue consuming `entries` and do not need to know whether the data came from a server, a local file, or a cache. A future implementation can fetch a complete replacement dataset, compare `version`, and persist the last successful response for offline display. No backend or synchronization system is added here.
