import { FitileDb } from '../local/FitileDb'
import { createFitileRepository } from '../local/repositories'
import { SyncEngine } from './SyncEngine'
import type { OutboxOperation, SyncTransport } from './types'

class MemoryTransport implements SyncTransport {
  remote = new Map<string, unknown>()
  order: string[] = []
  delayMs = 0
  async push(operation: OutboxOperation) {
    if (this.delayMs) await new Promise((resolve) => setTimeout(resolve, this.delayMs))
    this.order.push(`${operation.entity}:${operation.kind}`)
    if (operation.kind === 'delete') this.remote.delete(operation.entityId)
    else this.remote.set(operation.entityId, operation.payload)
    return { operationId: operation.id, serverUpdatedAt: '2026-08-28T20:01:00.000Z' }
  }
}

describe('SyncEngine', () => {
  it('replaying after acknowledgement is idempotent', async () => {
    const db = new FitileDb(`sync-test-${crypto.randomUUID()}`)
    const repository = createFitileRepository(db, 'user-1')
    const transport = new MemoryTransport()
    const engine = new SyncEngine(repository, transport)
    await repository.saveSet({ id: 'set-1', sessionId: 's', exerciseId: 'push-up', setNumber: 1, repetitions: 8, completedAt: '2026-08-28T20:00:00.000Z' })

    await engine.flush()
    await engine.flush()

    expect(transport.remote.size).toBe(1)
    expect(await repository.pendingOperations()).toHaveLength(0)
    db.close()
    await db.delete()
  })

  // Overlapping flushes previously raced and could deliver a stale "active" session
  // after the newer "completed" one, silently reverting server state.
  it('coalesces concurrent flushes so the newest write lands last', async () => {
    const db = new FitileDb(`sync-order-${crypto.randomUUID()}`)
    const repository = createFitileRepository(db, 'user-1')
    const transport = new MemoryTransport()
    transport.delayMs = 5
    const engine = new SyncEngine(repository, transport)

    await repository.sessions.put({ id: 'session-1', source: 'deterministic', split: 'push', status: 'active', startedAt: '2026-08-28T20:00:00.000Z' })
    await repository.sessions.put({ id: 'session-1', source: 'deterministic', split: 'push', status: 'completed', startedAt: '2026-08-28T20:00:00.000Z', completedAt: '2026-08-28T20:45:00.000Z' })

    await Promise.all([engine.flush(), engine.flush(), engine.flush()])

    expect((transport.remote.get('session-1') as { status: string }).status).toBe('completed')
    expect(await repository.pendingOperations()).toHaveLength(0)
    db.close()
    await db.delete()
  })
})
