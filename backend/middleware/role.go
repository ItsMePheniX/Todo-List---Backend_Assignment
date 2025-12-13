package middleware

import (
	"net/http"

	"backend-assignment/models"

	"github.com/gin-gonic/gin"
)

func RoleMiddleware(supabaseURL, supabaseKey string, requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error:   "User not authenticated",
			})
			c.Abort()
			return
		}

		// Get user role from Supabase
		role, err := getUserRole(supabaseURL, supabaseKey, userID.(string))
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Success: false,
				Error:   "Failed to get user role",
			})
			c.Abort()
			return
		}

		// Store role in context for handlers to use
		c.Set("userRole", role)

		// Check if user has required role
		if requiredRole != "" && role != requiredRole {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Success: false,
				Error:   "Insufficient permissions",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func getUserRole(supabaseURL, supabaseKey, userID string) (string, error) {
	// This is a placeholder - in production, you'd query Supabase
	// For now, we'll make the actual query in the handlers
	// This middleware primarily validates the role exists
	return "", nil
}
