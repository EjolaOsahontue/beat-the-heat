# BTH+ Store - Third-Party Integration Guide

This document provides detailed pointers on updating and configuring the three main third-party services used in the BTH+ store.

---

## Table of Contents
1. [Supabase (Database)](#supabase-database)
2. [Brevo (Email Service)](#brevo-email-service)
3. [Paystack (Payment Processing)](#paystack-payment-processing)

---

## Supabase (Database)

### What is it?
Supabase is a PostgreSQL database service that stores all your product data, customer information, and order records. It also handles authentication.

### What to Change
You need to:
1. Create a new Supabase project
2. Run the SQL schema provided in `SUPABASE_SCHEMA.sql`
3. Update your environment variables

### Step-by-Step Setup

#### 1. Create a New Supabase Project
- Go to [supabase.com](https://supabase.com)
- Sign in or create account
- Click "New Project"
- Fill in:
  - **Project Name**: `bth-plus` or similar
  - **Database Password**: Create strong password
  - **Region**: Choose closest to your users
- Click "Create new project" (takes 2-3 minutes)

#### 2. Get Your API Keys
Once project is created:
- Go to **Settings → API**
- Copy these values:
  - `NEXT_PUBLIC_SUPABASE_URL` - Under "Project URL"
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Under "Project API Keys → anon public"
  - `SUPABASE_SERVICE_ROLE_KEY` - Under "Project API Keys → service_role" (keep this SECRET)

#### 3. Run the Schema
- In Supabase Dashboard, go to **SQL Editor**
- Click "New Query"
- Copy all content from `SUPABASE_SCHEMA.sql` into the editor
- Click "Run"
- This creates all tables, indexes, and security policies

#### 4. Update .env.local
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Files That Use Supabase
- `lib/supabase.ts` - Already configured, just needs env vars
- `app/page.tsx` - Fetches landing background & products
- `app/about/page.tsx` - Fetches about text
- `app/account/page.tsx` - Fetches user orders
- `lib/auth-context.tsx` - Handles user authentication
- `components/ProductDetailFromRoute.tsx` - Fetches product details

### What Data Gets Stored
| Table | Purpose |
|-------|---------|
| `products` | Your items with images, price, stock |
| `customers` | User profiles & contact info |
| `orders` | Complete order history |
| `order_items` | Line items in each order |
| `site_content` | Dynamic content (about text, hero images) |
| `shipping_methods` | Delivery options |
| `promotional_codes` | Coupon codes |
| `reviews` | Customer feedback |

### Key Tables to Populate
1. **Insert Products** - Add your items via Supabase Dashboard or API
2. **Configure Shipping** - Already seeded with standard/express/overnight options
3. **Set Landing Background** - Update `site_content` table with your hero image URL
4. **Update About Text** - Edit the `about_us` row in `site_content`

### Row Level Security (RLS)
The schema includes security policies that:
- Allow public viewing of products
- Restrict customers to seeing only their own orders
- Require authentication for write operations

### Troubleshooting
- **"undefined" error when loading products?** Check if `NEXT_PUBLIC_SUPABASE_URL` is set
- **Auth not working?** Ensure Supabase authentication is enabled in project settings
- **Can't fetch data?** Check RLS policies - you may need to disable temporarily for testing

---

## Brevo (Email Service)

### What is it?
Brevo sends transactional emails to customers (order confirmations, shipping notifications, refund notices).

### What to Change
You need to:
1. Create a Brevo account
2. Verify your sending email domain
3. Get your API key
4. Update environment variables

### Step-by-Step Setup

#### 1. Create Brevo Account
- Go to [brevo.com](https://brevo.com)
- Sign up (free tier available)
- Verify email address

#### 2. Get API Key
- Go to **Settings → SMTP & API**
- Find **API Keys** section
- Click "Generate new key"
- Copy the API key (starts with `xsmtpsib-`)

#### 3. Verify Sending Email
- Go to **Settings → Senders**
- Add sender email (e.g., `noreply@bthplus.store`)
- Verify by clicking link in confirmation email
  > **Note**: If using business domain, you may need to verify DNS records

#### 4. Update .env.local
```bash
# .env.local
BREVO_API_KEY=xsmtpsib-your-api-key-here
BREVO_SENDER_EMAIL=noreply@bthplus.store
```

### Files That Use Brevo
- `lib/email.ts` - Main email sending function
- `app/api/send-email/route.ts` - Email API endpoint

### Email Templates Sent
1. **Order Confirmed** - When customer pays successfully
2. **Order Shipped** - When admin marks order as shipped
3. **Order Cancelled** - When order is cancelled
4. **Refund Processed** - When refund is issued

### How It Works
When an order status changes:
1. Admin updates order status in dashboard
2. System calls `sendOrderEmail()` function
3. Email is formatted with BTH+ branding (already updated from BTH)
4. Brevo sends to customer's email

### Customizing Email Templates
The HTML templates are in `lib/email.ts` - you can customize:
- Colors (already changed to black/white)
- Logo/branding
- Message text
- Footer links

### Troubleshooting
- **"Invalid API key" error?** Check you copied the full key correctly
- **Emails not sending?** Verify sender email is confirmed in Brevo
- **Emails marked as spam?** Set up SPF/DKIM records for your domain
  - Instructions: Brevo Settings → Senders → click your domain

### Upgrade Options
- **Free**: Up to 300 emails/day
- **Pro**: Unlimited emails + advanced features

---

## Paystack (Payment Processing)

### What is it?
Paystack handles credit card, debit card, and bank transfer payments from customers in Nigeria and across Africa.

### What to Change
You need to:
1. Create Paystack account
2. Get your API keys
3. Update environment variables
4. Verify your business details

### Step-by-Step Setup

#### 1. Create Paystack Account
- Go to [paystack.com](https://paystack.com)
- Sign up with business email
- Complete KYC (Know Your Customer) verification
  - Required: ID, business address, bank details
  - Usually verified within 1-2 business days

#### 2. Get API Keys
- Go to **Settings → API Keys & Webhooks**
- You'll see two keys:
  - **Public Key** - Safe to expose to frontend (starts with `pk_live_`)
  - **Secret Key** - Keep secret! Only for backend (starts with `sk_live_`)
- In test mode, you'll have `pk_test_` and `sk_test_`

#### 3. Update .env.local
```bash
# .env.local (Production)
NEXT_PUBLIC_PAYSTACK_KEY=pk_live_your-public-key
PAYSTACK_SECRET_KEY=sk_live_your-secret-key

# For testing/development:
NEXT_PUBLIC_PAYSTACK_KEY=pk_test_your-test-public-key
PAYSTACK_SECRET_KEY=sk_test_your-test-secret-key
```

### Files That Use Paystack
- `app/layout.tsx` - Loads Paystack script: `<Script src="https://js.paystack.co/v1/inline.js" />`
- `components/CheckoutButton.tsx` (or similar) - Initiates payment
- Payment handler - Processes payment callback

### How Payment Flow Works
1. Customer adds items to cart
2. Customer clicks "Pay with Paystack"
3. Paystack popup opens with secure payment form
4. Customer enters card/bank details
5. Paystack processes payment
6. Webhook confirms payment to your server
7. Order status updates to "paid"
8. Confirmation email sent to customer

### Setting Up Webhook (Important!)
Paystack needs to notify your server when payment succeeds:

1. **In Paystack Dashboard:**
   - Go to **Settings → API Keys & Webhooks**
   - Under "Webhook", add webhook URL:
     ```
     https://yourdomain.com/api/paystack-webhook
     ```
   - Events to enable: `charge.success`, `charge.failed`

2. **In Your Code:**
   - You need an endpoint at `/api/paystack-webhook` that:
     - Verifies the webhook signature
     - Updates order payment status
     - Calls `sendOrderEmail()`

### Testing Payments
Use these test card details:
- **Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Supported Payment Methods
- ✅ Visa/Mastercard credit/debit cards
- ✅ Bank transfers (Nigeria)
- ✅ USSD (mobile banking)
- ✅ Mobile wallets
- ✅ Bank Transfers (International - beta)

### Transaction Fees
- Standard: 1.5% + ₦100 (varies by payment method)
- Check current rates at paystack.com/pricing

### Security Considerations
- Never expose `PAYSTACK_SECRET_KEY` in client-side code
- Always verify webhook signatures on your backend
- Use HTTPS for all payment-related endpoints
- Store only payment references, not card details (Paystack handles this)

### Troubleshooting
- **Paystack popup not opening?** Check if public key is set correctly
- **"Merchant not activated" error?** Account needs KYC verification
- **Webhooks not being received?** 
  - Check webhook URL is HTTPS and publicly accessible
  - Verify webhook URL in Paystack settings
  - Check server logs for errors

### Switch Between Test/Live
- **Development/Testing**: Use `pk_test_*` keys
- **Production**: Use `pk_live_*` keys
- Update based on environment variable or .env file

---

## Environment Variables Quick Reference

Create `.env.local` in your project root with all these values:

```bash
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# BREVO (Email)
BREVO_API_KEY=xsmtpsib-...
BREVO_SENDER_EMAIL=noreply@bthplus.store

# PAYSTACK (Payments)
NEXT_PUBLIC_PAYSTACK_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
```

**⚠️ Important Security Notes:**
- Never commit `.env.local` to version control
- Never share secret keys (PAYSTACK_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY)
- Use environment variables on deployment platforms (Vercel, Heroku, etc.)
- Rotate keys periodically

---

## Migration from BTH to BTH+

If you have existing BTH data you want to keep:

### Products
1. Export products from old BTH Supabase
2. Update image URLs to your new hosting
3. Import into new BTH+ Supabase `products` table
4. Verify images load correctly

### Customers
1. Export customer list from old project
2. Create corresponding records in new `customers` table
3. Note: You'll need to reset passwords (Supabase auth is project-specific)

### Orders
1. Export order history for record-keeping
2. Optionally import into `orders` table with timestamps preserved
3. Ensure order references in Paystack are updated if applicable

---

## Support Resources

| Service | Support URL |
|---------|-------------|
| Supabase | [supabase.com/docs](https://supabase.com/docs) |
| Brevo | [brevo.com/en/help](https://help.brevo.com/) |
| Paystack | [paystack.com/docs](https://paystack.com/docs/) |

---

## Summary Checklist

- [ ] Create Supabase project
- [ ] Run SUPABASE_SCHEMA.sql in Supabase
- [ ] Copy Supabase credentials to .env.local
- [ ] Create Brevo account & verify sender email
- [ ] Copy Brevo API key to .env.local
- [ ] Create Paystack account & complete KYC
- [ ] Copy Paystack keys to .env.local
- [ ] Set up Paystack webhook URL
- [ ] Test payment flow with test cards
- [ ] Send test email via checkout
- [ ] Verify all three services working
- [ ] Deploy to production with live keys

