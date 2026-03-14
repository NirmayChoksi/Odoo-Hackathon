# Auth Module — Walkthrough

## What Was Built

A complete, professional Authentication frontend module for **StockFlow IMS** — Angular 21 with Tailwind CSS 4.

---

## Pages (all verified ✅)

````carousel
![Login Page](/C:/Users/snehp/.gemini/antigravity/brain/02d18f8c-ce78-44ee-8822-b1db90de9791/login_page_v2_1773462654652.png)
<!-- slide -->
![Register Page](/C:/Users/snehp/.gemini/antigravity/brain/02d18f8c-ce78-44ee-8822-b1db90de9791/register_page_1773462690470.png)
<!-- slide -->
![Forgot Password Page](/C:/Users/snehp/.gemini/antigravity/brain/02d18f8c-ce78-44ee-8822-b1db90de9791/forgot_password_page_1773462678401.png)
<!-- slide -->
![OTP Verify Page](/C:/Users/snehp/.gemini/antigravity/brain/02d18f8c-ce78-44ee-8822-b1db90de9791/verify_otp_page_1773462672590.png)
````

| Route | Page | Features |
|---|---|---|
| `/auth/login` | **Login** | Login ID + Password, show/hide toggle, Remember Me, Forgot Password link |
| `/auth/register` | **Register** | Login ID (6–12 chars), Email, Password + Confirm, strength indicator |
| `/auth/forgot-password` | **Forgot Password** | Email input, info box about OTP format |
| `/auth/verify-otp` | **OTP Verify** | 6-box auto-advance input, paste support, 60s countdown + Resend |
| `/auth/reset-password` | **Reset Password** | New + Confirm password, strength bar, visual requirements checklist |
| `/dashboard` | **Dashboard** | Placeholder showing "Authentication Successful" + logout button |

---

## Files Created

### Global
- [src/index.html](file:///C:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/index.html) — Google Fonts Inter, proper title + meta
- [src/styles.css](file:///c:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/styles.css) — Design tokens, `.form-input`, `.btn-primary`, `.otp-input`, `.strength-bar`, animations
- [src/app/app.config.ts](file:///C:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/app/app.config.ts) — Added `provideHttpClient()`, `provideAnimationsAsync()`
- [src/app/app.routes.ts](file:///C:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/app/app.routes.ts) — Root → `/auth/login`, lazy-load auth, `/dashboard`
- [src/app/app.html](file:///C:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/app/app.html) — Just `<router-outlet />`

### Auth Module (`src/app/modules/auth/`)
- [auth.routes.ts](file:///C:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/app/modules/auth/auth.routes.ts), [login/](file:///C:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/app/core/services/auth.service.ts#24-27), [register/](file:///C:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/app/core/services/auth.service.ts#28-31), `forgot-password/`, `verify-otp/`, `reset-password/`

### Core Service
- [src/app/core/services/auth.service.ts](file:///C:/Users/snehp/Downloads/Odoo-Hackathon/Frontend/src/app/core/services/auth.service.ts) — Mock observables for all auth operations

### Dashboard
- `src/app/modules/dashboard/` — Placeholder with logout

---

## Validation Rules

| Field | Rules |
|---|---|
| Login ID (login) | Required, min 6 chars |
| Login ID (register) | Required, 6–12 chars |
| Email | Required, valid format |
| Password (register/reset) | 8+ chars, uppercase, lowercase, special char |
| Confirm Password | Must match password |
| OTP | 6 digits required |

---

## Navigation Flow

```
Login ──────────────────────────────▶ Dashboard
  │                                     ▲
  ├─► Register ──────────────────────── ┘
  │
  └─► Forgot Password ──▶ OTP Verify ──▶ Reset Password ──▶ Login
```
