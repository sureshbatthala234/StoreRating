# Store Rating Application

A full-stack web application for reviewing and rating retail stores, featuring role-based dashboards for **Administrators**, **Store Owners**, and **Normal Users**.

---

## 🌟 Features Overview

### 1. Authentication & Security
- **JWT-Based Authentication**: Secure stateless token authentication.
- **Bcrypt Password Encryption**: Industry-standard password hashing with salt cost factor 10.
- **Strict Input Validation**:
  - **Full Name**: 20–60 characters.
  - **Email**: Standard email format validation and normalization.
  - **Password**: 8–16 characters containing at least one uppercase letter and at least one special character (`!@#$%^&*`).
  - **Address**: Up to 400 characters maximum.
- **Role-Based Access Control**:
  - `admin`: Full administrative access to users, stores, and analytics.
  - `owner`: Store-specific analytics, average rating, and rater details.
  - `user`: Public store browsing, searching, and submitting/modifying store ratings.
- **Change Password**: Dedicated self-service password update for all logged-in roles.

---

### 2. Administrator Role
- **Overview Dashboard**: Live statistics showing Total Users, Total Stores, and Total Ratings.
- **User Management**:
  - Search/filter users by Name, Email, Address, and Role.
  - Sort table by Name, Email, Role, or Date Registered.
  - Displays user role badge and associated store rating for owners.
  - Detailed single-user view (`/admin/users/:id`).
  - Create new accounts with any role (`admin`, `owner`, or `user`).
- **Store Management**:
  - Filter stores by Name, Email, or Address.
  - Sort table by Name, Email, Address, Date Added, or Average Rating.
  - Shows assigned Store Owner (Name and Email).
  - Add new stores and assign them to registered store owners.

---

### 3. Store Owner Role
- **Owner Dashboard**:
  - Displays owned store details (Name, Email, Physical Address).
  - **Prominent Average Rating**: Large visual average rating card with star breakdown and total reviews count.
  - **Customer Rater Table**: Detailed history of all customers who rated the store (Name, Email, Rating score 1–5, and submission timestamp).

---

### 4. Normal User Role
- **Store Directory & Search**:
  - Search stores in real-time by Store Name and Location / Address.
- **Community Ratings**:
  - View overall average rating score and total review count per store.
  - View user's own submitted rating (`my_rating`).
- **Interactive Rating System**:
  - Rate any store on a 1 to 5 star scale.
  - Modify previously submitted ratings at any time with instant UI updates.

---

## 🏗️ Project Architecture

```
store-rating-app/
├── backend/
│   ├── .env                      # Database & JWT configuration
│   ├── package.json              # Backend dependencies
│   ├── db/
│   │   └── schema.sql            # Database schema & default admin seed
│   └── src/
│       ├── app.js                # Express app entry & middleware
│       ├── config/
│       │   └── db.js             # MySQL2 connection pool
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── ownerController.js
│       │   └── storeController.js
│       ├── middleware/
│       │   ├── auth.js           # JWT verification
│       │   ├── authorize.js      # Role-based guard
│       │   └── validate.js       # express-validator handler
│       └── routes/
│           ├── admin.js
│           ├── auth.js
│           ├── owner.js
│           └── stores.js
│
└── frontend/
    ├── index.html                # Vite HTML shell
    ├── package.json              # Frontend dependencies
    ├── vite.config.js            # Vite build & API proxy setup
    └── src/
        ├── App.jsx               # React Router & Route guards
        ├── index.css             # Complete design system & responsive styling
        ├── main.jsx              # React DOM mounting
        ├── api/
        │   └── client.js         # Axios client with JWT interceptors
        ├── context/
        │   └── AuthContext.jsx   # Global auth state & actions
        ├── components/
        │   ├── Navbar.jsx        # Responsive navigation with role pills
        │   ├── ProtectedRoute.jsx# Role-based route guard
        │   └── StarRating.jsx    # Display & interactive rating components
        └── pages/
            ├── Login.jsx
            ├── Signup.jsx
            ├── ChangePassword.jsx
            ├── AdminDashboard.jsx
            ├── AdminUsers.jsx
            ├── AdminUserDetail.jsx
            ├── AdminStores.jsx
            ├── OwnerDashboard.jsx
            ├── UserStores.jsx
            └── NotFound.jsx
```

---

## 🚀 Getting Started

### 1. Database Setup (MySQL)
1. Ensure your MySQL server is running.
2. Run the SQL schema script in your MySQL client:
   ```bash
   mysql -u root -p < backend/db/schema.sql
   ```
3. Update `backend/.env` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=store_rating_db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   PORT=5000
   ```

#### Default Administrator Account
- **Email**: `admin@admin.com`
- **Password**: `Admin@1234`
*(Change this password immediately after first sign-in)*

---

### 2. Backend Setup
In the `backend` directory:
```bash
cd backend
npm install
npm run dev   # or: npm start
```
The API server will run on `http://localhost:5000`.

---

### 3. Frontend Setup
In the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The React frontend will run on `http://localhost:3000` and automatically proxy `/api` requests to the Express server.
