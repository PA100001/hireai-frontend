import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuth from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../../services/adminService';
import {
  Container, Box, TextField, Button, Typography, Alert, CircularProgress, Grid, Paper,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Switch, FormControlLabel
} from '@mui/material';
import { useSnackbar } from 'notistack';

// Schema for admin updating user
const adminUserUpdateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['1', '2', '3'], { required_error: "Role is required" }),
  companyName: z.string().optional(), // Required if role is recruiter
  isActive: z.boolean(),
}).refine(data => data.role === '2' ? !!data.companyName && data.companyName.length > 0 : true, {
  message: 'Company name is required for recruiters',
  path: ['companyName'], // Apply error to companyName field
});


const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuth(); // To prevent admin from changing their own role easily here

  const { data: userData, isLoading: isLoadingUser, error: userError, refetch } = useQuery({
    queryKey: ['adminUser', userId],
    queryFn: () => adminService.getUserById(userId),
    enabled: !!userId,
  });

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(adminUserUpdateSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '1',
      companyName: '',
      isActive: true,
    }
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (userData?.data?.user) {
      const fetchedUser = userData.data.user;
      reset({
        name: fetchedUser.name || '',
        email: fetchedUser.email || '',
        role: fetchedUser.role || '1',
        companyName: fetchedUser.profile?.companyName || '', // Assuming companyName is in profile for recruiter
        isActive: fetchedUser.isActive !== undefined ? fetchedUser.isActive : true,
      });
    }
  }, [userData, reset]);

  const updateUserMutation = useMutation({
    mutationFn: (data) => adminService.updateUserById(userId, data),
    onSuccess: (data) => {
      enqueueSnackbar('User updated successfully!', { variant: 'success' });
      queryClient.invalidateQueries(['adminUsers']); // Invalidate list
      queryClient.invalidateQueries(['adminUser', userId]); // Invalidate this user's detail
      refetch(); // Refetch current user detail page
      // navigate('/admin/users'); // Optionally navigate back
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to update user.', { variant: 'error' });
    }
  });

  const onSubmit = (formData) => {
    if (adminUser.id === userId && formData.role !== '3') {
        enqueueSnackbar("You cannot change your own role from admin via this form.", {variant: 'error'});
        return;
    }
    if (adminUser.id === userId && !formData.isActive) {
        enqueueSnackbar("You cannot deactivate your own account via this form.", {variant: 'error'});
        return;
    }

    const dataToSubmit = { ...formData };
    if (formData.role !== '2') {
      delete dataToSubmit.companyName; // Don't send companyName if not recruiter
    }
    updateUserMutation.mutate(dataToSubmit);
  };

  if (isLoadingUser) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (userError) return <Alert severity="error" sx={{ m: 2 }}>Error loading user data: {userError.message}</Alert>;
  if (!userData?.data?.user) return <Alert severity="info" sx={{ m: 2 }}>User not found.</Alert>;

  const userDetail = userData.data.user;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, my: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Edit User: {userDetail.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>ID: {userDetail.id}</Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{mt:1}}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Full Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" fullWidth required type="email" error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="role-select-label"
                      label="Role"
                      disabled={adminUser.id === userId} // Prevent admin from easily changing their own role here
                    >
                      <MenuItem value="jobseeker">Job Seeker</MenuItem>
                      <MenuItem value="recruiter">Recruiter</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  )}
                />
                {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                 {adminUser.id === userId && <FormHelperText>Admins cannot change their own role.</FormHelperText>}
              </FormControl>
            </Grid>
            {selectedRole === '2' && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Company Name (for Recruiter)"
                      fullWidth
                      required={selectedRole === '2'}
                      error={!!errors.companyName}
                      helperText={errors.companyName?.message}
                    />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch 
                        {...field} 
                        checked={field.value} 
                        disabled={adminUser.id === userId && !field.value} // Prevent admin deactivating self
                      />
                    )}
                  />
                }
                label="User is Active"
              />
              {adminUser.id === userId && !watch('isActive') && <FormHelperText error>Admins cannot deactivate their own account.</FormHelperText>}
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || updateUserMutation.isLoading}>
                {isSubmitting || updateUserMutation.isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/admin/users')}>
                Back to User List
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Display other user profile details (read-only) if needed */}
        {/* For example, if profile object has more data */}
        {/* <Typography variant="h6" sx={{mt:4}}>Additional Profile Info</Typography> */}
        {/* {userDetail.profile && <pre>{JSON.stringify(userDetail.profile, null, 2)}</pre>} */}

      </Paper>
    </Container>
  );
};

export default UserDetailPage;