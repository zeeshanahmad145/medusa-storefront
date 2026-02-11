import { createContext, useContext, useState, useEffect, useCallback } from "react";
import medusa from "../lib/medusa";
import { getCartId, setCartId, removeCartId } from "../lib/utils";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    const cartId = getCartId();
    if (!cartId) {
      setIsLoading(false);
      return;
    }

    try {
      const { cart: cartData } = await medusa.carts.retrieve(cartId);
      setCart(cartData);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      removeCartId();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const createCart = async (regionId = null) => {
    try {
      const { cart: newCart } = await medusa.carts.create({
        ...(regionId && { region_id: regionId }),
      });
      setCartId(newCart.id);
      setCart(newCart);
      return newCart;
    } catch (err) {
      console.error("Failed to create cart:", err);
      throw err;
    }
  };

  const addToCart = async (variantId, quantity = 1) => {
    let cartId = getCartId();
    let currentCart = cart;

    if (!cartId || !currentCart) {
      currentCart = await createCart();
      cartId = currentCart.id;
    }

    try {
      const { cart: updatedCart } = await medusa.carts.lineItems.create(cartId, {
        variant_id: variantId,
        quantity,
      });
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      throw err;
    }
  };

  const updateLineItem = async (lineId, quantity) => {
    const cartId = getCartId();
    if (!cartId) return;

    try {
      const { cart: updatedCart } = await medusa.carts.lineItems.update(cartId, lineId, {
        quantity,
      });
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error("Failed to update line item:", err);
      throw err;
    }
  };

  const deleteLineItem = async (lineId) => {
    const cartId = getCartId();
    if (!cartId) return;

    try {
      const { cart: updatedCart } = await medusa.carts.lineItems.delete(cartId, lineId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error("Failed to delete line item:", err);
      throw err;
    }
  };

  const updateCart = async (data) => {
    const cartId = getCartId();
    if (!cartId) return;

    try {
      const { cart: updatedCart } = await medusa.carts.update(cartId, data);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error("Failed to update cart:", err);
      throw err;
    }
  };

  const refreshCart = fetchCart;

  const clearCart = () => {
    removeCartId();
    setCart(null);
  };

  const value = {
    cart,
    isLoading,
    addToCart,
    updateLineItem,
    deleteLineItem,
    updateCart,
    refreshCart,
    clearCart,
    createCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
