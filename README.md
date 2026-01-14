# Aicser AI Studio - AI Learning Platform

A world-class, full-stack SaaS MVP for AI and machine learning education built with Next.js, Supabase, and Stripe.

## Features

### User Features
- **Authentication**: Secure email/password authentication with Supabase
- **Course Management**: Browse and enroll in AI/ML courses with different difficulty levels
- **Progress Tracking**: Track learning progress with percentage completion
- **Subscription Tiers**: Free, Pro, and Premium plans with different access levels
- **Stripe Integration**: Secure payment processing and subscription management
- **User Dashboard**: Personalized learning dashboard with stats and recent activity
- **AI Assistant Chatbot**: 
  + Streaming responses using AI SDK v5 and OpenAI GPT-5-mini
  + Two intelligent tools:
      * Document Search Tool: Searches course materials, Google Drive, and Google Search
      * Course Info Tool: Retrieves progress, resources, lessons, and difficulty information
  + Context-aware responses specific to each course

  ## User Experience
   **The chatbot can:**
   1. Answer questions about course content
   2. Search for relevant documents and resources
   3. Provide course information (progress, difficulty, resources)
   4. Explain difficult concepts
   5. Help find additional learning materials

### Admin Features
- **Admin Dashboard**: Comprehensive analytics and platform metrics
- **User Management**: View and manage all registered users
- **Course Management**: Track course enrollments and completion rates
- **Payment History**: Monitor all transactions and revenue

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Subscriptions
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Type Safety**: TypeScript

## Project Structure

\`\`\`
├── app/
│   ├── auth/              # Authentication pages (login, sign-up)
│   ├── dashboard/         # User dashboard and courses
│   ├── admin/             # Admin panel (users, courses, payments)
│   └── api/webhooks/      # Stripe webhook handlers
├── components/
│   ├── dashboard/         # Dashboard components
│   ├── admin/             # Admin components
│   ├── checkout/          # Stripe checkout components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── stripe.ts          # Stripe configuration
│   ├── products.ts        # Subscription product definitions
│   └── types.ts           # TypeScript type definitions
└── scripts/               # Database migration scripts
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables (already configured in v0):
   - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

4. Run database migrations:
   - Execute SQL scripts in the `scripts/` folder in order
   - Use the v0 interface to run these scripts directly

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Database Schema

### Tables

- **profiles**: User profiles with subscription information
- **courses**: Course catalog with difficulty and tier requirements
- **progress**: User course progress tracking
- **payments**: Payment transaction history

### Row Level Security (RLS)

All tables have RLS enabled for security:
- Users can only view/edit their own data
- Admin users have access to all data
- Courses are publicly viewable but enrollment respects subscription tiers

## Subscription Tiers

### Free Tier
- Access to beginner courses
- Basic AI concepts
- Community support

### Pro Tier ($19.99/month)
- All Free features
- Access to intermediate courses
- Advanced AI techniques
- Priority email support
- Downloadable resources

### Premium Tier ($49.99/month)
- All Pro features
- Access to all premium courses
- Expert-level content
- 1-on-1 mentorship sessions
- Certificate of completion

## Stripe Webhooks

The platform handles the following Stripe events:

- `checkout.session.completed`: Activate subscription after successful checkout
- `customer.subscription.updated`: Update subscription status changes
- `customer.subscription.deleted`: Handle subscription cancellations
- `invoice.payment_succeeded`: Record successful payments
- `invoice.payment_failed`: Handle failed payment attempts

Configure webhook endpoint: `/api/webhooks/stripe`

## Admin Access

To create an admin user, follow these steps:

### Quick Method (Recommended)

1. Sign up for an account at `/auth/sign-up`
2. Get your User ID from Supabase dashboard (Authentication → Users)
3. Run this SQL in Supabase SQL Editor:
   \`\`\`sql
   UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';
   \`\`\`
4. Access the admin panel at `/admin`

### Demo Admin Account

For quick testing, run the `scripts/004_create_demo_admin.sql` script:

**Demo Credentials:**
- Email: `admin@aicser.ai`
- Password: `Admin123!@`

### Admin Panel Features

Once you have admin access, you can:
- **Dashboard** (`/admin`): View overall statistics and analytics
- **Users Management** (`/admin/users`): Manage user accounts and subscriptions
- **Courses Management** (`/admin/courses`): Track enrollments and completion rates
- **Payments History** (`/admin/payments`): Monitor transactions and revenue

## Deployment

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy

## Security Best Practices

- All database operations use Row Level Security (RLS)
- Passwords are hashed by Supabase Auth
- Stripe payments use secure checkout sessions
- API routes validate authentication
- Admin routes require role verification

## Demo Branding

This project is branded as "Aicser AI Studio" for demonstration purposes. The branding includes:
- Modern blue-purple color scheme
- AI-focused iconography
- Professional landing page
- Educational platform aesthetic

## License

This is a demonstration project created with v0.
