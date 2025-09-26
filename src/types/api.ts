export interface Status {
  pipeline: "running" | "stopped" | "unknown"
  containerName: string
  vpn: "up" | "down" | "unknown"
  tor: "up" | "down" | "unknown"
  lastRunAt?: string
  cleanJobs?: number
  version?: string
}

export interface Link {
  id: string
  url: string
  addedAt: string
}

export interface LinksResponse {
  items: Link[]
}

export interface LogEntry {
  ts: string
  line: string
  level?: "info" | "warn" | "error"
}

export interface ApiResponse<T = any> {
  ok?: boolean
  id?: string
  created?: number
  data?: T
}

export interface UserSettings {
  autoScrollLogs: boolean
  pollStatusIfSSEUnavailable: boolean
  statusPollInterval: number
  maxLogLines: number
}

export const DEFAULT_SETTINGS: UserSettings = {
  autoScrollLogs: true,
  pollStatusIfSSEUnavailable: true,
  statusPollInterval: 2000,
  maxLogLines: 10000,
}
