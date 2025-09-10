import 'package:json_annotation/json_annotation.dart';

part 'scan_result.g.dart';

@JsonSerializable()
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

  factory ScanResult.fromJson(Map<String, dynamic> json) => 
      _$ScanResultFromJson(json);
  
  Map<String, dynamic> toJson() => _$ScanResultToJson(this);
}

@JsonSerializable()
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

  factory ItemInfo.fromJson(Map<String, dynamic> json) => 
      _$ItemInfoFromJson(json);
  
  Map<String, dynamic> toJson() => _$ItemInfoToJson(this);
}

@JsonSerializable()
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

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

@JsonSerializable()
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

  factory ScanRequest.fromJson(Map<String, dynamic> json) => 
      _$ScanRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$ScanRequestToJson(this);
}

@JsonSerializable()
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

  factory ValidationResponse.fromJson(Map<String, dynamic> json) => 
      _$ValidationResponseFromJson(json);
  
  Map<String, dynamic> toJson() => _$ValidationResponseToJson(this);
}