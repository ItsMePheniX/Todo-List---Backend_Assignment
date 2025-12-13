# 📖 API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "User already exists"
}
```

---

### Login
**POST** `/auth/login`

Authenticate a user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### Get Profile
**GET** `/auth/profile`

Get the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

## 📝 Task Endpoints (Protected)

### Get All Tasks
**GET** `/tasks`

Get all tasks for the authenticated user. Admins see all tasks.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Complete project",
      "description": "Finish the backend assignment",
      "status": "pending",
      "priority": "high",
      "user_id": "uuid",
      "created_at": "2025-12-12T10:00:00Z",
      "updated_at": "2025-12-12T10:00:00Z"
    }
  ]
}
```

---

### Get Task by ID
**GET** `/tasks/:id`

Get a specific task by ID. Users can only access their own tasks.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Complete project",
    "description": "Finish the backend assignment",
    "status": "pending",
    "priority": "high",
    "user_id": "uuid",
    "created_at": "2025-12-12T10:00:00Z",
    "updated_at": "2025-12-12T10:00:00Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### Create Task
**POST** `/tasks`

Create a new task for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the backend assignment",
  "status": "pending",
  "priority": "high"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "title": "Complete project",
    "description": "Finish the backend assignment",
    "status": "pending",
    "priority": "high",
    "user_id": "uuid",
    "created_at": "2025-12-12T10:00:00Z",
    "updated_at": "2025-12-12T10:00:00Z"
  }
}
```

---

### Update Task
**PUT** `/tasks/:id`

Update an existing task. Users can only update their own tasks.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "medium"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "title": "Updated title",
    "description": "Updated description",
    "status": "in-progress",
    "priority": "medium",
    "user_id": "uuid",
    "created_at": "2025-12-12T10:00:00Z",
    "updated_at": "2025-12-12T11:00:00Z"
  }
}
```

---

### Delete Task
**DELETE** `/tasks/:id`

Delete a task. Users can only delete their own tasks. Admins can delete any task.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 👑 Admin Endpoints (Admin Only)

### Get All Users
**GET** `/admin/users`

Get a list of all users in the system.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "created_at": "2025-12-12T10:00:00Z",
        "role": "user"
      }
    ]
  }
}
```

---

### Get User by ID
**GET** `/admin/users/:id`

Get detailed information about a specific user.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-12-12T10:00:00Z",
    "role": "user"
  }
}
```

---

### Update User Role
**PUT** `/admin/users/:id/role`

Update a user's role (user/admin).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "role": "admin",
    "created_at": "2025-12-12T10:00:00Z",
    "updated_at": "2025-12-12T11:00:00Z"
  }
}
```

---

### Delete User
**DELETE** `/admin/users/:id`

Delete a user from the system. Cannot delete yourself.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Cannot delete your own account"
}
```

---

### Get All Tasks (Admin)
**GET** `/admin/tasks`

Get all tasks from all users in the system.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Complete project",
      "description": "Finish the backend assignment",
      "status": "pending",
      "priority": "high",
      "user_id": "uuid",
      "created_at": "2025-12-12T10:00:00Z",
      "updated_at": "2025-12-12T10:00:00Z"
    }
  ]
}
```

---

## 🏥 Health Check

### Health Status
**GET** `/health`

Check if the API is running.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "message": "Backend API is running"
}
```

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 📌 Field Validation

### Task Fields
- `title`: Required, max 255 characters
- `description`: Optional, text
- `status`: Optional (default: "pending"), values: "pending", "in-progress", "completed"
- `priority`: Optional (default: "medium"), values: "low", "medium", "high"

### User Fields
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `full_name`: Required for registration

### Role Fields
- `role`: Required for updates, values: "user", "admin"

---

## 🔑 JWT Token Structure

The JWT token contains:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

Tokens expire after 1 hour (configured in Supabase).

---

## 📮 Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "Backend Assignment API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080/api/v1"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

**Need help?** Check the [README.md](README.md) for setup instructions.
