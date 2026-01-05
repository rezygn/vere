import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type CartItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  size: string;
  purity: string;
  image: string;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  cartCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  
  // Initialize from LocalStorage if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to LocalStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id && item.size === product.size);
      
      if (existingItem) {
        toast({ title: "Cart Updated", description: `Increased quantity of ${product.name}` });
        return prev.map((item) =>
          item.id === product.id && item.size === product.size
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      
      toast({ title: "Added to Cart", description: `${product.quantity}x ${product.name} added.` });
      return [...prev, product];
    });
  };

  // In CartContext.tsx
const removeFromCart = (id: number, size: string) => {
  setCartItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
};

// You must also update Cart.tsx to pass the size:
// <button onClick={() => removeFromCart(item.id, item.size)} ... >


  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
