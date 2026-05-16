# Collaborative Workflow Orchestration System

A full-stack MERN application that enables multiple users to collaboratively manage projects and execute dependency-aware workflows in real time.

---

# Features

## Authentication & Security

* JWT-based authentication
* Protected routes and APIs
* Persistent login sessions
* Password hashing using bcrypt

## Project Management

* Create projects
* Invite collaborators using secure invite tokens
* Join projects through invite links

## Task Orchestration

* Create, update, and delete tasks
* Dependency-aware execution
* Cyclic dependency detection
* Resource locking using `resourceTag`
* Retry handling with retry limits
* Task versioning and history tracking

## Real-Time Collaboration

* Real-time task updates using Socket.IO
* Live synchronization across multiple users

## Execution Planning

* Deterministic execution planning
* Dependency-respecting execution order
* Blocked task exclusion
* Priority-aware scheduling

## Daily Simulation

* Simulate task execution using available hours
* Dependency-aware task selection
* Failed task simulation
* Total priority scoring

## Audit Logging

Tracks:

* User signup
* Project creation
* Invite generation
* Member joins
* Task updates
* Dependency validation failures
* Retry attempts

---

# Tech Stack

## Frontend

* React
* React Router
* Zustand
* Tailwind CSS
* Axios
* Socket.IO Client

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO

---

# Project Structure

```bash
frontend/
backend/
```

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone <your-repo-url>
cd workflow-orchestrator
```

---

# Backend Setup

## Install dependencies

```bash
cd backend
npm install
```

## Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## Start Backend

```bash
npm run dev
```

---

# Frontend Setup

## Install dependencies

```bash
cd frontend
npm install
```

## Create `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Start Frontend

```bash
npm run dev
```

---

# Architecture Overview

The application follows a standard MERN architecture:

* React frontend for UI rendering and state management
* Express backend exposing REST APIs
* MongoDB for persistent storage
* Socket.IO for real-time collaboration
* JWT authentication for secure access

The backend is structured around:

* Controllers
* Routes
* Middleware
* Services
* Models

---

# Dependency Logic

Tasks are modeled as a Directed Acyclic Graph (DAG).

Implemented rules:

* Cyclic dependencies are rejected
* Tasks cannot move to Running/Completed unless dependencies are Completed
* Blocked or failed dependencies prevent execution
* Execution order is computed using topological sorting

Execution sorting rules:

1. Priority descending
2. Estimated hours ascending
3. Creation timestamp ascending

---

# Concurrency Handling

Optimistic concurrency control is implemented using `versionNumber`.

Rules:

* Every task update includes versionNumber
* Stale updates are rejected with HTTP 409
* Latest task state is returned on conflict
* Every update creates a version snapshot

---

# Simulation Approach

The simulation engine:

* Respects dependency ordering
* Excludes blocked and failed tasks
* Selects executable tasks within available hours
* Maximizes useful work using deterministic sorting
* Produces:

  * executionOrder
  * selectedTasks
  * blockedTasks
  * skippedTasks
  * totalPriorityScore

---

# Real-Time Updates

Socket.IO is used for:

* taskCreated
* taskUpdated
* taskDeleted
* taskStatusChanged
* retryAttempted

Users connected to the same project receive updates instantly.

---

# Security

Implemented security features:

* bcrypt password hashing
* JWT authentication
* Protected routes
* Invite token validation
* Environment variable protection

---

# API Endpoints

## Auth

* POST `/api/auth/register`
* POST `/api/auth/login`

## Projects

* POST `/api/projects`
* POST `/api/projects/:projectId/invite-token`
* POST `/api/projects/:projectId/compute-execution`
* POST `/api/projects/:projectId/simulate`

## Tasks

* POST `/api/tasks`
* PUT `/api/tasks/:id`
* DELETE `/api/tasks/:id`
* GET `/api/tasks/project/:projectId`
* GET `/api/tasks/:id/history`

---

# Testing

Implemented tests for:

* Cycle detection
* Stale update rejection
* Execution ordering
* Simulation logic

---

# Assumptions & Tradeoffs

* Priority was implemented using categorical weights:

  * Critical
  * High
  * Medium
  * Low

* UI polish was intentionally kept minimal to prioritize backend correctness and orchestration logic.

* Simulation uses deterministic heuristics instead of advanced optimization algorithms to remain lightweight and predictable.

---

# Deployment

Frontend and backend are deployable independently.

Suggested deployment:

* Frontend → Netlify => https://workflow-orchestrator1.netlify.app/login
* Backend → Render => https://workflow-orchestrator-jwxy.onrender.com
* Database → MongoDB Atlas

---

# Author
khushabu chauhan
Developed as part of the ES MAGICO MERN Stack Developer Assignment.
