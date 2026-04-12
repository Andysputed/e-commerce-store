import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useAppContext } from "../context";
import { ShieldCheck, ChevronRight, Lock, Plus, Minus } from "lucide-react";



export function Checkout() {
  const { cart, cartTotal, updateQuantity } = useAppContext();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("+254");
  const [isProcessing, setIsProcessing] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length < 9) {
      alert("Please enter a valid M-Pesa number.");
      return;
    }
    
    setIsProcessing(true);

    // 1. THE BULLETPROOF PHONE FORMATTER (Strips the '+')
    let cleanPhone = phone.replace(/\D/g, ""); 
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "254" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("7") || cleanPhone.startsWith("1")) {
      cleanPhone = "254" + cleanPhone;
    }

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/mpesa-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: "pay",
          phone: cleanPhone, // WE ARE SENDING THE CLEANED NUMBER
          amount: Math.round(cartTotal) // DARAJA HATES DECIMALS
        }),
      });

      const data = await response.json();
      const safaricomCode = data.safaricomResponse?.ResponseCode;

      // 2. THE TRUTH DETECTOR
      if (response.ok && safaricomCode === "0") {
        console.log("✅ REAL STK Push Triggered!", data);
        setTimeout(() => {
          navigate("/success");
        }, 5000); 

      } else {
        // THIS CATCHES THE SILENT DARAJA ERRORS
        console.error("❌ Daraja Rejected It:", data);
        const errorMessage = 
          data.safaricomResponse?.errorMessage || 
          data.safaricomResponse?.ResponseDescription || 
          data.error || 
          "Unknown Error";
          
        alert(`Safaricom Error: ${errorMessage}`);
        setIsProcessing(false);
      }

    } catch (error) {
      console.error("Network error:", error);
      alert("Could not connect to the payment server.");
      setIsProcessing(false);
    }
  };
  return (
    <div className="flex-1 max-w-[1200px] w-full mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-16 items-start justify-center py-12 lg:py-20">
      
      {/* Left: Cart Summary */}
      <div className="w-full lg:w-[45%] lg:sticky lg:top-[120px]">
        <div className="flex items-center gap-2 text-[#888] text-sm mb-8">
          <span>Cart</span>
          <ChevronRight size={14} />
          <span className="text-[#D4AF37]">Checkout</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] text-[#ECECEC] mb-8">
          Your Selection
        </h2>

        {cart.length === 0 ? (
          <p className="text-[#666]">Your cellar is empty.</p>
        ) : (
          <div className="space-y-6">
            {cart.map((item) => (
              <motion.div 
                key={item.product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 border-b border-[#2A2A2A] pb-6"
              >
                <div className="h-20 w-16 bg-[#111] rounded overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                  <img src={item.product.image} alt={item.product.name} className="h-full object-contain drop-shadow-lg" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-[#ECECEC] font-['Playfair_Display']">{item.product.name}</h4>
                  <div className="text-sm text-[#888]">{item.product.volume}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded-full bg-[#2A2A2A] hover:bg-[#333] text-[#ECECEC] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-[#ECECEC] text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded-full bg-[#2A2A2A] hover:bg-[#333] text-[#ECECEC] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[#D4AF37] font-semibold">
                    KES {(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="pt-6 flex justify-between items-center text-xl">
              <span className="text-[#888]">Subtotal</span>
              <span className="text-2xl text-[#ECECEC] font-['Playfair_Display']">
                KES {cartTotal.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Secure M-Pesa Input */}
      <div className="w-full lg:w-[45%] bg-[#111] border border-[#2A2A2A] rounded-2xl p-6 md:p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C27A2F]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-3 text-[#31C48D] mb-8 bg-[#31C48D]/10 w-fit px-4 py-2 rounded-full border border-[#31C48D]/20">
          <ShieldCheck size={18} />
          <span className="text-sm font-medium tracking-wide">Secure SSL Encrypted Checkout</span>
        </div>

        <h3 className="text-2xl font-['Playfair_Display'] text-[#ECECEC] mb-2">
          Express Checkout
        </h3>
        <p className="text-[#888] text-sm mb-10">
          Enter your Safaricom number to trigger an M-Pesa prompt on your phone.
        </p>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="mb-8">
            <label className="block text-xs uppercase tracking-widest text-[#666] mb-3">
              M-Pesa Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#C27A2F] text-[#ECECEC] text-xl tracking-wider rounded-lg p-5 outline-none transition-colors font-mono"
                placeholder="+254 7XX XXX XXX"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444]">
                <Lock size={20} />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isProcessing || cart.length === 0}
            className={`w-full relative py-5 rounded-lg font-bold text-lg tracking-wide uppercase flex justify-center items-center gap-3 transition-all duration-700 ${
              cart.length === 0 
                ? 'bg-[#333] text-[#666] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#C27A2F] to-[#D4AF37] text-black shadow-[0_0_40px_rgba(194,122,47,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)]'
            }`}
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing Request...</span>
            ) : (
              <>
                <span className="relative z-10">TRIGGER M-PESA PAYMENT</span>
                {/* Embedded pulse effect container */}
                <div className="absolute inset-0 rounded-lg border-2 border-[#D4AF37]/50 animate-pulse"></div>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-xs text-[#666] flex items-center justify-center gap-2">
          <Lock size={12} />
          Payments securely processed by Safaricom Daraja API
        </div>
      </div>
    </div>
  );
}
