import api from './http'

export interface TimelineEventRecord {
  id: number
  userId: number
  itemId: number
  eventType: string
  description: string
  eventData: unknown
  createdAt: string
  itemTitle: string
  itemCover: string
  itemRating: number | null
  itemType: string
  itemStatus: string
}

export interface TimelineEventPage {
  records: TimelineEventRecord[]
  total: number
  size: number
  current: number
  pages: number
}

export interface TimelineEventQuery {
  itemId?: number
  eventType?: string
  itemType?: string
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

/** GET /timelineEvent */
export function getTimelineEvents(
  params?: TimelineEventQuery,
): Promise<TimelineEventPage> {
  return api.get('/timelineEvent', { params })
}
