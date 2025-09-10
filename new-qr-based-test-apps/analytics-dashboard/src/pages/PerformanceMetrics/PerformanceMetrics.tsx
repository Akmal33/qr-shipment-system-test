import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Speed,
  TrendingUp,
  Assessment,
  Timer,
  People,
  LocalShipping,
} from '@mui/icons-material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { VictoryChart, VictoryArea, VictoryTheme, VictoryAxis, VictoryLabel } from 'victory';

const performanceKPIs = [
  { metric: 'Order Processing Time', current: 2.3, target: 2.0, unit: 'hours', trend: -0.2 },
  { metric: 'Inventory Accuracy', current: 98.2, target: 99.0, unit: '%', trend: +0.5 },
  { metric: 'Customer Satisfaction', current: 4.6, target: 4.8, unit: '/5', trend: +0.1 },
  { metric: 'Shipping Accuracy', current: 97.8, target: 98.5, unit: '%', trend: -0.3 },
  { metric: 'Return Rate', current: 2.1, target: 1.5, unit: '%', trend: +0.2 },
  { metric: 'Cost per Order', current: 8.45, target: 8.00, unit: '$', trend: +0.15 },
];

const departmentPerformance = [
  { department: 'Warehouse', efficiency: 92, productivity: 88, quality: 95, satisfaction: 89 },
  { department: 'Shipping', efficiency: 89, productivity: 91, quality: 87, satisfaction: 92 },
  { department: 'Customer Service', efficiency: 94, productivity: 86, quality: 96, satisfaction: 94 },
  { department: 'Sales', efficiency: 87, productivity: 93, quality: 89, satisfaction: 91 },
  { department: 'IT Support', efficiency: 96, productivity: 89, quality: 94, satisfaction: 88 },
];

const processEfficiency = [
  { process: 'Order Processing', jan: 85, feb: 87, mar: 89, apr: 91, may: 88, jun: 92 },
  { process: 'Picking & Packing', jan: 78, feb: 81, mar: 83, apr: 85, may: 87, jun: 89 },
  { process: 'Quality Control', jan: 92, feb: 94, mar: 91, apr: 93, may: 95, jun: 97 },
  { process: 'Shipping', jan: 88, feb: 85, mar: 87, apr: 89, may: 92, jun: 94 },
];

const operationalMetrics = [
  { month: 'Jan', throughput: 2340, errorRate: 2.1, costEfficiency: 92 },
  { month: 'Feb', throughput: 2580, errorRate: 1.8, costEfficiency: 94 },
  { month: 'Mar', throughput: 2720, errorRate: 1.5, costEfficiency: 96 },
  { month: 'Apr', throughput: 2450, errorRate: 2.0, costEfficiency: 93 },
  { month: 'May', throughput: 2890, errorRate: 1.3, costEfficiency: 98 },
  { month: 'Jun', throughput: 3120, errorRate: 1.1, costEfficiency: 99 },
];

const radarData = [
  { subject: 'Efficiency', A: 92, fullMark: 100 },
  { subject: 'Quality', A: 89, fullMark: 100 },
  { subject: 'Speed', A: 94, fullMark: 100 },
  { subject: 'Accuracy', A: 87, fullMark: 100 },
  { subject: 'Cost Control', A: 91, fullMark: 100 },
  { subject: 'Customer Satisfaction', A: 88, fullMark: 100 },
];

const PerformanceMetrics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const getPerformanceColor = (current: number, target: number, isReverse = false) => {
    const ratio = current / target;
    if (isReverse) {
      return ratio <= 1 ? 'success' : ratio <= 1.2 ? 'warning' : 'error';
    }
    return ratio >= 1 ? 'success' : ratio >= 0.8 ? 'warning' : 'error';
  };

  const getProgressValue = (current: number, target: number, isReverse = false) => {
    if (isReverse) {
      return Math.min((target / current) * 100, 100);
    }
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Performance Metrics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="warehouse">Warehouse</MenuItem>
              <MenuItem value="shipping">Shipping</MenuItem>
              <MenuItem value="customer-service">Customer Service</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="it-support">IT Support</MenuItem>
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

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {performanceKPIs.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {kpi.metric}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {kpi.current}{kpi.unit}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    <Assessment />
                  </Avatar>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress to Target
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target: {kpi.target}{kpi.unit}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressValue(kpi.current, kpi.target, kpi.metric.includes('Time') || kpi.metric.includes('Rate') || kpi.metric.includes('Cost'))}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                    color={getPerformanceColor(kpi.current, kpi.target, kpi.metric.includes('Time') || kpi.metric.includes('Rate') || kpi.metric.includes('Cost')) as any}
                  />
                </Box>
                
                <Chip
                  label={`${kpi.trend > 0 ? '+' : ''}${kpi.trend}${kpi.unit} trend`}
                  size="small"
                  color={kpi.trend > 0 ? (kpi.metric.includes('Rate') || kpi.metric.includes('Cost') ? 'error' : 'success') : 'success'}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Performance Radar Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Overall Performance Overview
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={60} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Operational Metrics Trend */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Operational Metrics Trend
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={operationalMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="throughput" fill="#8884d8" name="Throughput" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#ff7300"
                  strokeWidth={3}
                  name="Error Rate (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="costEfficiency"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  name="Cost Efficiency (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Department Performance Table */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Department Performance Scorecard
            </Typography>
            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Efficiency</TableCell>
                    <TableCell align="center">Productivity</TableCell>
                    <TableCell align="center">Quality</TableCell>
                    <TableCell align="center">Satisfaction</TableCell>
                    <TableCell align="center">Overall</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentPerformance.map((dept, index) => {
                    const overall = Math.round((dept.efficiency + dept.productivity + dept.quality + dept.satisfaction) / 4);
                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">
                            {dept.department}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${dept.efficiency}%`}
                            size="small"
                            color={dept.efficiency >= 90 ? 'success' : dept.efficiency >= 80 ? 'warning' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${dept.productivity}%`}
                            size="small"
                            color={dept.productivity >= 90 ? 'success' : dept.productivity >= 80 ? 'warning' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${dept.quality}%`}
                            size="small"
                            color={dept.quality >= 90 ? 'success' : dept.quality >= 80 ? 'warning' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${dept.satisfaction}%`}
                            size="small"
                            color={dept.satisfaction >= 90 ? 'success' : dept.satisfaction >= 80 ? 'warning' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={overall >= 90 ? 'success.main' : overall >= 80 ? 'warning.main' : 'error.main'}
                          >
                            {overall}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Process Efficiency Trends
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <VictoryChart
                theme={VictoryTheme.material}
                height={280}
                padding={{ left: 80, top: 20, right: 40, bottom: 50 }}
              >
                <VictoryAxis dependentAxis />
                <VictoryAxis />
                {processEfficiency.map((process, index) => (
                  <VictoryArea
                    key={index}
                    data={[
                      { x: 'Jan', y: process.jan },
                      { x: 'Feb', y: process.feb },
                      { x: 'Mar', y: process.mar },
                      { x: 'Apr', y: process.apr },
                      { x: 'May', y: process.may },
                      { x: 'Jun', y: process.jun },
                    ]}
                    style={{
                      data: {
                        fill: `hsl(${index * 60}, 70%, 50%)`,
                        fillOpacity: 0.3,
                        stroke: `hsl(${index * 60}, 70%, 40%)`,
                        strokeWidth: 2
                      }
                    }}
                    animate={{
                      duration: 1000,
                      onLoad: { duration: 500 }
                    }}
                  />
                ))}
              </VictoryChart>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceMetrics;