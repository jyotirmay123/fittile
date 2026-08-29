import type { FitileRepository } from '../local/repositories'
import type { SyncEntity, SyncStatus, SyncTransport } from './types'

export class SyncEngine {
  status: SyncStatus = 'idle'
  lastError?: string
  private running = false
  private requested = false

  constructor(private readonly repository: FitileRepository, private readonly transport: SyncTransport) {}

  /**
   * Drains the outbox in creation order. Concurrent callers are coalesced into a
   * single run: operations must reach the server in the order they were recorded,
   * otherwise a stale write (for example a session still marked "active") can land
   * after the newer one that supersedes it.
   */
  async flush() {
    this.requested = true
    if (this.running) return
    this.running = true
    try {
      while (this.requested) {
        this.requested = false
        await this.drain()
      }
    } finally {
      this.running = false
    }
  }

  /**
   * Restores the account from the server. Runs before the app decides whether a
   * user has onboarded, so signing in on a new device does not look like a new
   * account. Local pending writes are pushed first so they are never overwritten.
   */
  async hydrate(userId: string): Promise<boolean> {
    if (!this.transport.pull) return true
    try {
      await this.flush()
      const pulled = await this.transport.pull(userId)
      for (const [entity, records] of Object.entries(pulled)) {
        if (records?.length) await this.repository.applyServerRecords(entity as SyncEntity, records)
      }
      this.lastError = undefined
      return true
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error)
      this.status = error instanceof SyncAuthError ? 'auth-required' : error instanceof TypeError ? 'offline' : 'error'
      return false
    }
  }

  private async drain() {
    this.status = 'syncing'
    for (const operation of await this.repository.pendingOperations()) {
      try {
        const acknowledgement = await this.transport.push(operation)
        if (acknowledgement.operationId === operation.id) {
          this.lastError = undefined
          await this.repository.acknowledgeOperation(operation.id)
        }
      } catch (error) {
        this.lastError = error instanceof Error ? error.message : String(error)
        if (error instanceof SyncAuthError) {
          this.status = 'auth-required'
          return
        }
        this.status = error instanceof TypeError ? 'offline' : 'error'
        await this.repository.deferOperation(operation)
        return
      }
    }
    this.status = 'idle'
  }
}

export class SyncAuthError extends Error {}
