# 🇷🇼 RwandaBuy (E-guriro) — Rwanda's #1 Tech & Electronics Marketplace

<div align="center">

![RwandaBuy Platform](https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80)

**A high-performance, multi-vendor electronic marketplace tailored for Rwanda's tech retail ecosystem.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Neon Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 🌟 Key Platform Features

### 1. 🛍️ Buyer Experience
- **Electronics & Phone Catalog**: Advanced search, multi-attribute filtering (Brand, Price, RAM, Storage, Condition), and side-by-side device specs comparison.
- **Kigali Pickup Stations (Click & Collect)**:
  - Select between **Doorstep Delivery** and **7 Central Kigali Pickup Hubs** (CHIC Building, Kigali City Tower, UTC, Remera Giporoso, Kimironko Plaza, Kicukiro Sonatubes, Nyamirambo).
  - Flat **RWF 1,000** pickup fee; automatically **FREE** on orders $\ge$ **RWF 50,000**.
  - **Digital Pickup Pass**: Generates a 6-digit secure PIN (`RB-XXXXXX`) for counter collection.
- **Dynamic Order Tracking**: Real-time 4-step progress stepper (`Order Placed` ➔ `In Transit` ➔ `Ready for Pickup / Out for Delivery` ➔ `Collected / Delivered`).
- **Wishlists, Flash Sales & Reviews**: Save favorite gadgets, participate in timed flash sales, and leave verified ratings.

### 2. 💬 Real-Time Buyer-Seller Chat (`/chat`)
- **Serverless Real-Time Updates**: 3-second delta polling optimized for Vercel and Neon PostgreSQL with zero WebSocket dependencies.
- **Contextual Inquiries**: Deep-links directly from product pages and order cards with product photos and Order IDs pre-attached.
- **Media Uploads**: Powered by **Vercel Blob** for photos, receipts, and condition proof.
- **Read Receipts & Quick Replies**: Double checkmark statuses (`sent` ➔ `delivered` ➔ `read`) and quick answer chips.

### 3. 🏪 Seller Portal (`/seller/dashboard`)
- **Dedicated Storefronts (`/seller/[sellerId]/store`)**: Dynamic store header, verified badge, real-time product count, average rating, and minimum catalog price.
- **Product Creation (`/seller/products/new`)**: Upload multiple high-res photos via Vercel Blob, set specs, warranty, category, condition, and inventory.
- **Order Dispatch Management**: Update order statuses live in PostgreSQL to advance buyer tracking steppers.

### 4. 🛡️ Admin Super-Panel (`/admin`)
- **Live Database Propagation**: Direct PostgreSQL operations for product removal, user suspension, and seller approval.
- **Pickup Station Network Manager (`/admin/settings`)**:
  - Add, edit, and delete Kigali commercial pickup hubs.
  - Set global pickup fees and free threshold tiers.
  - Toggle platform feature flags, commission rates (default 8%), delivery rates by province, and maintenance mode.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    A[Next.js 16 App Router] --> B[Neon Serverless PostgreSQL]
    A --> C[Upstash Redis Cache]
    A --> D[Vercel Blob Storage]
    A --> E[Resend Transactional Email]
    
    subgraph Client Roles
        F[Buyer Interface]
        G[Seller Portal]
        H[Admin Dashboard]
    end
    
    F --> A
    G --> A
    H --> A
```

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript (Strict Mode) |
| **Primary Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) |
| **Caching Layer** | Upstash Redis (`@upstash/redis`) |
| **Asset Storage** | Vercel Blob (`@vercel/blob`) |
| **Styling** | Vanilla CSS Modules with custom design tokens |
| **Email Service** | Resend API (`resend`) |

---

## 📁 Repository Structure

```
RwandaBuy/
├── src/
│   ├── app/
│   │   ├── admin/                # Platform administration dashboard
│   │   │   ├── categories/       # Category manager
│   │   │   ├── orders/           # Order tracking and refund dispatch
│   │   │   ├── products/         # Global inventory controls
│   │   │   ├── promotions/       # Flash sales and banner management
│   │   │   ├── sellers/          # Seller verification workflows
│   │   │   ├── settings/         # Platform settings & pickup station manager
│   │   │   └── users/            # User account management
│   │   ├── api/                  # Next.js Serverless Route Handlers
│   │   │   ├── admin/settings/   # Global configuration API
│   │   │   ├── messages/         # Real-time chat & conversation endpoints
│   │   │   ├── orders/           # Order creation, queries & status updates
│   │   │   ├── products/         # Product catalog CRUD & filtering
│   │   │   ├── sellers/          # Seller profile & approval API
│   │   │   └── upload/           # Vercel Blob image uploader
│   │   ├── auth/                 # Login, registration, password recovery
│   │   ├── buyer/                # Order history, profile, and wishlist
│   │   ├── cart/                 # Shopping cart & district fee previews
│   │   ├── chat/                 # Real-time buyer-seller messaging hub
│   │   ├── checkout/             # Payment & Kigali Pickup Station selector
│   │   ├── products/             # Product catalog & [id] detail page
│   │   ├── seller/               # Seller dashboard & storefronts
│   │   └── sellers/              # Verified Tech Sellers directory
│   ├── components/               # Reusable UI components & Unicon icons
│   ├── context/                  # AuthContext and CartContext state providers
│   └── lib/                      # Core services, types, database & constants
│       ├── services/             # PostgreSQL database access layer
│       ├── constants.ts          # Provinces, districts, pickup hubs & fees
│       ├── db.ts                 # Neon PostgreSQL client initialization
│       ├── kv.ts                 # Redis caching utilities
│       └── types.ts              # Global TypeScript interfaces
└── public/                       # Static public assets
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Neon PostgreSQL Account**: Free serverless database instance

### 2. Installation & Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/Tuyishimire-lab/RwandaBuy.git
cd RwandaBuy
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the project root:
```env
# Neon PostgreSQL Database
DATABASE_URL="postgresql://user:password@ep-cool-project-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Vercel Blob (Image Uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Upstash Redis (Optional Cache)
UPSTASH_REDIS_REST_URL="https://...upstash.io"
UPSTASH_REDIS_REST_TOKEN="..."

# Resend Transactional Email (Optional)
RESEND_API_KEY="re_..."

# Cron & Admin Seed Secret
CRON_SECRET="your_secure_cron_secret"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npx tsc --noEmit    # Type check
npm run build       # Next.js production build
```

---

## 🚀 Deployment

The platform is designed for zero-config deployments on **Vercel**:
1. Connect your GitHub repository to Vercel.
2. Under **Project Settings ➔ Environment Variables**, add your `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`.
3. Push to `main` to trigger automated production deployments.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
