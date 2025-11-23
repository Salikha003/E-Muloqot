'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StatsCards } from '@/components/stats-cards'
import { Charts } from '@/components/charts'
import { RecentActivity } from '@/components/recent-activity'
import { ActiveOperators } from '@/components/active-operators'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Backenddan keladigan real murojaatlar (loglar) uchun holat
  const [logs, setLogs] = useState([])

  // 1. Backenddan loglarni (savol-javoblarni) olib kelish funksiyasi
  const fetchLogs = async () => {
    try {
      // Keshni butunlay o'chirib, har safar yangi ma'lumot olishni kafolatlaymiz
      const res = await fetch("http://localhost:8000/logs", { 
        cache: 'no-store', 
        headers: { 
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache' 
        } 
      });

      if (!res.ok) throw new Error("Serverdan ma'lumot kelmadi");
      
      const data = await res.json();
      console.log("Admin Panelga kelgan ma'lumotlar:", data);
      setLogs(data);
    } catch (error) {
      console.error("Admin Panel Fetch xatosi:", error);
    }
  };

  // 2. Effekt: Sahifa yuklanganda va har 10 soniyada yangilab turish
  useEffect(() => {
    fetchLogs()
    
    // Har 10 soniyada refreshTrigger orqali komponentlarni yangilaymiz
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1)
      fetchLogs() 
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <Header key={refreshTrigger} />

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-ax-7xl">
            
            {/* Stats Cards - Jami murojaatlar soni */}
            <div className="mb-8">
              <StatsCards 
                key={refreshTrigger} 
                totalCalls={logs.length} 
              />
            </div>

            {activeTab === 'dashboard' && (
              <>
                <Charts />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {/* Recent Activity - Real loglar */}
                    <RecentActivity 
                      key={refreshTrigger} 
                      logs={logs} 
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <ActiveOperators key={refreshTrigger} />
                  </div>
                </div>
              </>
            )}

            {/* Boshqa Tablar */}
            {activeTab !== 'dashboard' && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="text-white text-xl font-bold mb-4 text-balance">
                  {activeTab === 'calls' && 'Qo\'ng\'iroqlar Ro\'yxati'}
                  {activeTab === 'chats' && 'Jonli Chatlar'}
                  {activeTab === 'users' && 'Foydalanuvchilar'}
                  {activeTab === 'stats' && 'Statistika'}
                  {activeTab === 'settings' && 'Sozlamalar'}
                </h2>
                <p className="text-gray-400">
                  {activeTab === 'calls' && `Bazada jami ${logs.length} ta murojaat yozib olingan.`}
                  {activeTab === 'chats' && 'Foydalanuvchilar bilan AI bot muloqoti tahlili.'}
                  {activeTab === 'users' && 'Tizimga murojaat qilgan fuqarolar bazasi.'}
                  {activeTab === 'stats' && 'Murojaatlarning umumiy dinamikasi.'}
                  {activeTab === 'settings' && 'AI model va tizim parametrlarini boshqarish.'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}