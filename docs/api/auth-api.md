# VoteVibes Authentication API Specification

> **Base URL:** `http://localhost:5000/api/auth`  
> **API Version:** `v1.0`  
> **Format:** OpenAPI 3.0-Style Markdown Specification  

---

## Table of Contents

1. [Overview & Security](#overview--security)
2. [Endpoints](#endpoints)
   - [POST /api/auth/register](#1-post-apiauthregister)
   - [POST /api/auth/login](#2-post-apiauthlogin)
   - [POST /api/auth/refresh](#3-post-apiauthrefresh)
   - [POST /api/auth/logout](#4-post-apiauthlogout)
3. [Middleware & RBAC Usage](#middleware--rbac-usage)

---

## Overview & Security

The VoteVibes Authentication Module provides JWT-based dual-token authentication (Access Token + Refresh Token) with role-based access control (`ADMIN`, `VOTER`, `CANDIDATE`).

- **Access Token:** Short-lived JWT (15 minutes expiry) passed via `Authorization: Bearer <accessToken>` header.
- **Refresh Token:** Long-lived JWT (7 days expiry) stored in PostgreSQL database (`refresh_tokens` table).

---

## Endpoints

### 1. POST `/api/auth/register`

Register a new user in the system. New users are assigned the default `VOTER` role.

#### Request Headers
| Header | Value | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes |

#### Request Body Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | User's full name (non-empty) |
| `email` | `string` | Yes | Valid email address |
| `password` | `string` | Yes | Account password (minimum 8 characters) |

#### Validation Rules
- `name`: Must be a non-empty string.
- `email`: Must match standard RFC-5322 email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- `password`: Must be at least 8 characters in length.

#### HTTP Status Codes
| Code | Reason | Description |
| :--- | :--- | :--- |
| `201 Created` | Created | User registered successfully. |
| `400 Bad Request` | Validation Error | Input missing or invalid. |
| `409 Conflict` | Conflict | Email address is already registered. |
| `500 Internal Server Error` | Server Error | Database or system error. |

#### Example Request
```json
{
  "name": "Jane Student",
  "email": "jane.student@college.edu",
  "password": "securePassword123"
}
```

#### Example 201 Created Response
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "e4a7c8b2-1234-4567-89ab-cdef01234567",
      "name": "Jane Student",
      "email": "jane.student@college.edu",
      "role": "VOTER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Example 409 Conflict Response
```json
{
  "success": false,
  "message": "Email is already registered.",
  "error": "ConflictError",
  "statusCode": 409
}
```

---

### 2. POST `/api/auth/login`

Authenticate user credentials and issue Access & Refresh tokens.

#### Request Headers
| Header | Value | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes |

#### Request Body Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | User's registered email address |
| `password` | `string` | Yes | User's account password |

#### Validation Rules
- `email`: Must be a non-empty, valid email string.
- `password`: Must be a non-empty string.

#### HTTP Status Codes
| Code | Reason | Description |
| :--- | :--- | :--- |
| `200 OK` | OK | Authentication successful. |
| `400 Bad Request` | Validation Error | Email or password missing/invalid. |
| `401 Unauthorized` | Unauthorized | Email not found or password mismatch. |
| `500 Internal Server Error` | Server Error | System error. |

#### Example Request
```json
{
  "email": "jane.student@college.edu",
  "password": "securePassword123"
}
```

#### Example 200 OK Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e4a7c8b2-1234-4567-89ab-cdef01234567",
      "name": "Jane Student",
      "email": "jane.student@college.edu",
      "role": "VOTER"
    }
  }
}
```

#### Example 401 Unauthorized Response
```json
{
  "success": false,
  "message": "Invalid credentials.",
  "error": "UnauthorizedError",
  "statusCode": 401
}
```

---

### 3. POST `/api/auth/refresh`

Obtain a new 15-minute Access Token by providing a valid 7-day Refresh Token.

#### Request Headers
| Header | Value | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes |

#### Request Body Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refreshToken` | `string` | Yes | Active Refresh Token string |

#### Validation Rules
- `refreshToken`: Must be a non-empty string.

#### HTTP Status Codes
| Code | Reason | Description |
| :--- | :--- | :--- |
| `200 OK` | OK | Access Token refreshed. |
| `400 Bad Request` | Validation Error | Refresh token string missing. |
| `401 Unauthorized` | Unauthorized | Refresh token invalid, expired, or revoked. |
| `500 Internal Server Error` | Server Error | System error. |

#### Example Request
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Example 200 OK Response
```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Example 401 Unauthorized Response
```json
{
  "success": false,
  "message": "Refresh token has been revoked or is invalid.",
  "error": "UnauthorizedError",
  "statusCode": 401
}
```

---

### 4. POST `/api/auth/logout`

Revoke a Refresh Token by deleting its database record.

#### Request Headers
| Header | Value | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes |

#### Request Body Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refreshToken` | `string` | Yes | Active Refresh Token to revoke |

#### Validation Rules
- `refreshToken`: Must be a non-empty string.

#### HTTP Status Codes
| Code | Reason | Description |
| :--- | :--- | :--- |
| `200 OK` | OK | Logout successful and token revoked. |
| `400 Bad Request` | Validation Error | Refresh token missing. |
| `500 Internal Server Error` | Server Error | System error. |

#### Example Request
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Example 200 OK Response
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Middleware & RBAC Usage

### Authentication Middleware (`authenticate`)
Validates `Authorization: Bearer <accessToken>` header on protected routes and attaches the user payload to `req.user`.

```javascript
import { authenticate } from '../middleware/auth.middleware.js';

router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});
```

### RBAC Authorization Middleware (`authorize`)
Enforces role restrictions.

```javascript
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

// Admin only route
router.post('/admin/elections', authenticate, authorize('ADMIN'), controller);

// Multi-role route
router.get('/candidate/ballot', authenticate, authorize('ADMIN', 'CANDIDATE'), controller);
```
