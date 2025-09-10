import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import BarcodeGenerator from './pages/BarcodeGenerator/BarcodeGenerator';
import Reports from './pages/Reports/Reports';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  console.log('App component is rendering');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                QR & Barcode Generator Dashboard
              </Typography>
              <Button color="inherit" component={Link} to="/">
                QR Generator
              </Button>
              <Button color="inherit" component={Link} to="/reports">
                Reports
              </Button>
            </Toolbar>
          </AppBar>
          <Box sx={{ p: 3 }}>
            <Routes>
              <Route path="/" element={<BarcodeGenerator />} />
              <Route path="/barcode" element={<BarcodeGenerator />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4">Welcome to QR Generator Dashboard</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Navigate to QR Generator or Reports using the buttons above.
                  </Typography>
                </Box>
              } />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;