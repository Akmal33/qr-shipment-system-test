package kafka

import (
	"context"
	"fmt"
	"log"

	"github.com/segmentio/kafka-go"
)

// Producer represents a Kafka producer
type Producer struct {
	writer *kafka.Writer
}

// NewProducer creates a new Kafka producer
func NewProducer(brokers []string, topic string) *Producer {
	writer := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	}

	return &Producer{
		writer: writer,
	}
}

// SendMessage sends a message to Kafka
func (p *Producer) SendMessage(ctx context.Context, key, value []byte) error {
	message := kafka.Message{
		Key:   key,
		Value: value,
	}

	if err := p.writer.WriteMessages(ctx, message); err != nil {
		return fmt.Errorf("failed to send message to Kafka: %w", err)
	}

	return nil
}

// Close closes the producer
func (p *Producer) Close() error {
	return p.writer.Close()
}

// Consumer represents a Kafka consumer
type Consumer struct {
	reader *kafka.Reader
}

// NewConsumer creates a new Kafka consumer
func NewConsumer(brokers []string, topic, groupID string) *Consumer {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  brokers,
		Topic:    topic,
		GroupID:  groupID,
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})

	return &Consumer{
		reader: reader,
	}
}

// ReadMessage reads a message from Kafka
func (c *Consumer) ReadMessage(ctx context.Context) (kafka.Message, error) {
	message, err := c.reader.ReadMessage(ctx)
	if err != nil {
		return kafka.Message{}, fmt.Errorf("failed to read message from Kafka: %w", err)
	}

	return message, nil
}

// CommitMessages commits messages
func (c *Consumer) CommitMessages(ctx context.Context, msgs ...kafka.Message) error {
	return c.reader.CommitMessages(ctx, msgs...)
}

// Close closes the consumer
func (c *Consumer) Close() error {
	return c.reader.Close()
}

// KafkaService manages multiple producers and consumers
type KafkaService struct {
	brokers   []string
	producers map[string]*Producer
	consumers map[string]*Consumer
}

// NewKafkaService creates a new Kafka service
func NewKafkaService(brokers []string) *KafkaService {
	return &KafkaService{
		brokers:   brokers,
		producers: make(map[string]*Producer),
		consumers: make(map[string]*Consumer),
	}
}

// GetProducer gets or creates a producer for a topic
func (k *KafkaService) GetProducer(topic string) *Producer {
	if producer, exists := k.producers[topic]; exists {
		return producer
	}

	producer := NewProducer(k.brokers, topic)
	k.producers[topic] = producer
	log.Printf("Created Kafka producer for topic: %s", topic)
	return producer
}

// GetConsumer gets or creates a consumer for a topic
func (k *KafkaService) GetConsumer(topic, groupID string) *Consumer {
	key := fmt.Sprintf("%s-%s", topic, groupID)
	if consumer, exists := k.consumers[key]; exists {
		return consumer
	}

	consumer := NewConsumer(k.brokers, topic, groupID)
	k.consumers[key] = consumer
	log.Printf("Created Kafka consumer for topic: %s, group: %s", topic, groupID)
	return consumer
}

// Close closes all producers and consumers
func (k *KafkaService) Close() error {
	for topic, producer := range k.producers {
		if err := producer.Close(); err != nil {
			log.Printf("Error closing producer for topic %s: %v", topic, err)
		}
	}

	for key, consumer := range k.consumers {
		if err := consumer.Close(); err != nil {
			log.Printf("Error closing consumer %s: %v", key, err)
		}
	}

	return nil
}