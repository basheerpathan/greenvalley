# Green Valley Foundation — Full-Stack Web Application

A production-ready full-stack web application for a drug and alcohol de-addiction NGO center, featuring a public website, admin dashboard, patient management, dynamic forms, real-time updates, CCTV integration, and more.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| State | TanStack React Query, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt (access + refresh tokens) |
| Real-time | Socket.io |
| File Storage | Cloudinary |
| Video | HLS.js (CCTV streams) |
| Drag & Drop | @dnd-kit (field reordering) |

---

## Prerequisites

Before running the project, install the following:

1. **Node.js** (v18 or higher) — https://nodejs.org
2. **MongoDB** — Local: https://www.mongodb.com/try/download/community  
   OR use MongoDB Atlas (free cloud): https://cloud.mongodb.com
3. **VS Code** — https://code.visualstudio.com
4. **Git** (optional)

---

## Project Structure

```
green-valley-foundation/
├── backend/                 # Node.js + Express API
│   ├── config/             # DB & Cloudinary config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── utils/              # Seed script
│   ├── .env.example        # Environment variables template
│   ├── server.js           # Main server entry point
│   └── package.json
└── frontend/               # React + Vite app
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Auth & Socket contexts
    │   ├── pages/          # Public & Dashboard pages
    │   ├── services/       # Axios API client
    │   └── App.jsx         # Routes
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## How to Run in VS Code Terminal

### Step 1 — Open VS Code

1. Open VS Code
2. Go to **File → Open Folder**
3. Select: `C:\Users\PattanNagurBasheer\green-valley-foundation`

### Step 2 — Open Two Terminals

In VS Code, open the integrated terminal:
- Press **Ctrl + `** (backtick) to open a terminal
- Click the **+** icon (or press **Ctrl + Shift + `**) to open a second terminal

---

### Step 3 — Set Up the Backend

In **Terminal 1** (Backend):

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file and fill in your values
copy .env.example .env
```

Now open `.env` in VS Code and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/green-valley-foundation
JWT_SECRET=your_super_secret_key_here_at_least_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_also_at_least_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Note:** For Cloudinary, sign up free at https://cloudinary.com and get your credentials from the Dashboard.

```bash
# Seed the database with default admin user
npm run seed

# Start the backend server
npm run dev
```

You should see:
```
MongoDB Connected: localhost
🌿 Green Valley Foundation Server
🚀 Running on http://localhost:5000
```

---

### Step 4 — Set Up the Frontend

In **Terminal 2** (Frontend):

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

### Step 5 — Open the App

Open your browser and go to:

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Public website |
| `http://localhost:5173/login` | Staff login page |
| `http://localhost:5173/dashboard` | Admin dashboard |

---

## Default Login Credentials

After running `npm run seed` in the backend:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@greenvalley.org | Admin@123 |
| Staff | staff@greenvalley.org | Staff@123 |

> **Security Note:** Change these passwords immediately in production.

---

## Cloudinary Setup (For Image Uploads)

1. Go to https://cloudinary.com and create a free account
2. From your Cloudinary Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Paste these values into `backend/.env`

Without Cloudinary, the app works but image uploads (gallery, staff photos, events) will fail.

---

## MongoDB Setup Options

### Option A — Local MongoDB

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install and start the MongoDB service
3. Use: `MONGO_URI=mongodb://localhost:27017/green-valley-foundation`

### Option B — MongoDB Atlas (Free Cloud)

1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Get your connection string (looks like `mongodb+srv://username:password@cluster.mongodb.net/green-valley`)
4. Use this as your `MONGO_URI`

---

## Features Overview

### Public Website
- **Home** — Hero, stats (from DB), mission/vision, testimonials, CTA
- **About** — Organization history, milestones timeline, awards
- **Events** — Filter by category, upcoming vs past events with photos
- **Gallery** — Photo grid with lightbox, filter by category
- **Contact** — Form submissions saved to DB, embedded map

### Admin Dashboard
- **Patient In** — Admit patients with dynamic custom fields
- **Patient Out** — Discharge patients with custom discharge fields
- **Follow-Ups** — Schedule and track patient follow-ups
- **Medicines** — Inventory management + patient assignments + low-stock alerts
- **Staff** — Team management with photo uploads
- **Events** — Create/edit/delete events shown on public page
- **Gallery** — Upload photos with drag & drop, organize by category
- **Contact** — View and respond to contact form messages
- **Content** — Edit all public website content from admin panel
- **Live CCTV** — Configure and view live camera streams (HLS/WebRTC)
- **Settings** — Manage user accounts and roles

### Dynamic Custom Fields System
- Admin can add/edit/delete/reorder custom fields for:
  - Patient In forms
  - Patient Out forms
  - Follow-Up forms
- Field types: Text, Number, Date, Dropdown, Checkbox, Textarea
- Changes appear instantly for all staff without page reload
- Socket.io broadcasts field changes in real-time
- Custom values stored as flexible JSON maps in MongoDB

---

## API Endpoints Reference

```
POST   /api/auth/login              — Login
POST   /api/auth/refresh            — Refresh token
GET    /api/auth/me                 — Current user
GET    /api/patients                — List patients
POST   /api/patients                — Admit patient
PUT    /api/patients/:id/discharge  — Discharge patient
GET    /api/fields/:formType        — Get form fields
POST   /api/fields/:formType        — Add custom field
PUT    /api/fields/:formType/:id    — Update field
DELETE /api/fields/:formType/:id    — Soft-delete field
PUT    /api/fields/:formType/reorder — Reorder fields
GET    /api/followups               — List follow-ups
GET    /api/medicines               — Medicine inventory
GET    /api/medicines/low-stock     — Low stock alert
GET    /api/staff                   — Staff list (public)
GET    /api/events                  — Events (public)
GET    /api/gallery                 — Gallery (public)
POST   /api/contact                 — Submit contact form
GET    /api/content                 — All website content
PUT    /api/content/:type           — Update content section
GET    /api/cameras                 — CCTV camera list
POST   /api/cameras                 — Add camera
```

---

## Build for Production

### Backend (already Node.js, just deploy):
```bash
cd backend
NODE_ENV=production node server.js
```

### Frontend (build static files):
```bash
cd frontend
npm run build
# Output is in frontend/dist/
```

---

## Real-Time Features (Socket.io)

The following events are broadcast to all connected clients:
- `patient:created` / `patient:updated` / `patient:discharged`
- `fields:updated` — When custom form fields change
- `gallery:updated` — When photos are added/removed
- `staff:updated` — When staff members change
- `events:updated` — When events are created/modified
- `content:updated` — When website content changes
- `contact:new` — When a new contact message arrives

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running locally or check Atlas URI |
| Image uploads fail | Check Cloudinary credentials in `.env` |
| Login fails after seed | Confirm seed ran successfully: `npm run seed` |
| Port already in use | Change `PORT` in `.env` or kill the process |
| CORS errors | Ensure `FRONTEND_URL` in `.env` matches your frontend URL |
| Socket.io not connecting | Both backend (5000) and frontend (5173) must be running |

---

## Security Notes

- JWT tokens expire in 15 minutes; refresh tokens in 7 days
- Passwords are hashed with bcrypt (12 rounds)
- Rate limiting: 200 requests per 15 minutes per IP
- Helmet.js for security headers
- Role-based access control on all sensitive routes
- Input validation on all API endpoints

---

*Built for Green Valley Foundation — Compassionate care for recovery*
