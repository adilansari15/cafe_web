# Authentication System Documentation

## Overview
A complete authentication system has been implemented for the Cafe Web application with user registration, login, and profile management using MongoDB and JWT tokens.

## What's New

### 1. **Authentication Page** (`auth.html`)
- Beautiful, responsive login/signup page
- Two tabs: Login and Sign Up
- Form validation on client-side
- Error and success message displays
- Loading indicators during API calls

**Features:**
- Gradient purple background
- Smooth animations (slideUp, fadeIn)
- Form validation (password length, email format, password matching)
- Responsive design for all screen sizes

### 2. **Authentication Backend** (`models/User.js`)
User model with:
- Name, Email, Phone, Address fields
- Password hashing with bcrypt (10 salt rounds)
- Email uniqueness constraint
- Timestamp tracking (createdAt, updatedAt)
- Password comparison method for login verification

### 3. **Backend API Endpoints** (`server.js`)

#### Authentication Endpoints:

**POST /api/auth/signup**
- Register new user
- Request body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "address": "123 Main St"
  }
  ```
- Response: JWT token + user data
- Validation: Checks for duplicate emails, required fields

**POST /api/auth/login**
- Login existing user
- Request body:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Response: JWT token + user data
- Validation: Email and password must match stored data

**GET /api/auth/profile** (Protected)
- Get current user profile
- Headers: `Authorization: Bearer <token>`
- Response: User data (without password)

**PUT /api/auth/profile** (Protected)
- Update user profile
- Headers: `Authorization: Bearer <token>`
- Request body:
  ```json
  {
    "name": "Updated Name",
    "phone": "9876543210",
    "address": "New Address"
  }
  ```
- Response: Updated user data

**POST /api/auth/verify** (Protected)
- Verify JWT token validity
- Headers: `Authorization: Bearer <token>`
- Response: Validation status

### 4. **Frontend Authentication Script** (`auth-page.js`)

**Features:**
- Tab switching between Login and Sign Up forms
- Form validation with user-friendly error messages
- API calls to backend authentication endpoints
- LocalStorage for storing JWT token and user data
- Automatic redirect to home page after successful login/signup

**Key Functions:**
```javascript
// Tab switching
document.querySelectorAll('.auth-tab').addEventListener('click', ...)

// Login handler
document.getElementById('login-form').addEventListener('submit', ...)

// Signup handler
document.getElementById('signup-form').addEventListener('submit', ...)
```

### 5. **Updated Navigation** (`index.html`)
- Added "Login / Sign Up" button in the header navbar
- Button links to `auth.html`
- Styled with matching color scheme

## How to Use

### 1. **User Registration**
1. Click "Login / Sign Up" button in header
2. Click on "Sign Up" tab
3. Fill in all required fields:
   - Full Name (min 3 characters)
   - Email (must be valid format)
   - Phone (optional)
   - Address (optional)
   - Password (min 6 characters)
   - Confirm Password (must match)
4. Click "Sign Up" button
5. On success, redirected to home page with token stored

### 2. **User Login**
1. Click "Login / Sign Up" button in header
2. Ensure "Login" tab is active
3. Enter email and password
4. Click "Login" button
5. On success, redirected to home page with token stored

### 3. **Profile Management**
- User data stored in `localStorage`:
  ```javascript
  localStorage.getItem('token')      // JWT token
  localStorage.getItem('user')       // User object JSON
  ```

## Database Structure

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  phone: String,
  address: String,
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

1. **Password Hashing**: Passwords hashed with bcrypt (salt rounds: 10)
2. **JWT Tokens**: Secure token-based authentication (expires in 7 days)
3. **Email Uniqueness**: Duplicate email registrations prevented
4. **Protected Routes**: Sensitive endpoints require valid JWT token
5. **Input Validation**: Server-side and client-side validation
6. **CORS**: Cross-origin requests configured for safety

## Environment Variables

Add to `.env`:
```
MONGODB_URI=mongodb://localhost:27017/cafe_web
PORT=5000
JWT_SECRET=cafe_web_secret_key_2024
```

## Next Steps

1. **Update Shopping Cart**: Store userId with orders
2. **Order History**: Retrieve user's past orders
3. **User Profile Page**: Create dashboard to view/edit profile
4. **Email Verification**: Add email confirmation on signup
5. **Password Reset**: Implement forgot password functionality
6. **Social Login**: Add Google/Facebook authentication

## Testing

### Test Signup:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Test Protected Route:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <your_token_here>"
```

## File Structure
```
cafe_web/
├── auth.html              # Authentication page (new)
├── auth-page.js           # Auth frontend logic (new)
├── models/
│   ├── User.js           # User model (new)
│   └── Order.js
├── server.js             # Updated with auth endpoints
├── script.js
├── style.css             # Updated with auth button styles
├── index.html            # Updated with auth button
└── package.json          # Updated with bcrypt & jsonwebtoken
```
