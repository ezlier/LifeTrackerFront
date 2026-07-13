import api from './http'

export interface FocusRecord {
  id: number
  userId: number
  itemId: number | null
  mode: '番茄钟' | '倒计时' | '正计时'
  goal: string
  plannedDuration: number
  actualDuration: number
  pauseDuration: number
  status: 'running' | 'paused' | 'completed' | 'canceled'
  isCompleted: boolean
  startTime: string
  endTime: string | null
}

export interface FocusCreateParams {
  goal: string
  mode: string
  plannedDuration?: number
  itemId?: number | null
}

export interface WebSocketTicket {
  ticket: string
  expiresInMs: number
  endpoint: string
}

/** POST /ws-ticket —— 获取一次性 WebSocket 握手票据 */
export function createWebSocketTicket(): Promise<WebSocketTicket> {
  return api.post('/ws-ticket')
}

/** POST /focus —— 开始专注，返回任务 id */
export function createFocus(data: FocusCreateParams): Promise<number> {
  return api.post('/focus', data)
}

/** GET /focus/running —— 获取未完成的专注任务 */
export function getRunningFocus(): Promise<{ records: FocusRecord[] }> {
  return api.get('/focus/running')
}

/** PATCH /focus/:id/pause */
export function pauseFocus(id: number): Promise<null> {
  return api.patch(`/focus/${id}/pause`)
}

/** PATCH /focus/:id/resume */
export function resumeFocus(id: number): Promise<null> {
  return api.patch(`/focus/${id}/resume`)
}

/** PATCH /focus/:id/complete */
export function completeFocus(id: number): Promise<null> {
  return api.patch(`/focus/${id}/complete`)
}

/** PATCH /focus/:id/cancel */
export function cancelFocus(id: number): Promise<null> {
  return api.patch(`/focus/${id}/cancel`)
}
