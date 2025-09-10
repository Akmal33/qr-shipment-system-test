import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample data for charts
const salesData = [
  { month: 'Jan', sales: 65000, profit: 12000, orders: 450 },
  { month: 'Feb', sales: 78000, profit: 15000, orders: 520 },
  { month: 'Mar', sales: 90000, profit: 18000, orders: 630 },
  { month: 'Apr', sales: 81000, profit: 16000, orders: 580 },
  { month: 'May', sales: 95000, profit: 19000, orders: 680 },
  { month: 'Jun', sales: 110000, profit: 22000, orders: 750 },
];

const inventoryData = [
  { category: 'Electronics', value: 35, amount: 245000, color: '#8884d8' },
  { category: 'Clothing', value: 25, amount: 189000, color: '#82ca9d' },
  { category: 'Home & Garden', value: 20, amount: 126000, color: '#ffc658' },
  { category: 'Sports', value: 12, amount: 89000, color: '#ff7300' },
  { category: 'Books', value: 8, amount: 67000, color: '#00ff88' },
];

const regionData = [
  { region: 'North America', sales: 450000, growth: 12.3 },
  { region: 'Europe', sales: 380000, growth: 8.7 },
  { region: 'Asia Pacific', sales: 520000, growth: 18.5 },
  { region: 'Latin America', sales: 180000, growth: 15.2 },
  { region: 'Middle East', sales: 120000, growth: 22.1 },
];

const performanceData = [
  { metric: 'Order Fulfillment', value: 94, target: 95 },
  { metric: 'Inventory Accuracy', value: 98, target: 99 },
  { metric: 'Shipping Time', value: 87, target: 90 },
  { metric: 'Customer Satisfaction', value: 92, target: 90 },
];

function App() {
  // Filter states
  const [timeRange, setTimeRange] = useState('6months');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');
  const [metricType, setMetricType] = useState('sales');
  const [chartType, setChartType] = useState('line');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [realTimeUpdate, setRealTimeUpdate] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  React.useEffect(() => {
    if (realTimeUpdate) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeUpdate]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let data = salesData;
    
    // Apply time range filter
    switch (timeRange) {
      case '3months':
        data = salesData.slice(-3);
        break;
      case '6months':
        data = salesData;
        break;
      case '1year':
        // For demo, just use existing data
        data = salesData;
        break;
      default:
        data = salesData;
    }
    
    // Apply value range filters
    if (minValue || maxValue) {
      data = data.filter(item => {
        const value = item[metricType];
        const min = minValue ? parseInt(minValue) : 0;
        const max = maxValue ? parseInt(maxValue) : Infinity;
        return value >= min && value <= max;
      });
    }
    
    // Apply sorting
    if (sortBy === 'value') {
      data = [...data].sort((a, b) => {
        const aVal = a[metricType];
        const bVal = b[metricType];
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    
    return data;
  }, [timeRange, minValue, maxValue, metricType, sortBy, sortOrder]);

  const filteredInventoryData = useMemo(() => {
    if (category === 'all') return inventoryData;
    return inventoryData.filter(item => 
      item.category.toLowerCase().includes(category.toLowerCase())
    );
  }, [category]);

  const filteredRegionData = useMemo(() => {
    if (region === 'all') return regionData;
    return regionData.filter(item => 
      item.region.toLowerCase().includes(region.toLowerCase())
    );
  }, [region]);

  const renderChart = () => {
    const chartStyle = {
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    };
    
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={filteredData} style={chartStyle}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, metricType.charAt(0).toUpperCase() + metricType.slice(1)]}
              labelStyle={{ color: '#333' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={metricType} 
              stroke="#8884d8" 
              fill="url(#colorGradient)"
              strokeWidth={2}
              fillOpacity={0.6}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={filteredData} style={chartStyle}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, metricType.charAt(0).toUpperCase() + metricType.slice(1)]}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey={metricType} 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(data, index) => {
                // Add hover effect
              }}
            />
          </BarChart>
        );
      default:
        return (
          <LineChart data={filteredData} style={chartStyle}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, metricType.charAt(0).toUpperCase() + metricType.slice(1)]}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={metricType} 
              stroke="#8884d8" 
              strokeWidth={3}
              dot={{ 
                fill: '#8884d8', 
                strokeWidth: 2, 
                r: 6,
                transition: 'all 0.3s ease'
              }}
              activeDot={{ 
                r: 8, 
                stroke: '#8884d8',
                strokeWidth: 2,
                fill: '#fff'
              }}
            />
          </LineChart>
        );
    }
  };

  const filterStyles = {
    container: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    },
    filterGroup: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      alignItems: 'center'
    },
    select: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    label: {
      fontWeight: 'bold',
      marginBottom: '5px',
      display: 'block',
      color: '#333'
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>📊 Warehouse Analytics Dashboard</h1>
            <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>Advanced Analytics with Interactive Charts & Filters</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '5px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: realTimeUpdate ? '#4caf50' : '#f44336',
                animation: realTimeUpdate ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{ fontSize: '14px' }}>
                {realTimeUpdate ? 'Live Data' : 'Static Data'}
              </span>
              <button
                onClick={() => setRealTimeUpdate(!realTimeUpdate)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {realTimeUpdate ? 'Pause' : 'Resume'}
              </button>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
          `}
        </style>
      </header>

      {/* Filter System */}
      <div style={filterStyles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#1976d2' }}>🔍 Advanced Filter Controls</h3>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #1976d2',
              backgroundColor: showAdvancedFilters ? '#1976d2' : 'white',
              color: showAdvancedFilters ? 'white' : '#1976d2',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
        
        {/* Basic Filters */}
        <div style={filterStyles.filterGroup}>
          <div>
            <label style={filterStyles.label}>Time Range</label>
            <select 
              style={filterStyles.select}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div>
            <label style={filterStyles.label}>Category</label>
            <select 
              style={filterStyles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
            </select>
          </div>
          
          <div>
            <label style={filterStyles.label}>Region</label>
            <select 
              style={filterStyles.select}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="north">North America</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia Pacific</option>
              <option value="latin">Latin America</option>
              <option value="middle">Middle East</option>
            </select>
          </div>
          
          <div>
            <label style={filterStyles.label}>Metric Type</label>
            <select 
              style={filterStyles.select}
              value={metricType}
              onChange={(e) => setMetricType(e.target.value)}
            >
              <option value="sales">Sales Revenue</option>
              <option value="profit">Profit Margin</option>
              <option value="orders">Order Count</option>
            </select>
          </div>
          
          <div>
            <label style={filterStyles.label}>Chart Type</label>
            <select 
              style={filterStyles.select}
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>⚙️ Advanced Options</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {timeRange === 'custom' && (
                <>
                  <div>
                    <label style={filterStyles.label}>From Date</label>
                    <input 
                      type="date"
                      style={filterStyles.select}
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={filterStyles.label}>To Date</label>
                    <input 
                      type="date"
                      style={filterStyles.select}
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              <div>
                <label style={filterStyles.label}>Min Value ($)</label>
                <input 
                  type="number"
                  placeholder="e.g., 1000"
                  style={filterStyles.select}
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                />
              </div>
              
              <div>
                <label style={filterStyles.label}>Max Value ($)</label>
                <input 
                  type="number"
                  placeholder="e.g., 100000"
                  style={filterStyles.select}
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                />
              </div>
              
              <div>
                <label style={filterStyles.label}>Sort By</label>
                <select 
                  style={filterStyles.select}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date</option>
                  <option value="value">Value</option>
                  <option value="name">Name</option>
                </select>
              </div>
              
              <div>
                <label style={filterStyles.label}>Sort Order</label>
                <select 
                  style={filterStyles.select}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            
            {/* Filter Actions */}
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  setTimeRange('6months');
                  setCategory('all');
                  setRegion('all');
                  setMetricType('sales');
                  setChartType('line');
                  setDateFrom('');
                  setDateTo('');
                  setMinValue('');
                  setMaxValue('');
                  setSortBy('date');
                  setSortOrder('asc');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #f44336',
                  backgroundColor: 'white',
                  color: '#f44336',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔄 Reset All Filters
              </button>
              
              <button 
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #4caf50',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                💾 Save Filter Preset
              </button>
              
              <button 
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #2196f3',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📊 Export Filtered Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1976d2' }}>
          📈 {metricType.charAt(0).toUpperCase() + metricType.slice(1)} Trends ({timeRange})
        </h3>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Inventory Distribution */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#388e3c' }}>
            📦 Inventory Distribution ({category === 'all' ? 'All Categories' : category})
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredInventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {filteredInventoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={2}
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, 'Percentage']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Category Legend */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            marginTop: '15px',
            justifyContent: 'center'
          }}>
            {filteredInventoryData.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '15px',
                fontSize: '12px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: item.color
                }} />
                <span>{item.category}</span>
                <span style={{ fontWeight: 'bold' }}>${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Sales */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#f57c00' }}>
            🌍 Regional Sales ({region === 'all' ? 'All Regions' : region})
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredRegionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="region" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']} />
                <Bar dataKey="sales" fill="#f57c00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {performanceData.map((kpi, index) => {
          const progress = (kpi.value / kpi.target) * 100;
          const isOnTarget = kpi.value >= kpi.target;
          
          return (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${isOnTarget ? '#4caf50' : '#ff9800'}`
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{kpi.metric}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: isOnTarget ? '#4caf50' : '#ff9800' }}>
                  {kpi.value}%
                </span>
                <span style={{ color: '#666' }}>Target: {kpi.target}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(progress, 100)}%`,
                  height: '100%',
                  backgroundColor: isOnTarget ? '#4caf50' : '#ff9800',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                {isOnTarget ? '✅ On Target' : '⚠️ Needs Attention'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#7b1fa2' }}>📊 Dashboard Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total Revenue</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>$2.4M</p>
            <p style={{ margin: '5px 0 0 0', color: '#4caf50', fontSize: '14px' }}>+12.5% ↗️</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>Active Filters</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {[timeRange, category !== 'all' ? category : '', region !== 'all' ? region : ''].filter(Boolean).length}
            </p>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Applied</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Chart Type</h4>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textTransform: 'capitalize' }}>{chartType}</p>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Active View</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#7b1fa2' }}>Data Points</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{filteredData.length}</p>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Displayed</p>
          </div>
        </div>
      </div>
      
      <footer style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        color: '#666',
        fontSize: '14px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '10px' }}>
          🎆 Analytics Dashboard v2.0 - Enhanced with Advanced Graphics & Filter System
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          Running on Port 8085 ✅ | Real-time Updates: {realTimeUpdate ? 'Active �️' : 'Paused ⏸️'} | 
          Filters Applied: {[timeRange, category !== 'all' ? category : '', region !== 'all' ? region : ''].filter(Boolean).length}
        </div>
      </footer>
    </div>
  );
}

export default App;