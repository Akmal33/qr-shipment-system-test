import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/scanner_provider.dart';
import '../models/scan_result.dart';
import '../utils/storage_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final StorageService _storageService = StorageService();
  Map<String, int> _statistics = {};

  @override
  void initState() {
    super.initState();
    _loadStatistics();
  }

  Future<void> _loadStatistics() async {
    final stats = await _storageService.getScanStatistics();
    setState(() {
      _statistics = stats;
    });
  }

  Future<void> _clearHistory() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear History'),
        content: const Text('Are you sure you want to clear all scan history? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _storageService.clearScanHistory();
      if (mounted) {
        context.read<ScannerProvider>().refreshHistory();
        _loadStatistics();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Scan history cleared')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ScannerProvider>().refreshHistory();
              _loadStatistics();
            },
          ),
          PopupMenuButton(
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'clear',
                child: Row(
                  children: [
                    Icon(Icons.delete, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    const Text('Clear History'),
                  ],
                ),
              ),
            ],
            onSelected: (value) {
              if (value == 'clear') {
                _clearHistory();
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Statistics Cards
          _buildStatisticsSection(),
          
          // History List
          Expanded(
            child: Consumer<ScannerProvider>(
              builder: (context, scannerProvider, child) {
                if (scannerProvider.scanHistory.isEmpty) {
                  return _buildEmptyState();
                }
                
                return _buildHistoryList(scannerProvider.scanHistory);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatisticsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Statistics',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Total Scans',
                  '${_statistics['total'] ?? 0}',
                  Icons.qr_code_scanner,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStatCard(
                  'Success',
                  '${_statistics['success'] ?? 0}',
                  Icons.check_circle,
                  Colors.green,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStatCard(
                  'Failed',
                  '${_statistics['failure'] ?? 0}',
                  Icons.error,
                  Colors.red,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStatCard(
                  'Today',
                  '${_statistics['today'] ?? 0}',
                  Icons.today,
                  Colors.orange,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.history,
            size: 80,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            'No Scan History',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Start scanning items to see your history here',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.of(context).pushReplacementNamed('/scanner');
            },
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Start Scanning'),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryList(List<ScanResult> history) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: history.length,
      itemBuilder: (context, index) {
        final scan = history[index];
        return _buildHistoryItem(scan);
      },
    );
  }

  Widget _buildHistoryItem(ScanResult scan) {
    final isSuccess = scan.result == 'success';
    final timeAgo = _getTimeAgo(scan.timestamp);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isSuccess ? Colors.green[100] : Colors.red[100],
          child: Icon(
            isSuccess ? Icons.check : Icons.error,
            color: isSuccess ? Colors.green : Colors.red,
          ),
        ),
        title: Text(
          scan.itemInfo?.name ?? scan.itemId ?? 'Unknown Item',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (scan.itemInfo != null) ...[
              Text('ID: ${scan.itemInfo!.itemId}'),
              Text('Category: ${scan.itemInfo!.category}'),
            ] else if (scan.errorMsg != null) ...[
              Text(
                scan.errorMsg!,
                style: const TextStyle(color: Colors.red),
              ),
            ],
            Text(
              timeAgo,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Chip(
              label: Text(
                isSuccess ? 'SUCCESS' : 'FAILED',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
              backgroundColor: isSuccess ? Colors.green[100] : Colors.red[100],
              labelStyle: TextStyle(
                color: isSuccess ? Colors.green[800] : Colors.red[800],
              ),
            ),
            if (scan.itemInfo?.sellingPrice != null)
              Text(
                '\$${scan.itemInfo!.sellingPrice.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
          ],
        ),
        onTap: () => _showScanDetails(scan),
      ),
    );
  }

  String _getTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  void _showScanDetails(ScanResult scan) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Scan Details'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('Scan ID', scan.scanId),
            _buildDetailRow('Result', scan.result.toUpperCase()),
            _buildDetailRow('Type', scan.scanType),
            _buildDetailRow('Location', scan.location),
            _buildDetailRow('Device', scan.deviceId),
            _buildDetailRow('Time', scan.timestamp.toString()),
            if (scan.itemInfo != null) ...[
              const Divider(),
              const Text('Item Information:', 
                style: TextStyle(fontWeight: FontWeight.bold)),
              _buildDetailRow('Item ID', scan.itemInfo!.itemId),
              _buildDetailRow('Name', scan.itemInfo!.name),
              _buildDetailRow('Category', scan.itemInfo!.category),
              _buildDetailRow('Price', '\$${scan.itemInfo!.sellingPrice.toStringAsFixed(2)}'),
              _buildDetailRow('Stock', '${scan.itemInfo!.stockLevel} units'),
              _buildDetailRow('Location', scan.itemInfo!.warehouseLocation),
            ],
            if (scan.errorMsg != null) ...[
              const Divider(),
              _buildDetailRow('Error', scan.errorMsg!),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}