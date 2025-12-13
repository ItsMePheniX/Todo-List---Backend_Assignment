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

type AuthHandler struct {
	SupabaseURL string
	SupabaseKey string
}

func NewAuthHandler(supabaseURL, supabaseKey string) *AuthHandler {
	return &AuthHandler{
		SupabaseURL: supabaseURL,
		SupabaseKey: supabaseKey,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "Register Request"
// @Success 201 {object} models.Response
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// Call Supabase Auth API
	authURL := fmt.Sprintf("%s/auth/v1/signup", h.SupabaseURL)

	payload := map[string]interface{}{
		"email":    req.Email,
		"password": req.Password,
		"data": map[string]string{
			"full_name": req.FullName,
		},
	}

	jsonData, _ := json.Marshal(payload)

	httpReq, err := http.NewRequest("POST", authURL, bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to create request",
		})
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("apikey", h.SupabaseKey)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to register user",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		var errorResp map[string]interface{}
		json.Unmarshal(body, &errorResp)
		c.JSON(resp.StatusCode, models.ErrorResponse{
			Success: false,
			Error:   fmt.Sprintf("%v", errorResp["msg"]),
		})
		return
	}

	var authResp map[string]interface{}
	json.Unmarshal(body, &authResp)

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "User registered successfully",
		Data:    authResp,
	})
}

// Login godoc
// @Summary Login user
// @Description Login with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login Request"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.ErrorResponse
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// Call Supabase Auth API
	authURL := fmt.Sprintf("%s/auth/v1/token?grant_type=password", h.SupabaseURL)

	payload := map[string]string{
		"email":    req.Email,
		"password": req.Password,
	}

	jsonData, _ := json.Marshal(payload)

	httpReq, err := http.NewRequest("POST", authURL, bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to create request",
		})
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("apikey", h.SupabaseKey)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error:   "Failed to login",
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		var errorResp map[string]interface{}
		json.Unmarshal(body, &errorResp)
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error:   "Invalid credentials",
		})
		return
	}

	var authResp map[string]interface{}
	json.Unmarshal(body, &authResp)

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Login successful",
		Data:    authResp,
	})
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user's profile
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response
// @Failure 401 {object} models.ErrorResponse
// @Router /api/v1/auth/profile [get]
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	email, _ := c.Get("email")

	// Get user role from database
	role, err := h.getUserRole(userID.(string))
	if err != nil {
		role = "user" // Default role
	}

	user := models.User{
		ID:    userID.(string),
		Email: email.(string),
		Role:  role,
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    user,
	})
}

func (h *AuthHandler) getUserRole(userID string) (string, error) {
	// Query Supabase to get user role
	url := fmt.Sprintf("%s/rest/v1/user_roles?user_id=eq.%s&select=role", h.SupabaseURL, userID)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", h.SupabaseKey)
	req.Header.Set("Authorization", "Bearer "+h.SupabaseKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var roles []map[string]interface{}
	json.Unmarshal(body, &roles)

	if len(roles) > 0 {
		if role, ok := roles[0]["role"].(string); ok {
			return role, nil
		}
	}

	return "user", nil
}
