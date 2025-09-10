import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  LocalShipping,
  AttachMoney,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '../../services/api';
import { DashboardStats } from '../../types';

// Sample data for charts
const profitData = [
  { month: 'Jan', profit: 12000 },
  { month: 'Feb', profit: 15000 },
  { month: 'Mar', profit: 18000 },
  { month: 'Apr', profit: 16000 },
  { month: 'May', profit: 22000 },
  { month: 'Jun', profit: 25000 },
];

const categoryData = [
  { name: 'Electronics', value: 40, color: '#0088FE' },
  { name: 'Clothing', value: 30, color: '#00C49F' },
  { name: 'Books', value: 20, color: '#FFBB28' },
  { name: 'Tools', value: 10, color: '#FF8042' },
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}> = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="h2">
            {value}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp fontSize="small" sx={{ color: 'green', mr: 0.5 }} />
              <Typography variant="body2" color="green">
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // For now, use mock data since API might not be running
        const mockStats: DashboardStats = {
          totalItems: 1250,
          totalShipments: 342,
          activeShipments: 28,
          totalProfit: 125000,
          averageMargin: 45.6,
          recentActivity: [
            {
              type: 'item_created',
              description: 'New item added: Wireless Headphones',
              timestamp: '2024-01-10T14:30:00Z',
            },
            {
              type: 'shipment_delivered',
              description: 'Shipment SHP-2024-001 delivered to Jakarta',
              timestamp: '2024-01-10T13:15:00Z',
            },
            {
              type: 'stock_low',
              description: 'Low stock alert: Cotton T-Shirt (15 units left)',
              timestamp: '2024-01-10T12:00:00Z',
            },
          ],
        };
        
        setStats(mockStats);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard API error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Items"
            value={stats?.totalItems || 0}
            icon={<Inventory sx={{ color: 'white' }} />}
            color="#1976d2"
            trend="+5.2% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Shipments"
            value={stats?.activeShipments || 0}
            icon={<LocalShipping sx={{ color: 'white' }} />}
            color="#2e7d32"
            trend="+12% from last week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Profit"
            value={`$${stats?.totalProfit?.toLocaleString() || 0}`}
            icon={<AttachMoney sx={{ color: 'white' }} />}
            color="#ed6c02"
            trend="+8.4% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Profit Margin"
            value={`${stats?.averageMargin || 0}%`}
            icon={<TrendingUp sx={{ color: 'white' }} />}
            color="#9c27b0"
            trend="+2.1% from last month"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Profit Trend
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Profit']} />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  dot={{ fill: '#1976d2' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Inventory by Category
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

      {/* Recent Activity */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {stats?.recentActivity.map((activity, index) => (
            <ListItem key={index} divider={index < stats.recentActivity.length - 1}>
              <ListItemText
                primary={activity.description}
                secondary={new Date(activity.timestamp).toLocaleString()}
              />
              <Chip 
                label={activity.type.replace('_', ' ')} 
                size="small" 
                color={
                  activity.type.includes('delivered') ? 'success' :
                  activity.type.includes('created') ? 'primary' :
                  activity.type.includes('low') ? 'warning' : 'default'
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard;