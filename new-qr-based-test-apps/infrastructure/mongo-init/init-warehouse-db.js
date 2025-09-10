// MongoDB initialization script for warehouse management system

// Switch to warehouse database
use('warehouse_db');

// Create collections with validation schemas
db.createCollection('items', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["itemId", "name", "category", "barcode", "costPrice", "sellingPrice"],
         properties: {
            itemId: {
               bsonType: "string",
               pattern: "^ITM-[0-9]{4}-[0-9]{3}$",
               description: "must be a string matching ITM-YYYY-XXX pattern"
            },
            name: {
               bsonType: "string",
               minLength: 2,
               maxLength: 100,
               description: "must be a string between 2-100 characters"
            },
            category: {
               bsonType: "string",
               enum: ["Electronics", "Clothing", "Food", "Books", "Tools", "Other"],
               description: "must be one of the predefined categories"
            },
            barcode: {
               bsonType: "string",
               description: "must be a unique barcode string"
            },
            costPrice: {
               bsonType: "number",
               minimum: 0,
               description: "must be a positive number"
            },
            sellingPrice: {
               bsonType: "number",
               minimum: 0,
               description: "must be a positive number"
            },
            stockLevel: {
               bsonType: "int",
               minimum: 0,
               description: "must be a non-negative integer"
            },
            status: {
               bsonType: "string",
               enum: ["active", "inactive", "discontinued"],
               description: "must be one of the valid statuses"
            }
         }
      }
   }
});

db.createCollection('shipments', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["shipmentId", "items", "destination", "status"],
         properties: {
            shipmentId: {
               bsonType: "string",
               pattern: "^SHP-[0-9]{4}-[0-9]{3}$",
               description: "must be a string matching SHP-YYYY-XXX pattern"
            },
            items: {
               bsonType: "array",
               minItems: 1,
               items: {
                  bsonType: "string"
               },
               description: "must be an array of item IDs"
            },
            destination: {
               bsonType: "string",
               minLength: 2,
               description: "must be a valid destination"
            },
            status: {
               bsonType: "string",
               enum: ["pending", "in_transit", "delivered", "delayed", "cancelled"],
               description: "must be one of the valid statuses"
            }
         }
      }
   }
});

db.createCollection('users', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["userId", "username", "email", "role"],
         properties: {
            userId: {
               bsonType: "string",
               pattern: "^USR-[0-9]{4}-[0-9]{3}$",
               description: "must be a string matching USR-YYYY-XXX pattern"
            },
            username: {
               bsonType: "string",
               minLength: 3,
               maxLength: 30,
               description: "must be a string between 3-30 characters"
            },
            email: {
               bsonType: "string",
               pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
               description: "must be a valid email address"
            },
            role: {
               bsonType: "string",
               enum: ["admin", "manager", "warehouse_operator", "scanner_user"],
               description: "must be one of the valid roles"
            }
         }
      }
   }
});

db.createCollection('scan_logs');

// Create indexes for performance
db.items.createIndex({ "itemId": 1 }, { unique: true });
db.items.createIndex({ "barcode": 1 }, { unique: true });
db.items.createIndex({ "category": 1 });
db.items.createIndex({ "status": 1 });
db.items.createIndex({ "stockLevel": 1 });

db.shipments.createIndex({ "shipmentId": 1 }, { unique: true });
db.shipments.createIndex({ "status": 1 });
db.shipments.createIndex({ "destination": 1 });
db.shipments.createIndex({ "estimatedDelivery": 1 });

db.users.createIndex({ "userId": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.scan_logs.createIndex({ "timestamp": 1 });
db.scan_logs.createIndex({ "userId": 1 });
db.scan_logs.createIndex({ "itemId": 1 });
db.scan_logs.createIndex({ "result": 1 });

// Insert sample data
print("Inserting sample data...");

// Sample items
db.items.insertMany([
   {
      "itemId": "ITM-2024-001",
      "name": "Wireless Bluetooth Headphones",
      "category": "Electronics",
      "barcode": "1234567890123",
      "costPrice": 50.00,
      "sellingPrice": 89.99,
      "profitMargin": 44.45,
      "stockLevel": 150,
      "warehouseLocation": "A1-B2-C3",
      "status": "active",
      "createdAt": new Date(),
      "updatedAt": new Date()
   },
   {
      "itemId": "ITM-2024-002",
      "name": "Cotton T-Shirt",
      "category": "Clothing",
      "barcode": "2345678901234",
      "costPrice": 12.00,
      "sellingPrice": 24.99,
      "profitMargin": 51.98,
      "stockLevel": 300,
      "warehouseLocation": "B1-A2-D1",
      "status": "active",
      "createdAt": new Date(),
      "updatedAt": new Date()
   },
   {
      "itemId": "ITM-2024-003",
      "name": "Stainless Steel Water Bottle",
      "category": "Other",
      "barcode": "3456789012345",
      "costPrice": 8.50,
      "sellingPrice": 19.99,
      "profitMargin": 57.48,
      "stockLevel": 200,
      "warehouseLocation": "C1-B1-A3",
      "status": "active",
      "createdAt": new Date(),
      "updatedAt": new Date()
   }
]);

// Sample users
db.users.insertMany([
   {
      "userId": "USR-2024-001",
      "username": "admin",
      "email": "admin@warehouse.com",
      "role": "admin",
      "accessLevel": "level_5",
      "barcode": "QR_ADMIN_001",
      "isActive": true,
      "createdAt": new Date(),
      "lastScan": new Date()
   },
   {
      "userId": "USR-2024-002",
      "username": "john.doe",
      "email": "john@warehouse.com",
      "role": "warehouse_operator",
      "accessLevel": "level_2",
      "barcode": "QR_USER_002",
      "isActive": true,
      "createdAt": new Date(),
      "lastScan": new Date()
   },
   {
      "userId": "USR-2024-003",
      "username": "jane.smith",
      "email": "jane@warehouse.com",
      "role": "manager",
      "accessLevel": "level_4",
      "barcode": "QR_USER_003",
      "isActive": true,
      "createdAt": new Date(),
      "lastScan": new Date()
   }
]);

// Sample shipments
db.shipments.insertMany([
   {
      "shipmentId": "SHP-2024-001",
      "items": ["ITM-2024-001", "ITM-2024-002"],
      "destination": "Jakarta",
      "status": "in_transit",
      "estimatedDelivery": new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      "actualDelivery": null,
      "remainingTime": "4 days 12 hours",
      "trackingNumber": "TRK123456789",
      "createdAt": new Date(),
      "updatedAt": new Date()
   },
   {
      "shipmentId": "SHP-2024-002",
      "items": ["ITM-2024-003"],
      "destination": "Surabaya",
      "status": "pending",
      "estimatedDelivery": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      "actualDelivery": null,
      "remainingTime": "7 days",
      "trackingNumber": "TRK987654321",
      "createdAt": new Date(),
      "updatedAt": new Date()
   }
]);

print("Database initialization completed successfully!");
print("Created collections: items, shipments, users, scan_logs");
print("Inserted sample data for testing purposes");