import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../../services/adminService';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Box, CircularProgress, Alert, Button, IconButton, Tooltip, Chip, Typography,
  TextField, MenuItem, Select, FormControl, InputLabel, Grid, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { debounce } from 'lodash'; // npm install lodash

const UserListPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }]);
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const queryParams = {
    page: paginationModel.page + 1, // API is 1-indexed
    limit: paginationModel.pageSize,
    sortBy: sortModel[0]?.field || 'createdAt',
    order: sortModel[0]?.sort || 'desc',
    role: filters.role || undefined, // Send undefined if empty to not filter
    search: debouncedSearch || undefined,
  };

  const { data: usersData, isLoading, error, isFetching } = useQuery({
    queryKey: ['adminUsers', queryParams],
    queryFn: () => adminService.getAllUsers(queryParams),
    keepPreviousData: true, // Important for smooth pagination
  });
  
  const debouncedSetFilters = useCallback(
    debounce((searchValue) => {
      setDebouncedSearch(searchValue);
    }, 500), // 500ms delay
    []
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'search') {
        setFilters(prev => ({ ...prev, search: value }));
        debouncedSetFilters(value);
    } else {
        setFilters(prev => ({ ...prev, [name]: value }));
    }
  };


  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUserById,
    onSuccess: () => {
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      queryClient.invalidateQueries(['adminUsers']);
    },
    onError: (err) => {
      enqueueSnackbar(err.message || 'Failed to delete user', { variant: 'error' });
    },
    onSettled: () => {
      setDeleteConfirm({ open: false, id: null });
    }
  });

  const handleDeleteUser = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 220 },
    { field: 'name', headerName: 'Name', width: 180, renderCell: (params) => params.row.name || 'N/A' },
    { field: 'email', headerName: 'Email', width: 250, renderCell: (params) => params.row.email || 'N/A' },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => <Chip label={params.value} size="small" color={params.value === '3' ? 'secondary' : 'primary'} variant="outlined" sx={{textTransform:'capitalize'}}/>,
    },
    {
      field: 'isActive',
      headerName: 'Active',
      width: 100,
      type: 'boolean',
      renderCell: (params) => <Chip label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} size="small"/>
    },
    {
      field: 'createdAt',
      headerName: 'Registered On',
      width: 180,
      type: 'dateTime',
      valueGetter: (params) => new Date(params.value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View/Edit User">
            <IconButton onClick={() => navigate(`/admin/users/${params.row.id}`)} size="small">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton onClick={() => handleDeleteUser(params.row.id)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rowCount = usersData?.data?.totalResults || 0;

  if (error && !usersData) return <Alert severity="error" sx={{m:2}}>Error loading users: {error.message}</Alert>;

  return (
    <Container maxWidth="xl"> {/* Use xl for wider tables */}
      <Typography variant="h4" gutterBottom sx={{ my: 3 }}>User Management</Typography>
      
      <Paper sx={{p:2, mb:2}}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
                 <TextField
                    fullWidth
                    label="Search by Name/Email"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                        name="role"
                        value={filters.role}
                        label="Role"
                        onChange={handleFilterChange}
                    >
                        <MenuItem value=""><em>All Roles</em></MenuItem>
                        <MenuItem value="jobseeker">Job Seeker</MenuItem>
                        <MenuItem value="recruiter">Recruiter</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            {/* Add Button to create user if needed */}
        </Grid>
      </Paper>

      <Box sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={usersData?.data?.users || []}
          columns={columns}
          rowCount={rowCount}
          loading={isLoading || isFetching || deleteUserMutation.isLoading}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: false, // We have custom search
              csvOptions: { allColumns: true, fileName: 'users_export' },
              printOptions: { disableToolbarButton: true }
            },
          }}
          getRowId={(row) => row.id} // Ensure 'id' is present in your user data from API
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Box>
      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={() => deleteUserMutation.mutate(deleteConfirm.id)}
        title="Confirm Deletion"
        contentText={`Are you sure you want to delete this user? This action cannot be undone.`}
      />
    </Container>
  );
};

export default UserListPage;