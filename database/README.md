# Database

Local PostgreSQL database for the 13-Day Stories trecena content. This README covers setup, schema, the import scripts that load JSON content into the DB, and the query scripts that export it back out.

## Setup

1. Install and start PostgreSQL locally.
2. Create the database:
   ```bash
   createdb thirteen_day_stories
   psql thirteen_day_stories -f database/schema.sql
   ```
3. Copy `database/config.example.json` to `database/config.json` and fill in your credentials. `config.json` is what every script reads via [database/connection.js](connection.js); it is gitignored.
4. (Optional) Restore from the bundled snapshot instead of starting empty — see [Backups](#backups).

All scripts are runnable as `node scripts/<name>.js` from the repo root and use a shared connection pool ([database/connection.js](connection.js)).

## Schema

Three tables, defined in [schema.sql](schema.sql):

### `trecenas`
One row per trecena (20 total). Holds the `prologue` and `epilogue` text. The `name` column is the normalized lowercase letters-only key (e.g. `Q'anil` → `qanil`); `display_name` keeps the formatted version.

### `days`
13 rows per trecena, keyed by `(trecena_id, day)`. Holds the per-day text fields and JSONB blobs:
- `chapter` — narrative story for the day (from trecena-story import)
- `horoscope`, `affirmation`, `meditation` — daily readings
- `nawal` — nawal name
- `energy_of_the_day` JSONB — `{nawal, number, combined_energy}` (from birthdays import)
- `birthday` JSONB — `{title, content}` (from birthdays import)
- `colors` JSONB — color palette (currently unused by importers)

### `image_prompts`
One row per `day_id`. Holds the six prompt strings used downstream for image generation:
`story_primary`, `story_wide_1`, `story_wide_2`, `horoscope`, `affirmation`, `birthday`.

This table is **not** included in API output — it's a build-time-only side table. The legacy `days.image_prompts` JSONB column was removed; image prompts live here exclusively.

## Importing data

Each importer scans `database/input/` for JSON files matching its name pattern, validates structure, and UPSERTs by `(trecena_id, day)` and `day_id`. All importers are **idempotent** — re-running them is safe and won't disturb fields written by other importers (UPDATE statements only touch the columns that importer owns).

The trecena row must exist before any of the per-day importers run, so always run `insert-trecena-story.js` (or `insert-birthdays.js`) for a new trecena first.

| Script | Reads files matching | Populates |
|---|---|---|
| [scripts/insert-trecena-story.js](../scripts/insert-trecena-story.js) | `input/trecena-story-{name}.json` | `trecenas.{prologue,epilogue}`, `days.{chapter,nawal}`, `image_prompts.{story_primary,story_wide_1,story_wide_2}` |
| [scripts/insert-birthdays.js](../scripts/insert-birthdays.js) | `input/birthdays-{name}.json` | `days.{energy_of_the_day,birthday,nawal}`, `image_prompts.{horoscope,affirmation,birthday}` (the `birthday` prompt only) |
| [scripts/insert-horoscopes.js](../scripts/insert-horoscopes.js) | `input/horoscopes-{name}.json` | `days.horoscope`, `image_prompts.horoscope` |
| [scripts/insert-affirmations.js](../scripts/insert-affirmations.js) | `input/affirmations-{name}.json` | `days.affirmation`, `image_prompts.affirmation` |
| [scripts/insert-meditations.js](../scripts/insert-meditations.js) | `input/meditations-{name}.json` | `days.meditation` |

Run them with no arguments — each picks up every matching file in `database/input/`:

```bash
node scripts/insert-trecena-story.js
node scripts/insert-birthdays.js
node scripts/insert-horoscopes.js
node scripts/insert-affirmations.js
node scripts/insert-meditations.js
```

The package.json wrapper `npm run generate:birthdays` runs the birthdays importer, and `npm run generate` chains it with the data-generation step.

### Input JSON shape

All importers expect a top-level `trecena` field (string like `"E'"` or `"Q'anil"` — gets normalized) and a `days` array of length 13. Each day uses `day_number` (or `day` / `day_index`) and the field(s) the importer cares about. Image prompts go inside an `image_prompts` object using the column names above.

The trecena-story importer additionally accepts:
- `prologue` / `epilogue` as either a plain string or `{content: "..."}`
- `chapter` as a plain string (not `{title, content}` — flatten before saving)
- `world_module`, day `tone`, and chapter/prologue/epilogue titles are all silently ignored (no DB columns)

If you receive content in a non-standard shape (e.g. an `affirmations[]` array with `image_prompt` singular instead of `days[]` with `image_prompts.affirmation`), transform it to the expected shape before writing into `database/input/`.

### Filename → trecena name

The 20 normalized names: `aj`, `ajmaq`, `ajpu`, `aqabal`, `batz`, `e`, `imox`, `iq`, `ix`, `kame`, `kan`, `kat`, `kawoq`, `kej`, `noj`, `qanil`, `tijax`, `toj`, `tzi`, `tzikin`. Use these in filenames (e.g. `horoscopes-qanil.json`). Normalization is implemented in [database/normalize.js](normalize.js): strip non-letters, lowercase.

## Querying / exporting

- [database/queries/query-trecena.js](queries/query-trecena.js) — `node database/queries/query-trecena.js <name>` writes the merged JSON for one trecena to `database/output/<name>-trecena.json`. Joins `days` + `image_prompts` so the export contains everything.
- [database/queries/query-image-prompts-by-day.js](queries/query-image-prompts-by-day.js) — exports image prompts only.
- [database/check-all-trecenas.js](check-all-trecenas.js) and [database/check-qanil.js](check-qanil.js) — quick completeness checks.

## Backups

A full SQL dump is bundled at [database/thirteen_day_stories_backup.sql](thirteen_day_stories_backup.sql). It's a `pg_dump --clean --if-exists --no-owner --no-privileges` snapshot — schema + data, portable across machines.

**Restore:**
```bash
createdb thirteen_day_stories     # if the DB doesn't exist yet
psql thirteen_day_stories -f database/thirteen_day_stories_backup.sql
```

**Refresh the backup** after meaningful content changes:
```bash
pg_dump --clean --if-exists --no-owner --no-privileges \
  thirteen_day_stories > database/thirteen_day_stories_backup.sql
```

(Pass `-h`/`-U`/`-p` if your local Postgres isn't on the default socket.)
