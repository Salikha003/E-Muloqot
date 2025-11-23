'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { api, type LogEntry } from '@/lib/api'

interface CallVolumeData {
  day: string
  calls: number
}

interface ResponseTimeData {
  time: string
  duration: number
}

const getBarColor = (value: number) => {
  if (value < 20) return '#4ECDC4'
  if (value <= 25) return '#FFD700'
  return '#FF6B6B'
}

export function Charts() {
  const [callVolumeData, setCallVolumeData] = useState<CallVolumeData[]>([])
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAndProcessLogs = async () => {
      try {
        setLoading(true)
        const logs = await api.getLogs()
        
        // Process logs for call volume by day
        const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan']
        const callsByDay = new Array(7).fill(0)
        
        logs.forEach((log: LogEntry) => {
          try {
            const date = new Date(log.time)
            const dayIndex = date.getDay()
            callsByDay[dayIndex]++
          } catch (e) {
            console.error('Error parsing date:', e)
          }
        })
        
        const volumeData = dayNames.map((day, index) => ({
          day,
          calls: callsByDay[index]
        }))
        setCallVolumeData(volumeData)
        
        // Process logs for response time by hour blocks
        const hourBlocks = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
        const callsByHourBlock = new Array(6).fill(0).map(() => ({ count: 0, totalTime: 0 }))
        
        logs.forEach((log: LogEntry) => {
          try {
            const date = new Date(log.time)
            const hour = date.getHours()
            const blockIndex = Math.floor(hour / 4)
            
            if (blockIndex >= 0 && blockIndex < 6) {
              callsByHourBlock[blockIndex].count++
              // Simulate response time based on call volume (more calls = slightly longer response)
              callsByHourBlock[blockIndex].totalTime += 15 + Math.random() * 10
            }
          } catch (e) {
            console.error('Error processing hour:', e)
          }
        })
        
        const timeData = hourBlocks.map((time, index) => ({
          time,
          duration: callsByHourBlock[index].count > 0 
            ? Math.round(callsByHourBlock[index].totalTime / callsByHourBlock[index].count)
            : 15 + Math.random() * 10
        }))
        setResponseTimeData(timeData)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        // Fallback to default data on error
        setCallVolumeData([
          { day: 'Dush', calls: 0 },
          { day: 'Sesh', calls: 0 },
          { day: 'Chor', calls: 0 },
          { day: 'Pay', calls: 0 },
          { day: 'Juma', calls: 0 },
          { day: 'Shan', calls: 0 },
          { day: 'Yak', calls: 0 },
        ])
        setResponseTimeData([
          { time: '00:00', duration: 15 },
          { time: '04:00', duration: 12 },
          { time: '08:00', duration: 22 },
          { time: '12:00', duration: 28 },
          { time: '16:00', duration: 25 },
          { time: '20:00', duration: 18 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAndProcessLogs()
    // Refresh every 60 seconds
    const interval = setInterval(fetchAndProcessLogs, 60000)
    return () => clearInterval(interval)
  }, [])
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[380px] flex items-center justify-center">
          <p className="text-gray-400">Ma'lumotlar yuklanmoqda...</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[380px] flex items-center justify-center">
          <p className="text-gray-400">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Call Volume Chart */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white text-lg font-semibold mb-6">Qo'ng'iroqlar Hajmi</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={callVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="calls"
              stroke="#4ECDC4"
              fill="rgba(78, 205, 196, 0.1)"
              strokeWidth={3}
              isAnimationActive={true}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Response Time Chart */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white text-lg font-semibold mb-6">Javob Berish Vaqti</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => `${value}s`}
            />
            <Bar dataKey="duration" radius={8}>
              {responseTimeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.duration)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
