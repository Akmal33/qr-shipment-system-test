class ScanResult {
  final String scanId;
  final String userId;
  final String? itemId;
  final String scanType;
  final String result;
  final String location;
  final String deviceId;
  final DateTime timestamp;
  final String? errorMsg;
  final ItemInfo? itemInfo;

  ScanResult({
    required this.scanId,
    required this.userId,
    this.itemId,
    required this.scanType,
    required this.result,
    required this.location,
    required this.deviceId,
    required this.timestamp,
    this.errorMsg,
    this.itemInfo,
  });

  factory ScanResult.fromJson(Map<String, dynamic> json) {
    return ScanResult(
      scanId: json['scanId'] as String,
      userId: json['userId'] as String,
      itemId: json['itemId'] as String?,
      scanType: json['scanType'] as String,
      result: json['result'] as String,
      location: json['location'] as String,
      deviceId: json['deviceId'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      errorMsg: json['errorMsg'] as String?,
      itemInfo: json['itemInfo'] != null
          ? ItemInfo.fromJson(json['itemInfo'] as Map<String, dynamic>)
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'scanId': scanId,
      'userId': userId,
      'itemId': itemId,
      'scanType': scanType,
      'result': result,
      'location': location,
      'deviceId': deviceId,
      'timestamp': timestamp.toIso8601String(),
      'errorMsg': errorMsg,
      'itemInfo': itemInfo?.toJson(),
    };
  }
}

class ItemInfo {
  final String itemId;
  final String name;
  final String category;
  final double sellingPrice;
  final int stockLevel;
  final String warehouseLocation;
  final String status;

  ItemInfo({
    required this.itemId,
    required this.name,
    required this.category,
    required this.sellingPrice,
    required this.stockLevel,
    required this.warehouseLocation,
    required this.status,
  });

  factory ItemInfo.fromJson(Map<String, dynamic> json) {
    return ItemInfo(
      itemId: json['itemId'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      sellingPrice: (json['sellingPrice'] as num).toDouble(),
      stockLevel: json['stockLevel'] as int,
      warehouseLocation: json['warehouseLocation'] as String,
      status: json['status'] as String,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'itemId': itemId,
      'name': name,
      'category': category,
      'sellingPrice': sellingPrice,
      'stockLevel': stockLevel,
      'warehouseLocation': warehouseLocation,
      'status': status,
    };
  }
}

class User {
  final String userId;
  final String username;
  final String email;
  final String role;
  final String accessLevel;
  final bool isActive;

  User({
    required this.userId,
    required this.username,
    required this.email,
    required this.role,
    required this.accessLevel,
    required this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userId'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      accessLevel: json['accessLevel'] as String,
      isActive: json['isActive'] as bool,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'email': email,
      'role': role,
      'accessLevel': accessLevel,
      'isActive': isActive,
    };
  }
}

class ScanRequest {
  final String barcode;
  final String scanType;
  final String location;
  final String deviceId;

  ScanRequest({
    required this.barcode,
    required this.scanType,
    required this.location,
    required this.deviceId,
  });

  factory ScanRequest.fromJson(Map<String, dynamic> json) {
    return ScanRequest(
      barcode: json['barcode'] as String,
      scanType: json['scanType'] as String,
      location: json['location'] as String,
      deviceId: json['deviceId'] as String,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'barcode': barcode,
      'scanType': scanType,
      'location': location,
      'deviceId': deviceId,
    };
  }
}

class ValidationResponse {
  final bool isValid;
  final String message;
  final ItemInfo? itemInfo;
  final User? userInfo;

  ValidationResponse({
    required this.isValid,
    required this.message,
    this.itemInfo,
    this.userInfo,
  });

  factory ValidationResponse.fromJson(Map<String, dynamic> json) {
    return ValidationResponse(
      isValid: json['isValid'] as bool,
      message: json['message'] as String,
      itemInfo: json['itemInfo'] != null
          ? ItemInfo.fromJson(json['itemInfo'] as Map<String, dynamic>)
          : null,
      userInfo: json['userInfo'] != null
          ? User.fromJson(json['userInfo'] as Map<String, dynamic>)
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'isValid': isValid,
      'message': message,
      'itemInfo': itemInfo?.toJson(),
      'userInfo': userInfo?.toJson(),
    };
  }
}