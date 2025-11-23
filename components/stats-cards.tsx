'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Activity, Clock } from 'lucide-react'
import { api, type StatsResponse } from '@/lib/api'

export function StatsCards({ totalCalls }: { totalCalls: number }) {
  const [statsData, setStatsData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await api.getStats()
        setStatsData(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate average response time (mock calculation based on efficiency)
  const avgResponseTime = statsData ? (100 - parseFloat(statsData.efficiency)) / 10 : 0.8

  const stats = [
    {
      title: 'Jami murojaatlar',
      value: loading ? '...' : (statsData?.total_calls?.toString() || totalCalls.toString()),
      change: statsData?.today_calls ? `Bugun: ${statsData.today_calls}` : '+12%',
      icon: MessageCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Samaradorlik',
      value: loading ? '...' : (statsData?.efficiency || '92%'),
      change: 'Jonli',
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      title: 'O\'rtacha vaqt',
      value: loading ? '...' : `${avgResponseTime.toFixed(1)}s`,
      change: 'Optimal',
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`${stat.color} w-6 h-6`} />
            </div>
            <span className="text-green-400 text-sm font-medium">{stat.change}</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
          <p className="text-white text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}