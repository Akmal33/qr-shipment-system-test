package models

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Item represents an inventory item in the warehouse
type Item struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	ItemID           string             `bson:"itemId" json:"itemId" validate:"required,regex=^ITM-[0-9]{4}-[0-9]{3}$"`
	Name             string             `bson:"name" json:"name" validate:"required,min=2,max=100"`
	Category         string             `bson:"category" json:"category" validate:"required,oneof=Electronics Clothing Food Books Tools Other"`
	Barcode          string             `bson:"barcode" json:"barcode" validate:"required"`
	CostPrice        float64            `bson:"costPrice" json:"costPrice" validate:"required,min=0"`
	SellingPrice     float64            `bson:"sellingPrice" json:"sellingPrice" validate:"required,min=0"`
	ProfitMargin     float64            `bson:"profitMargin" json:"profitMargin"`
	StockLevel       int                `bson:"stockLevel" json:"stockLevel" validate:"min=0"`
	WarehouseLocation string            `bson:"warehouseLocation" json:"warehouseLocation"`
	Status           string             `bson:"status" json:"status" validate:"oneof=active inactive discontinued"`
	CreatedAt        time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt        time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// CalculateProfitMargin calculates the profit margin percentage
func (i *Item) CalculateProfitMargin() {
	if i.SellingPrice > 0 {
		i.ProfitMargin = ((i.SellingPrice - i.CostPrice) / i.SellingPrice) * 100
	}
}

// IsInStock checks if the item is in stock
func (i *Item) IsInStock() bool {
	return i.StockLevel > 0 && i.Status == "active"
}

// Shipment represents a shipment in the system
type Shipment struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	ShipmentID       string             `bson:"shipmentId" json:"shipmentId" validate:"required,regex=^SHP-[0-9]{4}-[0-9]{3}$"`
	Items            []string           `bson:"items" json:"items" validate:"required,min=1"`
	Destination      string             `bson:"destination" json:"destination" validate:"required,min=2"`
	Status           string             `bson:"status" json:"status" validate:"oneof=pending in_transit delivered delayed cancelled"`
	EstimatedDelivery *time.Time        `bson:"estimatedDelivery" json:"estimatedDelivery"`
	ActualDelivery   *time.Time         `bson:"actualDelivery" json:"actualDelivery,omitempty"`
	RemainingTime    string             `bson:"remainingTime" json:"remainingTime"`
	TrackingNumber   string             `bson:"trackingNumber" json:"trackingNumber"`
	CreatedAt        time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt        time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// CalculateRemainingTime calculates the remaining time until delivery
func (s *Shipment) CalculateRemainingTime() {
	if s.EstimatedDelivery != nil && s.Status == "in_transit" {
		remaining := time.Until(*s.EstimatedDelivery)
		if remaining > 0 {
			days := int(remaining.Hours() / 24)
			hours := int(remaining.Hours()) % 24
			s.RemainingTime = fmt.Sprintf("%d days %d hours", days, hours)
		} else {
			s.RemainingTime = "Overdue"
		}
	}
}

// User represents a system user
type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID      string             `bson:"userId" json:"userId" validate:"required,regex=^USR-[0-9]{4}-[0-9]{3}$"`
	Username    string             `bson:"username" json:"username" validate:"required,min=3,max=30"`
	Email       string             `bson:"email" json:"email" validate:"required,email"`
	PasswordHash string            `bson:"passwordHash" json:"-"`
	Role        string             `bson:"role" json:"role" validate:"required,oneof=admin manager warehouse_operator scanner_user"`
	AccessLevel string             `bson:"accessLevel" json:"accessLevel"`
	Barcode     string             `bson:"barcode" json:"barcode"`
	IsActive    bool               `bson:"isActive" json:"isActive"`
	LastScan    *time.Time         `bson:"lastScan" json:"lastScan,omitempty"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// HasPermission checks if user has required permission level
func (u *User) HasPermission(requiredLevel string) bool {
	levels := map[string]int{
		"level_1": 1,
		"level_2": 2,
		"level_3": 3,
		"level_4": 4,
		"level_5": 5,
	}
	
	userLevel := levels[u.AccessLevel]
	reqLevel := levels[requiredLevel]
	
	return userLevel >= reqLevel
}

// ScanLog represents a barcode scan log entry
type ScanLog struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	ScanID    string             `bson:"scanId" json:"scanId" validate:"required"`
	UserID    string             `bson:"userId" json:"userId" validate:"required"`
	ItemID    string             `bson:"itemId" json:"itemId"`
	ScanType  string             `bson:"scanType" json:"scanType" validate:"required,oneof=item_validation user_validation"`
	Result    string             `bson:"result" json:"result" validate:"required,oneof=success failure"`
	Location  string             `bson:"location" json:"location"`
	DeviceID  string             `bson:"deviceId" json:"deviceId"`
	Timestamp time.Time          `bson:"timestamp" json:"timestamp"`
	ErrorMsg  string             `bson:"errorMsg,omitempty" json:"errorMsg,omitempty"`
}

// BarcodeRequest represents a barcode generation request
type BarcodeRequest struct {
	ItemID   string `json:"itemId" validate:"required"`
	Type     string `json:"type" validate:"required,oneof=item user shipment"`
	Format   string `json:"format" validate:"required,oneof=CODE128 CODE39 QR"`
	Width    int    `json:"width,omitempty"`
	Height   int    `json:"height,omitempty"`
}

// BarcodeResponse represents a barcode generation response
type BarcodeResponse struct {
	BarcodeID   string `json:"barcodeId"`
	ItemID      string `json:"itemId"`
	BarcodeData string `json:"barcodeData"`
	ImageURL    string `json:"imageUrl"`
	Format      string `json:"format"`
	CreatedAt   time.Time `json:"createdAt"`
}