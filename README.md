# Water-Can Subscription & Delivery Management Platform

This is a production-ready system for managing water-can orders, subscriptions, recurring payments, deliveries, and reporting.

## 🏗 Folder Structure
```text
watercan-platform/
├── apps/
│   ├── customer-web/   (Next.js: Customer Portal)
│   ├── admin-web/      (Next.js: Admin Portal)
│   ├── delivery-web/   (Next.js/PWA: Delivery Agent Portal)
│   └── api/            (NestJS: Backend REST API)
├── packages/
│   ├── ui/             (Shared React components)
│   ├── types/          (Shared TypeScript definitions)
│   ├── validation/     (Zod schemas)
│   ├── config/         (Shared configs)
│   └── eslint-config/  (Shared ESLint config)
├── prisma/
│   └── schema.prisma   (PostgreSQL database schema)
├── docker/             (Docker compose & env templates)
├── package.json        (Turborepo workspace root)
└── pnpm-workspace.yaml
```

## 📊 Order / Payment / Delivery Lifecycle
1. **DRAFT**: Customer configures plan (cans/day, duration, address).
2. **CALCULATED**: Backend calculates the quote based on historical pricing snapshot.
3. **PAYMENT_PENDING**: A Razorpay Order is created. Customer opens Razorpay Checkout.
4. **PAID**: Razorpay webhook triggers on `order.paid` or `payment.captured`. Backend verifies the signature and idempotency.
5. **CONFIRMED**: Once payment is marked paid, the order becomes CONFIRMED.
6. **SCHEDULED**: The system automatically generates `DeliverySchedule` records for every day in the plan duration.
7. **PARTIALLY_DELIVERED**: Delivery agent starts fulfilling orders. As days pass, the status updates.
8. **COMPLETED**: All scheduled cans are delivered.

## 🛠 Local Setup Instructions
1. Install Node.js (v18+) and [pnpm](https://pnpm.io/installation).
2. Install Docker Desktop.
3. Clone the repository.
4. Copy the environment variables:
   ```bash
   cp docker/.env.example docker/.env
   ```
5. Start the infrastructure (Postgres, Redis):
   ```bash
   cd docker && docker-compose up -d
   ```
6. Install dependencies and push the Prisma schema:
   ```bash
   pnpm install
   pnpm dlx prisma db push
   pnpm dlx prisma generate
   ```
7. Start the development servers:
   ```bash
   pnpm run dev
   ```

## 💳 Razorpay & Webhook Setup
1. Go to your [Razorpay Dashboard](https://dashboard.razorpay.com/) and switch to **Test Mode**.
2. Navigate to **Settings > API Keys** and generate a new key pair (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`).
3. Navigate to **Settings > Webhooks** and Add a New Webhook.
   - **Webhook URL**: `https://<your-ngrok-url>/api/v1/payments/razorpay/webhook`
   - **Secret**: Create a random string and save it to `RAZORPAY_WEBHOOK_SECRET` in `.env`.
   - **Active Events**: `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`, `subscription.activated`, `subscription.pending`, `subscription.halted`.

## 🧪 Test Accounts
For local testing, you can seed the database with the following accounts:
- **Super Admin**: `superadmin@watercan.local` / `Admin@123`
- **Customer**: `customer@watercan.local` / `Customer@123`
- **Delivery Agent**: `driver@watercan.local` / `Driver@123`

## 🚀 Production Deployment (Azure)
1. **Database**: Provision Azure Database for PostgreSQL (Flexible Server).
2. **Redis**: Provision Azure Cache for Redis.
3. **Backend API**: Deploy the NestJS app to Azure App Service (Node.js 18) or Azure Container Apps.
4. **Frontends**: Deploy the Next.js apps (customer, admin, delivery) to Azure Static Web Apps (with Next.js support) or Azure App Service.
5. **Storage**: Provision Azure Blob Storage for delivery proof images.
6. **Webhooks**: Update the Razorpay webhook URL to your production Azure App Service domain.

## 🔒 Security Checklist
- [ ] Verify `RAZORPAY_KEY_SECRET` is never passed to frontend build variables.
- [ ] Verify `RAZORPAY_WEBHOOK_SECRET` is configured and signature verification is active in the backend.
- [ ] Ensure `Argon2` is used for password hashing.
- [ ] Ensure database transactions are used when updating `Payment`, `Order`, and `DeliverySchedules` simultaneously.
- [ ] Configure Helmet and CORS in NestJS production bootstrap.
- [ ] Enable rate-limiting on authentication and payment verification endpoints.
- [ ] Verify idempotency logic on webhook handlers.

