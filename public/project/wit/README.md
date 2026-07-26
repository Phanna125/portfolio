# 💒 WiT — Silence Your Wedding Planning Noise

<p align="center">
  <img src="logo.png" alt="WiT Logo" width="120" />
</p>

Plan moves better when structure and calm take turns. Block planning noise and find your rhythm with **WiT** — a premium, minimalist wedding orchestration platform built with a high-end web 3D/interactive stack.

---

## ⚡ Tech Stack

| Layer | Technologies | Key Libraries / Features |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, TypeScript, CSS Custom Variables | Three.js, React Three Fiber (R3F), `@react-three/drei`, `@splinetool/react-spline`, `gsap`, `animejs`, `framer-motion`, `lenis` (smooth scroll), `zustand`, `lucide-react` |
| **Backend** | NestJS 11, Node.js, TypeScript | TypeORM, Passport JWT (Authentication), Multer (File Upload), Class Validator |
| **Database** | MySQL | Auto-synchronized entities (TypeORM) |

---

## 🏗️ Architecture

```
                 [ React / Vite Frontend ]  →  Port 5173
                          │
                          ▼ (Vite Proxy → /api/*)
                 [ NestJS Backend Server ]  →  Port 3000
                          │
                     ┌────┴────┐
                     ▼         ▼
                [ MySQL DB ] [ Local FS ]
                (Port 3306)  (Uploads)
```

---

## 🌟 Key Features

### 🎊 Guest Portal (`/invite/:token`)
* **Animated Hero**: Couple names, real-time countdown timer, dynamic venue display.
* **Segmented RSVP**: "Grandma Filter" ensuring guests only see the specific events they are invited to.
* **Dynamic Multi-Event Timeline**: Smooth scrollable schedule representing the wedding events.
* **Ang Pao Gateway**: Digital banking QR codes with modern click-to-copy interactions.
* **Audio Guestbook**: In-browser voice recorder allowing guests to leave audio messages.
* **Media Hub**: Smooth drag-and-drop photo/video gallery upload system.
* **Interactive Map**: OpenStreetMap integration featuring Google Maps & Grab deep links.
* **Seating Finder**: Personal table assignment lookup widget.

### 📊 Couple's Dashboard (`/dashboard`)
* **RSVP-Linked Budget Calculator**: Real-time per-head cost estimations as RSVPs update.
* **Who-Paid-What Tracker**: Interactive visual contributor progress bars.
* **Guest Manager**: Full CRUD management, searching, and unique invite link generation.
* **Event Manager**: Interactive multi-event scheduling with GPS coordinates, custom order, and category colors.
* **Budget Tracker**: Budget categorization, payment statuses, and vendor progress tracking.
* **Interactive Seating Chart**: Drag-and-drop physical seating chart table builder.
* **Live Announcement Board**: Push text updates directly to the guest portal.
* **Media Gallery**: High-performance grid containing photo uploads and audio guestbook player.
* **Payment Setup**: Manage banking QR codes and gateway settings.

---

## 🚀 Setup & Installation

### Prerequisites
* **Node.js**: v18+ is required.
* **MySQL**: Make sure a local MySQL server is installed and running on port `3306`.

### 1. Database Setup
Create a new schema in MySQL:
```sql
CREATE DATABASE wedding_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Environment Variables Configuration
Navigate to the `backend/` directory, copy `.env.example` to `.env` and fill in your credentials:
```bash
cp backend/.env.example backend/.env
```
Ensure database credentials are set correctly:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASS=your_mysql_password
DB_NAME=wedding_platform
JWT_SECRET=some_jwt_random_secret_string
JWT_EXPIRATION=7d
PORT=3000
UPLOAD_DIR=./uploads
```

### 3. Install Dependencies
Run the installation script at the project root to install dependencies for both the frontend and backend:
```bash
npm run install:all
```

### 4. Run the Project
Start both servers concurrently from the root directory:
```bash
npm run dev:all
```
* **Frontend dev server**: http://localhost:5173
* **Backend NestJS server**: http://localhost:3000
* **MySQL DB server**: localhost:3306

---

## 📁 Repository Structure

```text
├── backend/
│   ├── src/
│   │   ├── announcement/     # Live dashboard announcements
│   │   ├── auth/             # Authentication & Jwt strategy
│   │   ├── budget/           # Budget & payment backend services
│   │   ├── entities/         # TypeORM MySQL entities (12 schemas)
│   │   ├── event/            # Wedding schedule events management
│   │   ├── guest/            # Guest list, RSVPs, invite links
│   │   ├── media/            # Image uploads & Audio Guestbook voice records
│   │   ├── payment-qr/       # Ang Pao digital banking QR setup
│   │   ├── rsvp/             # Public Guest RSVP submission module
│   │   ├── seating/          # Table layout and seat assignment logic
│   │   ├── wedding/          # Core wedding metadata and statistics
│   │   └── app.module.ts     # Main NestJS module
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components (3D models, Nav, UI)
│   │   ├── pages/            # Page layouts (Home, Dashboard, Invite)
│   │   └── main.tsx
│   └── package.json
└── package.json              # Root project dependencies & runner script
```

---

## 📝 API Routes Schema

| Module | Route / Endpoint | HTTP Method | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Public | Register new couple account |
| **Auth** | `/api/auth/login` | `POST` | Public | Login couples and receive JWT token |
| **Wedding** | `/api/weddings` | `POST` / `GET` | JWT | Manage wedding metadata |
| **Wedding** | `/api/weddings/:id/stats` | `GET` | JWT | Get dashboard analytics and budgets |
| **Guests** | `/api/weddings/:id/guests` | `POST` / `GET` / `PUT` / `DELETE` | JWT | CRUD list of guests & invite token generation |
| **Events** | `/api/weddings/:id/events` | `POST` / `GET` / `PUT` / `DELETE` | JWT | Set up multiple calendar timeline events |
| **RSVP** | `/api/rsvp/:token` | `GET` | Public | Fetch wedding details and RSVP configuration |
| **RSVP** | `/api/rsvp/:token` | `POST` | Public | Submit RSVP attendance and events selections |
| **Budget** | `/api/weddings/:id/budget` | `POST` / `GET` / `PUT` / `DELETE` | JWT | Control cost trackers and payments progress |
| **Seating** | `/api/weddings/:id/seating` | `POST` / `GET` / `PUT` / `DELETE` | JWT | Drag-and-drop table planning setup |
| **Media** | `/api/weddings/:id/media` | `POST` / `GET` | Public / JWT | Upload/Fetch event photographs and gallery assets |
| **Announcements** | `/api/weddings/:id/announcements` | `POST` / `GET` | Public / JWT | Publish board notifications and updates |
| **Payments** | `/api/weddings/:id/payment-qr` | `POST` / `GET` | Public / JWT | Create banking configuration QR layouts |