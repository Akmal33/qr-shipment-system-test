import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  TrendingUp,
  TrendingDown,
  Remove as StableIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

// Mock data for reports
const profitReportData = [
  { period: 'Jan 2024', revenue: 145000, profit: 65250, margin: 45.0, items: 234 },
  { period: 'Feb 2024', revenue: 168000, profit: 75600, margin: 45.0, items: 287 },
  { period: 'Mar 2024', revenue: 192000, profit: 88320, margin: 46.0, items: 321 },
  { period: 'Apr 2024', revenue: 178000, profit: 81320, margin: 45.7, items: 298 },
  { period: 'May 2024', revenue: 211000, profit: 99176, margin: 47.0, items: 356 },
  { period: 'Jun 2024', revenue: 234000, profit: 113490, margin: 48.5, items: 398 },
];

const inventoryReportData = [
  { category: 'Electronics', totalItems: 450, inStock: 387, lowStock: 23, outOfStock: 5, turnover: 5.2 },
  { category: 'Clothing', totalItems: 320, inStock: 298, lowStock: 18, outOfStock: 4, turnover: 3.8 },
  { category: 'Books', totalItems: 180, inStock: 165, lowStock: 12, outOfStock: 3, turnover: 2.1 },
  { category: 'Tools', totalItems: 150, inStock: 142, lowStock: 6, outOfStock: 2, turnover: 4.5 },
  { category: 'Sports', totalItems: 95, inStock: 89, lowStock: 4, outOfStock: 2, turnover: 3.2 },
];

const shipmentReportData = [
  { month: 'Jan', total: 85, delivered: 82, delayed: 2, cancelled: 1, onTimeRate: 96.5 },
  { month: 'Feb', total: 92, delivered: 87, delayed: 4, cancelled: 1, onTimeRate: 94.6 },
  { month: 'Mar', total: 108, delivered: 101, delayed: 5, cancelled: 2, onTimeRate: 93.5 },
  { month: 'Apr', total: 96, delivered: 91, delayed: 3, cancelled: 2, onTimeRate: 94.8 },
  { month: 'May', total: 115, delivered: 109, delayed: 4, cancelled: 2, onTimeRate: 94.8 },
  { month: 'Jun', total: 127, delivered: 122, delayed: 3, cancelled: 2, onTimeRate: 96.1 },
];

const topPerformingItems = [
  { itemId: 'ITM-2024-001', name: 'Wireless Headphones Pro', sales: 156, revenue: 23400, profit: 9360 },
  { itemId: 'ITM-2024-003', name: 'Smart Watch Series X', sales: 98, revenue: 29400, profit: 14700 },
  { itemId: 'ITM-2024-007', name: 'Bluetooth Speaker', sales: 134, revenue: 16080, profit: 6432 },
  { itemId: 'ITM-2024-012', name: 'USB-C Hub', sales: 89, revenue: 8010, profit: 3204 },
  { itemId: 'ITM-2024-015', name: 'Wireless Mouse', sales: 167, revenue: 8350, profit: 3340 },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: '16px' }}>
    {value === index && children}
  </div>
);

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-06-30',
  });
  const [reportType, setReportType] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const generateReport = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const exportReport = () => {
    // Simulate export functionality
    const filename = `report_${activeTab === 0 ? 'profit' : activeTab === 1 ? 'inventory' : 'shipments'}_${new Date().toISOString().split('T')[0]}`;
    
    if (exportFormat === 'pdf') {
      // In a real app, you'd generate and download a PDF
      console.log(`Exporting ${filename}.pdf`);
    } else {
      // In a real app, you'd generate and download an Excel file
      console.log(`Exporting ${filename}.xlsx`);
    }
    
    setExportDialogOpen(false);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp color="success" fontSize="small" />;
    } else if (current < previous) {
      return <TrendingDown color="error" fontSize="small" />;
    }
    return <StableIcon color="warning" fontSize="small" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportIcon fontSize="large" />
            Reports Dashboard
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={generateReport}
              disabled={loading}
            >
              Refresh Data
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => setExportDialogOpen(true)}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {/* Date Range and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Report Period</InputLabel>
                <Select
                  value={reportType}
                  label="Report Period"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing</MenuItem>
                  <MenuItem value="books">Books</MenuItem>
                  <MenuItem value="tools">Tools</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}

        {/* Report Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label="Profit & Revenue Report"
              icon={<TrendingUp />}
              iconPosition="start"
            />
            <Tab
              label="Inventory Report"
              icon={<FilterIcon />}
              iconPosition="start"
            />
            <Tab
              label="Shipment Report"
              icon={<DateRangeIcon />}
              iconPosition="start"
            />
          </Tabs>

          {/* Profit & Revenue Report */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3 }}>
              {/* Summary Cards */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(profitReportData.reduce((sum, item) => sum + item.revenue, 0))}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {getTrendIcon(234000, 211000)}
                        <Typography variant="body2" color="success.main" ml={0.5}>
                          +10.9% vs last month
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Profit
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(profitReportData.reduce((sum, item) => sum + item.profit, 0))}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {getTrendIcon(113490, 99176)}
                        <Typography variant="body2" color="success.main" ml={0.5}>
                          +14.4% vs last month
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Average Margin
                      </Typography>
                      <Typography variant="h5">
                        {formatPercentage(profitReportData.reduce((sum, item) => sum + item.margin, 0) / profitReportData.length)}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {getTrendIcon(48.5, 47.0)}
                        <Typography variant="body2" color="success.main" ml={0.5}>
                          +1.5% vs last month
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Items Sold
                      </Typography>
                      <Typography variant="h5">
                        {profitReportData.reduce((sum, item) => sum + item.items, 0).toLocaleString()}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {getTrendIcon(398, 356)}
                        <Typography variant="body2" color="success.main" ml={0.5}>
                          +11.8% vs last month
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Revenue & Profit Chart */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                      Revenue & Profit Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <AreaChart data={profitReportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <RechartsTooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stackId="1"
                          stroke="#1976d2"
                          fill="#1976d2"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="profit"
                          stackId="2"
                          stroke="#2e7d32"
                          fill="#2e7d32"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                      Profit Margin Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={profitReportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                        <RechartsTooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Margin']} />
                        <Line
                          type="monotone"
                          dataKey="margin"
                          stroke="#ed6c02"
                          strokeWidth={3}
                          dot={{ fill: '#ed6c02', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>

              {/* Top Performing Items */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Performing Items
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item ID</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell align="center">Units Sold</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">Profit</TableCell>
                        <TableCell align="center">Margin</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topPerformingItems.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell>
                            <Chip label={item.itemId} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="center">{item.sales}</TableCell>
                          <TableCell align="right">{formatCurrency(item.revenue)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.profit)}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={formatPercentage((item.profit / item.revenue) * 100)} 
                              color={item.profit / item.revenue > 0.4 ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </TabPanel>

          {/* Inventory Report */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              {/* Inventory Summary */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                      Inventory Status by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={inventoryReportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="inStock" stackId="a" fill="#4caf50" name="In Stock" />
                        <Bar dataKey="lowStock" stackId="a" fill="#ff9800" name="Low Stock" />
                        <Bar dataKey="outOfStock" stackId="a" fill="#f44336" name="Out of Stock" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                      Inventory Turnover Rate
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={inventoryReportData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" width={80} />
                        <RechartsTooltip formatter={(value) => [`${Number(value).toFixed(1)}x`, 'Turnover']} />
                        <Bar dataKey="turnover" fill="#9c27b0" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>

              {/* Detailed Inventory Table */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detailed Inventory Report
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="center">Total Items</TableCell>
                        <TableCell align="center">In Stock</TableCell>
                        <TableCell align="center">Low Stock</TableCell>
                        <TableCell align="center">Out of Stock</TableCell>
                        <TableCell align="center">Turnover Rate</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryReportData.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell>
                            <Typography variant="subtitle2">{category.category}</Typography>
                          </TableCell>
                          <TableCell align="center">{category.totalItems}</TableCell>
                          <TableCell align="center">
                            <Chip label={category.inStock} color="success" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={category.lowStock} 
                              color={category.lowStock > 20 ? 'warning' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={category.outOfStock} 
                              color={category.outOfStock > 5 ? 'error' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {category.turnover.toFixed(1)}x
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={
                                category.outOfStock > 5 ? 'Critical' :
                                category.lowStock > 20 ? 'Warning' : 'Good'
                              }
                              color={
                                category.outOfStock > 5 ? 'error' :
                                category.lowStock > 20 ? 'warning' : 'success'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </TabPanel>

          {/* Shipment Report */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              {/* Shipment Performance Chart */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                      Monthly Shipment Performance
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={shipmentReportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="delivered" stackId="a" fill="#4caf50" name="Delivered" />
                        <Bar dataKey="delayed" stackId="a" fill="#ff9800" name="Delayed" />
                        <Bar dataKey="cancelled" stackId="a" fill="#f44336" name="Cancelled" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                      On-Time Delivery Rate
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={shipmentReportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[90, 100]} />
                        <RechartsTooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'On-Time Rate']} />
                        <Line
                          type="monotone"
                          dataKey="onTimeRate"
                          stroke="#1976d2"
                          strokeWidth={3}
                          dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>

              {/* Shipment Summary Table */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Shipment Summary
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="center">Total Shipments</TableCell>
                        <TableCell align="center">Delivered</TableCell>
                        <TableCell align="center">Delayed</TableCell>
                        <TableCell align="center">Cancelled</TableCell>
                        <TableCell align="center">On-Time Rate</TableCell>
                        <TableCell align="center">Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shipmentReportData.map((month) => (
                        <TableRow key={month.month}>
                          <TableCell>
                            <Typography variant="subtitle2">{month.month} 2024</Typography>
                          </TableCell>
                          <TableCell align="center">{month.total}</TableCell>
                          <TableCell align="center">
                            <Chip label={month.delivered} color="success" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={month.delayed} 
                              color={month.delayed > 4 ? 'warning' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={month.cancelled} 
                              color={month.cancelled > 2 ? 'error' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="bold">
                              {month.onTimeRate.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={
                                month.onTimeRate >= 95 ? 'Excellent' :
                                month.onTimeRate >= 90 ? 'Good' : 'Needs Improvement'
                              }
                              color={
                                month.onTimeRate >= 95 ? 'success' :
                                month.onTimeRate >= 90 ? 'primary' : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </TabPanel>
        </Paper>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
          <DialogTitle>Export Report</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 300, pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={exportFormat}
                  label="Export Format"
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <MenuItem value="pdf">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PdfIcon />
                      PDF Report
                    </Box>
                  </MenuItem>
                  <MenuItem value="excel">
                    <Box display="flex" alignItems="center" gap={1}>
                      <ExcelIcon />
                      Excel Spreadsheet
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="textSecondary">
                The report will include all data from the selected date range and filters.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={exportReport} startIcon={<DownloadIcon />}>
              Export
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default Reports;