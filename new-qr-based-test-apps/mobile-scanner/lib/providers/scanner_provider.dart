import 'package:flutter/foundation.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/scan_result.dart';
import '../services/api_service.dart';
import '../utils/storage_service.dart';

class ScannerProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();
  final AudioPlayer _audioPlayer = AudioPlayer();
  
  bool _isScanning = false;
  String? _lastScannedCode;
  DateTime? _lastScanTime;
  List<ScanResult> _scanHistory = [];
  String? _error;
  bool _isConnected = true;
  ValidationResponse? _lastValidation;

  bool get isScanning => _isScanning;
  String? get lastScannedCode => _lastScannedCode;
  DateTime? get lastScanTime => _lastScanTime;
  List<ScanResult> get scanHistory => _scanHistory;
  String? get error => _error;
  bool get isConnected => _isConnected;
  ValidationResponse? get lastValidation => _lastValidation;

  ScannerProvider() {
    _initializeScanner();
    _loadScanHistory();
    _checkConnectivity();
  }

  Future<void> _initializeScanner() async {
    // Initialize any required services
    await _checkConnectivity();
  }

  Future<void> _checkConnectivity() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    _isConnected = connectivityResult != ConnectivityResult.none;
    notifyListeners();
  }

  Future<void> _loadScanHistory() async {
    try {
      _scanHistory = await _storageService.getScanHistory();
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load scan history: $e';
      notifyListeners();
    }
  }

  Future<void> processScan(String barcode) async {
    if (_isScanning) return; // Prevent double scanning
    
    try {
      _isScanning = true;
      _error = null;
      _lastScannedCode = barcode;
      _lastScanTime = DateTime.now();
      notifyListeners();

      // Get device info
      final deviceInfo = DeviceInfoPlugin();
      String deviceId = 'unknown';
      
      try {
        final androidInfo = await deviceInfo.androidInfo;
        deviceId = androidInfo.id;
      } catch (e) {
        deviceId = 'simulator';
      }

      // Create scan request
      final request = ScanRequest(
        barcode: barcode,
        scanType: 'item_validation',
        location: 'Mobile Scanner',
        deviceId: deviceId,
      );

      ValidationResponse validation;
      
      if (_isConnected) {
        // Try API validation
        try {
          validation = await _apiService.validateScan(request);
        } catch (e) {
          // Fallback to offline validation
          validation = _performOfflineValidation(barcode);
        }
      } else {
        // Offline validation
        validation = _performOfflineValidation(barcode);
      }

      _lastValidation = validation;

      // Create scan result
      final scanResult = ScanResult(
        scanId: 'SCN-${DateTime.now().millisecondsSinceEpoch}',
        userId: 'current_user_id', // Should come from auth provider
        itemId: validation.itemInfo?.itemId,
        scanType: 'item_validation',
        result: validation.isValid ? 'success' : 'failure',
        location: 'Mobile Scanner',
        deviceId: deviceId,
        timestamp: DateTime.now(),
        errorMsg: validation.isValid ? null : validation.message,
        itemInfo: validation.itemInfo,
      );

      // Store scan result locally
      await _storageService.saveScanResult(scanResult);
      _scanHistory.insert(0, scanResult);

      // Play feedback sound
      await _playFeedbackSound(validation.isValid);

      // Sync with server if connected
      if (_isConnected) {
        _syncWithServer();
      }

    } catch (e) {
      _error = 'Scan processing failed: $e';
      await _playFeedbackSound(false);
    } finally {
      _isScanning = false;
      notifyListeners();
      
      // Clear last validation after a delay
      Future.delayed(const Duration(seconds: 3), () {
        _lastValidation = null;
        notifyListeners();
      });
    }
  }

  ValidationResponse _performOfflineValidation(String barcode) {
    // Simple offline validation logic
    // In a real app, you would have cached data or local database
    
    // Mock validation for demo
    final mockItems = [
      ItemInfo(
        itemId: 'ITM-2024-001',
        name: 'Wireless Bluetooth Headphones',
        category: 'Electronics',
        sellingPrice: 89.99,
        stockLevel: 150,
        warehouseLocation: 'A1-B2-C3',
        status: 'active',
      ),
      ItemInfo(
        itemId: 'ITM-2024-002',
        name: 'Cotton T-Shirt',
        category: 'Clothing',
        sellingPrice: 24.99,
        stockLevel: 300,
        warehouseLocation: 'B1-A2-D1',
        status: 'active',
      ),
    ];

    // Simple barcode to item mapping
    if (barcode == '1234567890123') {
      return ValidationResponse(
        isValid: true,
        message: 'Item validated successfully (offline)',
        itemInfo: mockItems[0],
      );
    } else if (barcode == '2345678901234') {
      return ValidationResponse(
        isValid: true,
        message: 'Item validated successfully (offline)',
        itemInfo: mockItems[1],
      );
    } else {
      return ValidationResponse(
        isValid: false,
        message: 'Unknown barcode (offline validation)',
      );
    }
  }

  Future<void> _playFeedbackSound(bool success) async {
    try {
      if (success) {
        // Play success sound
        await _audioPlayer.play(AssetSource('sounds/success.mp3'));
      } else {
        // Play error sound
        await _audioPlayer.play(AssetSource('sounds/error.mp3'));
      }
    } catch (e) {
      // Sound playback failed, ignore
      debugPrint('Sound playback failed: $e');
    }
  }

  Future<void> _syncWithServer() async {
    // Background sync with server
    try {
      final unsyncedScans = await _storageService.getUnsyncedScans();
      for (final scan in unsyncedScans) {
        // Sync scan with server
        // Mark as synced
        await _storageService.markScanAsSynced(scan.scanId);
      }
    } catch (e) {
      debugPrint('Sync failed: $e');
    }
  }

  Future<void> refreshHistory() async {
    try {
      _error = null;
      notifyListeners();

      if (_isConnected) {
        final serverHistory = await _apiService.getScanHistory();
        _scanHistory = serverHistory;
        
        // Save to local storage
        for (final scan in serverHistory) {
          await _storageService.saveScanResult(scan);
        }
      } else {
        await _loadScanHistory();
      }
      
      notifyListeners();
    } catch (e) {
      _error = 'Failed to refresh history: $e';
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }
}