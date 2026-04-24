import React, { useState } from "react";
import { supabase } from "../context";
import { ShieldCheck, Mail, Key, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Login successful!
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-['Inter'] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-8 relative z-10 shadow-2xl shadow-black"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#111] border border-[#2A2A2A] rounded-2xl flex items-center justify-center mb-6 relative group">
            <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-2xl blur-xl group-hover:bg-[#D4AF37]/30 transition-all" />
            <ShieldCheck size={32} className="text-[#D4AF37] relative z-10" />
          </div>
          <h1 className="text-2xl font-['Playfair_Display'] font-bold text-[#ECECEC] uppercase tracking-widest text-center">
            Admin Gateway
          </h1>
          <p className="text-[#666] text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2 font-mono">
            <Lock size={10} /> Secure Session Required
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2 ml-1">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={16} className="text-[#444]" />
              </div>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-[#222] text-[#ECECEC] rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm"
                placeholder="admin@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#888] uppercase tracking-widest mb-2 ml-1">Authorization Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key size={16} className="text-[#444]" />
              </div>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-[#222] text-[#ECECEC] rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#D4AF37] hover:bg-[#C29B2E] text-black font-bold uppercase tracking-widest py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}