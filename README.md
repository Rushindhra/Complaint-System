# Complaint System

Complaint System is a campus complaint management web application for hostellers/students and wardens. Students can register, sign in, submit hostel-related complaints, track their complaint status, and receive notifications. Wardens can review complaints, verify or reject them, update progress, and send notifications back to students.

## Features

- Student and warden authentication with JWT.
- Student complaint creation, editing, deletion, and status tracking.
- Warden dashboard for reviewing and verifying complaints.
- Warden-to-student notification flow with unread notification counts.
- Student and warden profile management.
- Responsive React UI with Bootstrap styling.
- MongoDB-backed data models for hostellers, wardens, complaints, complaint statuses, verifications, and notifications.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Bootstrap
- Chart.js / React Chart.js

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs
- dotenv
- CORS

## Folder Structure

```text
Complaint System/
|-- client/                         # React + Vite frontend
|   |-- public/                     # Static assets served by Vite
|   |   |-- complaint-system-logo.svg
|   |   `-- vite.svg
|   |-- src/
|   |   |-- assets/                 # Frontend assets
|   |   |-- common/                 # Shared pages and UI modules
|   |   |   |-- Header.jsx
|   |   |   |-- Footer.jsx
|   |   |   |-- Signup.jsx
|   |   |   |-- StudentProfile.jsx
|   |   |   |-- WardenProfile.jsx
|   |   |   |-- VerifyComplaints.jsx
|   |   |   `-- NotificationSystem.jsx
|   |   |-- components/             # Reusable layout/navigation components
|   |   |   |-- PageNav.jsx
|   |   |   `-- RootLayout.jsx
|   |   |-- context/                # React context for auth and notifications
|   |   |   `-- UserContext.jsx
|   |   |-- pages/                  # Additional dashboard and complaint pages
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- index.css
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|
|-- server/                         # Express + MongoDB backend
|   |-- API/                        # Route handlers
|   |   |-- studentApi.js
|   |   `-- wardenApi.js
|   |-- http/                       # REST client request examples
|   |   |-- student.http
|   |   `-- warden.http
|   |-- middleware/                 # Express middleware
|   |   `-- verifytoken.js
|   |-- models/                     # Active Mongoose models
|   |   |-- complaintModel.js
|   |   |-- hosteller/
|   |   `-- warden/
|   |-- modelsP/                    # Previous/prototype model files
|   |-- server.js                   # Backend entry point
|   `-- package.json
|
`-- README.md                       # Project documentation
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB database connection string

### Backend Setup

1. Move into the backend folder:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in `server/` with:

   ```env
   PORT=4700
   DBURL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend:

   ```bash
   node server.js
   ```

The backend runs on `http://localhost:4700` when `PORT=4700`.

### Frontend Setup

1. Move into the frontend folder:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

The frontend usually runs on `http://localhost:5173`.

## Main API Areas

- `POST /student-api/register` - register a student/hosteller.
- `POST /student-api/login` - student login.
- `GET /student-api/complaints/:studentId` - fetch a student's complaints.
- `POST /student-api/:rollno/postcomplaint` - submit a complaint.
- `GET /student-api/notifications/:userId` - fetch student notifications.
- `POST /warden-api/register` - register a warden.
- `POST /warden-api/login` - warden login.
- `GET /warden-api/complaints/all` - fetch complaints for warden review.
- `PUT /warden-api/warden/verify/:complaintId` - verify or reject a complaint.
- `POST /warden-api/notify` - send a notification to a student.

## Notes

- Do not commit real `.env` values or database credentials.
- The frontend expects the backend to be available at `http://localhost:4700`.
- The backend CORS configuration allows local Vite development origins.
