module barcode-service

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/gin-contrib/cors v1.4.0
	go.mongodb.org/mongo-driver v1.12.1
	github.com/segmentio/kafka-go v0.4.42
	github.com/google/uuid v1.3.1
	go.uber.org/zap v1.25.0
	github.com/joho/godotenv v1.4.0
	github.com/go-playground/validator/v10 v10.15.1
	github.com/boombuler/barcode v1.0.1
	github.com/skip2/go-qrcode v0.0.0-20200617195104-da1b6568686e
)