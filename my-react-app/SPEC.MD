# Task Manager Web Application — Technical Specification

## 1. Overview

This document defines the technical specification for a **Pending Task Management Web Application** built using the **MERN Stack (MongoDB, Express.js, React, Node.js)**.

The application allows users to create, manage, and track pending tasks with configurable **priority levels** and **estimated duration**.

---

## 2. Objectives

* Allow users to create and manage pending tasks
* Assign priority levels to tasks
* Define expected duration for task completion
* Track task status (Pending, In Progress, Completed)
* Provide clean UI for productivity tracking
* Maintain scalable backend architecture

---

## 3. Technology Stack

### Frontend

* React (Vite or Create React App)
* TailwindCSS (Styling)
* Axios (API communication)
* React Router (Navigation)
* React Hook Form (Form handling)

### Backend

* Node.js
* Express.js
* JWT Authentication
* REST API architecture

### Database

* MongoDB
* Mongoose ODM

### Development Tools

* Git & GitHub
* Postman / Thunder Client
* Docker (optional future enhancement)

---

## 4. User Roles

### Authenticated User

* Create tasks
* Edit tasks
* Delete tasks
* Update task status
* View personal task list

(No admin role required in initial version.)

---

## 5. Core Features

### 5.1 Task Creation

Users can create a task with:

* Title
* Description
* Priority
* Duration
* Due Date (optional)

### 5.2 Priority Levels

* Low
* Medium
* High
* Critical

### 5.3 Duration

Duration represents estimated completion time.

Supported formats:

* Minutes
* Hours
* Days

Example:

* 30 minutes
* 2 hours
* 1 day

### 5.4 Task Status

* Pending (default)
* In Progress
* Completed

### 5.5 Task Management

Users can:

* Update task details
* Change priority
* Modify duration
* Mark tasks complete
* Delete tasks

---

## 6. System Architecture

```
React Frontend
      ↓
REST API (Express.js)
      ↓
MongoDB Database
```

---

## 7. Data Model (MongoDB Schema)

### User Schema

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}
```

### Task Schema

```js
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  durationValue: Number,
  durationUnit: String, // minutes | hours | days
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 8. API Specification

### Authentication APIs

#### Register

`POST /api/auth/register`

#### Login

`POST /api/auth/login`

Returns JWT token.

---

### Task APIs

#### Create Task

`POST /api/tasks`

#### Get All Tasks

`GET /api/tasks`

#### Get Single Task

`GET /api/tasks/:id`

#### Update Task

`PUT /api/tasks/:id`

#### Delete Task

`DELETE /api/tasks/:id`

#### Update Task Status

`PATCH /api/tasks/:id/status`

---

## 9. Frontend Pages

### 9.1 Authentication

* Login Page
* Register Page

### 9.2 Dashboard

Displays:

* Pending tasks
* Priority indicators
* Duration labels
* Status filters

### 9.3 Task Form

Fields:

* Title
* Description
* Priority dropdown
* Duration input + unit selector
* Due date picker

### 9.4 Task List

Features:

* Sorting by priority
* Filtering by status
* Edit/Delete actions

---

## 10. UI/UX Requirements

* Responsive layout
* Priority color coding

  * Low → Green
  * Medium → Yellow
  * High → Orange
  * Critical → Red
* Fast task creation workflow
* Minimal clicks to update status

---

## 11. Validation Rules

### Backend Validation

* Title required
* Priority required
* Duration must be positive
* Auth token required

### Frontend Validation

* Empty form prevention
* Proper duration format

---

## 12. Security Requirements

* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* User-specific task access

---

## 13. Non‑Functional Requirements

* API response < 300ms (local)
* Scalable REST structure
* Modular folder structure
* Clean separation of concerns

---

## 14. Folder Structure (Recommended)

```
backend/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── config/
 └── server.js

frontend/
 ├── components/
 ├── pages/
 ├── services/
 ├── hooks/
 └── App.jsx
```

---

## 15. Future Enhancements

* Task reminders
* Drag & drop task ordering
* Calendar integration
* Analytics dashboard
* Notifications
* Team collaboration

---

## 16. Success Criteria

The application is considered complete when:

* Users can authenticate
* Tasks can be created with priority and duration
* Tasks persist in MongoDB
* CRUD operations function correctly
* UI is responsive and usable

---

## 17. Version

**Version:** 1.0

**Architecture:** MERN Stack

**Document Purpose:** Development foundation and implementation reference.
