import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/scan_result.dart';

class StorageService {
  static const String _scanHistoryKey = 'scan_history';
  static const String _unsyncedScansKey = 'unsynced_scans';

  // Save scan result to local storage
  Future<void> saveScanResult(ScanResult scanResult) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Get existing history
      final existingHistory = await getScanHistory();
      
      // Add new scan to the beginning
      existingHistory.insert(0, scanResult);
      
      // Keep only last 100 scans
      if (existingHistory.length > 100) {
        existingHistory.removeRange(100, existingHistory.length);
      }
      
      // Save back to storage
      final jsonList = existingHistory.map((scan) => scan.toJson()).toList();
      await prefs.setString(_scanHistoryKey, json.encode(jsonList));
      
    } catch (e) {
      throw Exception('Failed to save scan result: $e');
    }
  }

  // Get scan history from local storage
  Future<List<ScanResult>> getScanHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_scanHistoryKey);
      
      if (jsonString == null) return [];
      
      final List<dynamic> jsonList = json.decode(jsonString);
      return jsonList.map((json) => ScanResult.fromJson(json)).toList();
      
    } catch (e) {
      return []; // Return empty list if parsing fails
    }
  }

  // Get unsynced scans
  Future<List<ScanResult>> getUnsyncedScans() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_unsyncedScansKey);
      
      if (jsonString == null) return [];
      
      final List<dynamic> jsonList = json.decode(jsonString);
      return jsonList.map((json) => ScanResult.fromJson(json)).toList();
      
    } catch (e) {
      return [];
    }
  }

  // Mark scan as synced
  Future<void> markScanAsSynced(String scanId) async {
    try {
      final unsyncedScans = await getUnsyncedScans();
      unsyncedScans.removeWhere((scan) => scan.scanId == scanId);
      
      final prefs = await SharedPreferences.getInstance();
      final jsonList = unsyncedScans.map((scan) => scan.toJson()).toList();
      await prefs.setString(_unsyncedScansKey, json.encode(jsonList));
      
    } catch (e) {
      throw Exception('Failed to mark scan as synced: $e');
    }
  }

  // Clear all scan history
  Future<void> clearScanHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_scanHistoryKey);
      await prefs.remove(_unsyncedScansKey);
    } catch (e) {
      throw Exception('Failed to clear scan history: $e');
    }
  }

  // Get scan statistics
  Future<Map<String, int>> getScanStatistics() async {
    try {
      final history = await getScanHistory();
      
      int successCount = 0;
      int failureCount = 0;
      int todayCount = 0;
      
      final today = DateTime.now();
      final todayStart = DateTime(today.year, today.month, today.day);
      
      for (final scan in history) {
        if (scan.result == 'success') {
          successCount++;
        } else {
          failureCount++;
        }
        
        if (scan.timestamp.isAfter(todayStart)) {
          todayCount++;
        }
      }
      
      return {
        'total': history.length,
        'success': successCount,
        'failure': failureCount,
        'today': todayCount,
      };
      
    } catch (e) {
      return {
        'total': 0,
        'success': 0,
        'failure': 0,
        'today': 0,
      };
    }
  }
}