import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Alert,
  Fab,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { inventoryApi } from '../../services/api';
import { Item } from '../../types';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [total, setTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    stockLevel: '',
    warehouseLocation: '',
    status: 'active',
  });

  const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Tools', 'Other'];

  useEffect(() => {
    fetchItems();
  }, [paginationModel]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockItems: Item[] = [
        {
          id: '1',
          itemId: 'ITM-2024-001',
          name: 'Wireless Bluetooth Headphones',
          category: 'Electronics',
          barcode: '1234567890123',
          costPrice: 50.00,
          sellingPrice: 89.99,
          profitMargin: 44.45,
          stockLevel: 150,
          warehouseLocation: 'A1-B2-C3',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          itemId: 'ITM-2024-002',
          name: 'Cotton T-Shirt',
          category: 'Clothing',
          barcode: '2345678901234',
          costPrice: 12.00,
          sellingPrice: 24.99,
          profitMargin: 51.98,
          stockLevel: 300,
          warehouseLocation: 'B1-A2-D1',
          status: 'active',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          itemId: 'ITM-2024-003',
          name: 'Stainless Steel Water Bottle',
          category: 'Other',
          barcode: '3456789012345',
          costPrice: 8.50,
          sellingPrice: 19.99,
          profitMargin: 57.48,
          stockLevel: 200,
          warehouseLocation: 'C1-B1-A3',
          status: 'active',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
      ];
      
      setItems(mockItems);
      setTotal(mockItems.length);
    } catch (err) {
      setError('Failed to fetch items');
      console.error('Inventory API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      costPrice: '',
      sellingPrice: '',
      stockLevel: '',
      warehouseLocation: '',
      status: 'active',
    });
    setOpenDialog(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      costPrice: item.costPrice.toString(),
      sellingPrice: item.sellingPrice.toString(),
      stockLevel: item.stockLevel.toString(),
      warehouseLocation: item.warehouseLocation,
      status: item.status,
    });
    setOpenDialog(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // await inventoryApi.deleteItem(itemId);
        setItems(items.filter(item => item.id !== itemId));
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  const handleSaveItem = async () => {
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stockLevel: parseInt(formData.stockLevel),
        warehouseLocation: formData.warehouseLocation,
        status: formData.status as 'active' | 'inactive' | 'discontinued',
      };

      if (editingItem) {
        // Update existing item
        const updatedItem = { ...editingItem, ...itemData };
        setItems(items.map(item => item.id === editingItem.id ? updatedItem : item));
      } else {
        // Create new item
        const newItem: Item = {
          id: Date.now().toString(),
          itemId: `ITM-2024-${String(items.length + 1).padStart(3, '0')}`,
          barcode: `${Date.now()}`,
          profitMargin: ((itemData.sellingPrice - itemData.costPrice) / itemData.sellingPrice) * 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...itemData,
        };
        setItems([...items, newItem]);
      }

      setOpenDialog(false);
    } catch (err) {
      setError('Failed to save item');
    }
  };

  const columns: GridColDef[] = [
    { field: 'itemId', headerName: 'Item ID', width: 130 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'category', headerName: 'Category', width: 120 },
    { 
      field: 'costPrice', 
      headerName: 'Cost Price', 
      width: 110,
      renderCell: (params: GridRenderCellParams) => `$${params.value.toFixed(2)}`,
    },
    { 
      field: 'sellingPrice', 
      headerName: 'Selling Price', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => `$${params.value.toFixed(2)}`,
    },
    { 
      field: 'profitMargin', 
      headerName: 'Profit Margin', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => `${params.value.toFixed(1)}%`,
    },
    { field: 'stockLevel', headerName: 'Stock', width: 80 },
    { field: 'warehouseLocation', headerName: 'Location', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={
            params.value === 'active' ? 'success' :
            params.value === 'inactive' ? 'warning' : 'error'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEditItem(params.row as Item)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteItem(params.row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton size="small" color="primary">
            <QrCodeIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateItem}
        >
          Add Item
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Selling Price"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock Level"
                type="number"
                value={formData.stockLevel}
                onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warehouse Location"
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                placeholder="e.g., A1-B2-C3"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;