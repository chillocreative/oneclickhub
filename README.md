# OneClickHub 🚀

A modern multi-tenant service marketplace platform connecting service providers (freelancers) with customers. Built with Laravel 12 and React (Inertia.js), featuring subscription management, payment gateway integration, and role-based access control.

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=flat&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat&logo=mysql&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features
- **Phone-Based Authentication**: Users login with phone numbers (primary identifier) with optional email
- **Role-Based Access Control (RBAC)**: Three distinct user roles (Admin, Freelancer, Customer)
- **Subscription Management**: Freelancers subscribe to plans to access platform features
- **Multi-Payment Gateway Integration**: Bayarcash and SenangPay support
- **Service Categories**: Multiple service sectors (Catering, Event Hall, etc.)
- **User Management**: Comprehensive admin panel for managing users and subscriptions
- **Revenue Center**: Track subscriptions, transactions, and payment gateway settings
- **Transaction History**: Complete audit trail of all payment transactions

### Admin Features
- User management (Create, Read, Update, Delete)
- Subscription plan management (Create, Update, Activate/Deactivate)
- Payment gateway configuration
- Transaction monitoring and reporting
- Role and permission management

### Freelancer Features
- Subscribe to service plans
- Manage service listings (coming soon)
- View subscription status and history
- Receive bookings from customers (coming soon)

### Customer Features
- Browse service providers
- Book services (coming soon)
- Review and rate services (coming soon)

## 🛠️ Tech Stack

### Backend
- **Framework**: Laravel 12.x (PHP 8.3)
- **Authentication**: Laravel Sanctum
- **Authorization**: Spatie Laravel Permission
- **Database**: MySQL
- **API**: RESTful API for mobile integration

### Frontend
- **Framework**: React 18.x
- **Routing**: Inertia.js 2.x (Server-side rendering)
- **Styling**: Tailwind CSS 3.x
- **UI Components**: Headless UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite

### Payment Gateways
- **Bayarcash**: Malaysian payment gateway
- **SenangPay**: Malaysian payment gateway

### Development Tools
- **Code Quality**: Laravel Pint (PHP CS Fixer)
- **Testing**: PHPUnit
- **Logs**: Laravel Pail
- **Queue**: Laravel Queue
- **Package Manager**: Composer, NPM

## 📦 Requirements

- PHP >= 8.3
- Composer
- Node.js >= 18.x
- NPM or Yarn
- MySQL >= 8.0
- Git

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd oneclickhub
```

### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### 3. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE oneclickhub;
EXIT;

# Run migrations and seeders
php artisan migrate --seed
```

### 5. Build Assets
```bash
# Development
npm run dev

# Production
npm run build
```

### 6. Start Development Server
```bash
# Option 1: Run all services concurrently (recommended)
composer dev

# Option 2: Run services separately
php artisan serve          # Laravel server (http://localhost:8000)
php artisan queue:listen   # Queue worker
php artisan pail           # Real-time logs
npm run dev                # Vite dev server
```

## ⚙️ Configuration

### Environment Variables

#### Database Configuration
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=oneclickhub
DB_USERNAME=root
DB_PASSWORD=
```

#### Payment Gateway Configuration

**Bayarcash**
```env
BAYARCASH_MERCHANT_CODE=your_merchant_code
BAYARCASH_VERIFICATION_KEY=your_verification_key
BAYARCASH_RETURN_URL="${APP_URL}/payment/bayarcash/return"
```

**SenangPay**
```env
SENANGPAY_MERCHANT_ID=your_merchant_id
SENANGPAY_SECRET_KEY=your_secret_key
SENANGPAY_CALLBACK_URL="${APP_URL}/payment/senangpay/callback"
```

#### Application Configuration
```env
APP_NAME=OneClickHub
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

### Default Admin Account
After running seeders, you can login with:
- **Phone**: (check database seeder)
- **Password**: (check database seeder)

## 📖 Usage

### Running the Application

#### Development Mode
```bash
# Start all services at once
composer dev
```
This command runs:
- Laravel development server (port 8000)
- Queue listener
- Real-time log viewer (Laravel Pail)
- Vite dev server (HMR enabled)

Access the application at: `http://localhost:8000`

#### Production Mode
```bash
# Build assets
npm run build

# Start server (use proper web server like Nginx/Apache)
php artisan serve
```

### Common Tasks

#### Create New Admin User
```bash
php artisan tinker
$user = User::create(['name' => 'Admin', 'phone_number' => '0123456789', 'password' => bcrypt('password')]);
$user->assignRole('Admin');
```

#### Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### Run Migrations
```bash
# Fresh migration (drops all tables)
php artisan migrate:fresh

# Fresh migration with seeders
php artisan migrate:fresh --seed

# Rollback last migration
php artisan migrate:rollback
```

## 📁 Project Structure

```
oneclickhub/
├── app/
│   ├── Http/
│   │   └── Controllers/          # Laravel controllers
│   │       ├── Auth/             # Authentication controllers
│   │       ├── PaymentController.php
│   │       ├── SubscriptionController.php
│   │       └── UserController.php
│   ├── Models/                   # Eloquent models
│   │   ├── User.php
│   │   ├── Subscription.php
│   │   ├── SubscriptionPlan.php
│   │   ├── Transaction.php
│   │   └── PaymentGateway.php
│   └── Services/                 # Business logic services
│       ├── BayarcashService.php
│       └── SenangpayService.php
├── database/
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Database seeders
├── resources/
│   ├── js/
│   │   ├── Pages/               # Inertia.js page components
│   │   │   ├── Auth/            # Authentication pages
│   │   │   ├── Users/           # User management
│   │   │   ├── Subscriptions/   # Subscription management
│   │   │   ├── Payment/         # Payment pages
│   │   │   ├── Dashboard.jsx
│   │   │   └── Welcome.jsx
│   │   ├── Components/          # Reusable React components
│   │   ├── Layouts/             # Page layouts
│   │   └── app.jsx              # Inertia app entry
│   └── css/
│       └── app.css              # Tailwind CSS
├── routes/
│   ├── web.php                  # Web routes (Inertia)
│   ├── api.php                  # API routes (Mobile)
│   └── auth.php                 # Authentication routes
├── tests/
│   ├── Feature/                 # Feature tests
│   └── Unit/                    # Unit tests
├── public/                      # Public assets
├── .env.example                 # Environment template
├── composer.json                # PHP dependencies
├── package.json                 # JavaScript dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
├── CLAUDE.md                    # AI assistant guidance
└── TECHNICAL_DOCS.md            # Technical documentation
```

## 🔌 API Documentation

### Authentication Endpoints
```
POST   /api/login              # User login
POST   /api/register           # User registration
POST   /api/logout             # User logout
GET    /api/user               # Get authenticated user
```

### Service Category Endpoints
```
GET    /api/categories         # List all service categories
```

### Payment Callback Endpoints (Public)
```
GET    /payment/bayarcash/return              # Bayarcash return URL
GET    /payment/senangpay/callback            # SenangPay callback (GET)
POST   /payment/senangpay/callback            # SenangPay callback (POST)
GET    /payment/success                       # Payment success page
GET    /payment/failed                        # Payment failed page
GET    /payment/pending                       # Payment pending page
```

### Admin Endpoints (Protected)
```
# User Management
GET    /users/freelancers                     # List freelancers
GET    /users/customers                       # List customers
GET    /users/admins                          # List admins
POST   /users                                 # Create user
PATCH  /users/{user}                          # Update user
DELETE /users/{user}                          # Delete user

# Subscription Management
GET    /subscriptions                         # List subscriptions
GET    /subscriptions/plans                   # List subscription plans
POST   /subscriptions/plans                   # Create plan
PATCH  /subscriptions/plans/{plan}            # Update plan
DELETE /subscriptions/plans/{plan}            # Delete plan
PATCH  /subscriptions/plans/{plan}/toggle     # Toggle plan status

# Payment Gateway Management
GET    /subscriptions/gateways                # List gateways
PATCH  /subscriptions/gateways/{gateway}      # Update gateway config

# Transaction Management
GET    /subscriptions/transactions            # List transactions
```

## 🧪 Testing

### Run All Tests
```bash
composer test
# or
php artisan test
```

### Run Specific Test Suite
```bash
# Feature tests
php artisan test --testsuite=Feature

# Unit tests
php artisan test --testsuite=Unit
```

### Run Specific Test File
```bash
php artisan test tests/Feature/Auth/LoginTest.php
```

### Run with Coverage
```bash
php artisan test --coverage
```

### Code Formatting
```bash
# Format all files
./vendor/bin/pint

# Format specific directory
./vendor/bin/pint app/Http/Controllers
```

## 🚢 Deployment

### Production Checklist

1. **Environment Configuration**
   ```bash
   # Set environment to production
   APP_ENV=production
   APP_DEBUG=false

   # Set secure app key
   php artisan key:generate

   # Configure database
   DB_DATABASE=production_db
   DB_USERNAME=production_user
   DB_PASSWORD=secure_password
   ```

2. **Optimize Application**
   ```bash
   # Cache configuration
   php artisan config:cache

   # Cache routes
   php artisan route:cache

   # Cache views
   php artisan view:cache

   # Optimize autoloader
   composer install --optimize-autoloader --no-dev
   ```

3. **Build Assets**
   ```bash
   npm run build
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate --force
   ```

5. **Set Permissions**
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```

6. **Configure Web Server**
   - Point document root to `/public`
   - Enable `.htaccess` for Apache
   - Configure Nginx with proper rules

### Recommended Server Configuration
- PHP 8.3 with extensions: OpenSSL, PDO, Mbstring, Tokenizer, XML, Ctype, JSON
- MySQL 8.0+
- Nginx or Apache with mod_rewrite
- SSL certificate (Let's Encrypt recommended)
- Queue worker (Supervisor recommended)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow PSR-12 coding standard for PHP
- Use Laravel best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Code Formatting
```bash
# Before committing, format your code
./vendor/bin/pint
```

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP Framework
- [React](https://reactjs.org) - A JavaScript library for building user interfaces
- [Inertia.js](https://inertiajs.com) - The Modern Monolith
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) - Associate users with roles and permissions

## 📞 Support

For support, email support@oneclickhub.com or open an issue in the repository.

---

**Built with ❤️ by the OneClickHub Team**
