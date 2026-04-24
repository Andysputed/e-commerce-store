import React from "react";
import { motion } from "motion/react";
import { useAppContext, Product } from "../context";
import { Plus, Filter, Search } from "lucide-react";

const CATEGORIES = ["All", "Whiskeys", "Vodkas", "Beers", "Wine"];

export function Storefront() {
  const { addToCart, products, isLoading } = useAppContext();
  const [activeCategory, setActiveCategory] = React.useState("All");

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#0A0A0A]">
        <div className="text-[#D4AF37] font-['Playfair_Display'] text-xl animate-pulse">
          Opening the Cellar...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full">
      {/* Sidebar - Hidden on mobile, shows on tablet (md) + desktop (lg) */}
      <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0 border-r border-[#2A2A2A] p-6 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
        <h2 className="text-[#D4AF37] font-['Playfair_Display'] text-xl mb-6 tracking-wide">Explore</h2>
        
        <div className="relative mb-8">
          <input 
            type="text" 
            placeholder="Search our cellar..."
            className="w-full bg-[#1A1A1A] border border-[#333] rounded text-sm text-[#ECECEC] px-10 py-3 outline-none focus:border-[#C27A2F] transition-colors"
          />
          <Search size={16} className="absolute left-4 top-3.5 text-[#666]" />
        </div>

        <nav className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-left px-4 py-3 rounded text-sm transition-all duration-300 ${activeCategory === cat ? 'bg-[#C27A2F]/10 text-[#C27A2F] border-l-2 border-[#C27A2F]' : 'text-[#888] hover:text-[#ECECEC] hover:bg-[#1A1A1A]'}`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Mobile Categories Scroller */}
        <div className="md:hidden flex items-center gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
          <button className="flex-shrink-0 bg-[#1A1A1A] text-[#888] p-3 rounded-full">
            <Filter size={16} />
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm transition-all duration-300 ${activeCategory === cat ? 'bg-[#C27A2F]/20 text-[#C27A2F] border border-[#C27A2F]/50' : 'bg-[#1A1A1A] text-[#888] border border-transparent'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-['Playfair_Display'] text-[#ECECEC] mb-6 md:mb-10">
          Curated Excellence
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 pb-20">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="group flex flex-col bg-[#111] rounded-xl border border-[#2A2A2A] hover:border-[#C27A2F]/30 overflow-hidden relative transition-colors duration-500"
            >
              <div className="relative aspect-[3/4] bg-[#0A0A0A] overflow-hidden flex items-center justify-center p-6 group-hover:bg-[#151515] transition-colors">
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#C27A2F]/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
                
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl scale-95 group-hover:scale-100 transition-transform duration-700"
                />
                
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="text-[10px] uppercase tracking-widest bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[#D4AF37] border border-[#D4AF37]/20">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 z-20 bg-gradient-to-t from-[#0D0D0D] to-transparent">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-['Playfair_Display'] text-lg text-[#ECECEC] leading-tight">
                    {product.name}
                  </h3>
                  <div className="text-xs text-[#888]">{product.volume}</div>
                </div>
                <div className="text-xs text-[#666] mb-4">ABV {product.alcoholContent}</div>
                
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-[#888]">Price</span>
                    <span className="text-[#D4AF37] font-semibold text-lg tracking-wider">
                      KES {product.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    className="relative bg-[#C27A2F] text-black h-12 w-12 rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors shadow-[0_0_15px_rgba(194,122,47,0.4)]"
                  >
                    <Plus size={20} />
                    <span className="absolute inset-0 rounded-full border border-[#C27A2F] animate-ping opacity-75"></span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}