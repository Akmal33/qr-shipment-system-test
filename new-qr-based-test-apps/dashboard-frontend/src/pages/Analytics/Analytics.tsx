import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { analyticsApi } from '../../services/api';
import { ProfitAnalytics, ShipmentPerformance, InventoryTurnover } from '../../types';

// Mock data for analytics
const profitTrendData = [
  { month: 'Jan', profit: 12000, margin: 42.5 },
  { month: 'Feb', profit: 15000, margin: 45.2 },
  { month: 'Mar', profit: 18000, margin: 48.1 },
  { month: 'Apr', profit: 16000, margin: 44.8 },
  { month: 'May', profit: 22000, margin: 51.3 },
  { month: 'Jun', profit: 25000, margin: 53.7 },
];

const categoryPerformanceData = [
  { category: 'Electronics', revenue: 45000, profit: 18000 },
  { category: 'Clothing', revenue: 32000, profit: 14400 },
  { category: 'Books', revenue: 18000, profit: 7200 },
  { category: 'Tools', revenue: 25000, profit: 11250 },
  { category: 'Other', revenue: 15000, profit: 6750 },
];

const turnoverData = [
  { name: 'Fast Moving', value: 40, color: '#00C49F' },
  { name: 'Medium Moving', value: 35, color: '#FFBB28' },
  { name: 'Slow Moving', value: 20, color: '#FF8042' },
  { name: 'Dead Stock', value: 5, color: '#8884d8' },
];

const deliveryPerformanceData = [
  { week: 'W1', onTime: 85, delayed: 15 },
  { week: 'W2', onTime: 92, delayed: 8 },
  { week: 'W3', onTime: 78, delayed: 22 },
  { week: 'W4', onTime: 88, delayed: 12 },
  { week: 'W5', onTime: 95, delayed: 5 },
  { week: 'W6', onTime: 90, delayed: 10 },
];

const Analytics: React.FC = () => {
  const [profitAnalytics, setProfitAnalytics] = useState<ProfitAnalytics | null>(null);
  const [shipmentPerformance, setShipmentPerformance] = useState<ShipmentPerformance | null>(null);
  const [inventoryTurnover, setInventoryTurnover] = useState<InventoryTurnover | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockProfitAnalytics: ProfitAnalytics = {
        totalProfit: 67600,
        averageMargin: 47.6,
        topPerformers: ['ITM-2024-001', 'ITM-2024-003'],
        lowPerformers: ['ITM-2024-002'],
        trendDirection: 'up',
      };

      const mockShipmentPerformance: ShipmentPerformance = {
        totalShipments: 342,
        deliveredOnTime: 298,
        delayed: 44,
        averageDeliveryTime: '3.2 days',
        successRate: '87.1%',
      };

      const mockInventoryTurnover: InventoryTurnover = {
        totalItems: 1250,
        fastMoving: 500,
        slowMoving: 250,
        averageTurnover: 4.2,
        categories: {
          Electronics: 5.1,
          Clothing: 3.8,
          Books: 2.1,
          Tools: 4.5,
          Other: 3.2,
        },
      };

      setProfitAnalytics(mockProfitAnalytics);
      setShipmentPerformance(mockShipmentPerformance);
      setInventoryTurnover(mockInventoryTurnover);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics API error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Profit
              </Typography>
              <Typography variant="h4">
                ${profitAnalytics?.totalProfit.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="green">
                ↑ {profitAnalytics?.trendDirection === 'up' ? '+12.5%' : '-5.2%'} from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Margin
              </Typography>
              <Typography variant="h4">
                {profitAnalytics?.averageMargin.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="green">
                ↑ +2.3% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Delivery Success Rate
              </Typography>
              <Typography variant="h4">
                {shipmentPerformance?.successRate}
              </Typography>
              <Typography variant="body2" color="green">
                ↑ +5.1% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Turnover
              </Typography>
              <Typography variant="h4">
                {inventoryTurnover?.averageTurnover}x
              </Typography>
              <Typography variant="body2" color="orange">
                → Stable from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Profit Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Profit Trend & Margin Analysis
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={profitTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="profit"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="margin"
                  stroke="#ff7300"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Inventory Turnover */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Movement
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={turnoverData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {turnoverData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Performance */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Category Performance
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={categoryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Delivery Performance */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Performance
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={deliveryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onTime" stackId="a" fill="#4caf50" name="On Time" />
                <Bar dataKey="delayed" stackId="a" fill="#f44336" name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top/Low Performers */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Top Performing Items
                </Typography>
                {profitAnalytics?.topPerformers.map((item, index) => (
                  <Typography key={index} variant="body2">
                    • {item} - High profit margin and fast turnover
                  </Typography>
                ))}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom color="error">
                  Items Needing Attention
                </Typography>
                {profitAnalytics?.lowPerformers.map((item, index) => (
                  <Typography key={index} variant="body2">
                    • {item} - Low profit margin or slow turnover
                  </Typography>
                ))}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;