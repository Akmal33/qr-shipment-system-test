import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/scanner_provider.dart';

class ScanResultDialog extends StatelessWidget {
  const ScanResultDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ScannerProvider>(
      builder: (context, scannerProvider, child) {
        final validation = scannerProvider.lastValidation;
        final isValid = validation?.isValid ?? false;
        
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Icon(
                isValid ? Icons.check_circle : Icons.error,
                color: isValid ? Colors.green : Colors.red,
                size: 28,
              ),
              const SizedBox(width: 8),
              Text(
                isValid ? 'Valid Item' : 'Invalid Item',
                style: TextStyle(
                  color: isValid ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (validation?.message != null) ...[
                Text(
                  validation!.message,
                  style: const TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 16),
              ],
              
              if (validation?.itemInfo != null) ...[
                const Text(
                  'Item Details:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 8),
                _buildItemDetail('Item ID', validation!.itemInfo!.itemId),
                _buildItemDetail('Name', validation.itemInfo!.name),
                _buildItemDetail('Category', validation.itemInfo!.category),
                _buildItemDetail('Price', '\$${validation.itemInfo!.sellingPrice.toStringAsFixed(2)}'),
                _buildItemDetail('Stock', '${validation.itemInfo!.stockLevel} units'),
                _buildItemDetail('Location', validation.itemInfo!.warehouseLocation),
                _buildItemDetail('Status', validation.itemInfo!.status.toUpperCase()),
              ],
              
              if (scannerProvider.lastScannedCode != null) ...[
                const SizedBox(height: 16),
                const Text(
                  'Scanned Code:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  scannerProvider.lastScannedCode!,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ],
              
              if (!scannerProvider.isConnected)
                Container(
                  margin: const EdgeInsets.only(top: 16),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.orange[200]!),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.cloud_off, 
                        color: Colors.orange[700], 
                        size: 16
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Validated offline. Will sync when connected.',
                          style: TextStyle(
                            color: Colors.orange[700],
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Continue Scanning'),
            ),
            if (validation?.itemInfo != null)
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  // Could navigate to item details page
                },
                child: const Text('View Details'),
              ),
          ],
        );
      },
    );
  }

  Widget _buildItemDetail(String label, String value) {
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