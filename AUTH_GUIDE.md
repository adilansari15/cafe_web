# Authentication Page - User Guide

## Overview
The authentication system now features a clean, modern login/signup interface with simplified fields.

## Page Layout

```
┌─────────────────────────────────────┐
│  ← Back Home                        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ☕ Cafe Web                   │  │
│  │  Your favorite coffee, online  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─────────────────┬─────────────┐  │
│  │ Login (ACTIVE)  │ Sign Up     │  │
│  └─────────────────┴─────────────┘  │
│  ═══════════════════════════════════  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Email Address                 │  │
│  │ [___________________          ]│  │
│  │                               │  │
│  │ Password                      │  │
│  │ [___________________          ]│  │
│  │                               │  │
│  │ [ Login Button                ]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ © 2025 - All Rights Reserved   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Form Fields

### Login Tab
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Email | Email | ✓ | Must be valid email format |
| Password | Password | ✓ | At least 1 character |

### Sign Up Tab
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Email | Email | ✓ | Must be valid email format |
| Password | Password | ✓ | Minimum 6 characters |
| Confirm Password | Password | ✓ | Must match password field |

## Styling Features

### Colors
- **Primary Gradient**: `#667eea` to `#764ba2` (Purple)
- **Background**: White container on purple gradient
- **Text**: Dark gray (#333) for labels, light gray for placeholders
- **Errors**: Red (#721c24) with light pink background
- **Success**: Green (#155724) with light green background

### Interactive Elements
- **Tabs**: Switch between Login/Sign Up with smooth animation
- **Inputs**: Border changes to purple on focus with subtle shadow
- **Buttons**: Gradient background with hover shadow effect
- **Error/Success**: Slide-in animations from top

### Responsive Breakpoints
| Screen Size | Changes |
|-------------|---------|
| 500px | Reduced padding, smaller fonts |
| 420px | Mobile-optimized spacing, compact layout |

## User Flow

### Sign Up Flow
```
1. User clicks "Sign Up" tab
2. Fills email and password fields
3. Confirms password
4. System validates:
   - Email format is valid
   - Password is 6+ characters
   - Passwords match
5. Backend checks for duplicate email
6. User account created in MongoDB
7. JWT token generated
8. Redirect to home page
9. Token stored in localStorage
```

### Login Flow
```
1. User stays on "Login" tab (default)
2. Enters email and password
3. System validates inputs
4. Backend finds user by email
5. Compares password hash
6. JWT token generated on success
7. Redirect to home page
8. Token stored in localStorage
```

## Error Handling

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "Email already registered" | Email exists in database | Use different email or login |
| "Passwords do not match" | Confirm password doesn't match | Re-enter passwords carefully |
| "Please enter a valid email address" | Invalid email format | Use format: user@example.com |
| "Password must be at least 6 characters" | Password too short | Create longer password |
| "Invalid email or password" | Wrong credentials on login | Check email/password |

## Browser Storage

After successful login/signup, the browser stores:

```javascript
// In localStorage:
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // 7-day JWT
  user: {
    _id: "507f1f77bcf86cd799439011",
    email: "user@example.com",
    name: ""
  }
}
```

## Security Features

✅ **Password Hashing**: All passwords hashed with bcrypt (salt rounds: 10)
✅ **Email Validation**: Duplicate emails prevented in database
✅ **JWT Tokens**: Secure token-based authentication
✅ **Token Expiry**: Tokens expire in 7 days
✅ **HTTPS Ready**: Can be deployed with SSL/TLS
✅ **CORS Enabled**: Safe cross-origin requests
✅ **Input Validation**: Both client and server-side validation

## How to Test

### Test 1: Sign Up New Account
1. Open `auth.html` in browser
2. Click "Sign Up" tab
3. Enter email: `testuser@example.com`
4. Enter password: `MyPassword123`
5. Confirm password: `MyPassword123`
6. Click "Sign Up"
7. See success message and redirect

### Test 2: Login with Account
1. Open `auth.html` in browser
2. Stay on "Login" tab
3. Enter email: `testuser@example.com`
4. Enter password: `MyPassword123`
5. Click "Login"
6. See success message and redirect

### Test 3: Try Duplicate Email
1. Try signing up with same email
2. See error: "Email already registered"

### Test 4: Invalid Password
1. During login, enter wrong password
2. See error: "Invalid email or password"

## Database Storage

User data stored in MongoDB with structure:
```javascript
{
  _id: ObjectId,
  email: "user@example.com",      // Unique, lowercase
  password: "$2b$10$hash...",     // Hashed with bcrypt
  name: "",                        // Optional
  phone: "",                       // Optional
  address: "",                     // Optional
  isVerified: false,               // For email verification (future)
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## File Structure
```
cafe_web/
├── auth.html           # Auth page with styled forms
├── auth-page.js        # Frontend auth logic
├── models/User.js      # User database model
└── server.js          # Backend auth endpoints
```

## Next Enhancements
- Add forgot password functionality
- Add email verification on signup
- Add user profile page to edit name, phone, address
- Add logout functionality
- Add session persistence on page reload
