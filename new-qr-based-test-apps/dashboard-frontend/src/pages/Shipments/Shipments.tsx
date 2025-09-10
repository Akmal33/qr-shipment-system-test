import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  IconButton,
  Alert,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  LocalShipping as ShippingIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon,
  DirectionsBus as TransitIcon,
} from '@mui/icons-material';
import { shipmentsApi } from '../../services/api';
import { Shipment } from '../../types';

const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  useEffect(() => {
    fetchShipments();
  }, [paginationModel]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockShipments: Shipment[] = [
        {
          id: '1',
          shipmentId: 'SHP-2024-001',
          items: ['ITM-2024-001', 'ITM-2024-002'],
          destination: 'Jakarta',
          status: 'in_transit',
          estimatedDelivery: '2024-01-15T00:00:00Z',
          remainingTime: '4 days 12 hours',
          trackingNumber: 'TRK123456789',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T14:30:00Z',
        },
        {
          id: '2',
          shipmentId: 'SHP-2024-002',
          items: ['ITM-2024-003'],
          destination: 'Surabaya',
          status: 'pending',
          estimatedDelivery: '2024-01-20T00:00:00Z',
          remainingTime: '7 days',
          trackingNumber: 'TRK987654321',
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z',
        },
        {
          id: '3',
          shipmentId: 'SHP-2024-003',
          items: ['ITM-2024-001'],
          destination: 'Bandung',
          status: 'delivered',
          estimatedDelivery: '2024-01-08T00:00:00Z',
          actualDelivery: '2024-01-07T16:30:00Z',
          remainingTime: 'Delivered',
          trackingNumber: 'TRK456789123',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-07T16:30:00Z',
        },
      ];
      
      setShipments(mockShipments);
    } catch (err) {
      setError('Failed to fetch shipments');
      console.error('Shipments API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setOpenDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'in_transit':
        return <TransitIcon color="primary" />;
      case 'delivered':
        return <DeliveredIcon color="success" />;
      case 'delayed':
        return <PendingIcon color="error" />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_transit':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'delayed':
        return 'error';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'shipmentId', headerName: 'Shipment ID', width: 140 },
    { field: 'destination', headerName: 'Destination', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.replace('_', ' ')}
          color={getStatusColor(params.value) as any}
          size="small"
          icon={getStatusIcon(params.value)}
        />
      ),
    },
    {
      field: 'items',
      headerName: 'Items',
      width: 100,
      renderCell: (params: GridRenderCellParams) => params.value.length,
    },
    {
      field: 'estimatedDelivery',
      headerName: 'Est. Delivery',
      width: 150,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    { field: 'remainingTime', headerName: 'Remaining Time', width: 150 },
    { field: 'trackingNumber', headerName: 'Tracking #', width: 140 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleViewShipment(params.row as Shipment)}
          >
            <ViewIcon />
          </IconButton>
          <IconButton size="small" color="primary">
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const timelineItems = selectedShipment ? [
    {
      title: 'Order Created',
      time: new Date(selectedShipment.createdAt).toLocaleString(),
      status: 'completed',
    },
    {
      title: 'Package Picked Up',
      time: 'Jan 08, 2024 09:00 AM',
      status: selectedShipment.status !== 'pending' ? 'completed' : 'pending',
    },
    {
      title: 'In Transit',
      time: 'Jan 10, 2024 02:30 PM',
      status: selectedShipment.status === 'in_transit' || selectedShipment.status === 'delivered' ? 'completed' : 'pending',
    },
    {
      title: 'Out for Delivery',
      time: selectedShipment.status === 'delivered' ? 'Jan 07, 2024 03:00 PM' : 'Pending',
      status: selectedShipment.status === 'delivered' ? 'completed' : 'pending',
    },
    {
      title: 'Delivered',
      time: selectedShipment.actualDelivery ? new Date(selectedShipment.actualDelivery).toLocaleString() : 'Pending',
      status: selectedShipment.status === 'delivered' ? 'completed' : 'pending',
    },
  ] : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Shipment Tracking</Typography>
        <Button variant="contained" startIcon={<ShippingIcon />}>
          Create Shipment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={shipments}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Shipment Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Shipment Details - {selectedShipment?.shipmentId}
        </DialogTitle>
        <DialogContent>
          {selectedShipment && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Shipment Information
                </Typography>
                <Typography><strong>Destination:</strong> {selectedShipment.destination}</Typography>
                <Typography><strong>Status:</strong> {selectedShipment.status.replace('_', ' ')}</Typography>
                <Typography><strong>Tracking Number:</strong> {selectedShipment.trackingNumber}</Typography>
                <Typography><strong>Items:</strong> {selectedShipment.items.join(', ')}</Typography>
                <Typography><strong>Created:</strong> {new Date(selectedShipment.createdAt).toLocaleString()}</Typography>
                {selectedShipment.estimatedDelivery && (
                  <Typography><strong>Est. Delivery:</strong> {new Date(selectedShipment.estimatedDelivery).toLocaleString()}</Typography>
                )}
                {selectedShipment.actualDelivery && (
                  <Typography><strong>Actual Delivery:</strong> {new Date(selectedShipment.actualDelivery).toLocaleString()}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Delivery Timeline
                </Typography>
                <Timeline>
                  {timelineItems.map((item, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot 
                          color={item.status === 'completed' ? 'success' : 'grey'}
                        />
                        {index < timelineItems.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">{item.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.time}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button variant="contained">Update Status</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Shipments;