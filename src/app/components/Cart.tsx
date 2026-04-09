import { motion } from 'motion/react';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import type { CartItem } from '../App';

type CartProps = {
  cart: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  onBack: () => void;
  total: number;
};

export function Cart({ cart, onUpdateQuantity, onRemove, onCheckout, onBack, total }: CartProps) {
  if (cart.length === 0) {
    return (
      <main className="max-w-md mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 text-[#D4A574]/40">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto">
              <path d="M9 2L7 4H3v2h18V4h-4l-2-2H9z" strokeWidth="1.5" />
              <path d="M3 6v14a2 2 0 002 2h14a2 2 0 002-2V6" strokeWidth="1.5" />
            </svg>
          </div>
          <h2
            className="text-3xl mb-3 text-[#fafafa]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Your cart is empty
          </h2>
          <p className="text-[#a0a0a0] mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            Discover our premium selection
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-[#D4A574] text-[#0a0a0a] rounded-lg hover:bg-[#c99860] transition-colors font-medium"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Continue Shopping
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-6 py-8 min-h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#D4A574] hover:opacity-80 transition-opacity mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={20} />
          <span>Continue Shopping</span>
        </button>
        <h2
          className="text-4xl text-[#fafafa]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Your Selection
        </h2>
      </div>

      <div className="flex-1 space-y-4 mb-6">
        {cart.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-[#1a1a1a] rounded-lg p-4 flex gap-4"
          >
            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#D4A574]/20 to-transparent" />
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="text-lg mb-1 text-[#fafafa] truncate"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {item.name}
              </h3>
              <p className="text-sm text-[#a0a0a0] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[#D4A574]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {item.price.toLocaleString()} KES
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-md bg-[#2a2a2a] text-[#fafafa] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-md bg-[#2a2a2a] text-[#fafafa] flex items-center justify-center hover:bg-[#3a3a3a] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="ml-2 p-1.5 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-[#D4A574]/20 pt-6">
        <div className="flex items-center justify-between mb-6">
          <span
            className="text-2xl text-[#a0a0a0]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Total
          </span>
          <span
            className="text-3xl text-[#D4A574]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {total.toLocaleString()} KES
          </span>
        </div>

        <button
          onClick={onCheckout}
          className="w-full py-4 bg-[#D4A574] text-[#0a0a0a] rounded-lg hover:bg-[#c99860] transition-all duration-300 font-semibold tracking-wide"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Proceed to Checkout
        </button>
      </div>
    </main>
  );
}
