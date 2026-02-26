#  TaskFlow – Modern Task Management Application

A production-ready task management web application built with React, TypeScript, Supabase, and Tailwind CSS.

TaskFlow allows users to securely authenticate, create tasks, manage task statuses, and track productivity in a clean and modern interface.

---

## 🌐 Live Demo

🔗 https://task-board-gamma-three.vercel.app/auth

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Router
- TanStack React Query

### Backend / Database
- Supabase (PostgreSQL)
- Supabase Authentication

### Deployment
- Vercel

---

## 🔐 Authentication Flow (Supabase Auth)

1. User signs up or logs in via Supabase authentication.
2. Supabase validates credentials securely.
3. On success:
   - A session JWT token is generated.
   - The session is stored client-side.
4. Protected routes are accessed only if session exists.
5. Each task is linked to the authenticated user's `user_id`.
6. On logout, session is cleared.

This ensures:
- Secure user-based data isolation
- Row-level access control (RLS)
- No task leakage between users

---

## 🗄 Database Schema

### Table: `tasks`

| Column      | Type        | Description                         |
|------------|------------|-------------------------------------|
| id         | uuid       | Primary key                        |
| title      | text       | Task title (max 200 characters)    |
| status     | text       | todo | in_progress | done          |
| user_id    | uuid       | References auth.users(id)          |
| created_at | timestamp  | Task creation time                 |

---
## ✨ Features

- Secure authentication (Signup / Login)
- Create, update, and track tasks
- Status cycling (Todo → In Progress → Done)
- Optimistic UI updates
- Responsive modern UI
- Dark mode support
- Smooth animations
- Toast notifications
- Production deployment

---

## ⚙️ Running Locally

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd taskflow
