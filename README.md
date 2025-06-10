# SoleFolio 👟

**The Social Network for Sneakerheads**

SoleFolio is the definitive platform for sneaker collectors, resellers, and enthusiasts. Showcase your collection, discover rare kicks, and make offers on any sneaker in the community.

## 🚀 Features

- **Digital Locker**: Beautiful, organized profiles to showcase your sneaker collection
- **Universal Offers**: Make offers on any sneaker, even ones not for sale
- **Social Discovery**: Follow collectors, discover trending shoes, and connect with the community
- **Value Tracking**: Real-time market value tracking for your collection
- **Secure Transactions**: Built-in marketplace with secure payment processing

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: Stripe Connect
- **Deployment**: Vercel
- **State Management**: Zustand + React Query

## 🏃‍♂️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SoleFolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Fill in your environment variables
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🏗 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── stores/             # Zustand state stores
└── types/              # TypeScript type definitions
```

## 🗄 Database Schema

The application uses Supabase with the following main tables:
- `users` - User profiles and authentication
- `sneakers` - Master sneaker database
- `user_sneakers` - User's sneaker collection
- `offers` - Offer system for buying/selling
- `follows` - Social following system

## 🔐 Authentication

SoleFolio uses Supabase Auth with support for:
- Email/password authentication
- Social logins (Google, Apple)
- Row Level Security (RLS) for data protection

## 💳 Payments

Integrated with Stripe Connect for:
- Secure marketplace transactions
- Automatic fee collection (5-7% seller fee)
- Multi-party payment flows

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on every push to main

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📄 License

SoleFolio - All rights reserved

---

Built with ❤️ for the sneaker community