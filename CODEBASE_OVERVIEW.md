# BTH Store — Complete File-by-File Overview

**Project:** BTH Premium Streetwear E-Commerce Store  
**Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4  
**Backend:** Supabase (PostgreSQL) + Paystack (Payments) + Brevo (Email)  
**State Management:** Zustand (Cart persistence)  
**Animation:** Framer Motion  

---

## 📁 Project Structure Summary

```
BTH-store/
├── app/                    # Next.js App Router pages (20 files)
│   ├── (public pages)      # Customer-facing storefront
│   ├── admin/              # Admin dashboard (10 files)
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout with Navbar + Paystack script
├── components/             # React components (7 files)
│   └── UI components (client-side interactive)
├── lib/                    # Core utilities (4 files)
│   ├── supabase.ts         # Supabase client
│   ├── store.ts            # Zustand cart store (with stock/variation logic)
│   ├── email.ts            # Brevo email helper (fetch-based)
│   └── emails.ts           # Brevo SDK wrapper
├── config files            # Next.js, TypeScript, ESLint, Tailwind
└── public/                 # Static assets (images, fonts, icons)
```

---

## 📄 Configuration Files

### `package.json`
**Location:** `C:\BTH-store\package.json`  
**Type:** Project manifest  
**Purpose:** Declares project metadata, dependencies, and npm scripts.

**Key Dependencies:**
- `next@16.2.6` — React framework with App Router
- `react@19.2.4` / `react-dom@19.2.4` — UI library
- `@supabase/supabase-js` — PostgreSQL client
- `zustand@5` — Lightweight state management (cart persistence)
- `framer-motion@12` — Animation library
- `lucide-react@1.14` — Icon set
- `@getbrevo/brevo` — Transactional email SDK
- `resend` — Email alternative SDK (also present)

**Scripts:**
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

---

### `tsconfig.json`
**Location:** `C:\BTH-store\tsconfig.json`  
**Type:** TypeScript configuration  
**Purpose:** Compiler options for TypeScript.

**Notable Options:**
- `strict: true` — All type checks enabled
- `jsx: react-jsx` — JSX transform for React 19
- `moduleResolution: bundler` — Compatible with bundlers like Next.js
- `paths: { "@/*": ["./*"] }` — Enables absolute imports from project root
- `plugins: [{ name: "next" }]` — Next.js TypeScript plugin
- `incremental: true` — Faster subsequent builds

---

### `next.config.ts`
**Location:** `C:\BTH-store\next.config.ts`  
**Type:** Next.js configuration  
**Purpose:** Currently minimal (default setup). Could host images, environment variables, etc.

---

### `postcss.config.mjs`
**Location:** `C:\BTH-store\postcss.config.mjs`  
**Type:** PostCSS configuration  
**Purpose:** Configures Tailwind CSS v4 as PostCSS plugin.

```js
plugins: { "@tailwindcss/postcss": {} }
```

---

### `eslint.config.mjs`
**Location:** `C:\BTH-store\eslint.config.mjs`  
**Type:** ESLint flat config (ESM)  
**Purpose:** Enforces Next.js + TypeScript best practices.

**Extends:**
- `next/vitals` — Core web vitals rules
- `next/typescript` — TypeScript-specific linting

**Ignores:** `.next/`, `out/`, `build/`, `next-env.d.ts`

---

### `next-env.d.ts`
**Location:** `C:\BTH-store\next-env.d.ts`  
**Type:** TypeScript declaration file (auto-generated)  
**Purpose:** Provides Next.js type definitions. Should not be edited manually.

---

### `.env.local`
**Location:** `C:\BTH-store\.env.local`  
**Type:** Environment variables (local only, gitignored)  
**Purpose:** Stores secrets and API keys.

**Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase instance URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public Supabase key
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — Paystack public key for frontend payments
- `BREVO_API_KEY` — Brevo (formerly Sendinblue) API key for transactional emails
- `BREVO_SENDER_EMAIL` — Sender address for order emails

---

## 🎨 Styles

### `app/globals.css`
**Location:** `C:\BTH-store\app\globals.css`  
**Type:** Global CSS with Tailwind v4  
**Purpose:** Imports Tailwind, defines CSS custom properties for theming, sets body styles.

**Key Features:**
- Uses `@import "tailwindcss"` (v4 syntax)
- Defines `--background` / `--foreground` custom properties
- `@theme inline` block exposes CSS variables to Tailwind
- Dark mode support via `@media (prefers-color-scheme: dark)`
- Sets default body font to Arial/Helvetica (complementary to Geist)

---

## 📚 Core Library (`lib/`)

### `lib/supabase.ts`
**Location:** `C:\BTH-store\lib\supabase.ts`  
**Type:** Utility module (6 lines)  
**Purpose:** Initializes and exports a singleton Supabase client.

**Logic:**
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```
**Non-null asserts (`!`) used** — assumes env vars are always set (should be validated in production).

---

### `lib/store.ts`
**Location:** `C:\BTH-store\lib\store.ts`  
**Type:** Zustand state store (173 lines)  
**Purpose:** Global cart state with persistence, variation-aware stock validation, and safe quantity clamping.

**State Shape:**
```ts
type CartState = {
  cart: CartItem[];

  addToCart(product, selectedVariation?) → void;
  removeFromCart(cartId) → void;
  updateQuantity(cartId, quantity) → void;
  clearCart() → void;
}
```

**Type `CartItem`:**
- `id`, `cartId`, `name`, `price`, `image_url?`, `quantity`, `stock`, `selectedVariation?`

**Key Logic — `addToCart` (stock-safe + variation-safe):**
1. Generates `cartId` as `${product.id}-${JSON.stringify(selectedVariation)}` to uniquely identify variant combinations.
2. Computes `stock`:
   - If **no variations** exist → uses `product.quantity` directly.
   - If **variations exist** → finds minimum stock among selected option stocks (each variation group contributes a stock constraint).
3. If item already in cart → increments quantity, clamped to computed stock.
4. If new item → adds only if `stock > 0`.

**Key Logic — `removeFromCart`:**
- Decrements quantity; removes line item if quantity reaches 1.

**Key Logic — `updateQuantity`:**
- Clamps `quantity` between 1 and `item.stock`.

**Persistence:** Uses `zustand/middleware persist` with storage key `"BTH-cart"`.

---

### `lib/email.ts`
**Location:** `C:\BTH-store\lib\email.ts`  
**Type:** Email helper (76 lines)  
**Purpose:** Sends transactional order emails via Brevo's REST API (`fetch`-based).

**Function:** `sendOrderEmail(type: 'paid' | 'shipped' | 'cancelled', order: any)`

**Logic:**
1. Reads `BREVO_API_KEY` and `BREVO_SENDER_EMAIL`.
2. Selects subject based on `type`.
3. Builds HTML content inline with template strings (premium BTH-styled).
4. Calls `https://api.brevo.com/v3/smtp/email` with `fetch`.
5. Returns `{ success: boolean, error? }`.

**Note:** Only supports three email types. No refund email in this function (exists in `emails.ts`).

---

### `lib/emails.ts`
**Location:** `C:\BTH-store\lib\emails.ts`  
**Type:** Email helper (SDK-based, 139 lines)  
**Purpose:** Alternative Brevo integration using `@getbrevo/brevo` SDK.

**Function:** `sendOrderEmail(type: string, order: any)`

**Supported Types:**
- `'success'` — order confirmation
- `'shipped'` — shipped notification
- `'cancelled'` — cancellation notice
- `'refunded'` — refund completion (only here)

**Logic:**
- Configures `SibApiV3Sdk.TransactionalEmailsApi` with API key from env.
- Builds `SendSmtpEmail` object with sender, recipient, subject, HTML.
- Calls `apiInstance.sendTransacEmail()`.

**Why two email modules?** Possibly a migration path: `email.ts` (REST) is used by the API route; `emails.ts` (SDK) may be legacy or planned.

---

## 🧩 Components (`components/`)

### `components/Navbar.tsx`
**Location:** `C:\BTH-store\components\Navbar.tsx`  
**Type:** Client Component (71 lines)  
**Purpose:** Fixed top navigation bar with logo, navigation links, user/search icons, and cart button that opens the `CartDrawer`.

**Logic:**
- `usePathname()` from `next/navigation` → returns `null` on admin pages (condition: `if (pathname.startsWith("/admin")) return null;`).
- `useCart()` from Zustand → derives `cartCount` with `reduce`.
- `mounted` state — prevents hydration mismatch for cart count badge (animated).
- Renders:
  - Logo (link to `/`)
  - Nav links: "New Arrivals", "Gallery", "About"
  - Icons: Search, User, ShoppingBag (opens drawer)
- Includes `<CartDrawer isOpen={isCartOpen} onClose={...} />` as sibling (portal-like via framer-motion).

---

### `components/ProductCard.tsx`
**Location:** `C:\BTH-store\components\ProductCard.tsx`  
**Type:** Client Component (42 lines)  
**Purpose:** Displays a product tile for grid layouts (homepage).

**Props:** `{ product: any }`

**Logic:**
- Selects image: prefers `product.images[0]`, falls back to `product.image_url`, else "No Image" placeholder.
- Rounds corners, handles `aspect-square` image container.
- Shows category (uppercase small) and product name (uppercase bold).
- Displays price formatted as `₦{Number(product.price).toLocaleString()}`.
- Entire card links to `/product/${product.id}`.

---

### `components/ProductActions.tsx`
**Location:** `C:\BTH-store\components\ProductActions.tsx`  
**Type:** Client Component (49 lines)  
**Purpose:** Shows stock indicator and "Add to Cart" button for product detail page; handles basic disabled states.

**Logic:**
- `stock = Number(product.quantity || 0)`
- `isOutOfStock = stock <= 0`
- Button disabled when out of stock or loading.
- Shows green/red dot + stock text.
- On click → calls `addToCart(product)` (no variation support; simple add).

**Note:** For products with variations, this component is NOT used — `ProductDetailClient` handles variation-aware adding.

---

### `components/AddToCartButton.tsx`
**Location:** `C:\BTH-store\components\AddToCartButton.tsx`  
**Type:** Client Component (34 lines)  
**Purpose:** Simple, compact add-to-cart button used in product card or other compact UIs. **No variation support.**

**Props:** `{ product: any }`

**Logic:**
- `isOutOfStock = product.quantity <= 0`
- `onClick` prevents default + stops propagation (for use inside links).
- Directly calls `addToCart(product)` from Zustand.
- Styled: white background, red button (except out-of-stock gray).

---

### `components/CartDrawer.tsx`
**Location:** `C:\BTH-store\components\CartDrawer.tsx`  
**Type:** Client Component (144 lines)  
**Purpose:** Slide-in drawer (right side) showing cart contents, quantity controls, and checkout link.

**Props:** `{ isOpen: boolean, onClose: () => void }`

**Logic:**
- Uses `AnimatePresence` from Framer Motion for enter/exit animations.
- Overlay (`fixed inset-0 bg-black/40`) closes drawer on click.
- Drawer panel slides from `x: '100%'` → `x: 0`.
- Displays cart items with:
  - Thumbnail image
  - Name, price, stock display
  - Minus/Plus buttons → call `removeFromCart` / `updateQuantity`
- Footer (visible only if `cart.length > 0`):
  - Total sum (`price * quantity`)
  - "Checkout" button → links to `/checkout`, closes drawer.

**Note:** Uses `item.stock` to disable Plus when quantity reaches stock limit.

---

### `components/ProductDetailClient.tsx`
**Location:** `C:\BTH-store\components\ProductDetailClient.tsx`  
**Type:** Client Component (326 lines)  
**Purpose:** Product detail page logic — handles image gallery, variation selection, quantity control, and add-to-cart with full variation-aware stock validation.

**Props:** `{ product: Product }`

**Type `Product`:**
```ts
{
  id, name, price, quantity,
  description?, images?, image_url?, category?,
  variations?  // unknown — parsed by parseVariationGroups()
}
```

**Helper Function — `parseVariationGroups(input)`** (lines 23–76):
- Normalizes `product.variations` (stored as JSONB in Supabase) into `{ name, options: [{ value, stock }] }[]`.
- Handles:
  - **Canonical** — `[{ name, options: [{value, stock}] }]`
  - **Legacy array of strings** — `[{ name, options: ["S","M"] }]` → stock = 0
  - **Legacy comma-string** — `{ name, options: "S, M" }` → split by comma
- Filters out empty groups/options.

**State:**
- `quantity` — user-selected amount (1+)
- `selectedVariation` — `Record<groupName, value>`

**Derived Values:**
- `variationGroups = parseVariations(product.variations)`
- `hasVariations = variationGroups.length > 0`
- `selectedStock` — computed min stock across selected options (returns 0 if incomplete selection or any selected option out of stock).
- `canAdd` — boolean: quantity within bounds and stock available.

**Effects:**
- `useEffect` on `[product.id, variationGroups]` → resets `quantity = 1` and clears `selectedVariation`.
- `useEffect` when `selectedStock` changes → clamps `quantity` to `selectedStock` if variations exist.

**Render:**
- Two-column grid (image left, details right).
- Image gallery with main image + thumbnail strip.
- Product name, category, price, description.
- Stock indicator (green/red pulsing dot).
- **Variation selectors** — `<select>` per group with disabled options `(stock <= 0)`.
- Quantity controls (± buttons + number input, clamped).
- Primary CTA button — disabled unless `canAdd`; on click calls `addToCart(product, selectedVariation)` **`quantity` times**.

---

### `components/ProductDetailFromRoute.tsx`
**Location:** `C:\BTH-store\components\ProductDetailFromRoute.tsx`  
**Type:** Client Component (71 lines)  
**Purpose:** Route-aware product fetcher; gets `id` from URL, fetches from Supabase, passes to `ProductDetailClient`.

**Logic:**
- Uses `useParams<{ id?: string }>()` from `next/navigation`.
- `parsedId` normalizes `string | string[]` to first string.
- `useEffect` runs on mount / `parsedId` change:
  - Calls `supabase.from('products').select('*').eq('id', parsedId).single()`.
  - Sets `product` or `error`.
- Loading and error states render minimal messages.
- Success → `<ProductDetailClient product={product} />`.

---

## 🏠 Public Pages (`app/`)

### `app/layout.tsx`
**Location:** `C:\BTH-store\app\layout.tsx`  
**Type:** Root Layout (Server Component by default)  
**Purpose:** App-wide HTML structure, fonts, global styles, Navbar, and Paystack inline script.

**Exports:** `metadata` (SEO title + description).

**Structure:**
- `<html>` with Geist font CSS variables.
- `<body>`:
  - `<Navbar />` — fixed at top
  - `<main className="pt-20">` — padded to avoid navbar overlap
  - `<Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />` — loads payment gateway early.

---

### `app/page.tsx`
**Location:** `C:\BTH-store\app\page.tsx`  
**Type:** Server Component (79 lines)  
**Purpose:** Homepage — hero section + product grid.

**Logic:**
- **Server-side data fetch:** `const { data: products, error } = await supabase.from('products').select('*')`.
- Renders:
  - Hero banner with gradient background, "ESSENTIALS '26" headline.
  - "Latest Drops" section title.
  - Grid of `ProductCard` components mapping over `products`.

**Error/Empty States:** Simple text messages if fetch fails or no products.

---

### `app/about/page.tsx`
**Location:** `C:\BTH-store\app\about\page.tsx`  
**Type:** Server Component (58 lines)  
**Purpose:** About Us page with editable content from `site_content` table.

**Logic:**
- Fetches `site_content` where `key = 'about_us'`.
- `aboutText` = `data?.value` or default copy.
- Renders styled card with:
  - About text (from DB)
  - "What we care about" list (hardcoded)
  - CTA buttons: "Shop the store" (→ `/`), "View gallery" (→ `/gallery`)

---

### `app/gallery/page.tsx`
**Location:** `C:\BTH-store\app\gallery\page.tsx`  
**Type:** Server Component (71 lines)  
**Purpose:** Gallery wall displaying image URLs from `site_content` table (key: `gallery_images` stored as JSON array).

**Logic:**
- Fetches `site_content` with `key = 'gallery_images'`.
- Parses `value` as JSON → `string[]`.
- Filters to valid non-empty strings.
- Renders responsive grid (1–3 columns) of images.
- Empty state guides admin to upload via `/admin`.

---

### `app/checkout/page.tsx`
**Location:** `C:\BTH-store\app\checkout\page.tsx`  
**Type:** Client Component (292 lines)  
**Purpose:** Checkout form with delivery details, shipping method selection, Paystack integration, and order finalization.

**Dependencies:**
- `useCart` from `@/lib/store`
- `supabase` for DB writes
- Paystack Inline Script loaded dynamically

**State:**
- `shippingMethods[]`, `selectedShipping`
- `formData` — `{ firstName, lastName, email, address, phone }`
- `loading`, `scriptLoaded`

**Effects:**
1. On mount — dynamically inject Paystack script; set `scriptLoaded` on load.
2. On mount — fetch `shipping_methods` from Supabase; auto-select first.

**Calculated:**
- `subtotal = cart.reduce(...)`
- `total = subtotal + selectedShipping.price`

**Handler — `handleCheckout`:**
1. Validates script loaded, Paystack available, form complete.
2. `window.PaystackPop.setup({...})` configures payment:
   - `key: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - `amount: total * 100` (in kobo)
   - `metadata: { customer_name, address, phone, items: cart }`
   - `onClose` — logs + sets loading false
   - `callback` — on success:
     1. **Insert order** into `orders` table (status: `'paid'`, includes shipping info, items, total, `payment_reference`).
     2. **Decrement stock** — `Promise.allSettled(cart.map(handleStockDecrement))`.
     3. **Send email** — POST `/api/send-email` with `type: 'success'`.
     4. **Clear cart** + `router.push('/')`.

**Helper — `handleStockDecrement`:**
- Fetches current product `quantity`.
- Updates to `quantity - amountBought`.
- Throws error if insufficient stock.

**Render:**
- Back link to home
- Two-column layout:
  - Left: Delivery form → Shipping method radio cards → "Pay" submit button.
  - Right: Sticky order summary — lists items with variations, subtotal, shipping, total.

---

### `app/product/[id]/page.tsx`
**Location:** `C:\BTH-store\app\product\[id]\page.tsx`  
**Type:** Route page ( Server Component wrapper )  
**Purpose:** Dynamic route for product detail; thin wrapper rendering `ProductDetailFromRoute`.

**Logic:** Simply renders `<ProductDetailFromRoute />`. The dynamic segment `[id]` is consumed by the child component.

---

## 👨‍💼 Admin Section (`app/admin/`)

### `app/admin/layout.tsx`
**Location:** `C:\BTH-store\app\admin\layout.tsx`  
**Type:** Layout (Server Component)  
**Purpose:** Admin dashboard shell — fixed sidebar with navigation, content area.

**Structure:**
- **Sidebar** (`w-72 bg-black text-white`):
  - Logo "BTH ADMIN"
  - Navigation groups:
    - Core: Dashboard, Site Content, Inventory Hub
    - Operations: Orders, Shipping, Customers
  - Bottom: Settings link
- **Main** (`flex-1 overflow-y-auto`):
  - Soft background (`bg-zinc-50/50`)
  - Renders `{children}` (current page content)

**Note:** Conditionally shows/hides links via `text-zinc-300` for active/inactive visual state (but links are always clickable).

---

### `app/admin/page.tsx`
**Location:** `C:\BTH-store\app\admin\page.tsx`  
**Type:** Client Component (326 lines)  
**Purpose:** Site Content Editor — manages "About Us" text and Gallery image URLs.

**State:**
- `aboutText` — editable textarea
- `galleryImages` — `string[]`
- `newImageUrl` — text input for manual URL add
- `imageFile` — file input for upload
- `loading`, `saving`, `error`

**Effects:**
- `useEffect([])` → `fetchSiteContent()`:
  - Queries `site_content` for keys `['about_us', 'gallery_images']`
  - Parses gallery JSON into array
  - Sets local state

**Actions:**
- `upsert(key, value)` — `supabase.from('site_content').upsert({ key, value }, { onConflict: 'key' })`
- `handleSave` — upserts both fields, then `window.location.reload()` (simple refresh).
- `addImage` — appends URL to `galleryImages` array (client-side staging).
- `removeImage(idx)` — removes from array; also deletes from Supabase Storage bucket `gallery-images` if filename can be extracted from URL.

**Upload Flow:**
1. User selects file → `setImageFile`
2. Click "Upload" → `supabase.storage.from('gallery-images').upload(fileName, file)`
3. Get public URL via `getPublicUrl(fileName)`
4. Append to `galleryImages`

**Storage:** Uses Supabase Storage bucket `gallery-images`.

---

### `app/admin/dashboard/page.tsx`
**Location:** `C:\BTH-store\app\admin\dashboard\page.tsx`  
**Type:** Client Component (53 lines)  
**Purpose:** High-level business metrics dashboard.

**Data Fetched:**
- `orders = supabase.from('orders').select('total_amount')`
- `revenue = sum of all orders.total_amount`
- `orders count = length`
- `customers = 0` (placeholder — not implemented)

**UI:**
- Three cards in grid:
  1. Revenue (black card, large ₦ value)
  2. Total Orders (white card)
  3. Conversion Rate (placeholder `--%`)
- Bottom placeholder box: "Recent Sales Activity Placeholder"

**Note:** Minimal implementation; no charts, no date filtering.

---

### `app/admin/products/page.tsx`
**Location:** `C:\BTH-store\app\admin\products\page.tsx`  
**Type:** Client Component (84 lines)  
**Purpose:** Simple product creation form + list of existing products (table).

**State:**
- `products[]`
- Form fields: `name`, `price`, `category`
- `loading`

**Effects:**
- `fetchProducts()` on mount → `supabase.from('products').select('*').order('created_at', {ascending: false})`

**Actions:**
- `handleAddProduct` — inserts `{ name, price, category }` (no variations, images, description, or quantity).
- `deleteProduct(id)` — delete + refresh.

**Render:**
- Form at top (grid: Name, Price, Category) + Create button.
- List below — each row shows name, category, price, Edit button (→ `/admin/products/${id}`), Trash button.

**Limitation:** Basic product creation only; full editing (including variations) happens in product edit page.

---

### `app/admin/products/[id]/page.tsx`
**Location:** `C:\BTH-store\app\admin\products\[id]\page.tsx`  
**Type:** Client Component (443 lines)  
**Purpose:** Full product editor — manages all product fields including complex variation/stock system.

**Route Behavior:**
- `id === 'new'` → create mode
- otherwise → edit mode (fetches existing product)

**Types:**
```ts
type VariationOption = { value: string; stock: number }
type VariationGroup = { name: string; options: VariationOption[] }
type ProductForm = { name, price, quantity, description, images[], variations[] }
```

**Normalization — `normalizeVariationsInput`:**
- Converts stored `variations` (JSONB, potentially legacy formats) into canonical `{ name, options: [{value, stock}] }[]`.
- Handles:
  - Objects with `value`/`stock`
  - Arrays of strings
  - Comma-separated strings

**Validation — `variationsValidationError`:**
- **Critical rule:** If variations exist, `form.quantity` must equal **sum of all option stocks** across all groups.
- Ensures no negative stock values.

**Derived — `canSave`:**
- Name non-empty
- Price ≥ 0 and finite
- Quantity ≥ 0 and finite
- No variation validation errors
- Each variation group has name and ≥1 option with value

**Actions:**
- On mount (edit mode): fetches product, populates form using `normalizeVariationsInput`.
- `handleSave`:
  - Validates `canSave`
  - Payload: `{ name, price, quantity, description, images (filtered), variations (or empty []) }`
  - `insert` if new, `update` if edit
  - Alerts success, redirects to `/admin/inventory`

**UI:**
- Back arrow (←) to inventory
- Save / Create button (disabled until valid)
- Form fields: Name, Price, Quantity, Description (textarea)
- **Variations editor:**
  - "Add Variation" button → adds group with one empty option
  - Each group: name input + option rows (value + stock + delete)
  - "Add Option" button per group
  - Real-time display of variation stock total vs. quantity
- Validation error banner in red if mismatch

**Note:** Very complex form with deeply nested state updates (manual array mutation before `setForm`).

---

### `app/admin/inventory/page.tsx`
**Location:** `C:\BTH-store\app\admin\inventory\page.tsx`  
**Type:** Client Component (70 lines)  
**Purpose:** Inventory Hub — overview of all products with stock status and quick actions.

**Logic:**
- `fetchInventory()` on mount: `supabase.from('products').select('*').order('created_at', {ascending: false})`
- Each product card shows:
  - Thumbnail (`images?.[0]`)
  - Name, price, stock badge (red if 0, gray if >0)
  - Variation count (`product.variations?.length`)
  - Actions: Edit (→ `/admin/products/${id}`), Delete (calls supabase delete then refresh)
- "Add New Product" button → `/admin/products/new`

---

### `app/admin/orders/page.tsx`
**Location:** `C:\BTH-store\app\admin\orders\page.tsx`  
**Type:** Client Component (106 lines)  
**Purpose:** Order management — view orders, update status, trigger email notifications.

**Data:** `orders[]` from `supabase.from('orders').select('*').order('created_at', {ascending: false})`

**Order Card Fields:**
- ID (first 8 chars), status badge (paid/shipped/cancelled)
- Customer name, email, phone, address
- Items list with selected variations
- Total amount

**Status Transition Actions:**
- `status === 'paid'` → **"Mark Shipped"** button → updates to `'shipped'` + sends email (`type: 'shipped'`)
- `status !== 'cancelled' && status !== 'refunded'` → **"Cancel & Mail"** → updates to `'cancelled'` + sends email (`type: 'cancelled'`)
- `status === 'cancelled'` → **"Refunded"** button → updates to `'refunded'` + sends email (`type: 'refunded'`)

**Email Trigger:** POST to `/api/send-email` with `{ type: newStatus, order }`.

**Loading State:** Disables button per order during API call (`loadingId`).

---

### `app/admin/customers/page.tsx`
**Location:** `C:\BTH-store\app\admin\customers\page.tsx`  
**Type:** Client Component (57 lines)  
**Purpose:** Customer base list derived from `orders` table.

**Logic:**
- Fetches all orders.
- `reduce` groups by `customer_email`:
  - Accumulates `spent`, `orders` count, `items` array.
- Renders each customer:
  - Avatar = first initial in black circle
  - Name, email
  - Stats: orders count, total spent (₦ formatted)

**Note:** No individual customer detail page; this is aggregated view.

---

### `app/admin/settings/page.tsx`
**Location:** `C:\BTH-store\app\admin\settings\page.tsx`  
**Type:** Client Component (45 lines)  
**Purpose:** Settings placeholder — shows static configuration cards.

**Sections (all read-only except Logout):**
- Store Status (toggle, always ON)
- Payment Gateway (Paystack Live, "Configure" button disabled)
- Admin Access (secure session, "Logout All Devices" link)

**Note:** No actual settings management implemented.

---

### `app/admin/shipping/page.tsx`
**Location:** `C:\BTH-store\app\admin\shipping\page.tsx`  
**Type:** Client Component (53 lines)  
**Purpose:** Manage shipping methods (name, price, estimated days).

**State:**
- `methods[]`
- `newMethod = { name, price, days }`
- `loading`

**Actions:**
- `fetchMethods()` — selects from `shipping_methods` ordered by price.
- `addMethod` — inserts new row; clears form; refreshes.
- Delete button per method → `supabase.delete().eq('id', m.id)` then refresh.

**UI:**
- Form: input ×3 + Add button
- List: each method shows name, price (formatted), days, trash icon

---

## 🔌 API Routes

### `app/api/send-email/route.ts`
**Location:** `C:\BTH-store\app\api\send-email\route.ts`  
**Type:** Route Handler (18 lines)  
**Purpose:** Server-side endpoint to send transactional emails via `lib/email.ts` Brevo integration.

**Method:** `POST`

**Request Body:** `{ type: 'paid' | 'shipped' | 'cancelled', order: any }`

**Logic:**
- Calls `sendOrderEmail(type, order)` from `@/lib/email`.
- Returns `{ message: "Email Sent" }` on success.
- Returns `500` on failure.

**Used By:**
- Checkout page (after payment) — `type: 'success'`
- Order management page — `type: 'shipped' | 'cancelled' | 'refunded'` (though `refunded` type isn't defined in `email.ts`, only in `emails.ts` — potential bug).

---

## 📦 Data Model Summary

**Supabase Tables (inferred):**
- `products` — `id*, name, price, quantity, description, images (jsonb[]), image_url, category, variations (jsonb), created_at`
- `orders` — `id*, customer_email, customer_name, address, phone, total_amount, shipping_cost, shipping_method_name, items (jsonb), status ('paid'|'shipped'|'cancelled'|'refunded'), payment_reference, created_at`
- `site_content` — `key* (PK), value (text)` — key-value store for about text, gallery JSON
- `shipping_methods` — `id*, name, price, estimated_days`
- `storage bucket: gallery-images` — stores uploaded gallery images

---

## 🧠 Business Logic Highlights

### Cart & Stock System
- **Cart persistence** via `zustand` + `persist` middleware → localStorage.
- **Variation-aware stock** — per product, if variations exist, actual available stock = min stock among selected option stocks.
- `addToCart` in `store.ts` prevents adding beyond stock; `updateQuantity` clamps.
- Cart `cartId` is deterministic: `productId + variationKey`; prevents duplicate variant entries.

### Checkout Flow
1. User fills delivery form
2. Selects shipping method (price affects total)
3. Paystack popup opens → user pays
4. On callback:
   - Order saved with `status='paid'`
   - Stock decremented per item
   - Confirmation email queued
   - Cart cleared

### Product Variations
- Stored as JSONB; can have multiple groups (e.g., Size, Color).
- Each group → options with `value` and `stock`.
- **Product-level `quantity` must equal sum of all option stocks** (enforced in product edit UI).
- Frontend (`ProductDetailClient`) uses this to compute `selectedStock`.

### Admin UX
- Most admin pages are client-rendered with simple `useEffect` data fetching.
- No optimistic updates; full refresh after mutations.
- Minimal error handling (alerts).
- No pagination, search, or filters — suitable for small catalogs.

---

## ⚠️ Potential Issues / Tech Debt

1. **Duplicate email modules** (`lib/email.ts` vs `lib/emails.ts`) — one uses REST `fetch`, one uses SDK. API route uses the REST version.
2. **`email.ts` missing 'refunded' case** — refund button in admin orders will cause fallback to default or error if email tries to use type 'refunded' (API route calls `/api/send-email` with status type); API uses `lib/email` which doesn't handle 'refunded'.
3. **No server-side stock validation on checkout** — `handleStockDecrement` runs after payment but could fail (e.g., race condition). No compensation if partial stock updates fail.
4. **Hardcoded Paystack inline script in layout** — also re-loaded in checkout (redundant).
5. **Variation validation rule** (quantity == sum of option stocks) is enforced in UI but not at database level — possible to bypass via direct DB write.
6. **Image uploads in admin site-content** — directly uploads to Supabase storage without MIME/type/size checks.
7. **No authentication/authorization** — admin pages are publicly accessible (no middleware, no auth gates).
8. **Error handling minimal** — mostly `alert()`; no toast/snackbar system.
9. **`overview.json` and `overview_architecture.puml`** exist but may be outdated; this document supersedes.

---

## 📊 Stats

- **Total files (source):** 31 TypeScript/TSX files
- **Total lines of code:** ~3092 (per `overview.json`)
- **Framework:** Next.js 16 (App Router, React 19)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Payments:** Paystack
- **Email:** Brevo (Sendinblue)

---

**Generated by:** Kilo — File-by-file codebase review  
**Date:** 2026-05-14
