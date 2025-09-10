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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { BarcodeResponse } from '../../types';

const BarcodeGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'item',
    format: 'CODE128',
    width: 200,
    height: 100,
    customData: '',
  });
  const [generatedBarcode, setGeneratedBarcode] = useState<BarcodeResponse | null>(null);
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generateBarcodeData = (itemId: string, type: string): string => {
    const timestamp = Date.now();
    const prefix = type === 'item' ? 'ITM' : type === 'user' ? 'USR' : 'SHP';
    return `${prefix}-${itemId}-${timestamp}`;
  };

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: formData.width,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M',
        margin: 2,
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  };

  const generateBarcode = async (data: string, format: string): Promise<string> => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, data, {
        format: format,
        width: 2,
        height: formData.height,
        displayValue: true,
        fontSize: 14,
        textMargin: 10,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      throw new Error('Failed to generate barcode');
    }
  };

  const handleGenerateBarcode = async () => {
    const dataToEncode = formData.customData || formData.itemId;
    
    if (!dataToEncode) {
      setError('Please enter Item ID or custom data');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const barcodeData = generateBarcodeData(dataToEncode, formData.type);
      let imageUrl: string;

      if (formData.format === 'QR') {
        imageUrl = await generateQRCode(barcodeData);
      } else {
        imageUrl = await generateBarcode(barcodeData, formData.format);
      }

      const response: BarcodeResponse = {
        barcodeId: `BC-${Date.now()}`,
        itemId: dataToEncode,
        barcodeData: barcodeData,
        imageUrl: imageUrl,
        format: formData.format,
        createdAt: new Date().toISOString(),
      };

      setGeneratedBarcode(response);
      setBarcodeImage(imageUrl);
      setSuccess('Barcode generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate barcode');
      console.error('Barcode generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (barcodeImage && generatedBarcode) {
      const link = document.createElement('a');
      link.href = barcodeImage;
      link.download = `${generatedBarcode.format.toLowerCase()}_${generatedBarcode.itemId}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess('Barcode downloaded successfully!');
    }
  };

  const handlePrint = () => {
    if (barcodeImage && generatedBarcode) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Barcode - ${generatedBarcode.itemId}</title>
              <style>
                body { 
                  text-align: center; 
                  padding: 20px; 
                  font-family: Arial, sans-serif;
                }
                .barcode-container {
                  border: 2px solid #ddd;
                  padding: 20px;
                  margin: 20px auto;
                  display: inline-block;
                  background: white;
                }
                img {
                  max-width: 100%;
                  margin: 10px 0;
                }
                .info {
                  margin: 5px 0;
                  color: #333;
                }
              </style>
            </head>
            <body>
              <div class="barcode-container">
                <h2>Item: ${generatedBarcode.itemId}</h2>
                <img src="${barcodeImage}" alt="${generatedBarcode.format} Code" />
                <div class="info">Data: ${generatedBarcode.barcodeData}</div>
                <div class="info">Format: ${generatedBarcode.format}</div>
                <div class="info">Generated: ${new Date(generatedBarcode.createdAt).toLocaleString()}</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleCopyData = async () => {
    if (generatedBarcode) {
      try {
        await navigator.clipboard.writeText(generatedBarcode.barcodeData);
        setSuccess('Barcode data copied to clipboard!');
      } catch (err) {
        setError('Failed to copy to clipboard');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <QrCodeIcon fontSize="large" />
        QR & Barcode Generator
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Generate QR codes and barcodes for items, users, and shipments
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Barcode Generation Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeIcon />
              Generate New Code
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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
                  placeholder="e.g., ITM-2024-001, PRODUCT-12345"
                  helperText="Primary identifier for the item"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custom Data (Optional)"
                  value={formData.customData}
                  onChange={(e) => setFormData({ ...formData, customData: e.target.value })}
                  placeholder="Override with custom data"
                  helperText="If provided, this will be used instead of generated data"
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
                    <MenuItem value="item">📦 Item</MenuItem>
                    <MenuItem value="user">👤 User</MenuItem>
                    <MenuItem value="shipment">🚚 Shipment</MenuItem>
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
                    <MenuItem value="CODE128">📊 Code 128</MenuItem>
                    <MenuItem value="CODE39">📋 Code 39</MenuItem>
                    <MenuItem value="QR">📱 QR Code</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Width (px)"
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 200 })}
                  inputProps={{ min: 100, max: 500 }}
                  helperText="100-500 pixels"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (px)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 100 })}
                  inputProps={{ min: 50, max: 300 }}
                  helperText="50-300 pixels"
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
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Generating...' : `Generate ${formData.format === 'QR' ? 'QR Code' : 'Barcode'}`}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Generated Barcode Display */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🖼️ Generated Code
            </Typography>

            {generatedBarcode && barcodeImage ? (
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={generatedBarcode.format} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }} 
                    />
                    <Chip 
                      label={formData.type} 
                      color="secondary" 
                      size="small" 
                    />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {generatedBarcode.itemId}
                  </Typography>
                  
                  {/* Actual Barcode/QR Code Image */}
                  <Box
                    sx={{
                      p: 3,
                      border: '2px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 3,
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 150,
                    }}
                  >
                    <img 
                      src={barcodeImage} 
                      alt={`${generatedBarcode.format} Code`}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px',
                        imageRendering: 'pixelated' // Ensures crisp barcode lines
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ textAlign: 'left', mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Data:</strong> {generatedBarcode.barcodeData}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Format:</strong> {generatedBarcode.format}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Size:</strong> {formData.width}x{formData.height} px
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Generated:</strong> {new Date(generatedBarcode.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      size="small"
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                      size="small"
                    >
                      Print
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={handleCopyData}
                      size="small"
                    >
                      Copy Data
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
                  borderRadius: 2,
                  color: 'text.secondary',
                  backgroundColor: '#fafafa',
                }}
              >
                <QrCodeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Code Generated
                </Typography>
                <Typography variant="body2">
                  Fill in the form and click "Generate" to create your QR code or barcode
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Barcode Format Information & Features */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📚 Format Information & Features
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      📋 Code 128
                    </Typography>
                    <Typography variant="body2" paragraph>
                      High-density linear barcode symbology that can encode alphanumeric characters.
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Features:</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>Compact and efficient</li>
                        <li>Widely supported</li>
                        <li>Good for item identification</li>
                        <li>Variable length encoding</li>
                      </ul>
                    </Typography>
                    <Chip label="Recommended for Items" size="small" color="success" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      📄 Code 39
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Discrete barcode that supports uppercase letters, numbers, and some symbols.
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Features:</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>Self-checking code</li>
                        <li>Easy to print and scan</li>
                        <li>Used in automotive & healthcare</li>
                        <li>Human-readable</li>
                      </ul>
                    </Typography>
                    <Chip label="Legacy Support" size="small" color="warning" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      📱 QR Code
                    </Typography>
                    <Typography variant="body2" paragraph>
                      2D matrix barcode with high data capacity and error correction.
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Features:</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>High data capacity (up to 4KB)</li>
                        <li>Error correction capability</li>
                        <li>Mobile-friendly scanning</li>
                        <li>Can store URLs, text, etc.</li>
                      </ul>
                    </Typography>
                    <Chip label="Most Versatile" size="small" color="primary" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="h6" gutterBottom>
                🚀 Quick Start Guide
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" color="primary">1</Typography>
                    <Typography variant="body2">Enter Item ID or custom data</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" color="primary">2</Typography>
                    <Typography variant="body2">Select format and type</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" color="primary">3</Typography>
                    <Typography variant="body2">Click Generate</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" color="primary">4</Typography>
                    <Typography variant="body2">Download, print, or copy</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BarcodeGenerator;