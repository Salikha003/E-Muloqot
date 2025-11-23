'use client'

import { useState } from 'react'

interface Operator {
  id: string
  name: string
  status: 'online' | 'lunch' | 'offline'
  activeChats: number
  avatarGradient: string
  letter: string
}

const operators: Operator[] = [
  {
    id: '1',
    name: 'Alisher',
    status: 'online',
    activeChats: 8,
    avatarGradient: 'from-blue-500 to-cyan-500',
    letter: 'A',
  },
  {
    id: '2',
    name: 'Nigora',
    status: 'online',
    activeChats: 12,
    avatarGradient: 'from-purple-500 to-pink-500',
    letter: 'N',
  },
  {
    id: '3',
    name: 'Dilshod',
    status: 'lunch',
    activeChats: 0,
    avatarGradient: 'from-green-500 to-emerald-500',
    letter: 'D',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500 animate-pulse-ring'
    case 'lunch':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return 'Online'
    case 'lunch':
      return 'Tushlik'
    default:
      return 'Offline'
  }
}

export function ActiveOperators() {
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null)

  const onlineCount = operators.filter(op => op.status === 'online').length
  const totalCount = operators.length

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-white text-lg font-semibold mb-6">Faol Operatorlar</h3>

      {/* Operator Cards */}
      <div className="space-y-3 mb-6">
        {operators.map(operator => (
          <div
            key={operator.id}
            onClick={() => setSelectedOperator(selectedOperator === operator.id ? null : operator.id)}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedOperator === operator.id
                ? 'bg-blue-900/30 border-blue-500/50'
                : 'bg-slate-700/30 border-white/5 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${operator.avatarGradient} flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}
              >
                {operator.letter}
              </div>

              {/* Operator Info */}
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{operator.name}</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(operator.status)}`} />
                  <span className="text-gray-400 text-xs">{getStatusText(operator.status)}</span>
                </div>
              </div>

              {/* Active Chats Badge */}
              {operator.activeChats > 0 && (
                <div className="bg-blue-600/30 border border-blue-500/50 rounded-lg px-2 py-1">
                  <p className="text-blue-200 text-xs font-medium">{operator.activeChats} chat</p>
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {selectedOperator === operator.id && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Faollik:</span>
                  <span className="text-white text-xs font-medium">
                    {operator.activeChats} ta chat, o'rtacha javob vaqti 18s
                  </span>
                </div>
                <button className="w-full mt-2 bg-blue-600/20 border border-blue-500/50 text-blue-300 rounded-lg py-2 text-xs font-medium hover:bg-blue-600/30 transition">
                  Batafsil ko'rish
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="border-t border-white/10 pt-6 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Onlaynga chiqishgan:</span>
          <span className="text-green-400 font-semibold text-sm">{onlineCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Jami operatorlar:</span>
          <span className="text-gray-300 font-semibold text-sm">{totalCount}</span>
        </div>
      </div>
    </div>
  )
}
