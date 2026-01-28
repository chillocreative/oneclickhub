# One Click Hub - Technical Documentation

## 1. Database Schema (ERD)

The system uses a MySQL relational database with the following core tables.

### Users & Authentication
- **users**
  - `id` (BigInt, PK)
  - `name` (String)
  - `phone_number` (String, Unique) - **Primary Login Identifier**
  - `email` (String, Unique, Nullable)
  - `password` (String)
  - `remember_token`
  - `timestamps`

### Roles & Permissions (Spatie)
- **roles**
  - `id` (BigInt, PK)
  - `name` (String) - e.g., 'Admin', 'General User'
  - `guard_name` (String)
- **permissions**
  - `id`, `name`, `guard_name`
- **model_has_roles** (Pivot)
  - `role_id`, `model_type`, `model_id`

### Service Sectors
- **service_categories**
  - `id` (BigInt, PK)
  - `name` (String, Unique) - e.g., 'Catering', 'Event Hall'
  - `slug` (String, Unique)
  - `description` (Text, Nullable)
  - `timestamps`

### Multi-Tenancy (Future)
- Currently implemented via **Role-Based Access Control (RBAC)**.
- For data segregation, a `team_id` or `tenant_id` can be added to service-related tables (e.g., `services`, `bookings`) to link them to specific Service Providers (General Users).

---

## 2. API Documentation

### Authentication (Sanctum)
- **POST** `/login`: Authenticate user (supports phone/email logic).
- **POST** `/register`: Register new user.
- **POST** `/logout`: Invalidate token.
- **GET** `/user`: Get current authenticated user details.

### Service Categories
- **GET** `/api/categories`
  - **Description**: Fetch all available service categories.
  - **Access**: Public
  - **Response**:
    ```json
    [
      {
        "id": 1,
        "name": "Catering",
        "slug": "catering",
        "description": null
      },
      ...
    ]
    ```

---

## 3. Tech Stack & Configuration

- **Backend**: Laravel 12 (PHP 8.3)
- **Frontend**: React.js (via Inertia.js)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: MySQL
- **CSS**: Tailwind CSS (Pre-configured with custom OneClickHub design system)
- **Auth**: Laravel Sanctum + Spatie Permission (Phone Login)

### Key Directories
- **Controllers**: `app/Http/Controllers`
- **Models**: `app/Models`
- **Frontend Pages**: `resources/js/Pages`
- **Routes**: `routes/web.php` (Frontend), `routes/api.php` (Mobile/External)

### Next Steps 
1. **SMS Integration**: Implement `SmsService` interface to replace log-based OTP.
2. **Flutter App**: Consume the `/api/categories` and Auth endpoints.
3. **Dashboard UI**: Customize `resources/js/Pages/Dashboard.jsx` to show Service Provider specific stats.
