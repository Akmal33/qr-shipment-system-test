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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  LocalShipping,
  Schedule,
  CheckCircle,
  Cancel,
  LocationOn,
  Speed,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const shippingVolume = [
  { month: 'Jan', domestic: 1245, international: 456, express: 234 },
  { month: 'Feb', domestic: 1380, international: 523, express: 289 },
  { month: 'Mar', domestic: 1456, international: 598, express: 312 },
  { month: 'Apr', domestic: 1289, international: 467, express: 278 },
  { month: 'May', domestic: 1567, international: 634, express: 345 },
  { month: 'Jun', domestic: 1678, international: 712, express: 398 },
];

const deliveryPerformance = [
  { metric: 'On-Time Delivery', value: 92, target: 95 },
  { metric: 'Same-Day Delivery', value: 78, target: 80 },
  { metric: 'Express Delivery', value: 95, target: 98 },
  { metric: 'International Delivery', value: 85, target: 90 },
];

const shippingCosts = [
  { carrier: 'FedEx', cost: 125000, volume: 2340, avgCost: 53.4 },
  { carrier: 'UPS', cost: 98000, volume: 1890, avgCost: 51.9 },
  { carrier: 'DHL', cost: 145000, volume: 2680, avgCost: 54.1 },
  { carrier: 'USPS', cost: 67000, volume: 1560, avgCost: 42.9 },
];

const deliveryStatus = [
  { status: 'Delivered', count: 2456, color: '#4caf50' },
  { status: 'In Transit', count: 892, color: '#2196f3' },
  { status: 'Processing', count: 234, color: '#ff9800' },
  { status: 'Delayed', count: 123, color: '#f44336' },
];

const recentShipments = [
  { id: 'SH001', destination: 'New York, NY', status: 'delivered', estimatedDays: 2, actualDays: 2 },
  { id: 'SH002', destination: 'Los Angeles, CA', status: 'in-transit', estimatedDays: 3, actualDays: null },
  { id: 'SH003', destination: 'Chicago, IL', status: 'delivered', estimatedDays: 1, actualDays: 1 },
  { id: 'SH004', destination: 'Houston, TX', status: 'delayed', estimatedDays: 2, actualDays: null },
  { id: 'SH005', destination: 'Phoenix, AZ', status: 'processing', estimatedDays: 3, actualDays: null },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle color="success" />;
    case 'in-transit':
      return <LocalShipping color="primary" />;
    case 'processing':
      return <Schedule color="warning" />;
    case 'delayed':
      return <Cancel color="error" />;
    default:
      return <Schedule />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'in-transit':
      return 'primary';
    case 'processing':
      return 'warning';
    case 'delayed':
      return 'error';
    default:
      return 'default';
  }
};

const ShippingAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [carrierFilter, setCarrierFilter] = useState('all');

  const totalShipments = deliveryStatus.reduce((sum, item) => sum + item.count, 0);
  const onTimeRate = 92; // percentage
  const avgDeliveryTime = 2.3; // days

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Shipping Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Carrier</InputLabel>
            <Select
              value={carrierFilter}
              label="Carrier"
              onChange={(e) => setCarrierFilter(e.target.value)}
            >
              <MenuItem value="all">All Carriers</MenuItem>
              <MenuItem value="fedex">FedEx</MenuItem>
              <MenuItem value="ups">UPS</MenuItem>
              <MenuItem value="dhl">DHL</MenuItem>
              <MenuItem value="usps">USPS</MenuItem>
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
                    Total Shipments
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {totalShipments.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    +12.5% vs last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <LocalShipping />
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
                    On-Time Delivery
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {onTimeRate}%
                  </Typography>
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    -2.1% vs target
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#388e3c' }}>
                  <CheckCircle />
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
                    Avg Delivery Time
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {avgDeliveryTime} days
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    -0.3 days improvement
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f57c00' }}>
                  <Speed />
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
                    Shipping Cost
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    $435K
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                    +5.2% vs last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#7b1fa2' }}>
                  <LocationOn />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Shipping Volume Trends */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Shipping Volume Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shippingVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="domestic"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Domestic"
                />
                <Area
                  type="monotone"
                  dataKey="international"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="International"
                />
                <Area
                  type="monotone"
                  dataKey="express"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                  name="Express"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Delivery Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Current Delivery Status
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                >
                  {deliveryStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Shipments']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Carrier Performance & Recent Shipments */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Carrier Cost Analysis
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shippingCosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="carrier" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'cost' ? `$${value.toLocaleString()}` : value,
                    name === 'cost' ? 'Total Cost' : name === 'volume' ? 'Volume' : 'Avg Cost'
                  ]}
                />
                <Legend />
                <Bar dataKey="cost" fill="#8884d8" name="Total Cost ($)" />
                <Bar dataKey="volume" fill="#82ca9d" name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Shipments
            </Typography>
            <List sx={{ maxHeight: 320, overflow: 'auto' }}>
              {recentShipments.map((shipment, index) => (
                <React.Fragment key={shipment.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(shipment.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {shipment.id}
                          </Typography>
                          <Chip
                            label={shipment.status.replace('-', ' ')}
                            size="small"
                            color={getStatusColor(shipment.status) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Destination: {shipment.destination}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Estimated: {shipment.estimatedDays} days
                            {shipment.actualDays && ` | Actual: ${shipment.actualDays} days`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentShipments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShippingAnalytics;