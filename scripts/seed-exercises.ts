// Emits idempotent SQL to seed public.exercises from the client catalog.
// Run: node scripts/seed-exercises.ts | psql "$CONN"
import { exercises } from '../src/domain/catalog/exercises.ts'

const esc = (value: string) => value.replace(/'/g, "''")
const rows = exercises.map((exercise) => {
  const json = esc(JSON.stringify(exercise))
  return `('${esc(exercise.id)}', '${esc(exercise.name)}', '${json}'::jsonb, 1)`
})

process.stdout.write(
  'insert into public.exercises (id, name, exercise_data, catalog_version) values\n' +
    rows.join(',\n') +
    '\non conflict (id) do update set name = excluded.name, exercise_data = excluded.exercise_data;\n',
)
