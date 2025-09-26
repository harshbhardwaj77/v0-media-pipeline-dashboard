import type { Status, LinksResponse, ApiResponse } from "@/types/api"

// Handle environment variable access safely
const getApiBase = (): string => {
  try {
    // Check if we're in a Vite environment with access to import.meta.env
    if (import.meta?.env?.VITE_API_BASE) {
      return import.meta.env.VITE_API_BASE
    }
  } catch (error) {
    // Fallback if import.meta is not available
    console.warn("Environment variable access failed, using default API base")
  }

  // Default fallback
  return "http://localhost:8081"
}

const API_BASE = getApiBase()

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError("Network error or API unavailable")
  }
}

export const api = {
  // Status endpoints
  getStatus: (): Promise<Status> => fetchApi("/api/status"),

  // Pipeline control
  startPipeline: (): Promise<ApiResponse> => fetchApi("/api/pipeline/start", { method: "POST" }),
  stopPipeline: (): Promise<ApiResponse> => fetchApi("/api/pipeline/stop", { method: "POST" }),

  // Links management
  getLinks: (): Promise<LinksResponse> => fetchApi("/api/links"),
  addLink: (url: string): Promise<ApiResponse> =>
    fetchApi("/api/links", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
  addBulkLinks: (urls: string[]): Promise<ApiResponse> =>
    fetchApi("/api/links/bulk", {
      method: "POST",
      body: JSON.stringify({ urls }),
    }),
  deleteLink: (id: string): Promise<ApiResponse> => fetchApi(`/api/links/${id}`, { method: "DELETE" }),
}

export { API_BASE }
