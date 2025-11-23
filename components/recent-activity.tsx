import { MessageSquare, Clock, CheckCircle } from 'lucide-react'

export function RecentActivity({ logs }: { logs: any[] }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg">Oxirgi murojaatlar</h3>
        <span className="text-blue-400 text-sm">Real-vaqtda yangilanmoqda</span>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Hozircha murojaatlar yo'q...</p>
        ) : (
          logs.slice(0, 6).map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <MessageSquare className="text-blue-500 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {log.question}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {log.time}
                  </span>
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-3 h-3" /> AI javob berdi
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}