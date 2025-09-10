import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  GetApp,
  Schedule,
  Assessment,
  PictureAsPdf,
  TableChart,
  Email,
  Delete,
  Edit,
  Visibility,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Sample data for reports
const reportTemplates = [
  {
    id: 1,
    name: 'Monthly Sales Report',
    description: 'Comprehensive monthly sales analysis with trends and forecasts',
    category: 'Sales',
    lastGenerated: '2024-01-15',
    frequency: 'Monthly',
    format: 'PDF',
  },
  {
    id: 2,
    name: 'Inventory Status Report',
    description: 'Current inventory levels, low stock alerts, and turnover analysis',
    category: 'Inventory',
    lastGenerated: '2024-01-20',
    frequency: 'Weekly',
    format: 'Excel',
  },
  {
    id: 3,
    name: 'Shipping Performance Dashboard',
    description: 'Delivery metrics, carrier performance, and cost analysis',
    category: 'Logistics',
    lastGenerated: '2024-01-18',
    frequency: 'Daily',
    format: 'PDF',
  },
  {
    id: 4,
    name: 'Customer Analytics Report',
    description: 'Customer behavior, satisfaction scores, and retention metrics',
    category: 'Customer',
    lastGenerated: '2024-01-10',
    frequency: 'Quarterly',
    format: 'Excel',
  },
];

const scheduledReports = [
  {
    id: 1,
    name: 'Daily Operations Summary',
    nextRun: '2024-01-21 08:00',
    recipients: ['manager@company.com', 'operations@company.com'],
    status: 'Active',
  },
  {
    id: 2,
    name: 'Weekly Inventory Alert',
    nextRun: '2024-01-22 09:00',
    recipients: ['inventory@company.com'],
    status: 'Active',
  },
  {
    id: 3,
    name: 'Monthly Executive Summary',
    nextRun: '2024-02-01 10:00',
    recipients: ['exec@company.com'],
    status: 'Paused',
  },
];

// Sample chart data for custom reports
const customChartData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 3000 },
  { month: 'Mar', value: 5000 },
  { month: 'Apr', value: 4500 },
  { month: 'May', value: 6000 },
  { month: 'Jun', value: 5500 },
];

const categoryData = [
  { name: 'Electronics', value: 35, color: '#8884d8' },
  { name: 'Clothing', value: 25, color: '#82ca9d' },
  { name: 'Home & Garden', value: 20, color: '#ffc658' },
  { name: 'Sports', value: 20, color: '#ff7300' },
];

const CustomReports: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('last30days');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const handleGenerateReport = (reportId: number) => {
    const report = reportTemplates.find(r => r.id === reportId);
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleDownloadReport = () => {
    // Simulate report generation and download
    console.log('Generating report:', selectedReport);
    setOpenDialog(false);
    // In a real application, this would trigger the actual report generation
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sales':
        return <Assessment color="primary" />;
      case 'Inventory':
        return <TableChart color="success" />;
      case 'Logistics':
        return <Schedule color="warning" />;
      case 'Customer':
        return <Email color="info" />;
      default:
        return <Assessment />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Paused':
        return 'warning';
      case 'Error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Custom Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: 'primary.main' }}
        >
          Create New Report
        </Button>
      </Box>

      {/* Report Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Report Configuration
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="inventory">Inventory</MenuItem>
                <MenuItem value="logistics">Logistics</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Format</InputLabel>
              <Select
                value={selectedFormat}
                label="Format"
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="powerpoint">PowerPoint</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="last7days">Last 7 Days</MenuItem>
                <MenuItem value="last30days">Last 30 Days</MenuItem>
                <MenuItem value="last3months">Last 3 Months</MenuItem>
                <MenuItem value="last6months">Last 6 Months</MenuItem>
                <MenuItem value="last1year">Last Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<GetApp />}
              sx={{ height: '40px' }}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Templates */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Available Report Templates
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {reportTemplates.map((template) => (
                <Grid item xs={12} sm={6} key={template.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getCategoryIcon(template.category)}
                        <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {template.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={template.category} size="small" color="primary" variant="outlined" />
                        <Chip label={template.frequency} size="small" color="secondary" variant="outlined" />
                        <Chip label={template.format} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Last generated: {template.lastGenerated}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<GetApp />}
                        onClick={() => handleGenerateReport(template.id)}
                      >
                        Generate
                      </Button>
                      <Button size="small" startIcon={<Edit />}>
                        Edit
                      </Button>
                      <Button size="small" startIcon={<Visibility />}>
                        Preview
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Report Preview
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={customChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Insights
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Scheduled Reports */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Scheduled Reports
        </Typography>
        <List>
          {scheduledReports.map((report, index) => (
            <React.Fragment key={report.id}>
              <ListItem>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {report.name}
                      </Typography>
                      <Chip
                        label={report.status}
                        size="small"
                        color={getStatusColor(report.status) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Next run: {report.nextRun}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recipients: {report.recipients.join(', ')}
                      </Typography>
                    </Box>
                  }
                />
                <Box>
                  <IconButton size="small" color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </ListItem>
              {index < scheduledReports.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Report Generation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedReport.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedReport.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date From"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date To"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Export Format</InputLabel>
                    <Select value="pdf" label="Export Format">
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Recipients (optional)"
                    placeholder="Enter email addresses separated by commas"
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDownloadReport} startIcon={<GetApp />}>
            Generate & Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomReports;