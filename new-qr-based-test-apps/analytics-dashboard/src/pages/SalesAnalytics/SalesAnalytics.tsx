import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';
import { VictoryArea, VictoryChart, VictoryTheme, VictoryAxis } from 'victory';

// Sample data
const salesByRegion = [
  { region: 'North America', sales: 450000, growth: 12.3, orders: 2340 },
  { region: 'Europe', sales: 380000, growth: 8.7, orders: 1890 },
  { region: 'Asia Pacific', sales: 520000, growth: 18.5, orders: 2680 },
  { region: 'Latin America', sales: 180000, growth: 15.2, orders: 890 },
  { region: 'Middle East', sales: 120000, growth: 22.1, orders: 560 },
];

const salesByProduct = [
  { category: 'Electronics', q1: 120000, q2: 135000, q3: 148000, q4: 162000 },
  { category: 'Clothing', q1: 89000, q2: 94000, q3: 102000, q4: 98000 },
  { category: 'Home & Garden', q1: 65000, q2: 72000, q3: 78000, q4: 84000 },
  { category: 'Sports', q1: 45000, q2: 52000, q3: 58000, q4: 61000 },
  { category: 'Books', q1: 28000, q2: 31000, q3: 29000, q4: 33000 },
];

const monthlyTrends = [
  { month: 'Jan', revenue: 285000, target: 300000, conversion: 3.2 },
  { month: 'Feb', revenue: 315000, target: 320000, conversion: 3.8 },
  { month: 'Mar', revenue: 342000, target: 340000, conversion: 4.1 },
  { month: 'Apr', revenue: 298000, target: 350000, conversion: 3.9 },
  { month: 'May', revenue: 385000, target: 360000, conversion: 4.5 },
  { month: 'Jun', revenue: 420000, target: 380000, conversion: 4.8 },
];

const topProducts = [
  { name: 'Wireless Headphones', sales: 15420, revenue: 231300, growth: '+18%' },
  { name: 'Smart Watch', sales: 12350, revenue: 185250, growth: '+24%' },
  { name: 'Laptop Stand', sales: 9870, revenue: 147150, growth: '+12%' },
  { name: 'USB Cable', sales: 18200, revenue: 145600, growth: '+8%' },
  { name: 'Phone Case', sales: 22100, revenue: 132600, growth: '+15%' },
];

const SalesAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [viewType, setViewType] = useState('revenue');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Sales Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={viewType}
              label="View"
              onChange={(e) => setViewType(e.target.value)}
            >
              <MenuItem value="revenue">Revenue</MenuItem>
              <MenuItem value="orders">Orders</MenuItem>
              <MenuItem value="growth">Growth</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Revenue vs Target */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Revenue vs Target Comparison
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'revenue' ? 'Actual Revenue' : 'Target Revenue',
                  ]}
                />
                <Legend />
                <Bar dataKey="target" fill="#e0e0e0" name="Target" />
                <Bar dataKey="revenue" fill="#1976d2" name="Actual" />
                <Line
                  type="monotone"
                  dataKey="conversion"
                  stroke="#ff9800"
                  strokeWidth={3}
                  yAxisId="right"
                  name="Conversion Rate (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Sales by Region
            </Typography>
            <Box sx={{ mt: 2 }}>
              {salesByRegion.map((item, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {item.region}
                    </Typography>
                    <Chip
                      label={`+${item.growth}%`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ${item.sales.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.orders.toLocaleString()} orders
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Product Performance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quarterly Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByProduct} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Sales']} />
                <Legend />
                <Bar dataKey="q1" stackId="a" fill="#8884d8" name="Q1" />
                <Bar dataKey="q2" stackId="a" fill="#82ca9d" name="Q2" />
                <Bar dataKey="q3" stackId="a" fill="#ffc658" name="Q3" />
                <Bar dataKey="q4" stackId="a" fill="#ff7300" name="Q4" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Top Performing Products
            </Typography>
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {product.sales.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ${product.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={product.growth}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Victory Chart Example - Advanced Analytics */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Sales Trend Analysis (Advanced View)
            </Typography>
            <VictoryChart
              theme={VictoryTheme.material}
              height={200}
              padding={{ left: 80, top: 20, right: 80, bottom: 50 }}
            >
              <VictoryAxis dependentAxis />
              <VictoryAxis />
              <VictoryArea
                data={monthlyTrends}
                x="month"
                y="revenue"
                style={{
                  data: { fill: "rgba(25, 118, 210, 0.3)", stroke: "#1976d2", strokeWidth: 2 }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
              />
            </VictoryChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesAnalytics;