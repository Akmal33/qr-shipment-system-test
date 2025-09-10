package utils

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

// GenerateID generates a new ID in the specified format
func GenerateID(prefix string) string {
	year := time.Now().Year()
	
	// Generate random 3-digit number
	max := big.NewInt(999)
	n, _ := rand.Int(rand.Reader, max)
	
	return fmt.Sprintf("%s-%d-%03d", prefix, year, n.Int64()+1)
}

// GenerateItemID generates a new item ID
func GenerateItemID() string {
	return GenerateID("ITM")
}

// GenerateShipmentID generates a new shipment ID
func GenerateShipmentID() string {
	return GenerateID("SHP")
}

// GenerateUserID generates a new user ID
func GenerateUserID() string {
	return GenerateID("USR")
}

// GenerateScanID generates a new scan ID
func GenerateScanID() string {
	return GenerateID("SCN")
}

// GenerateBarcode generates a barcode string
func GenerateBarcode(itemID string) string {
	// Remove dashes and prefix for barcode
	cleaned := strings.ReplaceAll(itemID, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "ITM", "")
	
	// Pad to ensure consistent length
	for len(cleaned) < 10 {
		cleaned = "0" + cleaned
	}
	
	return cleaned
}

// ValidateEmail validates an email address
func ValidateEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// ValidateItemID validates an item ID format
func ValidateItemID(itemID string) bool {
	itemIDRegex := regexp.MustCompile(`^ITM-[0-9]{4}-[0-9]{3}$`)
	return itemIDRegex.MatchString(itemID)
}

// ValidateShipmentID validates a shipment ID format
func ValidateShipmentID(shipmentID string) bool {
	shipmentIDRegex := regexp.MustCompile(`^SHP-[0-9]{4}-[0-9]{3}$`)
	return shipmentIDRegex.MatchString(shipmentID)
}

// ValidateUserID validates a user ID format
func ValidateUserID(userID string) bool {
	userIDRegex := regexp.MustCompile(`^USR-[0-9]{4}-[0-9]{3}$`)
	return userIDRegex.MatchString(userID)
}

// GenerateTrackingNumber generates a tracking number
func GenerateTrackingNumber() string {
	return fmt.Sprintf("TRK%s", strings.ReplaceAll(uuid.New().String(), "-", "")[:12])
}

// CalculateDeliveryTime calculates delivery time based on destination
func CalculateDeliveryTime(destination string) time.Time {
	// Simple logic - in real implementation this would be more sophisticated
	destinations := map[string]int{
		"Jakarta":   3,
		"Surabaya":  2,
		"Bandung":   1,
		"Medan":     5,
		"Semarang":  2,
		"Makassar":  4,
		"Palembang": 3,
		"Yogyakarta": 2,
	}
	
	days, exists := destinations[destination]
	if !exists {
		days = 7 // Default to 7 days for unknown destinations
	}
	
	return time.Now().Add(time.Duration(days) * 24 * time.Hour)
}

// FormatRemainingTime formats remaining time in a readable format
func FormatRemainingTime(targetTime time.Time) string {
	remaining := time.Until(targetTime)
	
	if remaining <= 0 {
		return "Overdue"
	}
	
	days := int(remaining.Hours() / 24)
	hours := int(remaining.Hours()) % 24
	
	if days > 0 {
		return fmt.Sprintf("%d days %d hours", days, hours)
	}
	
	return fmt.Sprintf("%d hours", hours)
}

// Contains checks if a slice contains a specific element
func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// RemoveFromSlice removes an element from a slice
func RemoveFromSlice(slice []string, item string) []string {
	result := make([]string, 0)
	for _, s := range slice {
		if s != item {
			result = append(result, s)
		}
	}
	return result
}

// PaginationParams represents pagination parameters
type PaginationParams struct {
	Page     int `form:"page" json:"page"`
	PageSize int `form:"page_size" json:"page_size"`
	SortBy   string `form:"sort_by" json:"sort_by"`
	SortOrder string `form:"sort_order" json:"sort_order"`
}

// GetOffset calculates the offset for pagination
func (p *PaginationParams) GetOffset() int {
	if p.Page <= 0 {
		p.Page = 1
	}
	return (p.Page - 1) * p.GetPageSize()
}

// GetPageSize returns the page size with default
func (p *PaginationParams) GetPageSize() int {
	if p.PageSize <= 0 || p.PageSize > 100 {
		return 20 // Default page size
	}
	return p.PageSize
}

// GetSortOrder returns normalized sort order
func (p *PaginationParams) GetSortOrder() int {
	if strings.ToLower(p.SortOrder) == "desc" {
		return -1
	}
	return 1
}