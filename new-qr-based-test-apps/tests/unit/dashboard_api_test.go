package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// Test setup
func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	// Mock handlers for testing
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})
	
	router.GET("/api/v1/inventory/items", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"items": []map[string]interface{}{
				{
					"itemId":      "ITM-2024-001",
					"name":        "Test Item",
					"category":    "Electronics",
					"stockLevel":  100,
					"status":      "active",
				},
			},
			"total": 1,
		})
	})
	
	router.POST("/api/v1/inventory/items", func(c *gin.Context) {
		c.JSON(http.StatusCreated, gin.H{
			"message": "Item created successfully",
			"itemId":  "ITM-2024-002",
		})
	})
	
	return router
}

// Unit Tests
func TestHealthEndpoint(t *testing.T) {
	router := setupTestRouter()
	
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	router.ServeHTTP(w, req)
	
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "healthy", response["status"])
}

func TestGetItems(t *testing.T) {
	router := setupTestRouter()
	
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/inventory/items", nil)
	router.ServeHTTP(w, req)
	
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	items := response["items"].([]interface{})
	assert.Len(t, items, 1)
	
	item := items[0].(map[string]interface{})
	assert.Equal(t, "ITM-2024-001", item["itemId"])
	assert.Equal(t, "Test Item", item["name"])
}

func TestCreateItem(t *testing.T) {
	router := setupTestRouter()
	
	newItem := map[string]interface{}{
		"name":        "New Test Item",
		"category":    "Tools",
		"costPrice":   25.99,
		"sellingPrice": 39.99,
		"stockLevel":  50,
	}
	
	jsonData, _ := json.Marshal(newItem)
	
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/inventory/items", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)
	
	assert.Equal(t, http.StatusCreated, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Item created successfully", response["message"])
	assert.Equal(t, "ITM-2024-002", response["itemId"])
}

// Model validation tests
func TestItemValidation(t *testing.T) {
	tests := []struct {
		name     string
		itemID   string
		expected bool
	}{
		{"Valid Item ID", "ITM-2024-001", true},
		{"Invalid Item ID Format", "INVALID-001", false},
		{"Empty Item ID", "", false},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := validateItemID(tt.itemID)
			assert.Equal(t, tt.expected, isValid)
		})
	}
}

func TestProfitMarginCalculation(t *testing.T) {
	tests := []struct {
		costPrice    float64
		sellingPrice float64
		expected     float64
	}{
		{50.0, 100.0, 50.0},
		{25.0, 50.0, 50.0},
		{10.0, 15.0, 33.33},
	}
	
	for _, tt := range tests {
		margin := calculateProfitMargin(tt.costPrice, tt.sellingPrice)
		assert.InDelta(t, tt.expected, margin, 0.01)
	}
}

// Mock utility functions
func validateItemID(itemID string) bool {
	if itemID == "" {
		return false
	}
	// Simple validation for demo
	return len(itemID) > 5 && itemID[:3] == "ITM"
}

func calculateProfitMargin(costPrice, sellingPrice float64) float64 {
	if sellingPrice == 0 {
		return 0
	}
	return ((sellingPrice - costPrice) / sellingPrice) * 100
}