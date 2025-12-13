package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"backend-assignment/models"

	"github.com/gin-gonic/gin"
)

type TaskHandler struct {
	SupabaseURL string
	SupabaseKey string
}

func NewTaskHandler(supabaseURL, supabaseKey string) *TaskHandler {
	return &TaskHandler{
		SupabaseURL: supabaseURL,
		SupabaseKey: supabaseKey,
	}
}

// GetTasks godoc
// @Summary Get all tasks
// @Description Get all tasks for the authenticated user (or all tasks if admin)
// @Tags tasks
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response
// @Failure 401 {object} models.ErrorResponse
// @Router /api/v1/tasks [get]
func (h *TaskHandler) GetTasks(c *gin.Context) {
	userID, _ := c.Get("userID")

	// Check if user is admin
	isAdmin, _ := h.isUserAdmin(userID.(string))

	var url string
	if isAdmin {
		// Admin can see all tasks
		url = fmt.Sprintf("%s/rest/v1/tasks?select=*&order=created_at.desc", h.SupabaseURL)
	} else {
		// Regular users see only their tasks
		url = fmt.Sprintf("%s/rest/v1/tasks?user_id=eq.%s&select=*&order=created_at.desc", h.SupabaseURL, userID.(string))
	}

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", h.SupabaseKey)
	req.Header.Set("Authorization", "Bearer "+h.SupabaseKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to fetch tasks",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var tasks []models.Task
	json.Unmarshal(body, &tasks)

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    tasks,
	})
}

// GetTask godoc
// @Summary Get a task by ID
// @Description Get a specific task by ID
// @Tags tasks
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Task ID"
// @Success 200 {object} models.Response
// @Failure 404 {object} models.ErrorResponse
// @Router /api/v1/tasks/{id} [get]
func (h *TaskHandler) GetTask(c *gin.Context) {
	taskID := c.Param("id")
	userID, _ := c.Get("userID")

	url := fmt.Sprintf("%s/rest/v1/tasks?id=eq.%s&select=*", h.SupabaseURL, taskID)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", h.SupabaseKey)
	req.Header.Set("Authorization", "Bearer "+h.SupabaseKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to fetch task",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var tasks []models.Task
	json.Unmarshal(body, &tasks)

	if len(tasks) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error:   "Task not found",
		})
		return
	}

	task := tasks[0]

	// Check if user owns this task or is admin
	isAdmin, _ := h.isUserAdmin(userID.(string))
	if task.UserID != userID.(string) && !isAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Success: false,
			Error:   "Access denied",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    task,
	})
}

// CreateTask godoc
// @Summary Create a new task
// @Description Create a new task for the authenticated user
// @Tags tasks
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.CreateTaskRequest true "Create Task Request"
// @Success 201 {object} models.Response
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/tasks [post]
func (h *TaskHandler) CreateTask(c *gin.Context) {
	var req models.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	userID, _ := c.Get("userID")

	// Set defaults
	if req.Status == "" {
		req.Status = "pending"
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}

	payload := map[string]interface{}{
		"title":       req.Title,
		"description": req.Description,
		"status":      req.Status,
		"priority":    req.Priority,
		"user_id":     userID.(string),
	}

	jsonData, _ := json.Marshal(payload)

	url := fmt.Sprintf("%s/rest/v1/tasks", h.SupabaseURL)
	httpReq, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("apikey", h.SupabaseKey)
	httpReq.Header.Set("Authorization", "Bearer "+h.SupabaseKey)
	httpReq.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to create task",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var tasks []models.Task
	json.Unmarshal(body, &tasks)

	if len(tasks) > 0 {
		c.JSON(http.StatusCreated, models.Response{
			Success: true,
			Message: "Task created successfully",
			Data:    tasks[0],
		})
	} else {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to create task",
		})
	}
}

// UpdateTask godoc
// @Summary Update a task
// @Description Update an existing task
// @Tags tasks
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Task ID"
// @Param request body models.UpdateTaskRequest true "Update Task Request"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/tasks/{id} [put]
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	taskID := c.Param("id")
	userID, _ := c.Get("userID")

	var req models.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// Build update payload
	payload := make(map[string]interface{})
	if req.Title != "" {
		payload["title"] = req.Title
	}
	if req.Description != "" {
		payload["description"] = req.Description
	}
	if req.Status != "" {
		payload["status"] = req.Status
	}
	if req.Priority != "" {
		payload["priority"] = req.Priority
	}

	jsonData, _ := json.Marshal(payload)

	url := fmt.Sprintf("%s/rest/v1/tasks?id=eq.%s&user_id=eq.%s", h.SupabaseURL, taskID, userID.(string))
	httpReq, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("apikey", h.SupabaseKey)
	httpReq.Header.Set("Authorization", "Bearer "+h.SupabaseKey)
	httpReq.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to update task",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var tasks []models.Task
	json.Unmarshal(body, &tasks)

	if len(tasks) > 0 {
		c.JSON(http.StatusOK, models.Response{
			Success: true,
			Message: "Task updated successfully",
			Data:    tasks[0],
		})
	} else {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error:   "Task not found or access denied",
		})
	}
}

// DeleteTask godoc
// @Summary Delete a task
// @Description Delete a task by ID
// @Tags tasks
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Task ID"
// @Success 200 {object} models.Response
// @Failure 404 {object} models.ErrorResponse
// @Router /api/v1/tasks/{id} [delete]
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	taskID := c.Param("id")
	userID, _ := c.Get("userID")

	url := fmt.Sprintf("%s/rest/v1/tasks?id=eq.%s&user_id=eq.%s", h.SupabaseURL, taskID, userID.(string))
	httpReq, _ := http.NewRequest("DELETE", url, nil)
	httpReq.Header.Set("apikey", h.SupabaseKey)
	httpReq.Header.Set("Authorization", "Bearer "+h.SupabaseKey)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to delete task",
		})
		return
	}
	defer resp.Body.Close()

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Task deleted successfully",
	})
}

func (h *TaskHandler) isUserAdmin(userID string) (bool, error) {
	url := fmt.Sprintf("%s/rest/v1/user_roles?user_id=eq.%s&select=role", h.SupabaseURL, userID)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", h.SupabaseKey)
	req.Header.Set("Authorization", "Bearer "+h.SupabaseKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var roles []map[string]interface{}
	json.Unmarshal(body, &roles)

	if len(roles) > 0 {
		if role, ok := roles[0]["role"].(string); ok && role == "admin" {
			return true, nil
		}
	}

	return false, nil
}
