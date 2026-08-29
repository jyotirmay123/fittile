import { FitileDb } from '../local/FitileDb'
import { createFitileRepository } from '../local/repositories'
import { SyncEngine } from './SyncEngine'
import type { OutboxOperation, PulledRecords, SyncTransport } from './types'

// Stands in for the server: records what was pushed and serves it back on pull,
// which is exactly what a second device sees after signing in.
class FakeServer implements SyncTransport {
  rows = new Map<string, { entity: string; record: Record<string, unknown>; deleted: boolean }>()
  async push(operation: OutboxOperation) {
    this.rows.set(operation.entityId, {
      entity: operation.entity,
      record: (operation.payload ?? {}) as Record<string, unknown>,
      deleted: operation.kind === 'delete',
    })
    return { operationId: operation.id, serverUpdatedAt: '2026-08-29T00:00:00.000Z' }
  }
  async pull(): Promise<PulledRecords> {
    const out: PulledRecords = {}
    for (const [id, row] of this.rows) {
      const bucket = (out[row.entity as keyof PulledRecords] ??= [])
      bucket.push({ id, deleted: row.deleted, record: row.record })
    }
    return out
  }
}

describe('account hydration', () => {
  it('restores a signed-in account onto a device that has never seen it', async () => {
    const server = new FakeServer()
    const userId = 'user-1'

    const laptopDb = new FitileDb(`laptop-${crypto.randomUUID()}`)
    const laptop = createFitileRepository(laptopDb, userId)
    await laptop.saveProfile({
      displayName: 'You', weightKg: 80, experience: 'beginner', goal: 'build-muscle',
      preferredSplit: 'push', workoutDays: 4, workoutMinutes: 50,
      calorieTarget: 2730, proteinTargetG: 160, locale: 'en-US', units: 'metric',
    })
    await laptop.saveSet({ id: crypto.randomUUID(), sessionId: 's1', exerciseId: 'db-bench-press', setNumber: 1, weightKg: 12.5, repetitions: 10, completedAt: '2026-08-29T10:00:00.000Z' })
    await new SyncEngine(laptop, server).flush()

    const phoneDb = new FitileDb(`phone-${crypto.randomUUID()}`)
    const phone = createFitileRepository(phoneDb, userId)
    expect(await phone.getProfile()).toBeUndefined()

    await new SyncEngine(phone, server).hydrate(userId)

    expect(await phone.getProfile()).toMatchObject({ goal: 'build-muscle', calorieTarget: 2730 })
    expect(await phone.listSets()).toHaveLength(1)

    laptopDb.close(); await laptopDb.delete()
    phoneDb.close(); await phoneDb.delete()
  })
})
