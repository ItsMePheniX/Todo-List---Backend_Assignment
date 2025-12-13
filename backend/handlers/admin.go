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

type AdminHandler struct {
	SupabaseURL        string
	SupabaseServiceKey string
}

func NewAdminHandler(supabaseURL, supabaseServiceKey string) *AdminHandler {
	return &AdminHandler{
		SupabaseURL:        supabaseURL,
		SupabaseServiceKey: supabaseServiceKey,
	}
}

// GetAllUsers godoc
// @Summary Get all users (Admin only)
// @Description Get a list of all users in the system
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response
// @Failure 403 {object} models.ErrorResponse
// @Router /api/v1/admin/users [get]
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	userID, _ := c.Get("userID")

	// Check if user is admin
	if !h.isAdmin(userID.(string)) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Success: false,
			Error:   "Admin access required",
		})
		return
	}

	// Get all users from auth.users using service role key
	url := fmt.Sprintf("%s/auth/v1/admin/users", h.SupabaseURL)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", h.SupabaseServiceKey)
	req.Header.Set("Authorization", "Bearer "+h.SupabaseServiceKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to fetch users from Supabase",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	json.Unmarshal(body, &result)

	// Check if Supabase returned an error
	if errCode, hasError := result["error_code"]; hasError {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   fmt.Sprintf("Supabase error: %v - %v", errCode, result["msg"]),
		})
		return
	}

	// Check if response status was not OK
	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, models.ErrorResponse{
			Success: false,
			Error:   fmt.Sprintf("Supabase returned status %d", resp.StatusCode),
		})
		return
	}

	// Get user roles
	rolesURL := fmt.Sprintf("%s/rest/v1/user_roles?select=*", h.SupabaseURL)
	rolesReq, _ := http.NewRequest("GET", rolesURL, nil)
	rolesReq.Header.Set("apikey", h.SupabaseServiceKey)
	rolesReq.Header.Set("Authorization", "Bearer "+h.SupabaseServiceKey)

	rolesResp, _ := client.Do(rolesReq)
	defer rolesResp.Body.Close()
	rolesBody, _ := io.ReadAll(rolesResp.Body)

	var roles []models.UserRole
	json.Unmarshal(rolesBody, &roles)

	// Create a map of user_id -> role
	roleMap := make(map[string]string)
	for _, r := range roles {
		roleMap[r.UserID] = r.Role
	}

	// Combine user data with roles
	if users, ok := result["users"].([]interface{}); ok {
		enrichedUsers := make([]map[string]interface{}, 0)
		for _, u := range users {
			if userMap, ok := u.(map[string]interface{}); ok {
				userId := userMap["id"].(string)
				userMap["role"] = roleMap[userId]
				if userMap["role"] == "" {
					userMap["role"] = "user" // Default to user role if not set
				}
				enrichedUsers = append(enrichedUsers, userMap)
			}
		}
		result["users"] = enrichedUsers
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    result,
	})
}

// GetUserByID godoc
// @Summary Get user by ID (Admin only)
// @Description Get detailed information about a specific user
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 {object} models.Response
// @Failure 403 {object} models.ErrorResponse
// @Router /api/v1/admin/users/{id} [get]
func (h *AdminHandler) GetUserByID(c *gin.Context) {
	userID, _ := c.Get("userID")
	targetUserID := c.Param("id")

	if !h.isAdmin(userID.(string)) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Success: false,
			Error:   "Admin access required",
		})
		return
	}

	url := fmt.Sprintf("%s/auth/v1/admin/users/%s", h.SupabaseURL, targetUserID)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", h.SupabaseServiceKey)
	req.Header.Set("Authorization", "Bearer "+h.SupabaseServiceKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to fetch user",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == http.StatusNotFound {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error:   "User not found",
		})
		return
	}

	var user map[string]interface{}
	json.Unmarshal(body, &user)

	// Get user role
	role := h.getUserRole(targetUserID)
	user["role"] = role

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    user,
	})
}

// UpdateUserRole godoc
// @Summary Update user role (Admin only)
// @Description Update a user's role (user/admin)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body models.UpdateRoleRequest true "Update Role Request"
// @Success 200 {object} models.Response
// @Failure 403 {object} models.ErrorResponse
// @Router /api/v1/admin/users/{id}/role [put]
func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	userID, _ := c.Get("userID")
	targetUserID := c.Param("id")

	if !h.isAdmin(userID.(string)) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Success: false,
			Error:   "Admin access required",
		})
		return
	}

	var req models.UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// Validate role
	if req.Role != "user" && req.Role != "admin" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Invalid role. Must be 'user' or 'admin'",
		})
		return
	}

	payload := map[string]interface{}{
		"role": req.Role,
	}

	jsonData, _ := json.Marshal(payload)

	url := fmt.Sprintf("%s/rest/v1/user_roles?user_id=eq.%s", h.SupabaseURL, targetUserID)
	httpReq, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("apikey", h.SupabaseServiceKey)
	httpReq.Header.Set("Authorization", "Bearer "+h.SupabaseServiceKey)
	httpReq.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to update role",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var roles []models.UserRole
	json.Unmarshal(body, &roles)

	if len(roles) > 0 {
		c.JSON(http.StatusOK, models.Response{
			Success: true,
			Message: "User role updated successfully",
			Data:    roles[0],
		})
	} else {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error:   "User not found",
		})
	}
}

// DeleteUser godoc
// @Summary Delete user (Admin only)
// @Description Delete a user from the system
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 {object} models.Response
// @Failure 403 {object} models.ErrorResponse
// @Router /api/v1/admin/users/{id} [delete]
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	userID, _ := c.Get("userID")
	targetUserID := c.Param("id")

	if !h.isAdmin(userID.(string)) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Success: false,
			Error:   "Admin access required",
		})
		return
	}

	// Prevent self-deletion
	if userID.(string) == targetUserID {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   "Cannot delete your own account",
		})
		return
	}

	url := fmt.Sprintf("%s/auth/v1/admin/users/%s", h.SupabaseURL, targetUserID)
	httpReq, _ := http.NewRequest("DELETE", url, nil)
	httpReq.Header.Set("apikey", h.SupabaseServiceKey)
	httpReq.Header.Set("Authorization", "Bearer "+h.SupabaseServiceKey)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to delete user",
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Success: false,
			Error:   "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "User deleted successfully",
	})
}

// GetAllTasks godoc
// @Summary Get all tasks from all users (Admin only)
// @Description Get a list of all tasks in the system
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response
// @Failure 403 {object} models.ErrorResponse
// @Router /api/v1/admin/tasks [get]
func (h *AdminHandler) GetAllTasks(c *gin.Context) {
	userID, _ := c.Get("userID")

	if !h.isAdmin(userID.(string)) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Success: false,
			Error:   "Admin access required",
		})
		return
	}

	url := fmt.Sprintf("%s/rest/v1/tasks?select=*&order=created_at.desc", h.SupabaseURL)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", h.SupabaseServiceKey)
	req.Header.Set("Authorization", "Bearer "+h.SupabaseServiceKey)

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

func (h *AdminHandler) isAdmin(userID string) bool {
	role := h.getUserRole(userID)
	return role == "admin"
}

func (h *AdminHandler) getUserRole(userID string) string {
	url := fmt.Sprintf("%s/rest/v1/user_roles?user_id=eq.%s&select=role", h.SupabaseURL, userID)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", h.SupabaseServiceKey)
	req.Header.Set("Authorization", "Bearer "+h.SupabaseServiceKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "user"
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var roles []map[string]interface{}
	json.Unmarshal(body, &roles)

	if len(roles) > 0 {
		if role, ok := roles[0]["role"].(string); ok {
			return role
		}
	}

	return "user"
}
