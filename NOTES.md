# Notes
## Smart play list system message WIP

```md
  You are a professional DJ assistant designed to help users create customized playlists from their music library using harmonic mixing principles.

  ## Core Capabilities
  - Analyze the user's DJ library, provided in CSV format.
  - Create playlists base on the users's instructions and **harmonic compatibility**
  - Return playlists in extended m3u format with track name and artist in `EXTINF` tags

  ## Harmonix Mixing Rules
  When creating harmonically mixed playlists, follow these **strict compatibility rules** using the Camelot Wheel system:

  ### Compatible Key Transitions (in order of preference)

  1. **Same Key** (Perfect): 8A → 8A, 5B → 5B
  2. **Adjacent Keys (+1)**: 8A → 9A → 10A
  4. **Relative Major/Minor (scale change)**: 8A ↔ 8B, 5A ↔ 5B
  3. **Adjacent Keys (-1)**: 8A → 7A → 6A
  5. **+2 (Energy Boost)**: 8A → 10A
  6. ** Go up a semitone (+7 or -5)**: This is a bold energy boost. For example, 8A → 3A (8+7 = 15, which becomes 3 on the 12-section wheel).

  ### Key Compatibility Matrix
  For any starting key X:
  - **Perfect**: Same key (XA → XA, XB → XB)
  - **Relative**: XA ↔ XB
  - **Forward**: XA → (X+1)A, XB → (X+1)B
  - **Backward**: XA → (X-1)A, XB → (X-1)B
  - **Wrap around**: 12A → 1A, 1A → 12A

  ### Critical Rules
  - **ALWAYS** verify each transition is compatible before adding a track
  - **USE** relative major/minor switches to add variety without breaking harmony
  - **ALWAYS** pay carefuyl attention to the user's requirements track selection criteria

  When the user requests harmonic mixing, explicitly state the key progression in your response (e.g., "Harmonic progression: 8A → 8B → 9B → 9A").

  Always prioritize the user's specific requirements while leveraging your knowledge of music structure and DJ techniques to create cohesive, engaging playlists.

  Return the results in the format an extended m3u.
```
## Database query that converts to camelot notation
This query selects tracks from the mixxx database and normalilzes the keys to Camelot notation.
```sql
SELECT DISTINCT
    l.title,
    l.artist,
    l.year,
    l.datetime_added,
    l.genre,
    l.duration,
    l.bpm,
    CASE
        -- If key already contains Camelot notation (has A or B followed by space and parenthesis)
        WHEN l.key LIKE '%A (%' OR l.key LIKE '%B (%' THEN
            SUBSTR(l.key, 1, INSTR(l.key, ' ') - 1)
        -- Minor keys - individual WHEN statements
        WHEN l.key = 'Am' OR l.key = 'Amin' THEN '8A'
        WHEN l.key = 'Em' OR l.key = 'Emin' THEN '9A'
        WHEN l.key = 'Bm' OR l.key = 'Bmin' THEN '10A'
        WHEN l.key = 'F#m' OR l.key = 'F#min' OR l.key = 'Gbm' OR l.key = 'Gbmin' THEN '11A'
        WHEN l.key = 'C#m' OR l.key = 'C#min' OR l.key = 'Dbm' OR l.key = 'Dbmin' THEN '12A'
        WHEN l.key = 'G#m' OR l.key = 'G#min' OR l.key = 'Abm' OR l.key = 'Abmin' THEN '1A'
        WHEN l.key = 'D#m' OR l.key = 'D#min' OR l.key = 'Ebm' OR l.key = 'Ebmin' THEN '2A'
        WHEN l.key = 'A#m' OR l.key = 'A#min' OR l.key = 'Bbm' OR l.key = 'Bbmin' THEN '3A'
        WHEN l.key = 'Fm' OR l.key = 'Fmin' THEN '4A'
        WHEN l.key = 'Cm' OR l.key = 'Cmin' THEN '5A'
        WHEN l.key = 'Gm' OR l.key = 'Gmin' THEN '6A'
        WHEN l.key = 'Dm' OR l.key = 'Dmin' THEN '7A'
        -- Major keys - individual WHEN statements
        WHEN l.key = 'C' OR l.key = 'Cmaj' OR l.key = 'CM' THEN '8B'
        WHEN l.key = 'G' OR l.key = 'Gmaj' OR l.key = 'GM' THEN '9B'
        WHEN l.key = 'D' OR l.key = 'Dmaj' OR l.key = 'DM' THEN '10B'
        WHEN l.key = 'A' OR l.key = 'Amaj' OR l.key = 'AM' THEN '11B'
        WHEN l.key = 'E' OR l.key = 'Emaj' OR l.key = 'EM' THEN '12B'
        WHEN l.key = 'B' OR l.key = 'Bmaj' OR l.key = 'BM' OR l.key = 'Cb' OR l.key = 'Cbmaj' THEN '1B'
        WHEN l.key = 'F#' OR l.key = 'F#maj' OR l.key = 'F#M' OR l.key = 'Gb' OR l.key = 'Gbmaj' THEN '2B'
        WHEN l.key = 'C#' OR l.key = 'C#maj' OR l.key = 'C#M' OR l.key = 'Db' OR l.key = 'Dbmaj' THEN '3B'
        WHEN l.key = 'G#' OR l.key = 'G#maj' OR l.key = 'G#M' OR l.key = 'Ab' OR l.key = 'Abmaj' THEN '4B'
        WHEN l.key = 'D#' OR l.key = 'D#maj' OR l.key = 'D#M' OR l.key = 'Eb' OR l.key = 'Ebmaj' THEN '5B'
        WHEN l.key = 'A#' OR l.key = 'A#maj' OR l.key = 'A#M' OR l.key = 'Bb' OR l.key = 'Bbmaj' THEN '6B'
        WHEN l.key = 'F' OR l.key = 'Fmaj' OR l.key = 'FM' THEN '7B'
        ELSE l.key -- Return original if no match
    END AS "key",
    c.name "crate name",
    l.color,
    tl."location"
FROM
    "library" l
    JOIN crate_tracks ct ON ct.track_id = l.id
    JOIN crates c ON c.id = ct.crate_id
    JOIN track_locations tl ON tl.id = l."location"
```
## Sample user request

I'd like to create a playlist of 25 tracks. Here are some rules:

- Gradually increase the energy level as the set progresses. You can determine the energy level of a track by the "color" field. The mapping of color to energy level is provided below
- The sequence of tracks must follow harmonic mixing guidelines.

```
| Color | Energy Level |
|:------|:-------------|
| 34952 | Low          |
| 35071 | Medium       |
| 255   | High         |
| 136   | Very High    |
```

Here are the tracks:

```csv
insert tracks from query here
```
