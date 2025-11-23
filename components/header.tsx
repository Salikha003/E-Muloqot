'use client'

import { Search, Bell } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="sticky top-0 bg-slate-800/30 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between z-40">
      {/* Left side */}
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm">Ta'lim Call-Markaz Boshqaruv Paneli</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-200"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors duration-200">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
        </button>
      </div>
    </div>
  )
}
