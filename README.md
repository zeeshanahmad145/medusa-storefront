# Medusa Vite Storefront

A modern, fast React + Vite storefront for Medusa v2 backend with full e-commerce functionality.

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
