//dispatch for cart-updated event
export const triggerCartUpdate = () => {
  window.dispatchEvent(new Event('cart-updated'));
};


