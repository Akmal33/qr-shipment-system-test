import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { barcodeApi } from '../../services/api';
import { BarcodeRequest, BarcodeResponse } from '../../types';

const BarcodeGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'item',
    format: 'CODE128',
    width: 200,
    height: 100,
  });
  const [generatedBarcode, setGeneratedBarcode] = useState<BarcodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateBarcode = async () => {
    if (!formData.itemId) {
      setError('Please enter an Item ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: BarcodeRequest = {
        itemId: formData.itemId,
        type: formData.type as 'item' | 'user' | 'shipment',
        format: formData.format as 'CODE128' | 'CODE39' | 'QR',
        width: formData.width,
        height: formData.height,
      };

      // Mock response for demonstration
      const mockResponse: BarcodeResponse = {
        barcodeId: `BC-${Date.now()}`,
        itemId: formData.itemId,
        barcodeData: `${formData.itemId}_${Date.now()}`,
        imageUrl: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
        format: formData.format,
        createdAt: new Date().toISOString(),
      };

      setGeneratedBarcode(mockResponse);
    } catch (err) {
      setError('Failed to generate barcode');
      console.error('Barcode generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedBarcode) {
      // Create download link
      const link = document.createElement('a');
      link.href = generatedBarcode.imageUrl;
      link.download = `barcode_${generatedBarcode.itemId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (generatedBarcode) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Barcode - ${generatedBarcode.itemId}</title></head>
            <body style="text-align: center; padding: 20px;">
              <h2>Item ID: ${generatedBarcode.itemId}</h2>
              <img src="${generatedBarcode.imageUrl}" alt="Barcode" style="max-width: 100%;" />
              <p>Barcode Data: ${generatedBarcode.barcodeData}</p>
              <p>Format: ${generatedBarcode.format}</p>
              <p>Generated: ${new Date(generatedBarcode.createdAt).toLocaleString()}</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Barcode Generator
      </Typography>

      <Grid container spacing={3}>
        {/* Barcode Generation Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate New Barcode
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item ID"
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  placeholder="e.g., ITM-2024-001"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="item">Item</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="shipment">Shipment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={formData.format}
                    label="Format"
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  >
                    <MenuItem value="CODE128">Code 128</MenuItem>
                    <MenuItem value="CODE39">Code 39</MenuItem>
                    <MenuItem value="QR">QR Code</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Width (px)"
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                  inputProps={{ min: 100, max: 500 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (px)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  inputProps={{ min: 50, max: 300 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <QrCodeIcon />}
                  onClick={handleGenerateBarcode}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Barcode'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Generated Barcode Display */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generated Barcode
            </Typography>

            {generatedBarcode ? (
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {generatedBarcode.itemId}
                  </Typography>
                  
                  {/* Barcode Preview */}
                  <Box
                    sx={{
                      p: 2,
                      border: '2px dashed #ccc',
                      borderRadius: 1,
                      mb: 2,
                      minHeight: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    {/* Mock barcode visualization */}
                    <Box
                      sx={{
                        width: formData.width,
                        height: formData.height,
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        textAlign: 'center',
                        backgroundImage: formData.format === 'QR' 
                          ? 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+")' 
                          : 'repeating-linear-gradient(90deg, black 0px, black 2px, white 2px, white 4px)',
                      }}
                    >
                      {formData.format === 'QR' ? (
                        <Typography variant="caption" sx={{ color: 'black' }}>
                          QR CODE
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'transparent' }}>
                          {generatedBarcode.itemId}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Format: {generatedBarcode.format}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Data: {generatedBarcode.barcodeData}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Generated: {new Date(generatedBarcode.createdAt).toLocaleString()}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                    >
                      Print
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  color: 'text.secondary',
                }}
              >
                <QrCodeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1">
                  Generate a barcode to see the preview here
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Barcode Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Barcode Format Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Code 128
                    </Typography>
                    <Typography variant="body2">
                      • High-density linear barcode
                      • Supports alphanumeric characters
                      • Widely used in shipping and inventory
                      • Good for item identification
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Code 39
                    </Typography>
                    <Typography variant="body2">
                      • Variable length barcode
                      • Supports uppercase letters and numbers
                      • Self-checking code
                      • Used in automotive and healthcare
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      QR Code
                    </Typography>
                    <Typography variant="body2">
                      • 2D matrix barcode
                      • High data capacity
                      • Error correction capability
                      • Mobile-friendly scanning
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BarcodeGenerator;