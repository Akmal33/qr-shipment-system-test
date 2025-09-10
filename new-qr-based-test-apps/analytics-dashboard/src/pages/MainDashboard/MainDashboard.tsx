import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  LocalShipping,
  AttachMoney,
  People,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Sample data
const salesData = [
  { month: 'Jan', sales: 65000, profit: 12000, orders: 450 },
  { month: 'Feb', sales: 78000, profit: 15000, orders: 520 },
  { month: 'Mar', sales: 90000, profit: 18000, orders: 630 },
  { month: 'Apr', sales: 81000, profit: 16000, orders: 580 },
  { month: 'May', sales: 95000, profit: 19000, orders: 680 },
  { month: 'Jun', sales: 110000, profit: 22000, orders: 750 },
];

const inventoryData = [
  { name: 'Electronics', value: 35, color: '#8884d8' },
  { name: 'Clothing', value: 25, color: '#82ca9d' },
  { name: 'Home & Garden', value: 20, color: '#ffc658' },
  { name: 'Sports', value: 12, color: '#ff7300' },
  { name: 'Books', value: 8, color: '#00ff88' },
];

const performanceData = [
  { metric: 'Order Fulfillment', value: 94, target: 95 },
  { metric: 'Inventory Accuracy', value: 98, target: 99 },
  { metric: 'Shipping Time', value: 87, target: 90 },
  { metric: 'Customer Satisfaction', value: 92, target: 90 },
];

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  color,
}) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isPositive ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
            <Typography
              variant="body2"
              sx={{
                ml: 0.5,
                color: isPositive ? 'success.main' : 'error.main',
                fontWeight: 'medium',
              }}
            >
              {change}
            </Typography>
          </Box>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const MainDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value="$2.4M"
            change="+12.5%"
            isPositive={true}
            icon={<AttachMoney />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value="3,642"
            change="+8.2%"
            isPositive={true}
            icon={<LocalShipping />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Inventory Items"
            value="12,847"
            change="-2.1%"
            isPositive={false}
            icon={<Inventory />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Customers"
            value="8,291"
            change="+15.3%"
            isPositive={true}
            icon={<People />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Sales & Profit Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'sales' ? 'Sales' : 'Profit',
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#1976d2"
                  strokeWidth={3}
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#388e3c"
                  strokeWidth={3}
                  dot={{ fill: '#388e3c', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Inventory Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Inventory Distribution
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
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'Percentage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Key Performance Indicators
            </Typography>
            <Box sx={{ mt: 2 }}>
              {performanceData.map((item, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {item.metric}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.value}% / {item.target}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: item.value >= item.target ? '#4caf50' : '#ff9800',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Chip
                      label={item.value >= item.target ? 'On Track' : 'Needs Attention'}
                      size="small"
                      color={item.value >= item.target ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Monthly Orders Volume
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [value, 'Orders']} />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#8884d8"
                  fill="url(#colorOrders)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainDashboard;