import { createWebSocketTicket } from '@/api/focus'

const CLIENT_ID_KEY = 'lifetrackr_presence_client_id'
const HEARTBEAT_INTERVAL_MS = 10_000
const MAX_RECONNECT_DELAY_MS = 10_000

interface PresenceServerMessage {
  type?: string
  code?: string
  message?: string
  focusId?: number | null
}

interface FocusPresenceOptions {
  onBound?: (focusId: number) => void | Promise<void>
  onFocusUnavailable?: (focusId: number) => void | Promise<void>
  onError?: (error: unknown) => void
}

export interface FocusPresence {
  start: (focusId: number) => void
  stop: () => void
  destroy: () => void
}

let fallbackClientId: string | null = null

function createClientId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getOrCreateClientId() {
  try {
    const stored = localStorage.getItem(CLIENT_ID_KEY)
    if (stored) return stored

    const clientId = createClientId()
    localStorage.setItem(CLIENT_ID_KEY, clientId)
    return clientId
  } catch {
    fallbackClientId ??= createClientId()
    return fallbackClientId
  }
}

function createPresenceUrl(endpoint: string, ticket: string) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = new URL(endpoint, `${protocol}//${window.location.host}`)
  url.protocol = protocol
  url.searchParams.set('ticket', ticket)
  return url.toString()
}

export function createFocusPresence(options: FocusPresenceOptions = {}): FocusPresence {
  const clientId = getOrCreateClientId()

  let activeFocusId: number | null = null
  let socket: WebSocket | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  let sequence = 0
  let generation = 0
  let destroyed = false

  function notify(callback: ((focusId: number) => void | Promise<void>) | undefined, focusId: number) {
    if (!callback) return
    Promise.resolve(callback(focusId)).catch((error) => options.onError?.(error))
  }

  function clearHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  function clearReconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function send(payload: object) {
    if (socket?.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify(payload))
  }

  function sendHeartbeat(focusId: number) {
    send({
      type: 'HEARTBEAT',
      focusId,
      seq: ++sequence,
      clientTime: Date.now(),
    })
  }

  function startHeartbeat(focusId: number) {
    clearHeartbeat()
    sendHeartbeat(focusId)
    heartbeatTimer = setInterval(() => sendHeartbeat(focusId), HEARTBEAT_INTERVAL_MS)
  }

  function scheduleReconnect(run: number) {
    if (
      destroyed ||
      run !== generation ||
      activeFocusId === null ||
      reconnectTimer ||
      !navigator.onLine
    ) {
      return
    }

    const delay = Math.min(1_000 * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY_MS)
    reconnectAttempts += 1
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      void connect(run)
    }, delay)
  }

  async function connect(run: number) {
    const focusId = activeFocusId
    if (
      destroyed ||
      run !== generation ||
      focusId === null ||
      !navigator.onLine ||
      socket?.readyState === WebSocket.CONNECTING ||
      socket?.readyState === WebSocket.OPEN
    ) {
      return
    }

    try {
      const ticket = await createWebSocketTicket()
      if (destroyed || run !== generation || activeFocusId !== focusId) return

      const ws = new WebSocket(createPresenceUrl(ticket.endpoint, ticket.ticket))
      socket = ws

      ws.addEventListener('open', () => {
        if (destroyed || run !== generation || activeFocusId !== focusId) {
          ws.close(1000, 'Stale presence connection')
          return
        }

        send({
          type: 'BIND_FOCUS',
          focusId,
          clientId,
        })
      })

      ws.addEventListener('message', (event) => {
        if (run !== generation || activeFocusId !== focusId) return

        let message: PresenceServerMessage
        try {
          message = JSON.parse(String(event.data)) as PresenceServerMessage
        } catch (error) {
          options.onError?.(error)
          return
        }

        if (message.type === 'FOCUS_BOUND' && message.focusId === focusId) {
          reconnectAttempts = 0
          startHeartbeat(focusId)
          notify(options.onBound, focusId)
          return
        }

        if (message.type === 'ERROR') {
          options.onError?.(new Error(message.message || message.code || 'Presence WebSocket error'))
          if (message.code === 'FOCUS_NOT_RUNNING') {
            const unavailableFocusId = focusId
            stopInternal(false)
            notify(options.onFocusUnavailable, unavailableFocusId)
          }
        }
      })

      ws.addEventListener('error', () => {
        if (run === generation) {
          options.onError?.(new Error('Presence WebSocket transport error'))
        }
      })

      ws.addEventListener('close', () => {
        if (socket === ws) socket = null
        clearHeartbeat()
        if (run === generation && activeFocusId === focusId) {
          scheduleReconnect(run)
        }
      })
    } catch (error) {
      options.onError?.(error)
      if (run === generation && activeFocusId === focusId) {
        scheduleReconnect(run)
      }
    }
  }

  function stopInternal(sendUnbind: boolean) {
    generation += 1
    activeFocusId = null
    reconnectAttempts = 0
    sequence = 0
    clearReconnect()
    clearHeartbeat()

    const ws = socket
    socket = null
    if (!ws) return

    if (sendUnbind && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'UNBIND_FOCUS' }))
    }
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, 'Presence monitoring stopped')
    }
  }

  function start(focusId: number) {
    if (!Number.isInteger(focusId) || focusId <= 0 || destroyed) return

    if (
      activeFocusId === focusId &&
      (socket?.readyState === WebSocket.CONNECTING ||
        socket?.readyState === WebSocket.OPEN ||
        reconnectTimer)
    ) {
      return
    }

    stopInternal(true)
    activeFocusId = focusId
    const run = generation
    void connect(run)
  }

  function stop() {
    stopInternal(true)
  }

  function handleOnline() {
    if (activeFocusId !== null && !destroyed) {
      clearReconnect()
      void connect(generation)
    }
  }

  function handleOffline() {
    if (
      socket?.readyState === WebSocket.OPEN ||
      socket?.readyState === WebSocket.CONNECTING
    ) {
      socket.close()
    }
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  function destroy() {
    if (destroyed) return
    destroyed = true
    stopInternal(true)
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }

  return { start, stop, destroy }
}
