package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims represents the JWT claims
type JWTClaims struct {
	UserID      string `json:"userId"`
	Username    string `json:"username"`
	Role        string `json:"role"`
	AccessLevel string `json:"accessLevel"`
	jwt.RegisteredClaims
}

// JWTService handles JWT operations
type JWTService struct {
	secretKey string
	issuer    string
}

// NewJWTService creates a new JWT service
func NewJWTService(secretKey, issuer string) *JWTService {
	return &JWTService{
		secretKey: secretKey,
		issuer:    issuer,
	}
}

// GenerateToken generates a JWT token for a user
func (j *JWTService) GenerateToken(userID, username, role, accessLevel string, expiration time.Duration) (string, error) {
	claims := &JWTClaims{
		UserID:      userID,
		Username:    username,
		Role:        role,
		AccessLevel: accessLevel,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    j.issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secretKey))
}

// ValidateToken validates a JWT token and returns the claims
func (j *JWTService) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// RefreshToken generates a new token with extended expiration
func (j *JWTService) RefreshToken(tokenString string, newExpiration time.Duration) (string, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return "", fmt.Errorf("invalid token for refresh: %w", err)
	}

	// Generate new token with same user data but new expiration
	return j.GenerateToken(claims.UserID, claims.Username, claims.Role, claims.AccessLevel, newExpiration)
}

// Permission levels
const (
	AccessLevel1 = "level_1" // Basic scanner access
	AccessLevel2 = "level_2" // Warehouse operator
	AccessLevel3 = "level_3" // Supervisor
	AccessLevel4 = "level_4" // Manager
	AccessLevel5 = "level_5" // Admin
)

// Role constants
const (
	RoleAdmin             = "admin"
	RoleManager           = "manager"
	RoleWarehouseOperator = "warehouse_operator"
	RoleScannerUser       = "scanner_user"
)

// HasPermission checks if a user has the required permission level
func HasPermission(userLevel, requiredLevel string) bool {
	levels := map[string]int{
		AccessLevel1: 1,
		AccessLevel2: 2,
		AccessLevel3: 3,
		AccessLevel4: 4,
		AccessLevel5: 5,
	}

	userLevelInt := levels[userLevel]
	requiredLevelInt := levels[requiredLevel]

	return userLevelInt >= requiredLevelInt
}