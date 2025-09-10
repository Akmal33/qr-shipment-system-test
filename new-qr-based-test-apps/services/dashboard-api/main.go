package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Printf("Warning: Could not load .env file: %v", err)
	}

	// Initialize configuration
	config := LoadConfig()

	// Initialize logger
	logger, err := NewLogger(config.LogLevel, config.LogFormat)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Close()

	// Initialize database connections
	mongoDB, err := ConnectMongoDB(config.MongoURI, config.MongoDatabase)
	if err != nil {
		logger.Fatal("Failed to connect to MongoDB", zap.Error(err))
	}
	defer mongoDB.Close()

	elasticsearch, err := ConnectElasticsearch(config.ElasticsearchURL)
	if err != nil {
		logger.Fatal("Failed to connect to Elasticsearch", zap.Error(err))
	}

	// Initialize Kafka service
	kafkaService := NewKafkaService(strings.Split(config.KafkaBrokers, ","))
	defer kafkaService.Close()

	// Initialize services
	services := &Services{
		MongoDB:       mongoDB,
		Elasticsearch: elasticsearch,
		Kafka:         kafkaService,
		Logger:        logger,
		JWTService:    NewJWTService(config.JWTSecret, "warehouse-dashboard"),
	}

	// Initialize handlers
	handlers := NewHandlers(services)

	// Setup Gin router
	if config.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}
	
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:8080"}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(corsConfig))

	// Setup routes
	setupRoutes(router, handlers)

	// Start server
	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", config.Port),
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	logger.Info("Dashboard API server started", zap.String("port", config.Port))

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited")
}

// Config holds application configuration
type Config struct {
	Port             string
	MongoURI         string
	MongoDatabase    string
	ElasticsearchURL string
	KafkaBrokers     string
	JWTSecret        string
	LogLevel         string
	LogFormat        string
	GinMode          string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		Port:             getEnv("DASHBOARD_API_PORT", "8001"),
		MongoURI:         getEnv("MONGODB_URI", "mongodb://admin:warehouse123@localhost:27017/warehouse_db?authSource=admin"),
		MongoDatabase:    getEnv("MONGODB_DATABASE", "warehouse_db"),
		ElasticsearchURL: getEnv("ELASTICSEARCH_URL", "http://localhost:9200"),
		KafkaBrokers:     getEnv("KAFKA_BROKERS", "localhost:9092"),
		JWTSecret:        getEnv("JWT_SECRET", "warehouse-super-secret-jwt-key-2024"),
		LogLevel:         getEnv("LOG_LEVEL", "info"),
		LogFormat:        getEnv("LOG_FORMAT", "json"),
		GinMode:          getEnv("GIN_MODE", "debug"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}