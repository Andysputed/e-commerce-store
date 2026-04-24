import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialization (Replace with your actual environment variables)
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  volume: string;
  alcoholContent: string;
  stock: number;
  description?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

// --- TUTOR NOTE: STEP 1 ---
// We add clearCart to our interface. This tells TypeScript, 
// "Hey, anyone who uses this context will have access to a function called clearCart."
interface AppContextType {
  cart: CartItem[];
  products: Product[];
  isLoading: boolean;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void; // <-- NEW: Added here
  cartCount: number;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // The cart state holds all the items. 
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch products from Supabase database when the app loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;

        if (data) {
          const mappedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: Number(item.price),
            image: item.image,
            volume: item.volume,
            alcoholContent: item.alcohol_content,
            stock: item.stock,
            description: item.description
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => 
      prev
        .map((item) => 
          item.product.id === productId 
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // --- TUTOR NOTE: STEP 2 ---
  // Here is the actual action. When clearCart is called, we take 
  // the cart state and simply set it to an empty array.
  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals on the fly based on what is currently in the cart
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    // --- TUTOR NOTE: STEP 3 ---
    // We add clearCart to the value object so that other components 
    // (like your Checkout page) can grab it and use it!
    <AppContext.Provider value={{ 
      cart, 
      products, 
      isLoading, 
      addToCart, 
      updateQuantity, 
      clearCart,     // <-- NEW: Exposed to the rest of the app here
      cartCount, 
      cartTotal 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};