# Build2Hire — Job Portal Platform
## Database Schema Documentation

**Version:** 1.0  
**Author:** Varunkumar Chimata
**Date:** 2 June 2026  

---

## 1. Overview

This document describes the MongoDB database structure used in Build2Hire, a platform connecting students with companies through real project work. The system supports:

- User authentication (email/password and OAuth ready)
- Three user roles: Student, HR, Admin
- Project posting and team formation
- Join request workflow for team collaboration
- Company registration and verification
- Admin user management

| Property | Value |
|---|---|
| Database Type | MongoDB Atlas |
| ODM | Mongoose |
| Architecture | MVC with REST API |
| Database Name | build2hire |

---

## 2. Collections Overview

| Collection | Purpose |
|---|---|
| users | Stores all user accounts — students, HR, and admins |
| projects | Stores projects posted by students |
| joinrequests | Stores student requests to join project teams |
| companies | Stores company registrations pending admin verification |

---

## 3. Users Collection

**Collection Name:** users

**Purpose:**  
Stores authentication details, profile information, and role data for all users — students, HR managers, and admins.

**Schema Structure:**
```js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String
    // NOT required - OAuth users won't have password
    // Validated in controller BEFORE hashing
  },
  role: {
    type: String,
    enum: ['Student', 'Hr', 'Admin'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String
  }
}, { timestamps: true })
```

**Field Documentation:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| _id | ObjectId | auto | — | Unique MongoDB ID |
| name | String | Yes | — | Full name |
| email | String | Yes | — | Login email, globally unique |
| password | String | No | — | Bcrypt hashed, never returned in API |
| role | Enum | Yes | — | Student / Hr / Admin |
| isActive | Boolean | No | true | Account status (can be deactivated by admin) |
| googleId | String | No | null | Google OAuth ID (Phase 2) |
| avatar | String | No | null | Profile picture URL (Phase 2) |
| createdAt | Date | auto | — | Account creation time |
| updatedAt | Date | auto | — | Last update time |

**Indexes:**
- `email` — unique, for fast login lookup
- `role` — for role-based queries
- `googleId` — unique, sparse, for OAuth users

**Security Rules:**
- Password hashing with bcrypt (12 rounds) — handled before storage
- Password validation (min 8 chars) happens in controller, not schema
- Password excluded from all API responses
- Email validation using regex at schema level
- One account per email globally

**Example Document:**
```json
{
  "_id": "6a110d01670bce2459b84244",
  "name": "Varun Manasa",
  "email": "varun@test.com",
  "role": "Student",
  "isActive": true,
  "googleId": null,
  "avatar": null,
  "createdAt": "2026-05-23T02:12:17.784Z",
  "updatedAt": "2026-05-25T07:21:32.491Z"
}
```

---

## 4. Projects Collection

**Collection Name:** projects

**Purpose:**  
Stores projects posted by students. Each project has a head (creator) and can have up to 3 additional team members.

**Schema Structure:**
```js
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20
  },
  githubUrl: {
    type: String,
    required: true
  },
  projectType: {
    type: String,
    enum: ['Hackathon', 'Finalyear-Project', 'Startup'],
    required: true
  },
  skills: {
    type: [String],
    validate: {
      validator: function(skills) {
        return skills.length >= 1
      },
      message: 'At least one skill is required'
    }
  },
  rolesNeeded: {
    type: [String],
    enum: ['frontend', 'backend', 'ml', 'designer', 'devops', 'other']
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    validate: {
      validator: function(members) {
        return members.length <= 3
      },
      message: 'Maximum 3 members allowed (head + 3)'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['recruiting', 'in-progress', 'completed'],
    default: 'recruiting'
  }
}, { timestamps: true })
```

**Field Documentation:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| _id | ObjectId | auto | — | Unique MongoDB ID |
| title | String | Yes | — | Project name (min 5 chars) |
| description | String | Yes | — | Project details (min 20 chars) |
| githubUrl | String | Yes | — | GitHub repository URL |
| projectType | Enum | Yes | — | Hackathon / Finalyear-Project / Startup |
| skills | [String] | Yes | — | Required tech skills (min 1) |
| rolesNeeded | [String] | No | [] | Roles like frontend, backend, ml, etc. |
| members | [ObjectId] | No | [] | Joined members (max 3, excludes head) |
| createdBy | ObjectId | Yes | — | Ref to User (project head) |
| status | Enum | No | recruiting | recruiting / in-progress / completed |
| createdAt | Date | auto | — | Project creation time |
| updatedAt | Date | auto | — | Last update time |

**Indexes:**
- `createdBy` — for fetching student's own projects
- `projectType` — for filtering by project type
- `status` — for filtering by status

**Business Rules:**
- Project head stored separately in `createdBy` — NOT in members array
- Team size = 1 (head) + members array (0-3) = max 4 total
- Head cannot be in members array
- Only creator can edit/delete project
- Students can browse all projects (public)
- HR can view project teams

**Example Document:**
```json
{
  "_id": "6a1cd19e848a65ac02991692",
  "title": "Build2Hire Job Portal",
  "description": "A platform connecting students with companies through real projects and team collaboration",
  "githubUrl": "https://github.com/varun47-ch/Build2Hire",
  "projectType": "Finalyear-Project",
  "skills": ["React", "Node.js", "MongoDB", "Express"],
  "rolesNeeded": ["frontend", "backend"],
  "members": ["6a1cd0fb848a65ac02991691"],
  "createdBy": "6a110d01670bce2459b84244",
  "status": "recruiting",
  "createdAt": "2026-06-01T00:26:06.092Z",
  "updatedAt": "2026-06-01T00:47:41.867Z"
}
```

---

## 5. JoinRequests Collection

**Collection Name:** joinrequests

**Purpose:**  
Tracks student requests to join project teams. Every request requires project head approval before the student is added to the team.

**Schema Structure:**
```js
const joinRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  role: {
    type: String,
    enum: ['frontend', 'backend', 'ml', 'designer', 'devops', 'other'],
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true })

// Compound index to prevent duplicate pending requests
joinRequestSchema.index({ requestedBy: 1, projectId: 1, status: 1 })
```

**Field Documentation:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| _id | ObjectId | auto | — | Unique MongoDB ID |
| requestedBy | ObjectId | Yes | — | Ref to User (student) |
| projectId | ObjectId | Yes | — | Ref to Project |
| role | Enum | Yes | — | frontend / backend / ml / designer / devops / other |
| status | Enum | No | pending | pending / approved / rejected |
| createdAt | Date | auto | — | Request creation time |
| updatedAt | Date | auto | — | Last update time |

**Indexes:**
- `(requestedBy, projectId, status)` — compound, prevents duplicate pending requests

**Business Rules:**
- Student cannot send duplicate pending requests to same project
- Student cannot join their own project
- Project must have space (members < 3) to accept request
- Only project head can accept/reject requests
- Approved request automatically adds student to project.members
- One request per student per project

**Example Document:**
```json
{
  "_id": "6a1cd4db848a65ac02991693",
  "requestedBy": "6a1cd0fb848a65ac02991691",
  "projectId": "6a1cd19e848a65ac02991692",
  "role": "frontend",
  "status": "approved",
  "createdAt": "2026-06-01T00:39:55.873Z",
  "updatedAt": "2026-06-01T00:47:41.761Z"
}
```

---

## 6. Companies Collection

**Collection Name:** companies

**Purpose:**  
Stores company registrations. HR managers register companies; admins verify them before they can browse student teams.

**Schema Structure:**
```js
const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyEmail: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    required: true
  },
  linkedin: {
    type: String
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true })
```

**Field Documentation:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| _id | ObjectId | auto | — | Unique MongoDB ID |
| companyName | String | Yes | — | Official company name |
| companyEmail | String | No | null | Company email address |
| website | String | Yes | — | Company website (admin verification source) |
| linkedin | String | No | null | LinkedIn company URL |
| registeredBy | ObjectId | Yes | — | Ref to User (HR manager) — unique |
| status | Enum | No | pending | pending / approved / rejected |
| createdAt | Date | auto | — | Registration time |
| updatedAt | Date | auto | — | Last update time |

**Indexes:**
- `registeredBy` — unique, each HR registers one company

**Business Rules:**
- One company per HR account (registeredBy unique)
- Company starts in "pending" status until admin approves
- Only approved companies can browse student teams
- Admin can approve or reject registration

**Example Document:**
```json
{
  "_id": "6a1cdd9876e8746cb2cc46be",
  "companyName": "TechCorp Inc",
  "companyEmail": "careers@techcorp.com",
  "website": "https://techcorp.com",
  "linkedin": "https://linkedin.com/company/techcorp",
  "registeredBy": "6a1cdcd776e8746cb2cc46bc",
  "status": "approved",
  "createdAt": "2026-06-01T01:17:12.382Z",
  "updatedAt": "2026-06-01T01:24:14.470Z"
}
```

---

## 7. Relationships Map

```
User (Student)  ──── createdBy ────────► Project
User (Student)  ──── members ───────────► Project
User (Student)  ──── requestedBy ──────► JoinRequest ──── projectId ────► Project
User (HR)       ──── registeredBy ─────► Company
User (Admin)    ──── manages ───────────► User
```

---

## 8. Index Summary

| Collection | Index | Type | Purpose |
|---|---|---|---|
| users | email | Unique | Fast login lookup |
| users | role | Regular | Role-based queries |
| users | googleId | Unique Sparse | OAuth user identification |
| projects | createdBy | Regular | Fetch student's projects |
| projects | projectType | Regular | Filter by project type |
| projects | status | Regular | Filter by status |
| joinrequests | (requestedBy, projectId, status) | Compound | Prevent duplicate pending requests |
| companies | registeredBy | Unique | One company per HR |

---

## 9. Data Integrity Rules

**Cascade Delete:**
- When a project is deleted, all associated JoinRequests are deleted

**Validation Rules:**
- Email must be valid format across all collections
- Password validated BEFORE hashing (min 8 chars)
- Project title min 5 chars, description min 20 chars
- Skills array must have at least 1 item
- Members array limited to 3 items

**Authorization Rules:**
- Students can only edit/delete their own projects
- HR can only view their own company
- Admins can manage all users and companies
- Only project head can accept/reject join requests

---

## 10. Notes

- **Phase 1:** Email/password authentication, team formation, company verification
- **Phase 2:** Google OAuth, email notifications, real-time chat
- **Scalability:** Indexes designed for efficient queries at scale
- **Security:** All passwords hashed, sensitive fields excluded from API responses
