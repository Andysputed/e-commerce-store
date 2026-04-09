import { motion } from 'motion/react';
import type { Product } from '../App';

const products: Product[] = [
  {
    id: 1,
    name: 'Jameson Black Barrel',
    description: 'Rich Irish Whiskey',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80',
  },
  {
    id: 2,
    name: 'Singleton 12YO',
    description: 'Smooth Scottish Malt',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80',
  },
  {
    id: 3,
    name: 'Tusker Cider',
    description: 'Crisp Apple Refreshment',
    price: 350,
    image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80',
  },
  {
    id: 4,
    name: 'Hennessy VS',
    description: 'Premium French Cognac',
    price: 5200,
    image: 'https://images.unsplash.com/photo-1618146223715-d0d3da0c797d?w=400&q=80',
  },
  {
    id: 5,
    name: 'Johnnie Walker Black',
    description: 'Legendary Scotch Blend',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80',
  },
  {
    id: 6,
    name: 'Grey Goose',
    description: 'Ultra-Premium Vodka',
    price: 4100,
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80',
  },
];

type ProductGridProps = {
  onAddToCart: (product: Product) => void;
};

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  return (
    <main className="max-w-md mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2
          className="text-4xl mb-2 text-[#fafafa]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Premium Selection
        </h2>
        <p className="text-[#a0a0a0]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Curated spirits for distinguished taste
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <div className="relative bg-[#1a1a1a] rounded-lg overflow-hidden">
              <div className="aspect-[3/4] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#D4A574]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#D4A574]/30 blur-3xl opacity-50" />
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-4">
                <h3
                  className="text-lg mb-1 text-[#fafafa]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {product.name}
                </h3>
                <p
                  className="text-xs text-[#a0a0a0] mb-3"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xl text-[#D4A574]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {product.price.toLocaleString()} KES
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAddToCart(product)}
              className="w-full mt-3 py-3 bg-[#D4A574] text-[#0a0a0a] rounded-lg hover:bg-[#c99860] transition-all duration-300 font-medium tracking-wide"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Add to Cart
            </button>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
