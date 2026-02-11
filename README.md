# Medusa Vite Storefront

A modern, fast React + Vite storefront for Medusa v2 backend with full e-commerce functionality.

## Features

✅ **Product Catalog**
- Browse all products with search functionality
- Product detail pages with variant selection
- Image thumbnails and pricing display

✅ **Shopping Cart**
- Add/remove items
- Update quantities
- Persistent cart using localStorage
- Real-time cart count in navigation

✅ **Checkout Flow**
- Multi-step checkout (Shipping → Payment → Review)
- Shipping address form
- Shipping method selection
- Multiple payment providers (Manual & Stripe)
- Order review and confirmation

✅ **Order Management**
- Order confirmation page
- Order details display
- Success notifications

## Tech Stack

- **Frontend**: React 19 + Vite 7
- **Backend**: Medusa v2
- **Styling**: Tailwind CSS 4
- **Payment**: Stripe (optional)
- **Routing**: React Router v7
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Project Structure

```
storefront-vite/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navigation.jsx
│   │   └── ProductCard.jsx
│   ├── context/          # React contexts
│   │   └── CartContext.jsx
│   ├── lib/              # Utilities and config
│   │   ├── medusa.js     # Medusa SDK setup
│   │   ├── utils.js      # Helper functions
│   │   └── constants.js  # Payment provider configs
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   └── OrderSuccess.jsx
│   ├── App.jsx           # Main app with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Environment template
├── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Medusa v2 backend running (default: http://localhost:9000)
- Stripe account (optional, for Stripe payments)

### Installation

1. **Install dependencies:**
```bash
cd storefront-vite
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Required
VITE_MEDUSA_BASE_URL=http://localhost:9000

# Optional - for API key authentication
VITE_MEDUSA_PUBLISHABLE_API_KEY=your_medusa_publishable_key

# Optional - for Stripe payments
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

3. **Start development server:**
```bash
npm run dev
```

Storefront will be available at **http://localhost:5173**

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MEDUSA_BASE_URL` | ✅ | Your Medusa backend URL (e.g., http://localhost:9000) |
| `VITE_MEDUSA_PUBLISHABLE_API_KEY` | ❌ | Medusa publishable API key for authenticated requests |
| `VITE_STRIPE_PUBLIC_KEY` | ❌ | Stripe publishable key for card payments |

## Payment Methods

### Manual Payment (Default)
- Test payment provider
- No real charges
- Perfect for development and testing

### Stripe (Optional)
- Real credit card payments
- Requires Stripe account
- Secure PCI-compliant checkout

To enable Stripe:
1. Add your Stripe public key to `.env`
2. Ensure Stripe provider is configured in Medusa backend
3. Select "Credit Card" at checkout

## Checkout Flow

1. **Cart Review** - View items and totals
2. **Shipping** - Enter address and select shipping method
3. **Payment** - Choose payment provider
4. **Review** - Confirm order details
5. **Success** - Order confirmation with details

## API Integration

The storefront uses the official `@medusajs/medusa-js` SDK for all backend communication:

```javascript
import medusa from "./lib/medusa";

// List products
const { products } = await medusa.products.list();

// Get cart
const { cart } = await medusa.carts.retrieve(cartId);

// Add to cart
await medusa.carts.lineItems.create(cartId, {
  variant_id: variantId,
  quantity: 1,
});
```

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## Customization

### Styling
- Uses **Tailwind CSS v4** with JIT compiler
- Modify `src/index.css` for global styles
- All Tailwind utilities available

### Adding Payment Providers
1. Add provider config to `src/lib/constants.js`:
```javascript
export const paymentInfoMap = {
  pp_your_provider: {
    title: "Your Provider",
    icon: "💳",
  },
};
```

2. Add detection logic:
```javascript
export const isYourProvider = (providerId) => {
  return providerId?.startsWith("pp_your");
};
```

3. Update `Checkout.jsx` to handle the new provider

## Troubleshooting

### CORS Issues
Ensure your Medusa backend has the correct CORS settings:
```env
STORE_CORS=http://localhost:5173
ADMIN_CORS=http://localhost:5173
AUTH_CORS=http://localhost:5173
```

### Cart Not Persisting
- Check browser localStorage is enabled
- Verify cart_id is being saved correctly

### Stripe Payment Fails
- Ensure `VITE_STRIPE_PUBLIC_KEY` is set correctly
- Check Stripe provider is configured in Medusa backend
- Verify backend has `STRIPE_API_KEY` configured

## License

MIT

## Support

For issues with:
- **Storefront**: Create an issue in this repository
- **Medusa Backend**: Visit [Medusa Documentation](https://docs.medusajs.com)
- **Stripe Integration**: Visit [Stripe Documentation](https://stripe.com/docs)
