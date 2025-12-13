# API Testing Guide

Complete guide for testing all API endpoints using curl commands or Postman.

## Base URL
```
http://localhost:8080
```

---

## 🔧 Health Check

### Check if server is running
```bash
curl -X GET http://localhost:8080/health
```

**Expected Response:**
```json
{
  "status": "healthy"
}
```

---

## 🔐 Authentication Endpoints

### 1. Register a New User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### 2. Register an Admin User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "full_name": "Admin User"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

> **💡 Important:** Save the `token` from the response. You'll need it for authenticated requests.

### 4. Get User Profile
```bash
curl -X GET http://localhost:8080/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "created_at": "2025-12-13T00:00:00Z"
}
```

---

## 📋 Task Endpoints (User)

### 5. Create a Task
```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "pending",
    "priority": "high"
  }'
```

**Request Body Fields:**
- `title` (required): Task title
- `description` (optional): Task description
- `status` (required): `pending`, `in-progress`, or `completed`
- `priority` (required): `low`, `medium`, or `high`

**Expected Response:**
```json
{
  "id": "task-uuid",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending",
  "priority": "high",
  "user_id": "user-uuid",
  "created_at": "2025-12-13T00:00:00Z",
  "updated_at": "2025-12-13T00:00:00Z"
}
```

### 6. Get All Tasks (Current User)
```bash
curl -X GET http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "task-uuid-1",
    "title": "Task 1",
    "description": "Description 1",
    "status": "pending",
    "priority": "high",
    "user_id": "user-uuid",
    "created_at": "2025-12-13T00:00:00Z",
    "updated_at": "2025-12-13T00:00:00Z"
  },
  {
    "id": "task-uuid-2",
    "title": "Task 2",
    "description": "Description 2",
    "status": "completed",
    "priority": "medium",
    "user_id": "user-uuid",
    "created_at": "2025-12-13T00:00:00Z",
    "updated_at": "2025-12-13T00:00:00Z"
  }
]
```

### 7. Get Task by ID
```bash
curl -X GET http://localhost:8080/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Update a Task
```bash
curl -X PUT http://localhost:8080/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in-progress",
    "priority": "medium"
  }'
```

**Expected Response:**
```json
{
  "id": "task-uuid",
  "title": "Updated task title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "medium",
  "user_id": "user-uuid",
  "created_at": "2025-12-13T00:00:00Z",
  "updated_at": "2025-12-13T00:30:00Z"
}
```

### 9. Delete a Task
```bash
curl -X DELETE http://localhost:8080/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Task deleted successfully"
}
```

---

## 👑 Admin Endpoints

> **⚠️ Note:** All admin endpoints require the user to have an `admin` role.

### 10. Get All Users
```bash
curl -X GET http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "user-uuid-1",
    "email": "user1@example.com",
    "full_name": "User One",
    "role": "user",
    "created_at": "2025-12-13T00:00:00Z"
  },
  {
    "id": "user-uuid-2",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "admin",
    "created_at": "2025-12-13T00:00:00Z"
  }
]
```

### 11. Get User by ID
```bash
curl -X GET http://localhost:8080/api/v1/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "created_at": "2025-12-13T00:00:00Z"
}
```

### 12. Update User Role
```bash
curl -X PUT http://localhost:8080/api/v1/admin/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

**Request Body:**
- `role`: Must be either `user` or `admin`

**Expected Response:**
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "admin",
    "created_at": "2025-12-13T00:00:00Z"
  }
}
```

### 13. Delete a User
```bash
curl -X DELETE http://localhost:8080/api/v1/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "User deleted successfully"
}
```

### 14. Get All Tasks (All Users)
```bash
curl -X GET http://localhost:8080/api/v1/admin/tasks \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "task-uuid-1",
    "title": "Task from User 1",
    "description": "Description",
    "status": "pending",
    "priority": "high",
    "user_id": "user-uuid-1",
    "created_at": "2025-12-13T00:00:00Z",
    "updated_at": "2025-12-13T00:00:00Z"
  },
  {
    "id": "task-uuid-2",
    "title": "Task from User 2",
    "description": "Description",
    "status": "completed",
    "priority": "low",
    "user_id": "user-uuid-2",
    "created_at": "2025-12-13T00:00:00Z",
    "updated_at": "2025-12-13T00:00:00Z"
  }
]
```

---

## 📝 Complete Testing Workflow

Follow this step-by-step workflow to test all endpoints:

### Step 1: Health Check
```bash
curl -X GET http://localhost:8080/health
```

### Step 2: Register Regular User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Step 3: Login as Regular User
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```
**Save the token as `USER_TOKEN`**

### Step 4: Create Tasks
```bash
# Create Task 1
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task 1",
    "description": "First task",
    "status": "pending",
    "priority": "high"
  }'

# Create Task 2
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task 2",
    "description": "Second task",
    "status": "in-progress",
    "priority": "medium"
  }'
```

### Step 5: Get All User Tasks
```bash
curl -X GET http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer USER_TOKEN"
```

### Step 6: Update a Task
```bash
curl -X PUT http://localhost:8080/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task",
    "description": "Updated description",
    "status": "completed",
    "priority": "low"
  }'
```

### Step 7: Register Admin User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "full_name": "Admin User"
  }'
```

### Step 8: Login as Admin
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```
**Save the token as `ADMIN_TOKEN`**

### Step 9: Promote User to Admin (using Supabase or manually)
Update the user role in your database to `admin` for the admin user.

### Step 10: Test Admin Endpoints
```bash
# Get all users
curl -X GET http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get all tasks
curl -X GET http://localhost:8080/api/v1/admin/tasks \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Update user role
curl -X PUT http://localhost:8080/api/v1/admin/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## 🧪 Postman Collection Setup

### Environment Variables
Create a Postman environment with these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:8080` | |
| `userToken` | | (Set after login) |
| `adminToken` | | (Set after admin login) |
| `userId` | | (Set from response) |
| `taskId` | | (Set from response) |

### Using Variables in Postman

In your requests, use:
- URL: `{{baseUrl}}/api/v1/auth/login`
- Authorization: `Bearer {{userToken}}`

### Auto-save Tokens

Add this to the **Tests** tab of your login request:
```javascript
// Save user token
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("userToken", response.token);
    pm.environment.set("userId", response.user.id);
}
```

For admin login:
```javascript
// Save admin token
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("adminToken", response.token);
}
```

---

## 🔍 Common Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Cause:** Missing or invalid JWT token

### 403 Forbidden
```json
{
  "error": "Forbidden: Admin access required"
}
```
**Cause:** User doesn't have admin role

### 404 Not Found
```json
{
  "error": "Task not found"
}
```
**Cause:** Resource doesn't exist or user doesn't have access

### 400 Bad Request
```json
{
  "error": "Invalid request body"
}
```
**Cause:** Malformed JSON or missing required fields

---

## 📊 Status Codes

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

## 🎯 Tips for Testing

1. **Always check health endpoint first** to ensure server is running
2. **Save JWT tokens** after login for subsequent requests
3. **Use environment variables** in Postman for easier testing
4. **Test error cases** by providing invalid data
5. **Verify authorization** by testing endpoints without tokens
6. **Test role-based access** by trying admin endpoints with regular user token
7. **Check response formats** match expected structure
8. **Test edge cases** like empty strings, very long text, special characters

---

## 🚀 Quick Test Commands

```bash
# Quick test all major endpoints
# 1. Health
curl http://localhost:8080/health

# 2. Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","full_name":"Test User"}'

# 3. Login (save the token from response)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 4. Create Task (replace TOKEN)
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test task","status":"pending","priority":"high"}'

# 5. Get Tasks
curl -X GET http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer TOKEN"
```
