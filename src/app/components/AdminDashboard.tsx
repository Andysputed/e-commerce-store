import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Bell, ShieldAlert, CheckCircle, Clock, TrendingUp, BarChart3, Database } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

const HOURLY_DATA = [
  { time: "10am", ksh: 12000 },
  { time: "11am", ksh: 19500 },
  { time: "12pm", ksh: 35000 },
  { time: "1pm", ksh: 28000 },
  { time: "2pm", ksh: 42000 },
  { time: "3pm", ksh: 65000 },
  { time: "4pm", ksh: 89000 },
  { time: "Now", ksh: 124500 },
];

const INITIAL_TRANSACTIONS = [
  { id: "QWE789XCV", phone: "+254 712 *** 345", amount: 18500, status: "pending" },
  { id: "RTY456BNM", phone: "+254 722 *** 789", amount: 4500, status: "verified" },
  { id: "UIO123LKJ", phone: "+254 733 *** 012", amount: 6500, status: "verified" },
  { id: "PAS789QWE", phone: "+254 799 *** 456", amount: 350, status: "verified" },
];

const INVENTORY = [
  { name: "Singleton 12YO", current: 24, max: 30 },
  { name: "Tusker Cider", current: 8, max: 200 },
  { name: "Grey Goose Vodka", current: 15, max: 50 },
  { name: "Penfolds Bin 389", current: 3, max: 30 },
];

export function AdminDashboard() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Simulate a status change for the wow factor
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions((prev) => 
        prev.map(t => 
          t.status === "pending" ? { ...t, status: "verified" } : t
        )
      );
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#ECECEC] font-['Inter'] flex flex-col">
      {/* Commander Header */}
      <header className="bg-[#0D0D0D] border-b border-[#2A2A2A] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Database className="text-[#D4AF37]" size={28} />
          <div>
            <h1 className="text-xl md:text-2xl font-['Playfair_Display'] text-[#ECECEC] font-bold tracking-wider">
              BANDAPTAI COMMANDER CONSOLE
            </h1>
            <div className="text-xs text-[#666] uppercase tracking-widest font-mono">
              Live Systems Active • Secure Session
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm text-[#888] hover:text-[#ECECEC] transition-colors border-b border-transparent hover:border-[#888] pb-1 hidden md:block">
            Exit to Storefront
          </Link>
          <div className="relative cursor-pointer">
            <Bell size={24} className="text-[#888] hover:text-[#ECECEC]" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse border border-[#0D0D0D]">
              5 Low Stock!
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-[1800px] mx-auto w-full">
        
        {/* Left Column: Top Stats & Chart */}
        <div className="xl:col-span-2 space-y-6 flex flex-col">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Cashflow Widget */}
            <div className="bg-[#111] border border-[#2A2A2A] rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#D4AF37]/10 transition-colors duration-1000"></div>
              
              <div className="flex items-center gap-2 text-[#888] mb-4 text-sm uppercase tracking-widest">
                <TrendingUp size={16} className="text-[#D4AF37]" />
                Today's Verified M-Pesa Revenue
              </div>
              <div className="text-5xl md:text-6xl font-['Playfair_Display'] text-[#D4AF37] font-semibold drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                KES 124,500
              </div>
              <div className="mt-4 text-[#31C48D] text-sm flex items-center gap-1 bg-[#31C48D]/10 w-fit px-3 py-1 rounded-full border border-[#31C48D]/20">
                <TrendingUp size={14} /> +24% vs yesterday
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-[#111] border border-[#2A2A2A] rounded-xl p-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col justify-center border-r border-[#2A2A2A] pr-4">
                <div className="text-[#888] text-sm uppercase tracking-widest mb-2">Total Orders</div>
                <div className="text-3xl text-[#ECECEC] font-['Playfair_Display']">142</div>
              </div>
              <div className="flex flex-col justify-center pl-2">
                <div className="text-[#888] text-sm uppercase tracking-widest mb-2">Avg Order Val</div>
                <div className="text-3xl text-[#ECECEC] font-['Playfair_Display']">KES 8,450</div>
              </div>
            </div>
          </div>

          {/* Chart Widget */}
          <div className="bg-[#111] border border-[#2A2A2A] rounded-xl p-6 flex-1 min-h-[350px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-[#ECECEC] font-semibold">
                <BarChart3 size={20} className="text-[#C27A2F]" />
                Transaction Volume (Hourly)
              </div>
              <div className="flex gap-2">
                <span className="bg-[#C27A2F]/20 text-[#C27A2F] text-xs px-3 py-1 rounded-full border border-[#C27A2F]/30">Today</span>
                <span className="text-[#666] text-xs px-3 py-1 rounded-full border border-[#333]">Week</span>
              </div>
            </div>
            
            <div className="h-[280px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKsh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C27A2F" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#C27A2F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="time" stroke="#666" axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#666" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val: number) => `KES ${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#ECECEC' }}
                    itemStyle={{ color: '#D4AF37' }}
                  />
                  <Area type="monotone" dataKey="ksh" stroke="#C27A2F" strokeWidth={3} fillOpacity={1} fill="url(#colorKsh)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Transactions & Inventory */}
        <div className="space-y-6">
          
          {/* Live Transaction Monitor */}
          <div className="bg-[#111] border border-[#2A2A2A] rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-[#2A2A2A] pb-4">
              <h3 className="text-[#ECECEC] font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Live M-Pesa Monitor
              </h3>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {transactions.map((tx) => (
                  <motion.div 
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-[#333] gap-4 sm:gap-0"
                  >
                    <div>
                      <div className="text-sm font-mono text-[#ECECEC] mb-1">{tx.id}</div>
                      <div className="text-xs text-[#888]">{tx.phone}</div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end sm:gap-6 w-full sm:w-auto">
                      <div className="text-[#D4AF37] font-semibold text-right min-w-[100px]">
                        KES {tx.amount.toLocaleString()}
                      </div>
                      
                      {/* Dynamic Pill Tag */}
                      <motion.div 
                        layout
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wider font-semibold w-[140px] justify-center ${
                          tx.status === "pending" 
                            ? "bg-[#F0B030]/15 text-[#F0B030] border border-[#F0B030]/30 shadow-[0_0_10px_rgba(240,176,48,0.2)]"
                            : "bg-[#31C48D]/15 text-[#31C48D] border border-[#31C48D]/30 shadow-[0_0_10px_rgba(49,196,141,0.2)]"
                        }`}
                      >
                        {tx.status === "pending" ? (
                          <>
                            <Clock size={12} className="animate-spin-slow" />
                            Pending Callback
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            Payment Verified
                          </>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Out-of-Stock Preventer */}
          <div className="bg-[#111] border border-[#2A2A2A] rounded-xl p-6">
            <h3 className="text-[#ECECEC] font-semibold mb-6 flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500" />
              Out-of-Stock Preventer
            </h3>

            <div className="space-y-6">
              {INVENTORY.map((item) => {
                const percentage = (item.current / item.max) * 100;
                let statusColor = "bg-[#31C48D]"; // Green
                let textColor = "text-[#31C48D]";
                
                if (percentage < 35) {
                  statusColor = "bg-[#F0B030]"; // Amber
                  textColor = "text-[#F0B030]";
                }
                if (item.current < 10) {
                  statusColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse";
                  textColor = "text-red-500 animate-pulse";
                }

                return (
                  <div key={item.name}>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-sm text-[#ECECEC]">{item.name}</div>
                      <div className={`text-xs font-semibold ${textColor}`}>
                        {item.current} / {item.max} Left
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${statusColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full mt-8 py-3 bg-[#1A1A1A] border border-[#333] hover:border-[#888] rounded-lg text-sm text-[#888] hover:text-[#ECECEC] transition-colors uppercase tracking-widest">
              Review Restock Orders
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
