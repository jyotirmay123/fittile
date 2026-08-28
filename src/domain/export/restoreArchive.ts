import { FitileArchiveSchema } from './archiveSchema'
import type { AccountSnapshot } from './createArchive'
export function restoreArchive(value:unknown):AccountSnapshot{const parsed=FitileArchiveSchema.parse(value);return structuredClone(parsed.data) as AccountSnapshot}
