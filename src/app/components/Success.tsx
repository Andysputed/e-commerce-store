import React, { useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Check, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export function Success() {
  useEffect(() => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    
    const colors = ['#D4AF37', '#C27A2F', '#ECECEC'];

    (function frame() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2
        },
        colors: colors
      });

      requestAnimationFrame(frame);
    }());
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-8 border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.2)] relative"
      >
        <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37] opacity-20 animate-ping"></div>
        <Check size={48} className="text-[#D4AF37]" />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-['Playfair_Display'] text-[#ECECEC] mb-4 text-center"
      >
        Payment Verified
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[#888] text-lg max-w-md text-center mb-12"
      >
        Your selection is being prepared for dispatch. Your M-Pesa receipt has been sent via SMS.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link 
          to="/" 
          className="group flex items-center gap-2 text-[#D4AF37] uppercase tracking-widest text-sm font-semibold hover:text-[#ECECEC] transition-colors"
        >
          Return to Cellar
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}
