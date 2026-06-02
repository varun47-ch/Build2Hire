# Build2Hire — API Contracts
**Version:** 1.0  
**Author:** Varunkumar Chimata 
**Date:** 2 June 2026  

---

## Objects

### User Object
```
{
  id: ObjectId
  name: string
  email: string
  role: string (Student / Hr / Admin)
  isActive: boolean
  createdAt: datetime (ISO 8601)
  updatedAt: datetime (ISO 8601)
}
```

### Project Object
```
{
  id: ObjectId
  title: string
  description: string
  githubUrl: string
  projectType: string (Hackathon / Finalyear-Project / Startup)
  skills: [string]
  rolesNeeded: [string]
  members: [<user_object>]
  createdBy: <user_object>
  status: string (recruiting / in-progress / completed)
  createdAt: datetime (ISO 8601)
  updatedAt: datetime (ISO 8601)
}
```

### JoinRequest Object
```
{
  id: ObjectId
  requestedBy: <user_object>
  projectId: ObjectId
  role: string (frontend / backend / ml / designer / devops / other)
  status: string (pending / approved / rejected)
  createdAt: datetime (ISO 8601)
  updatedAt: datetime (ISO 8601)
}
```

### Company Object
```
{
  id: ObjectId
  companyName: string
  companyEmail: string
  website: string
  linkedin: string
  registeredBy: <user_object>
  status: string (pending / approved / rejected)
  createdAt: datetime (ISO 8601)
  updatedAt: datetime (ISO 8601)
}
```

---

## Auth Routes

---

### POST /api/auth/register
Creates a new user account and returns JWT token.

* **URL Params:** None
* **Headers:** Content-Type: application/json
* **Data Params:**
```
{
  name: string (required)
  email: string (required, unique)
  password: string (required, min 8 chars)
  role: string (required: Student / Hr / Admin)
}
```
* **Success Response:**
  * Code: 201
  * Content:
```
{
  success: true,
  token: string (JWT),
  user: <user_object>
}
```
* **Error Response:**
  * Code: 400 Content: `{ success: false, message: "Missing required fields" }`
  * Code: 409 Content: `{ success: false, message: "Email already registered" }`
  * Code: 500 Content: `{ success: false, message: "Server error" }`

---

### POST /api/auth/login
Authenticates user and returns JWT token.

* **URL Params:** None
* **Headers:** Content-Type: application/json
* **Data Params:**
```
{
  email: string (required)
  password: string (required)
}
```
* **Success Response:**
  * Code: 200
  * Content:
```
{
  success: true,
  token: string (JWT),
  user: <user_object>
}
```
* **Error Response:**
  * Code: 400 Content: `{ success: false, message: "Email and password required" }`
  * Code: 401 Content: `{ success: false, message: "Invalid credentials" }`
  * Code: 403 Content: `{ success: false, message: "Account is deactivated" }`

---

### POST /api/auth/logout
Logs out user (client-side token removal).

* **URL Params:** None
* **Headers:** Authorization: Bearer {token}
* **Data Params:** None
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, message: "Logged out successfully" }`
* **Auth Required:** Yes (Student / Hr / Admin)

---

## Project Routes

---

### GET /api/projects
Fetches all projects with optional filters and pagination.

* **URL Params:** 
  * `?skill=react` (optional)
  * `?type=Hackathon` (optional)
  * `?status=recruiting` (optional)
  * `?page=1` (optional, default 1)
  * `?limit=10` (optional, default 10)
* **Headers:** None
* **Success Response:**
  * Code: 200
  * Content:
```
{
  success: true,
  data: [<project_object>, ...],
  pagination: {
    page: integer,
    limit: integer,
    total: integer,
    pages: integer
  }
}
```
* **Auth Required:** No (Public)

---

### GET /api/projects/my-projects
Fetches projects created by logged-in student.

* **URL Params:** None
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: [<project_object>, ...] }`
* **Error Response:**
  * Code: 401 Content: `{ success: false, message: "No token provided" }`
  * Code: 403 Content: `{ success: false, message: "Only students can access this" }`
* **Auth Required:** Yes (Student only)

---

### GET /api/projects/:id
Fetches a single project by ID.

* **URL Params:** `id` (project MongoDB ID)
* **Headers:** None
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <project_object> }`
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "Project not found" }`
* **Auth Required:** No (Public)

---

### GET /api/projects/:id/team
Fetches full team details for a project (HR view).

* **URL Params:** `id` (project MongoDB ID)
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content:
```
{
  success: true,
  data: {
    projectId: ObjectId,
    projectTitle: string,
    team: [
      { name, email, position (Project Head / Member) },
      ...
    ]
  }
}
```
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "Project not found" }`
* **Auth Required:** Yes (Hr only)

---

### GET /api/projects/:id/join-requests
Fetches incoming join requests for a project (head only).

* **URL Params:** `id` (project MongoDB ID)
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: [<join_request_object>, ...] }`
* **Error Response:**
  * Code: 403 Content: `{ success: false, message: "Only project head can view requests" }`
  * Code: 404 Content: `{ success: false, message: "Project not found" }`
* **Auth Required:** Yes (Student - project head only)

---

### POST /api/projects
Creates a new project.

* **URL Params:** None
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  title: string (required, min 5 chars),
  description: string (required, min 20 chars),
  githubUrl: string (required),
  projectType: string (required: Hackathon / Finalyear-Project / Startup),
  skills: [string] (required, min 1),
  rolesNeeded: [string] (optional)
}
```
* **Success Response:**
  * Code: 201
  * Content: `{ success: true, data: <project_object> }`
* **Error Response:**
  * Code: 400 Content: `{ success: false, message: "Missing required fields" }`
* **Auth Required:** Yes (Student only)

---

### PATCH /api/projects/:id
Updates project details (creator only).

* **URL Params:** `id` (project MongoDB ID)
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  title: string (optional),
  description: string (optional),
  githubUrl: string (optional),
  skills: [string] (optional),
  rolesNeeded: [string] (optional)
}
```
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <project_object> }`
* **Error Response:**
  * Code: 403 Content: `{ success: false, message: "Not authorized to update" }`
  * Code: 404 Content: `{ success: false, message: "Project not found" }`
* **Auth Required:** Yes (Student - creator only)

---

### PATCH /api/projects/:id/status
Updates project status (creator only).

* **URL Params:** `id` (project MongoDB ID)
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  status: string (required: recruiting / in-progress / completed)
}
```
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <project_object> }`
* **Error Response:**
  * Code: 403 Content: `{ success: false, message: "Not authorized" }`
  * Code: 404 Content: `{ success: false, message: "Project not found" }`
* **Auth Required:** Yes (Student - creator only)

---

### DELETE /api/projects/:id
Deletes a project (creator or admin).

* **URL Params:** `id` (project MongoDB ID)
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, message: "Project deleted successfully" }`
* **Error Response:**
  * Code: 403 Content: `{ success: false, message: "Not authorized to delete" }`
  * Code: 404 Content: `{ success: false, message: "Project not found" }`
* **Auth Required:** Yes (Student - creator or Admin)

---

## Profile Routes

---

### GET /api/profile/me
Fetches logged-in user's profile.

* **URL Params:** None
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <user_object> }`
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "User not found" }`
* **Auth Required:** Yes (Any logged-in user)

---

### PATCH /api/profile/me
Updates logged-in user's profile.

* **URL Params:** None
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  name: string (optional),
  avatar: string (optional)
}
```
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <user_object> }`
* **Error Response:**
  * Code: 400 Content: `{ success: false, message: "Cannot update email, password, or role" }`
* **Auth Required:** Yes (Any logged-in user)

---

### GET /api/profile/:id
Fetches any user's public profile.

* **URL Params:** `id` (user MongoDB ID)
* **Headers:** None
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <user_object> }`
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "User not found" }`
* **Auth Required:** No (Public)

---

## Join Request Routes

---

### POST /api/projects/:id/join-requests
Sends a join request to a project.

* **URL Params:** `id` (project MongoDB ID)
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  role: string (required: frontend / backend / ml / designer / devops / other)
}
```
* **Success Response:**
  * Code: 201
  * Content: `{ success: true, data: <join_request_object> }`
* **Error Response:**
  * Code: 400 Content: `{ success: false, message: "Cannot join your own project" }`
  * Code: 400 Content: `{ success: false, message: "Team is full" }`
  * Code: 409 Content: `{ success: false, message: "You already have a pending request" }`
  * Code: 404 Content: `{ success: false, message: "Project not found" }`
* **Auth Required:** Yes (Student only)

---

### PATCH /api/projects/:id/join-requests/:requestId
Accepts or rejects a join request (project head only).

* **URL Params:** 
  * `id` (project MongoDB ID)
  * `requestId` (join request MongoDB ID)
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  status: string (required: approved / rejected)
}
```
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <join_request_object> }`
* **Error Response:**
  * Code: 403 Content: `{ success: false, message: "Only project head can accept/reject" }`
  * Code: 404 Content: `{ success: false, message: "Join request not found" }`
* **Auth Required:** Yes (Student - project head only)

---

### GET /api/my-requests
Fetches all join requests sent by logged-in student.

* **URL Params:** None
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: [<join_request_object>, ...] }`
* **Auth Required:** Yes (Student only)

---

## Company Routes

---

### POST /api/companies
Registers a new company (HR only).

* **URL Params:** None
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  companyName: string (required),
  companyEmail: string (optional),
  website: string (required),
  linkedin: string (optional)
}
```
* **Success Response:**
  * Code: 201
  * Content:
```
{
  success: true,
  message: "Company registered successfully. Awaiting admin verification.",
  data: {
    id: ObjectId,
    companyName: string,
    status: "pending",
    ...
  }
}
```
* **Error Response:**
  * Code: 409 Content: `{ success: false, message: "You have already registered a company" }`
* **Auth Required:** Yes (Hr only)

---

### GET /api/companies/profile
Fetches HR's registered company.

* **URL Params:** None
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <company_object> }`
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "Company not found" }`
* **Auth Required:** Yes (Hr only)

---

### GET /api/companies
Fetches all companies with pagination (admin only).

* **URL Params:** 
  * `?status=pending` (optional)
  * `?page=1` (optional, default 1)
  * `?limit=10` (optional, default 10)
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content:
```
{
  success: true,
  message: "Retrieved X companies",
  data: [<company_object>, ...],
  pagination: {
    currentPage: integer,
    pageSize: integer,
    totalRecords: integer,
    totalPages: integer
  }
}
```
* **Auth Required:** Yes (Admin only)

---

### GET /api/companies/:id
Fetches specific company details (admin only).

* **URL Params:** `id` (company MongoDB ID)
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <company_object> }`
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "Company not found" }`
* **Auth Required:** Yes (Admin only)

---

### PATCH /api/companies/:id/status
Updates company verification status (admin only).

* **URL Params:** `id` (company MongoDB ID)
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  status: string (required: pending / approved / rejected)
}
```
* **Success Response:**
  * Code: 200
  * Content:
```
{
  success: true,
  message: "Company status updated from X to Y",
  data: <company_object>
}
```
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "Company not found" }`
* **Auth Required:** Yes (Admin only)

---

## Admin Routes

---

### GET /api/users
Fetches all users with pagination (admin only).

* **URL Params:** 
  * `?role=Student` (optional)
  * `?page=1` (optional, default 1)
  * `?limit=10` (optional, default 10)
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content:
```
{
  success: true,
  message: "Retrieved X users",
  data: [<user_object>, ...],
  pagination: {
    currentPage: integer,
    pageSize: integer,
    totalRecords: integer,
    totalPages: integer
  }
}
```
* **Auth Required:** Yes (Admin only)

---

### GET /api/users/:id
Fetches specific user details (admin only).

* **URL Params:** `id` (user MongoDB ID)
* **Headers:** Authorization: Bearer {token}
* **Success Response:**
  * Code: 200
  * Content: `{ success: true, data: <user_object> }`
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "User not found" }`
* **Auth Required:** Yes (Admin only)

---

### PATCH /api/users/:id/status
Activates or deactivates a user account (admin only).

* **URL Params:** `id` (user MongoDB ID)
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  isActive: boolean (required: true to activate, false to deactivate)
}
```
* **Success Response:**
  * Code: 200
  * Content:
```
{
  success: true,
  message: "User activated/deactivated successfully",
  data: {
    id: ObjectId,
    name: string,
    email: string,
    isActive: boolean,
    previousStatus: boolean,
    ...
  }
}
```
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "User not found" }`
* **Auth Required:** Yes (Admin only)

---

## HR Routes

---

### POST /api/projects/:id/contact
Sends inquiry about project team to all team members (HR only).

* **URL Params:** `id` (project MongoDB ID)
* **Headers:** Authorization: Bearer {token}, Content-Type: application/json
* **Data Params:**
```
{
  message: string (required)
}
```
* **Success Response:**
  * Code: 200
  * Content:
```
{
  success: true,
  message: "Contact message sent to team members successfully",
  data: {
    projectId: ObjectId,
    projectTitle: string,
    recipientCount: integer,
    sentAt: datetime
  }
}
```
* **Error Response:**
  * Code: 404 Content: `{ success: false, message: "Project not found" }`
  * Code: 500 Content: `{ success: false, message: "Email service error" }`
* **Auth Required:** Yes (Hr only)
* **Note:** Email sending uses Nodemailer with Gmail SMTP

---

## Health Check

---

### GET /api/health
Checks if API is running.

* **URL Params:** None
* **Headers:** None
* **Success Response:**
  * Code: 200
  * Content: `{ status: "Build2Hire API is running" }`
* **Auth Required:** No (Public)

---

## Summary

**Total Endpoints:** 31

| Category | Count |
|---|---|
| Auth | 3 |
| Projects | 9 |
| Profile | 3 |
| Join Requests | 4 |
| Companies | 5 |
| Admin | 3 |
| HR | 1 |
| Health | 1 |

---

## Authentication

All protected routes require:
```
Headers: {
  "Authorization": "Bearer {JWT_TOKEN}"
}
```

Token format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

JWT contains: `userId` and expires in 24 hours.

---

## Error Handling

All errors follow this format:
```
{
  success: false,
  message: "Human-readable error message"
}
```

Common HTTP Status Codes:
- `200` — Success
- `201` — Created
- `400` — Bad Request (validation error)
- `401` — Unauthorized (no token)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found
- `409` — Conflict (duplicate email, etc.)
- `500` — Server Error

---

## Rate Limiting

Currently not implemented. Recommended for Phase 2:
- 100 requests per 15 minutes per IP on auth endpoints
- 1000 requests per hour per authenticated user on other endpoints
