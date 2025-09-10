import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/scan_result.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  User? _user;
  bool _isLoading = true;
  String? _error;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  AuthProvider() {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token != null) {
        // In a real app, you would validate the token with the server
        // For now, we'll assume it's valid and load user data
        final userData = prefs.getString('user_data');
        if (userData != null) {
          _user = User.fromJson(userData as Map<String, dynamic>);
        }
      }
    } catch (e) {
      _error = 'Failed to check auth status: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String username, String password) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      // For development, use mock login if API is not available
      if (username == 'admin' && password == 'admin') {
        _user = User(
          userId: 'USR-2024-001',
          username: 'admin',
          email: 'admin@warehouse.com',
          role: 'admin',
          accessLevel: 'level_5',
          isActive: true,
        );

        // Store mock user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', 'mock_token_${DateTime.now().millisecondsSinceEpoch}');
        await prefs.setString('user_data', _user!.toJson().toString());
        
        _isLoading = false;
        notifyListeners();
        return true;
      }

      // Try API login
      try {
        _user = await _apiService.login(username, password);
        
        // Store user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', _user!.toJson().toString());
        
        _isLoading = false;
        notifyListeners();
        return true;
      } catch (apiError) {
        // API failed, show error
        _error = 'Invalid credentials or server unavailable';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Login failed: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user_data');
      
      _user = null;
      _error = null;
      notifyListeners();
    } catch (e) {
      _error = 'Logout failed: $e';
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}