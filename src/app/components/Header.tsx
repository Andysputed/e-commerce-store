import { ShoppingCart } from 'lucide-react';

type HeaderProps = {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
};

export function Header({ cartCount, onCartClick, onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#D4A574]/10">
      <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="text-[#D4A574] tracking-widest hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          <h1 className="text-2xl font-semibold">BANDAPTAI</h1>
          <div className="text-xs tracking-[0.2em] opacity-90">LOUNGE</div>
        </button>

        <button
          onClick={onCartClick}
          className="relative p-2 text-[#D4A574] hover:opacity-80 transition-opacity"
        >
          <ShoppingCart size={24} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D4A574] text-[#0a0a0a] text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
