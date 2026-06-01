# 🔐 Homely — Authentication Module Documentation

> **Author:** Subrat
> **Branch:** `subrat`
> **Last Updated:** 30 May 2026

---

## 📌 Overview

This module implements the **complete authentication system** for the Homely application. It provides a unified auth layer for **all user roles** — `TENANT`, `OWNER`, and `ADMIN` — using JWT-based dual-token authentication (access token + refresh token).

### What's Included

- User Registration (all roles)
- User Login
- JWT Access Token (short-lived, 15 min)
- JWT Refresh Token (long-lived, 7 days, httpOnly cookie)
- Token Rotation on Refresh
- Logout (cookie cleared)
- Get Current User Profile
- Change Password
- Role-based Authorization Middleware
- Request Validation (express-validator)
- Global Error Handler
- Custom ApiError / ApiResponse utilities
- API Versioning (`/api/v1/`)

### What's NOT Included (Future Work)

- Google OAuth
- Email Verification (OTP/link flow)
- TenantProfile / OwnerProfile CRUD
- Forgot / Reset Password

---

## 📁 Project Structure

```
homely-server/
├── server.js                          # Entry point — connects DB, starts Express
├── .env                               # Environment variables (gitignored)
├── .env.example                       # Template for .env
├── package.json
│
└── src/
    ├── app.js                         # Express app setup, CORS, versioning
    │
    ├── config/
    │   ├── env.config.js              # Centralized env loader (frozen object)
    │   └── db.config.js               # MongoDB connection (DatabaseConfig class)
    │
    ├── controllers/
    │   └── auth.controller.js         # AuthController class (handles HTTP req/res)
    │
    ├── middlewares/
    │   ├── auth.middleware.js          # AuthMiddleware — authenticate & authorize
    │   ├── errorHandler.middleware.js  # Global error handler (ErrorHandler class)
    │   └── validators/
    │       └── auth.validator.js      # AuthValidator — input validation rules
    │
    ├── models/                        # ⚠️ NOT TOUCHED — maintained by teammate
    │   ├── user.model.js
    │   ├── tenant.model.js
    │   ├── owner.model.js
    │   ├── listing.model.js
    │   ├── favorite.model.js
    │   ├── conversation.model.js
    │   ├── message.model.js
    │   ├── notification.model.js
    │   └── report.model.js
    │
    ├── repositories/
    │   ├── contracts/
    │   │   └── IUserRepository.js     # Interface (abstract methods)
    │   └── implementations/
    │       └── mongoUserRepository.js # MongoDB implementation
    │
    ├── routes/
    │   └── v1/
    │       ├── index.routes.js        # V1 route aggregator
    │       └── auth.routes.js         # Auth endpoints
    │
    ├── services/
    │   └── auth.service.js            # AuthService — business logic
    │
    └── utils/
        ├── ApiError.js                # Custom error class (statusCode + errors[])
        ├── ApiResponse.js             # Custom success response wrapper
        ├── asyncHandler.js            # Wraps async handlers (auto try-catch)
        ├── constants.js               # ROLES, ACCOUNT_STATUS, COOKIE_NAMES
        ├── tokenHelper.js             # TokenHelper — JWT generate/verify
        └── cookieHelper.js            # CookieHelper — set/clear httpOnly cookies
```

---

## 🏗️ Architecture

```
Client Request
     │
     ▼
┌─────────────────┐
│   Routes (v1)   │  ← Defines endpoints, wires middleware chain
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validators    │  ← Validates request body (express-validator)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  ← Handles HTTP request/response, sets cookies
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │  ← Business logic (hashing, token gen, checks)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  ← Database operations via Mongoose
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │
└─────────────────┘
```

**All code is class-based** (no functional controllers/services).

---

## 🔗 API Endpoints

**Base URL:** `http://localhost:9000/api/v1`

### 1. Health Check

```
GET /api/v1/health
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Server is running healthy 🏠",
  "data": {
    "uptime": 123.456,
    "timestamp": "2026-05-30T18:00:00.000Z"
  }
}
```

---

### 2. Register

```
POST /api/v1/auth/register
```

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Subrat Kumar",
  "email": "subrat@example.com",
  "password": "MyPass@123",
  "confirmPassword": "MyPass@123",
  "role": "TENANT",
  "phone": "+919876543210"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | ✅ | Max 100 chars |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |
| `confirmPassword` | string | ✅ | Must match `password` |
| `role` | string | ✅ | `TENANT` \| `OWNER` \| `ADMIN` |
| `phone` | string | ❌ | E.164 format (e.g., `+919876543210`) |

**Success Response:** `201 Created`
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "665a1b2c3d4e5f6a7b8c9d0e",
      "name": "Subrat Kumar",
      "email": "subrat@example.com",
      "role": "TENANT",
      "phone": "+919876543210",
      "isEmailVerified": false,
      "accountStatus": "ACTIVE",
      "createdAt": "2026-05-30T18:00:00.000Z",
      "updatedAt": "2026-05-30T18:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

> 🍪 **Cookie Set:** `refreshToken` (httpOnly, 7 days)

**Error Responses:**

| Status | Scenario |
|--------|----------|
| `400 Bad Request` | Validation failed (missing fields, weak password, etc.) |
| `409 Conflict` | Email already registered |

---

### 3. Login

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "subrat@example.com",
  "password": "MyPass@123"
}
```

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

> 🍪 **Cookie Set:** `refreshToken` (httpOnly, 7 days)

**Error Responses:**

| Status | Scenario |
|--------|----------|
| `400 Bad Request` | Missing email or password |
| `401 Unauthorized` | Invalid email or password |
| `403 Forbidden` | Account is BLOCKED |

---

### 4. Refresh Token

```
POST /api/v1/auth/refresh-token
```

**No body required.** The refresh token is read from the `refreshToken` cookie.

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

> 🍪 **Cookie Updated:** New `refreshToken` (token rotation)

**Error Responses:**

| Status | Scenario |
|--------|----------|
| `401 Unauthorized` | Missing, invalid, or expired refresh token |
| `403 Forbidden` | Account is BLOCKED |

---

### 5. Get Current User

```
GET /api/v1/auth/me
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "user": {
      "_id": "665a1b2c3d4e5f6a7b8c9d0e",
      "name": "Subrat Kumar",
      "email": "subrat@example.com",
      "role": "TENANT",
      "phone": "+919876543210",
      "isEmailVerified": false,
      "accountStatus": "ACTIVE",
      "createdAt": "2026-05-30T18:00:00.000Z",
      "updatedAt": "2026-05-30T18:00:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Scenario |
|--------|----------|
| `401 Unauthorized` | No token / invalid token / expired token |

---

### 6. Change Password

```
PATCH /api/v1/auth/change-password
```

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "MyPass@123",
  "newPassword": "NewPass@456",
  "confirmNewPassword": "NewPass@456"
}
```

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password changed successfully. Please log in again.",
  "data": null
}
```

> 🍪 **Cookie Cleared:** Forces re-login

**Error Responses:**

| Status | Scenario |
|--------|----------|
| `400 Bad Request` | Validation failed / new password same as current |
| `401 Unauthorized` | Current password is wrong |

---

### 7. Logout

```
POST /api/v1/auth/logout
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

> 🍪 **Cookie Cleared:** `refreshToken` removed

---

## 🔧 How Teammates Can Use Auth in Their Features

### Protecting a Route (Authentication Required)

```javascript
import AuthMiddleware from '../../middlewares/auth.middleware.js';

// Any authenticated user can access
router.get('/listings', AuthMiddleware.authenticate, listingController.getAll);
```

Inside your controller, `req.user` will have:
```javascript
req.user = {
  id: '665a1b2c3d4e5f6a7b8c9d0e',
  email: 'subrat@example.com',
  role: 'TENANT'
};
```

### Restricting by Role (Authorization)

```javascript
// Only OWNER can create listings
router.post(
  '/listings',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('OWNER', 'ADMIN'),
  listingController.create
);
```

### Using Custom Response Utilities

```javascript
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

// Success response
res.status(StatusCodes.OK).json(
  new ApiResponse(StatusCodes.OK, 'Listings fetched', { listings })
);

// Error throwing (caught by global error handler)
throw new ApiError(StatusCodes.NOT_FOUND, 'Listing not found');
```

### Following the Repository Pattern

```
1. Create contract:    repositories/contracts/IListingRepository.js
2. Create impl:        repositories/implementations/mongoListingRepository.js
3. Create service:     services/listing.service.js
4. Create controller:  controllers/listing.controller.js
5. Create routes:      routes/v1/listing.routes.js
6. Register in:        routes/v1/index.routes.js
```

---

## 🛡️ Error Response Format (Global)

All errors follow this consistent format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "password", "message": "Password must be at least 8 characters long" }
  ]
}
```

| Error Type | Status Code | Auto-Handled |
|------------|-------------|--------------|
| Validation Error (express-validator) | `400` | ✅ |
| Mongoose ValidationError | `400` | ✅ |
| Mongoose CastError | `400` | ✅ |
| Duplicate Key (MongoDB 11000) | `409` | ✅ |
| JWT Invalid/Expired | `401` | ✅ |
| Custom ApiError | Any | ✅ |
| Unknown/Unhandled | `500` | ✅ |

---

## ⚙️ Environment Variables

```env
PORT=9000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
ACCESS_TOKEN_SECRET=<128-char hex>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<128-char hex>
REFRESH_TOKEN_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 📦 Dependencies Added

| Package | Purpose |
|---------|---------|
| `bcryptjs` | Password hashing (salt rounds: 12) |
| `http-status-codes` | No hardcoded status codes |
| `express-validator` | Request body validation |
| `cookie-parser` | Parse httpOnly cookies |

**Pre-existing:** `express`, `mongoose`, `jsonwebtoken`, `cors`, `morgan`, `dotenv`

---

## 🔑 Token Strategy

| Token | Storage | Lifetime | Contains |
|-------|---------|----------|----------|
| Access Token | Client memory / `Authorization` header | 15 min | `userId`, `email`, `role` |
| Refresh Token | httpOnly cookie | 7 days | `userId` |

- **Token Rotation:** On every refresh, BOTH tokens are regenerated
- **Password Change:** Forces re-login (cookie cleared)
- **Cookie Config:** `httpOnly: true`, `secure: true` (production), `sameSite: strict` (production)
