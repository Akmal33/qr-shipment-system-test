import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Inventory,
  Warning,
  TrendingDown,
  TrendingUp,
  Storage,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from 'recharts';

const inventoryData = [
  { category: 'Electronics', inStock: 1245, reserved: 156, lowStock: 23, value: 245000 },
  { category: 'Clothing', inStock: 2890, reserved: 245, lowStock: 45, value: 189000 },
  { category: 'Home & Garden', inStock: 856, reserved: 89, lowStock: 12, value: 126000 },
  { category: 'Sports', inStock: 634, reserved: 67, lowStock: 8, value: 89000 },
  { category: 'Books', inStock: 1456, reserved: 123, lowStock: 34, value: 67000 },
];

const turnoverData = [
  { month: 'Jan', turnover: 4.2, target: 4.5 },
  { month: 'Feb', turnover: 4.8, target: 4.5 },
  { month: 'Mar', turnover: 3.9, target: 4.5 },
  { month: 'Apr', turnover: 5.1, target: 4.5 },
  { month: 'May', turnover: 4.6, target: 4.5 },
  { month: 'Jun', turnover: 5.3, target: 4.5 },
];

const warehouseUtilization = [
  { warehouse: 'Warehouse A', capacity: 10000, used: 8500, utilization: 85 },
  { warehouse: 'Warehouse B', capacity: 8000, used: 6200, utilization: 77.5 },
  { warehouse: 'Warehouse C', capacity: 12000, used: 9600, utilization: 80 },
  { warehouse: 'Warehouse D', capacity: 6000, used: 4800, utilization: 80 },
];

const lowStockAlerts = [
  { product: 'iPhone Charging Cable', current: 12, minimum: 50, status: 'critical' },
  { product: 'Bluetooth Speaker', current: 8, minimum: 25, status: 'critical' },
  { product: 'Laptop Bag', current: 23, minimum: 40, status: 'warning' },
  { product: 'Desk Lamp', current: 31, minimum: 50, status: 'warning' },
  { product: 'Coffee Mug', current: 45, minimum: 75, status: 'warning' },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88'];

const InventoryAnalytics: React.FC = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [timeRange, setTimeRange] = useState('6months');

  const totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);
  const totalItems = inventoryData.reduce((sum, item) => sum + item.inStock, 0);
  const criticalItems = lowStockAlerts.filter(item => item.status === 'critical').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Inventory Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Warehouse</InputLabel>
            <Select
              value={selectedWarehouse}
              label="Warehouse"
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              <MenuItem value="all">All Warehouses</MenuItem>
              <MenuItem value="a">Warehouse A</MenuItem>
              <MenuItem value="b">Warehouse B</MenuItem>
              <MenuItem value="c">Warehouse C</MenuItem>
              <MenuItem value="d">Warehouse D</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={timeRange}
              label="Period"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="3months">3 Months</MenuItem>
              <MenuItem value="6months">6 Months</MenuItem>
              <MenuItem value="1year">1 Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Inventory Value
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ${totalValue.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp color="success" />
                    <Typography variant="body2" sx={{ ml: 0.5, color: 'success.main' }}>
                      +5.2%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <Storage />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Items
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {totalItems.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingDown color="error" />
                    <Typography variant="body2" sx={{ ml: 0.5, color: 'error.main' }}>
                      -2.1%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: '#388e3c' }}>
                  <Inventory />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Critical Stock Items
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {criticalItems}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Need immediate attention
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#d32f2f' }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Avg. Turnover Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    4.7x
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp color="success" />
                    <Typography variant="body2" sx={{ ml: 0.5, color: 'success.main' }}>
                      +8.3%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: '#f57c00' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Inventory Distribution */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Inventory by Category
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="inStock"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Items in Stock']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Inventory Turnover */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Inventory Turnover Rate
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any, name: string) => [value, name === 'turnover' ? 'Actual' : 'Target']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="turnover"
                  stroke="#1976d2"
                  strokeWidth={3}
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ff9800"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Warehouse Utilization & Low Stock Alerts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Warehouse Utilization
            </Typography>
            <Box sx={{ mt: 2 }}>
              {warehouseUtilization.map((warehouse, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {warehouse.warehouse}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {warehouse.used.toLocaleString()} / {warehouse.capacity.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={warehouse.utilization}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor: 
                          warehouse.utilization > 90 ? '#f44336' :
                          warehouse.utilization > 80 ? '#ff9800' : '#4caf50',
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {warehouse.utilization}% utilized
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Low Stock Alerts
            </Typography>
            <Box sx={{ mt: 2 }}>
              {lowStockAlerts.map((alert, index) => (
                <Alert
                  key={index}
                  severity={alert.status === 'critical' ? 'error' : 'warning'}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {alert.product}
                    </Typography>
                    <Typography variant="body2">
                      Current: {alert.current} | Minimum: {alert.minimum}
                    </Typography>
                  </Box>
                </Alert>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryAnalytics;