export const formatPrice = (amount, currencyCode = "USD") => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  });
  return formatter.format(amount / 100);
};

export const getCartId = () => localStorage.getItem("cart_id");

export const setCartId = (cartId) => {
  localStorage.setItem("cart_id", cartId);
};

export const removeCartId = () => {
  localStorage.removeItem("cart_id");
};
