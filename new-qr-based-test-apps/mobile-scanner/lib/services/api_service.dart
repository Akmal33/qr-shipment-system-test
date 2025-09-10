import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/scan_result.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8003'; // Scanner API
  static const String authBaseUrl = 'http://localhost:8001'; // Dashboard API
  
  static const String scanEndpoint = '/api/v1/scan/validate';
  static const String loginEndpoint = '/api/v1/auth/login';
  static const String historyEndpoint = '/api/v1/scan/logs';

  // Get stored auth token
  Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Store auth token
  Future<void> _storeAuthToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  // Login user
  Future<User?> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$authBaseUrl$loginEndpoint'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await _storeAuthToken(data['token']);
        return User.fromJson(data['user']);
      } else {
        throw Exception('Login failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  // Validate scanned barcode
  Future<ValidationResponse> validateScan(ScanRequest request) async {
    try {
      final token = await _getAuthToken();
      final response = await http.post(
        Uri.parse('$baseUrl$scanEndpoint'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode(request.toJson()),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return ValidationResponse.fromJson(data);
      } else {
        // Return failed validation response
        return ValidationResponse(
          isValid: false,
          message: 'Validation failed: ${response.statusCode}',
        );
      }
    } catch (e) {
      // Return error response
      return ValidationResponse(
        isValid: false,
        message: 'Network error: $e',
      );
    }
  }

  // Get scan history
  Future<List<ScanResult>> getScanHistory({
    int page = 1,
    int pageSize = 50,
  }) async {
    try {
      final token = await _getAuthToken();
      final response = await http.get(
        Uri.parse('$baseUrl$historyEndpoint?page=$page&page_size=$pageSize'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> scans = data['scans'] ?? [];
        return scans.map((scan) => ScanResult.fromJson(scan)).toList();
      } else {
        throw Exception('Failed to fetch history: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('History fetch error: $e');
    }
  }

  // Check API health
  Future<bool> checkHealth() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: {'Content-Type': 'application/json'},
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
}