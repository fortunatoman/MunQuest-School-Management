# MunQuest – School Management System

A full-stack application for managing Model United Nations (MUN) events, including student and teacher registration, event organisation, and real-time updates. Built with React (frontend) and Node.js/Express (backend), using Supabase for auth and data.

## Repository structure

| Folder      | Description |
|------------|-------------|
| **Frontend** | React + Vite + TypeScript app (port 3001). See [Frontend/README.md](Frontend/README.md). |
| **Backend**  | Node.js + Express + TypeScript API (port 1000). See [Backend/README.md](Backend/README.md). |

## Quick start

### Option 1: Run with Docker

1. **Backend env** – Copy `Backend/.env.example` to `Backend/.env` and set:
   - `PORT` (optional, default `1000`)
   - `JWT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

2. From the **repository root** (where `docker-compose.yml` is):

   ```bash
   docker compose up --build
   ```

3. Open:
   - **App:** http://localhost:3001  
   - **API:** http://localhost:1000  

More details (env vars, stopping): [DOCKER.md](DOCKER.md).

### Option 2: Run locally

**Backend**

```bash
cd Backend
cp .env.example .env   # edit .env with your values
npm install
npm run dev
```

**Frontend** (in another terminal)

```bash
cd Frontend
cp .env.example .env   # set VITE_BACKEND_URL if needed
npm install
npm run dev
```

Then open http://localhost:3001 (frontend) and use the API at http://localhost:1000.

## Features

- **Authentication** – Login and registration for students and teachers (Supabase)
- **Events** – Create and manage MUN events; event-based routing in the app
- **Profiles** – Profile creation and editing for students and teachers
- **Organisers** – Event creation, delegate management, approvals
- **Real-time** – Socket.io for live updates and notifications

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Supabase client, Socket.io client  
- **Backend:** Node.js, Express, TypeScript, Supabase, Socket.io, JWT, Multer  

## Documentation

- [Frontend/README.md](Frontend/README.md) – Frontend structure, design system, conventions  
- [Backend/README.md](Backend/README.md) – API structure, routes, conventions  
- [DOCKER.md](DOCKER.md) – Docker setup and usage  

## License

Proprietary. All rights reserved.


---
Last updated: 2026-03-18 15:38:16
