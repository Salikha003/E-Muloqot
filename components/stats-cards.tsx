import { MessageCircle, Activity, Clock } from 'lucide-react'

export function StatsCards({ totalCalls }: { totalCalls: number }) {
  const stats = [
    {
      title: 'Jami murojaatlar',
      value: totalCalls.toString(),
      change: '+12%',
      icon: MessageCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Aktiv chatlar',
      value: '24',
      change: 'Jonli',
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Kutish vaqti',
      value: '0.8s',
      change: '-15%',
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