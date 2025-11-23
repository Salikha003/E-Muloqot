'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  PhoneIncoming,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calls', label: "Qo'ng'iroqlar", icon: PhoneIncoming, badge: '12', badgeColor: 'bg-red-500' },
  { id: 'chats', label: 'Chatlar', icon: MessageSquare, badge: '5', badgeColor: 'bg-blue-500' },
  { id: 'users', label: 'Foydalanuvchilar', icon: Users },
  { id: 'stats', label: 'Statistika', icon: BarChart3 },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Admin Panel</h2>
            <p className="text-gray-400 text-xs">Operator Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    'px-2 py-1 rounded text-white text-xs font-semibold',
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">Operator #12</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-ring"></div>
              <span className="text-green-400 text-xs">Faol</span>
            </div>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm transition-colors duration-200">
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </div>
  )
}
