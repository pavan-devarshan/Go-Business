# Go Business – Referral Dashboard

A React + Vite referral management dashboard built for the Go Business coding assessment.

## Features
- JWT authentication via cookie (`jwt_token`)
- Protected routes (dashboard, referral detail)
- Overview metrics, service summary, referral link/code sharing with copy
- Searchable, sortable referrals table with client-side pagination (10 rows/page)
- Referral detail page (`/referral/:id`)
- 404 Not Found page
- Accessible markup (aria-labels, role="alert", role="region", keyboard nav)
- Responsive design

## Tech Stack
- React 18
- React Router v6
- js-cookie
- Vite

## Setup & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Test Credentials
- Email: admin@example.com
- Password: admin123

## Routes
| Route | Type | Description |
|-------|------|-------------|
| `/login` | Public | Login page |
| `/` | Protected | Referral Dashboard |
| `/referral/:id` | Protected | Referral Detail |
| `*` | Public | 404 Not Found |

## Deploy (Vercel)
```bash
npm run build
# Then deploy the `dist/` folder to Vercel
```
