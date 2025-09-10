package database

import (
	"fmt"
	"log"

	"github.com/elastic/go-elasticsearch/v8"
)

// ElasticsearchClient represents an Elasticsearch connection
type ElasticsearchClient struct {
	Client *elasticsearch.Client
}

// ConnectElasticsearch establishes a connection to Elasticsearch
func ConnectElasticsearch(url string) (*ElasticsearchClient, error) {
	cfg := elasticsearch.Config{
		Addresses: []string{url},
	}

	client, err := elasticsearch.NewClient(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create Elasticsearch client: %w", err)
	}

	// Test the connection
	res, err := client.Info()
	if err != nil {
		return nil, fmt.Errorf("failed to get Elasticsearch info: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("Elasticsearch connection error: %s", res.Status())
	}

	log.Printf("Connected to Elasticsearch at: %s", url)

	return &ElasticsearchClient{
		Client: client,
	}, nil
}

// Index constants for Elasticsearch
const (
	InventoryAnalyticsIndex = "warehouse-inventory-analytics"
	ShipmentAnalyticsIndex  = "warehouse-shipment-analytics"
	ProfitAnalyticsIndex    = "warehouse-profit-analytics"
	ScanLogsIndex          = "warehouse-scan-logs"
)