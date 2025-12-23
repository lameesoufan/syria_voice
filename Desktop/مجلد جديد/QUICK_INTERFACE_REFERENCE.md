# 🚀 Quick Interface Reference - VoicesOfSyria

**One-page visual reference for all UI screens**

---

## 📱 ALL INTERFACES AT A GLANCE

### 1. PUBLIC (No Login)
```
┌─────────────────────┐  ┌─────────────────────┐
│  VISITOR VIEW       │  │  STORY DETAIL       │
│  ─────────────      │  │  ─────────────      │
│  🔍 Search          │  │  ← Back             │
│  [All][Audio][...]  │  │  Story Title        │
│  ┌───┐ ┌───┐ ┌───┐ │  │  📍 🕐 👤          │
│  │📄 │ │🎵 │ │📹 │ │  │  Content...         │
│  └───┘ └───┘ └───┘ │  │  ▶️ Media Player    │
│  [Login Button]     │  │                     │
└─────────────────────┘  └─────────────────────┘
```

### 2. AUTHENTICATION
```
┌─────────────────────┐  ┌─────────────────────┐
│  LOGIN              │  │  SIGN UP            │
│  ─────────────      │  │  ─────────────      │
│  Welcome Back       │  │  Create Account     │
│  📧 Email           │  │  👤 Name            │
│  🔒 Password        │  │  📧 Email           │
│  [Forgot?]          │  │  🔒 Password        │
│  [Log In]           │  │  [Sign Up]          │
│  [Continue Visitor] │  │  → Verify Email     │
│  [Create Account]   │  │  [Back to Login]    │
└─────────────────────┘  └─────────────────────┘
```

### 3. PUBLISHER DASHBOARD
```
┌──────┬────────────────────────────────────────┐
│ 📊   │  OVERVIEW TAB                          │
│Panel │  Welcome back, John!                   │
│      │  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│🏠Over│  │ 12 │ │ 8  │ │ 3  │ │ 1  │         │
│📄My S│  │Tot │ │App │ │Pen │ │Mod │         │
│➕New │  └────┘ └────┘ └────┘ └────┘         │
│⚙️Set │  Quick Actions: [New][Manage][Set]    │
│      │  Recent Activity...                    │
│🚪Out │                                        │
├──────┼────────────────────────────────────────┤
│      │  MY STORIES TAB                        │
│      │  Title    │Type│Status│Date│Actions   │
│      │  Story 1  │📄  │✅    │... │👁️✏️🗑️   │
│      │  Story 2  │🎵  │🕐    │... │👁️✏️🗑️   │
├──────┼────────────────────────────────────────┤
│      │  NEW STORY TAB                         │
│      │  Choose Type:                          │
│      │  ┌────┐  ┌────┐  ┌────┐              │
│      │  │📄  │  │🎵  │  │📹  │              │
│      │  │Text│  │Audi│  │Vide│              │
│      │  └────┘  └────┘  └────┘              │
│      │  → Form with fields                    │
├──────┼────────────────────────────────────────┤
│      │  SETTINGS TAB                          │
│      │  Profile Picture: [👤] [Upload]       │
│      │  Name: [........]  Email: [........]   │
│      │  Phone: [........] Location: [.....]   │
│      │  Bio: [...........................]    │
│      │  [Cancel] [Save Changes]               │
└──────┴────────────────────────────────────────┘
```

### 4. ADMIN PANEL
```
┌────────────────┬──────────────────────────────────┐
│ QUEUE (3)      │  STORY DETAILS                   │
│ ┌────────────┐ │  Memory of Aleppo                │
│ │🎵 AUDIO #1 │ │  👤 User1 📍 Aleppo 🕐 Pending  │
│ │Memory of   │ │  ─────────────                   │
│ │Aleppo      │ │  Story content here...           │
│ └────────────┘ │  Context: Type, Attacker, Date   │
│ ┌────────────┐ │  Media: [View]                   │
│ │📹 VIDEO #2 │ │  Modification Note:              │
│ │Damascus    │ │  [...........................]    │
│ └────────────┘ │  [❌ Reject][✏️ Modify][✅ Approve]│
└────────────────┴──────────────────────────────────┘
```

---

## 🗺️ NAVIGATION MAP

```
START → Visitor View (/)
         │
         ├─→ Login (/login) → Dashboard (/dashboard)
         │                     ├─→ Overview
         │                     ├─→ My Stories
         │                     ├─→ New Story
         │                     └─→ Settings
         │
         ├─→ Sign Up (/signup) → Verify → Login
         │
         ├─→ Story Detail (/stories/:id)
         │
         └─→ Admin (/admin) → Review Queue
```

---

## 🎨 QUICK STYLE REFERENCE

**Type Badges:**
- 📄 TEXT = Blue
- 🎵 AUDIO = Green  
- 📹 VIDEO = Orange

**Status Badges:**
- ✅ APPROVED = Green
- 🕐 PENDING = Yellow
- ❌ REJECTED = Red
- ✏️ NEEDS_MOD = Orange

**Icons:**
- 🏠 Home | 📄 Stories | ➕ New | ⚙️ Settings | 🚪 Logout
- 👤 User | 📧 Email | 🔒 Password | 🔍 Search
- 📍 Location | 🕐 Time | ✏️ Edit | 🗑️ Delete | 👁️ View

---

## ✅ INTERFACE TESTING CHECKLIST

### Without Backend Connection:
1. Open `frontend/src/components/VisitorView.jsx`
2. Comment out `useEffect` that calls `fetchStories()`
3. Use mock data already in components
4. Navigate to each route manually in browser

### Routes to Test:
- `/` - Visitor View
- `/login` - Login Form
- `/signup` - Sign Up Form
- `/dashboard` - Publisher Dashboard (needs auth bypass)
- `/admin` - Admin Panel (needs auth bypass)

### To Bypass Auth Temporarily:
```javascript
// In App.js or ProtectedRoute.jsx
// Comment out authentication check:
// if (!user) return <Navigate to="/login" />;

// Or set mock user in localStorage:
localStorage.setItem('user', JSON.stringify({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER' // or 'ADMIN'
}));
```

---

## 📊 FORM FIELDS REFERENCE

### Login Form:
- Email (required)
- Password (required)

### Sign Up Form:
- Full Name (required)
- Email (required)
- Password (required, min 6 chars)
- Verification Code (after signup)

### Text Story Form:
- Title (required)
- Content (required)
- Province (required, dropdown)
- Incident Date (required, date picker)
- Attacker (optional)

### Audio/Video Story Form:
- Title (required)
- File Upload (required, max 50MB audio, 200MB video)
- Province (required)
- Incident Date (required)
- Attacker (optional)

### Profile Settings:
- Avatar (upload)
- Full Name
- Email
- Phone
- Location
- Organization
- Website
- Bio

---

## 🔄 USER FLOWS

### Submit Story Flow:
```
Dashboard → New Story → Select Type → Fill Form → Submit
→ Status: PENDING → Admin Reviews → APPROVED/REJECTED
```

### Admin Review Flow:
```
Admin Panel → Select Story → Review Details
→ [Approve] → Published
→ [Reject] → Removed
→ [Modify] → Back to Publisher
```

### Authentication Flow:
```
Sign Up → Email Verify → Login → Dashboard (by role)
```

---

**Quick Tip:** Use this reference to understand the UI structure without running the application. All interfaces are documented with their layouts, fields, and navigation paths.
