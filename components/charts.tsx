'use client'

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

const callVolumeData = [
  { day: 'Dush', calls: 450 },
  { day: 'Sesh', calls: 520 },
  { day: 'Chor', calls: 480 },
  { day: 'Pay', calls: 590 },
  { day: 'Juma', calls: 610 },
  { day: 'Shan', calls: 380 },
  { day: 'Yak', calls: 420 },
]

const responseTimeData = [
  { time: '00:00', duration: 15 },
  { time: '04:00', duration: 12 },
  { time: '08:00', duration: 22 },
  { time: '12:00', duration: 28 },
  { time: '16:00', duration: 25 },
  { time: '20:00', duration: 18 },
]

const getBarColor = (value: number) => {
  if (value < 20) return '#4ECDC4'
  if (value <= 25) return '#FFD700'
  return '#FF6B6B'
}

export function Charts() {
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
