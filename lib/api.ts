// API Service Layer - Centralized backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    throw error
  }
}

export const api = {
  // Get all logs
  getLogs: () => fetchAPI<LogEntry[]>('/logs'),

  // Get statistics
  getStats: () => fetchAPI<StatsResponse>('/stats'),

  // Get admin stats
  getAdminStats: () => fetchAPI<AdminStatsResponse>('/admin-stats'),
}

// Type definitions for API responses
export interface LogEntry {
  id: number
  question: string
  answer: string
  time: string
}

export interface StatsResponse {
  total_calls: number
  today_calls: number
  saved_money: string
  efficiency: string
}

export interface AdminStatsResponse {
  count: number
  saved_money: string
  rating: number
}
