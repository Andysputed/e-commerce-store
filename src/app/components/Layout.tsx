import React from "react";
import { Outlet, Link, useLocation } from "react-router";
import { ShoppingCart, Menu, Activity } from "lucide-react";
import { useAppContext } from "../context";
import { motion } from "motion/react";

export function Layout() {
  const { cartCount } = useAppContext();
  const location = useLocation();
  const isCheckoutOrSuccess = location.pathname.includes("checkout") || location.pathname.includes("success");

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#ECECEC] font-['Inter'] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2A2A2A] bg-[#0D0D0D]/90 backdrop-blur-md px-4 py-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isCheckoutOrSuccess && (
            <button className="md:hidden text-[#D4AF37]">
              <Menu size={24} />
            </button>
          )}
          <Link to="/" className="text-[#D4AF37] text-xl md:text-2xl font-['Playfair_Display'] font-semibold tracking-wide flex items-center gap-2">
            BANDAPTAI
            <span className="hidden md:inline text-xs font-['Inter'] text-[#C27A2F] uppercase tracking-widest mt-1">Lounge & Store</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/admin" className="text-[#888] hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-sm">
            <Activity size={16} />
            <span className="hidden md:inline">Commander Console</span>
          </Link>

          {!isCheckoutOrSuccess && (
            <Link to="/checkout" className="relative text-[#D4AF37] p-2">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 bg-[#C27A2F] text-[#0D0D0D] text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full"
                >
                  {cartCount}
                </motion.div>
              )}
            </Link>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
