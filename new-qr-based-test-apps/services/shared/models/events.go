package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// EventMessage represents a generic event message for Kafka
type EventMessage struct {
	EventType string      `json:"eventType"`
	EventID   string      `json:"eventId"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}

// NewEventMessage creates a new event message
func NewEventMessage(eventType string, data interface{}) *EventMessage {
	return &EventMessage{
		EventType: eventType,
		EventID:   uuid.New().String(),
		Timestamp: time.Now(),
		Data:      data,
	}
}

// ToJSON converts the event message to JSON
func (e *EventMessage) ToJSON() ([]byte, error) {
	return json.Marshal(e)
}

// InventoryEvent represents inventory-related events
type InventoryEvent struct {
	ItemID  string                 `json:"itemId"`
	Action  string                 `json:"action"` // create, update, delete
	Changes map[string]interface{} `json:"changes"`
	UserID  string                 `json:"userId"`
}

// ShipmentEvent represents shipment-related events
type ShipmentEvent struct {
	ShipmentID string                 `json:"shipmentId"`
	Action     string                 `json:"action"` // created, updated, status_changed
	Changes    map[string]interface{} `json:"changes"`
	UserID     string                 `json:"userId"`
}

// ScanEvent represents scan-related events
type ScanEvent struct {
	ScanID   string `json:"scanId"`
	UserID   string `json:"userId"`
	ItemID   string `json:"itemId,omitempty"`
	ScanType string `json:"scanType"`
	Result   string `json:"result"`
	Location string `json:"location"`
	DeviceID string `json:"deviceId"`
}

// UserEvent represents user-related events
type UserEvent struct {
	UserID string                 `json:"userId"`
	Action string                 `json:"action"` // login, logout, permission_change
	Changes map[string]interface{} `json:"changes"`
}

// Event type constants
const (
	// Inventory events
	EventItemCreated = "item_created"
	EventItemUpdated = "item_updated"
	EventItemDeleted = "item_deleted"
	EventStockUpdated = "stock_updated"

	// Shipment events
	EventShipmentCreated = "shipment_created"
	EventShipmentUpdated = "shipment_updated"
	EventShipmentStatusChanged = "shipment_status_changed"
	EventShipmentDelivered = "shipment_delivered"

	// Scan events
	EventBarcodeScanned = "barcode_scanned"
	EventValidationSuccess = "validation_success"
	EventValidationFailure = "validation_failure"

	// User events
	EventUserLogin = "user_login"
	EventUserLogout = "user_logout"
	EventUserCreated = "user_created"
	EventPermissionChanged = "permission_changed"
)

// Kafka topic constants
const (
	TopicInventoryEvents = "inventory-events"
	TopicShipmentEvents  = "shipment-events"
	TopicScanEvents      = "scan-events"
	TopicUserEvents      = "user-events"
)