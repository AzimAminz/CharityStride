import { useState, useCallback } from "react";

/**
 * Custom hook for managing shopping cart state
 */
export function useCart() {
  const [items, setItems] = useState([]);

  const addItem = useCallback((item) => {
    const cartId = `cart_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setItems((prev) => [...prev, { ...item, cartId }]);
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId, newQuantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: item.unitPrice * newQuantity,
            }
          : item
      )
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const calculateTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [items]);

  const calculateEarlyBirdSavings = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.earlyBirdDiscount || 0), 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.length;
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    calculateTotal,
    calculateEarlyBirdSavings,
    getItemCount,
  };
}
