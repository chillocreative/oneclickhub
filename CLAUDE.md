# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OneClickHub is a multi-tenant service marketplace platform connecting service providers (freelancers) with customers. Built with Laravel 12 and React (via Inertia.js), it features subscription management, payment gateway integration, and role-based access control.

**Tech Stack:**
- Backend: Laravel 12 (PHP 8.3)
- Frontend: React.js via Inertia.js
- Database: MySQL
- Auth: Laravel Sanctum + Spatie Permission (phone-based login)
- Payment Gateways: Bayarcash, SenangPay
- Styling: Tailwind CSS with custom design system
- State Management: Inertia.js (server-driven)
- Animations: Framer Motion
- Icons: Lucide React

## Development Commands

### Running the Development Environment
```bash
# Start all dev services (Laravel server, queue, logs, Vite) concurrently
composer dev

# Alternative: run services separately
php artisan serve          # Laravel development server
php artisan queue:listen   # Queue worker
php artisan pail           # Real-time logs
npm run dev                # Vite dev server
```

### Testing
```bash
# Run all tests
composer test
# or
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run specific test file
php artisan test tests/Feature/ExampleTest.php

# Run with coverage
php artisan test --coverage
```

### Code Quality
```bash
# Format code with Laravel Pint
./vendor/bin/pint

# Fix specific file/directory
./vendor/bin/pint app/Http/Controllers
```

### Database
```bash
# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh migration with seed
php artisan migrate:fresh --seed

# Create new migration
php artisan make:migration create_table_name
```

### Build
```bash
# Production build
npm run build

# Watch mode for development
npm run dev
```

## Architecture

### Authentication & Authorization
- **Primary login identifier**: Phone number (not email)
- **Three user roles**: Admin, Freelancer, Customer
- Uses Spatie Permission package for RBAC
- Laravel Sanctum for API authentication (future mobile app)
- Middleware: `role:Admin` for admin-only routes

### User Roles & Access
- **Admin**: Full system access - user management, subscription plans, payment gateway settings, revenue tracking
- **Freelancer**: Service providers who subscribe to plans to list services
- **Customer**: General users who book services

### Subscription System
Freelancers subscribe to plans to access platform features:
- **Models**: `SubscriptionPlan`, `Subscription`, `Transaction`
- **Payment flow**: User selects plan → Gateway (Bayarcash/SenangPay) → Callback → Subscription activated
- Plans have: name, price, duration (days), features (JSON), status (active/inactive)
- Subscriptions track: user, plan, dates (start/end), status, auto-renewal

### Payment Gateway Integration
Two payment services are integrated via service layer pattern:
- **BayarcashService** (`app/Services/BayarcashService.php`)
- **SenangpayService** (`app/Services/SenangpayService.php`)

Each service handles:
- Payment link generation
- Signature/hash validation
- Return/callback URL processing
- Transaction status updates

**Payment callback routes** (public, no auth):
- Bayarcash: `/payment/bayarcash/return`
- SenangPay: `/payment/senangpay/callback` (supports GET/POST)
- Status pages: `/payment/success`, `/payment/failed`, `/payment/pending`

### Data Models
Core models in `app/Models/`:
- **User**: Extended with `position` field, HasRoles trait, subscription relationship
- **Subscription**: Belongs to User and SubscriptionPlan, tracks status/dates
- **SubscriptionPlan**: Defines available plans with features (JSON)
- **Transaction**: Records all payment transactions with gateway details
- **PaymentGateway**: Stores gateway credentials (Bayarcash, SenangPay)
- **ServiceCategory**: Service types (e.g., Catering, Event Hall)

### Frontend Structure (Inertia.js)
```
resources/js/
├── Pages/              # Full page components (Inertia.js)
│   ├── Auth/          # Login, Register
│   ├── Dashboard.jsx  # Main dashboard
│   ├── Welcome.jsx    # Landing page with subscription plans
│   ├── Users/         # User management (Admin)
│   ├── Subscriptions/ # Revenue center (Admin)
│   ├── Payment/       # Payment status pages
│   └── Profile/       # User profile
├── Components/        # Reusable React components
├── Layouts/           # Page layouts (e.g., AuthenticatedLayout)
└── app.jsx           # Inertia app setup
```

**Inertia.js patterns:**
- Controllers return: `Inertia::render('PageName', ['data' => $data])`
- Props passed from backend are available directly in React components
- Forms use `useForm()` hook from `@inertiajs/react`
- Routes accessed via `route()` helper (Ziggy)

### Backend Structure
```
app/
├── Http/Controllers/
│   ├── Auth/                    # Authentication controllers
│   ├── UserController.php       # Admin user management
│   ├── SubscriptionController.php  # Subscription/plan management
│   ├── PaymentController.php    # Payment gateway callbacks
│   └── ProfileController.php    # User profile
├── Models/                      # Eloquent models
├── Services/                    # Payment gateway services
└── Providers/                   # Service providers
```

### Routes
- **Web routes** (`routes/web.php`): Inertia.js pages, auth required except landing/payment callbacks
- **API routes** (`routes/api.php`): REST API for future mobile app (Sanctum auth)
- **Admin routes**: Wrapped in `middleware('role:Admin')` group

## Important Conventions

### Phone Number Authentication
- Users login with phone number (not email)
- Email is optional (nullable)
- When working on auth features, always consider phone as primary identifier

### Service Layer Pattern
- Payment logic lives in `app/Services/` not controllers
- Each gateway has dedicated service class with consistent interface
- Controllers call service methods and handle responses

### Subscription Status Flow
```
pending → active (on successful payment)
active → cancelled (manual cancellation)
active → expired (end_date passed)
```

### Database Schema Checks
Before querying certain tables (like `subscriptions`), check if they exist:
```php
Schema::hasTable('subscriptions')
```
This prevents errors during fresh installations.

### Frontend State Management
- Use Inertia.js props for server-side data (no Redux/Context needed)
- Forms: `useForm()` from `@inertiajs/react`
- Page visits: `router.visit()` or `router.get()`
- Flash messages passed via `$page.props.flash`

### Styling Conventions
- Tailwind CSS utility classes (no custom CSS unless necessary)
- Design system color palette defined in `tailwind.config.js`
- Responsive design: mobile-first approach
- Animations via Framer Motion for complex interactions

## Common Patterns

### Creating Admin-Only Features
```php
// In routes/web.php
Route::middleware(['auth', 'role:Admin'])->group(function () {
    Route::get('/admin-feature', [Controller::class, 'method']);
});
```

### Payment Gateway Flow
1. User initiates payment → Controller validates → Service creates payment link
2. User completes payment on gateway → Gateway redirects to callback URL
3. Callback controller → Service validates signature → Update transaction/subscription

### Working with Subscriptions
```php
// Check if user has active subscription
$user->activeSubscription() // Returns Subscription model or null

// Assign subscription
$user->subscriptions()->create([...]);

// Cancel subscription
$subscription->update(['status' => 'cancelled', 'end_date' => now()]);
```

### Inertia.js Page Creation
```php
// Controller
return Inertia::render('PageName', [
    'data' => $data,
    'canEdit' => auth()->user()->can('edit-something'),
]);
```

```jsx
// resources/js/Pages/PageName.jsx
export default function PageName({ data, canEdit }) {
    return <div>...</div>;
}
```

## Environment Setup

### Required .env Variables
```
# Database
DB_CONNECTION=mysql
DB_DATABASE=oneclickhub

# Payment Gateways
BAYARCASH_MERCHANT_CODE=
BAYARCASH_VERIFICATION_KEY=
SENANGPAY_MERCHANT_ID=
SENANGPAY_SECRET_KEY=
```

### Initial Setup
```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run build
```

## Testing Considerations

- Tests use SQLite in-memory database (see `phpunit.xml`)
- Feature tests should cover payment gateway callbacks with signature validation
- Mock external payment gateway API calls in tests
- Test role-based access control for admin routes
- Test subscription status transitions
