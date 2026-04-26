# TubeForge Implementation Plan (Updated April 2026)

## Project Structure Overview

### Frontend Files
```
src/main/resources/static/
├── index.html          - Main landing page + App
├── login.html          - Login/Sign Up portal
├── payment.html        - Payment portal with plan selection
├── style.css          - Global styles
├── app.js             - Application logic
└── payment/           - QR code images
    ├── 149 pay.jpeg
    ├── 349 pay.jpeg
    └── 699 pay.jpeg
```

---

## App Section (index.html)

### Tabs
- **Ideas** - Generate video title ideas
- **Script** - Generate video scripts
- **Thumbnail** - Generate thumbnail briefs
- **Image Gen** - Generate images (API)

### App Features
- Tab-based navigation
- Input fields for each feature
- Loading states
- Copy to clipboard
- API calls to backend
- Output displays in right panel (app-output)

### App Layout Structure
```html
<div class="app-container">
  <div class="app-bar">
    <div class="app-tabs">
      <button data-tab="ideas">Ideas</button>
      <button data-tab="script">Script</button>
      <button data-tab="thumbnail">Thumbnail</button>
      <button data-tab="image">Image Gen</button>
    </div>
  </div>
  <div class="app-body">
    <div class="app-input">
      <!-- Input fields per tab -->
    </div>
    <div class="app-output">
      <div class="app-result">
        <!-- AI Generated Content -->
      </div>
    </div>
  </div>
</div>
```

---

## Login/Sign Up Portal (login.html)

### Features
- Toggle between Login / Sign Up forms
- Email + Password authentication (localStorage)
- User registration with name, email, password
- Password confirmation
- Auto-redirect after login
- OAuth buttons (Google, GitHub) - UI only

### Flow
1. User visits login.html
2. Can login with existing account OR sign up for new account
3. On success: redirect to index.html
4. Email saved to localStorage

### Data Storage
```javascript
localStorage.setItem('tubeforge_users', JSON.stringify([
  { name, email, password, plan, created }
]))
localStorage.setItem('tubeforge_user', JSON.stringify(currentUser))
localStorage.setItem('tubeforge_email', email)
```

---

## Payment Portal (payment.html)

### Features
- 4 plan cards displaying:
  | Plan | Price | Duration | Features |
  |------|-------|----------|----------|
  | Free | ₹0 | Forever | 3 requests/day, Ideas+Script |
  | Basic | ₹149 | 24 days | 10 requests/day |
  | Pro | ₹349 | 24 days | 25 requests/day + Thumbnail |
  | Premium | ₹699 | Lifetime | Unlimited all |

- Click plan → Opens payment modal with QR code
- Enter email + UTR/Ref ID
- Verify payment → Activate membership
- View current membership status

### Plan Pricing (INDIAN RUPEES)
- All prices in INR (₹)
- Basic: ₹149
- Pro: ₹349  
- Premium: ₹699

### Payment Flow
1. User selects plan card
2. Modal shows QR code for that plan amount
3. User scans QR with UPI app (GPay, PhonePe, Paytm)
4. Enters UTR from payment confirmation
5. Enters email
6. Clicks "Verify Payment"
7. Backend validates and activates membership

### QR Codes
Located in `/payment/` folder:
- `149 pay.jpeg` - Basic plan QR (₹149)
- `349 pay.jpeg` - Pro plan QR (₹349)
- `699 pay.jpeg` - Premium plan QR (₹699)

### Endpoints Used
- `POST /api/payment/verify` - Verify UTR and activate membership
- `GET /api/membership/status` - Check current membership

---

## Profile System

### Navigation Changes
- **Before Login:** "Login" button in nav
- **After Login:** Profile dropdown with user name

### Profile Dropdown Menu
- **My Profile** - Opens profile modal
- **My Plan** - Shows membership status
- **Upgrade Plan** - Goes to payment page
- **Logout** - Signs out user

### Profile Modal Features
| Section | Fields | Function |
|---------|--------|----------|
| Account | Name, Email | Edit & Save |
| Security | Current Password, New Password, Confirm | Change password |
| Feedback | Success/Error messages | - |

### Membership Modal Features
- Current plan display
- Daily limit usage
- Used today count
- Expiry date
- Upgrade button

### Navigation Structure (Updated)
```html
<nav>
  <div class="logo">TubeForge</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#how">How it works</a>
    <a href="#app">App</a>
    <a href="#pricing">Plans</a>
  </div>
  <div id="nav-auth">
    <!-- Login button OR Profile dropdown -->
  </div>
</nav>
```

---

## Backend Updates

### Membership Data
- Stored in `memberships.json`
- Format:
```json
{
  "email@example.com": {
    "plan": "pro",
    "expiryDate": "2026-05-13",
    "requestsUsedToday": 5,
    "lastRequestDate": "2026-04-19"
  }
}
```

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ideas` | POST | Generate ideas (checks membership) |
| `/api/script` | POST | Generate script (checks membership) |
| `/api/thumbnail` | POST | Generate thumbnail (pro+ only) |
| `/api/payment/verify` | POST | Verify payment, activate membership |
| `/api/membership/status` | GET | Get current membership |

---

## How to Test

### 1. Test Login/Sign Up
- Go to http://localhost:8080/login.html
- Click "Sign Up", fill form, click "Create Account"
- Should redirect to main page

### 2. Test Profile Dropdown
- After login, "Login" button becomes profile dropdown
- Click profile dropdown to see options

### 3. Test Profile Modal
- Click "My Profile" in dropdown
- Edit name/email and save
- Try changing password

### 4. Test Membership Modal
- Click "My Plan" in dropdown
- View current plan status

### 5. Test App
- Go to http://localhost:8080
- Try Ideas, Script, Thumbnail generation
- Output should appear in right panel

### 6. Test Payment
- Click "Plans" nav link OR scroll to pricing section
- Click any paid plan (e.g., Pro ₹349)
- Payment modal opens with QR code
- Scan QR with UPI app
- Enter email + UTR
- Click "Verify Payment"
- Success message shows

---

## Files Created/Modified

### New Files Created
| File | Purpose |
|------|---------|
| `login.html` | Login/Sign Up portal |
| `payment.html` | Payment portal |
| `payment/149 pay.jpeg` | QR for ₹149 |
| `payment/349 pay.jpeg` | QR for ₹349 |
| `payment/699 pay.jpeg` | QR for ₹699 |

### Backend Files
| File | Purpose |
|------|---------|
| `Membership.java` | Membership model |
| `PaymentVerifyRequest.java` | Request model |
| `MembershipService.java` | Membership logic |
| `PaymentController.java` | Payment endpoints |

### Modified Files
| File | Changes |
|------|---------|
| `index.html` | App tabs, profile dropdown, modals |
| `style.css` | Profile dropdown styles, modal styles |
| `AIController.java` | Membership checks |
| `AIRequest.java` | Email field added |

---

## Known Limitations

1. **Payment Verification** - Currently just checks UTR format (10-20 chars). No real bank verification.
2. **Login** - Uses localStorage. No backend database.
3. **Image Gen Tab** - Available in app

---

*Last Updated: April 2026*
*Status: All Features Implemented*
- Profile System ✅
- Payment Portal ✅
- Login/Sign Up ✅
- App Output Layout ✅