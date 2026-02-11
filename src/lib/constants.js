export const paymentInfoMap = {
  pp_stripe_stripe: {
    title: "Credit Card",
    icon: "💳",
  },
  pp_system_default: {
    title: "Manual Payment (Test)",
    icon: "🧪",
  },
};

export const isStripeLike = (providerId) => {
  return providerId?.startsWith("pp_stripe_");
};

export const isManual = (providerId) => {
  return providerId?.startsWith("pp_system_default");
};
