# Todo Board — Backend API

A production-ready REST API for a Kanban-style todo board application. Built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **Cloudinary** for image storage, and **Gmail** for transactional emails.

---

## Features

- **Auth** — Email/password signup with Gmail-based email verification. Clicking the verification link auto-logs the user in.
- **Boards** — Create boards with name, description, and a custom background image (stored on Cloudinary).
- **Lists** — Each board gets four default lists: *Todo*, *In Progress*, *Complete*, *Blocked*. Custom lists can be added.
- **Labels** — Per-board labels with custom name and hex color.
- **Work Items** — Each item has title, description, due date/time, label assignments, and a nested checklist (title + boolean status).
- **Reminders** — When a work item has a due date and reminder enabled, an email is sent via Gmail. If no time is specified, the email fires at 08:00 on the due date.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB (Atlas free tier) |
| ODM | Mongoose 8 |
| Auth | JWT + bcrypt |
| Email | Nodemailer + Gmail App Password |
| File Storage | Cloudinary |
| Scheduler | node-cron |

---

## Project Structure

```
todo-backend/
├── src/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary config
│   │   └── mailer.js           # Nodemailer transporter
│   ├── models/
│   │   ├── User.js
│   │   ├── Board.js
│   │   ├── List.js
│   │   ├── Label.js
│   │   └── WorkItem.js         # Includes nested checklist schema
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT protect middleware
│   │   └── upload.middleware.js # Multer + Cloudinary
│   ├── utils/
│   │   ├── ApiError.js         # Operational error class
│   │   └── asyncHandler.js     # Async route wrapper
│   ├── services/
│   │   ├── email.service.js    # Verification & reminder emails
│   │   └── scheduler.service.js # node-cron reminder job
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── board.controller.js
│   │   ├── list.controller.js
│   │   ├── label.controller.js
│   │   └── workitem.controller.js
│   └── routes/
│       ├── auth.routes.js
│       ├── board.routes.js
│       ├── list.routes.js
│       ├── label.routes.js
│       └── workitem.routes.js
├── index.js                    # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Setup

### 1. Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) free-tier cluster
- A [Cloudinary](https://cloudinary.com) free account
- A Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled (requires 2FA)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret string |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` |
| `EMAIL_FROM` | Your Gmail address |
| `EMAIL_APP_PASSWORD` | 16-character Gmail App Password |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `FRONTEND_URL` | Your frontend's base URL (for email links) |

#### Getting a Gmail App Password

1. Go to [Google Account → Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already on
3. Go to **App Passwords** → select "Mail" and your device
4. Copy the 16-character password into `EMAIL_APP_PASSWORD`

### 4. Run

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### `POST /auth/signup`
Register a new user. Sends a verification email.

**Body:**
```json
{
  "name": "Vaibhav",
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created. Please check your email to verify your account."
}
```

---

#### `GET /auth/verify-email?token=<token>`
Called when the user clicks the link in the verification email. Returns a JWT so the frontend can auto-login the user.

**Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "<jwt>",
  "user": { ... }
}
```

---

#### `POST /auth/login`
Login with email and password.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { ... }
}
```

---

#### `POST /auth/resend-verification`
Resend the verification email.

**Body:** `{ "email": "user@example.com" }`

---

#### `GET /auth/me` *(protected)*
Returns the current authenticated user.

---

### Boards

#### `POST /boards` *(protected)*
Create a board. Optionally upload a background image.

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `description` | string | — |
| `backgroundImage` | file | — |

**Response `201`:** `{ "success": true, "board": { ... } }`

Four default lists (*Todo*, *In Progress*, *Complete*, *Blocked*) are automatically created.

---

#### `GET /boards` *(protected)*
Returns all boards for the current user.

---

#### `GET /boards/:boardId` *(protected)*
Returns a single board.

---

#### `PUT /boards/:boardId` *(protected)*
Update board name, description, or background image.

**Content-Type:** `multipart/form-data`

---

#### `DELETE /boards/:boardId` *(protected)*
Permanently deletes the board and all its lists, labels, and work items. Also removes the background image from Cloudinary.

---

### Lists

#### `POST /boards/:boardId/lists` *(protected)*
Add a custom list to a board.

**Body:** `{ "name": "Review" }`

---

#### `GET /boards/:boardId/lists` *(protected)*
Returns all lists for a board, sorted by `order`.

---

#### `PUT /boards/:boardId/lists/:listId` *(protected)*
Update a list's name or order.

**Body:** `{ "name": "QA", "order": 2 }`

---

#### `DELETE /boards/:boardId/lists/:listId` *(protected)*
Deletes the list and all its work items.

---

### Labels

#### `POST /boards/:boardId/labels` *(protected)*
Create a label.

**Body:**
```json
{
  "name": "Bug",
  "color": "#E53E3E"
}
```

---

#### `GET /boards/:boardId/labels` *(protected)*
Returns all labels for a board.

---

#### `PUT /boards/:boardId/labels/:labelId` *(protected)*
Update label name or color.

---

#### `DELETE /boards/:boardId/labels/:labelId` *(protected)*
Delete a label.

---

### Work Items

#### `POST /boards/:boardId/workitems` *(protected)*
Create a work item.

**Body:**
```json
{
  "title": "Fix login bug",
  "description": "Users can't log in with Google on mobile",
  "listId": "<list_id>",
  "dueDate": "2025-07-01T14:00:00.000Z",
  "hasDueTime": true,
  "reminder": true,
  "labels": ["<label_id>"]
}
```

> **Reminder behavior:**
> - `reminder: true` + `hasDueTime: true` → email sent when current time ≥ `dueDate`
> - `reminder: true` + `hasDueTime: false` → email sent at **08:00** on the due date

---

#### `GET /boards/:boardId/workitems` *(protected)*
Returns all work items for a board. Filter by list with `?listId=<id>`.

---

#### `GET /boards/:boardId/workitems/:itemId` *(protected)*
Returns a single work item with populated labels and list.

---

#### `PUT /boards/:boardId/workitems/:itemId` *(protected)*
Update any field. Changing `dueDate` automatically resets `reminderSent`.

**Body (all optional):**
```json
{
  "title": "Updated title",
  "description": "...",
  "listId": "<new_list_id>",
  "dueDate": "2025-07-05T09:00:00.000Z",
  "hasDueTime": true,
  "reminder": true,
  "labels": ["<label_id>"],
  "order": 0
}
```

---

#### `DELETE /boards/:boardId/workitems/:itemId` *(protected)*
Delete a work item.

---

### Checklist (nested in Work Items)

#### `POST /boards/:boardId/workitems/:itemId/checklist` *(protected)*
Add a checklist item.

**Body:** `{ "title": "Write unit tests" }`

---

#### `PUT /boards/:boardId/workitems/:itemId/checklist/:checkId` *(protected)*
Update a checklist item.

**Body:** `{ "title": "Write integration tests", "completed": true }`

---

#### `DELETE /boards/:boardId/workitems/:itemId/checklist/:checkId` *(protected)*
Delete a checklist item.

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | unique, required |
| `password` | String | hashed with bcrypt |
| `avatar_url` | String | optional |
| `isVerified` | Boolean | default false |
| `verificationToken` | String | cleared after verification |
| `verificationTokenExpiry` | Date | 24h window |

### Board
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `description` | String | |
| `backgroundImage` | String | Cloudinary URL |
| `backgroundImagePublicId` | String | for deletion |
| `owner` | ObjectId → User | |

### List
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `board` | ObjectId → Board | |
| `order` | Number | |
| `isDefault` | Boolean | true for the 4 built-ins |

### Label
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `color` | String | hex, e.g. `#FF5733` |
| `board` | ObjectId → Board | |

### WorkItem
| Field | Type | Notes |
|---|---|---|
| `title` | String | required |
| `description` | String | |
| `list` | ObjectId → List | |
| `board` | ObjectId → Board | |
| `owner` | ObjectId → User | |
| `dueDate` | Date | |
| `hasDueTime` | Boolean | controls reminder timing |
| `reminder` | Boolean | enable/disable email reminder |
| `reminderSent` | Boolean | auto-reset on dueDate change |
| `labels` | [ObjectId → Label] | |
| `checklist` | [{ title, completed }] | |
| `order` | Number | |

---

## Email Flows

### Verification Email
Sent on signup. Contains a button "Verify Email & Log In" linking to:
```
<FRONTEND_URL>/auth/verify-email?token=<token>
```
The frontend should call `GET /auth/verify-email?token=<token>` and store the returned JWT.

### Reminder Email
Sent by the cron scheduler (runs every minute). Triggered when:
- `reminder: true`
- `reminderSent: false`
- Due date/time has been reached

---

## Error Responses

All errors follow the same shape:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

| Code | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (unverified email) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email) |
| 500 | Internal server error |

---

## License

ISC
