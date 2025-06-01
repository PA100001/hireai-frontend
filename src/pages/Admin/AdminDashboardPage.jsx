import React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as adminService from '../../services/adminService';
import { Container, Typography, Grid, Card, CardContent, Box, CircularProgress, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work'; // JobSeeker
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // Recruiter
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Admin
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // npm install recharts

const StatCard = ({ title, value, icon, color = "primary.main" }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%' }}>
    <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>{icon}</Avatar>
    <Box>
      <Typography variant="h6" component="div">{value}</Typography>
      <Typography color="text.secondary">{title}</Typography>
    </Box>
  </Card>
);

const roleIcons = {
  jobseeker: <WorkIcon />,
  recruiter: <SupervisorAccountIcon />,
  admin: <AdminPanelSettingsIcon />,
};

const AdminDashboardPage = () => {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['adminUserStats'],
    queryFn: adminService.getUserStats,
  });

  if (isLoading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>Error loading stats: {error.message}</Alert>;

  const stats = statsData?.data;

  const chartData = stats?.usersByRole?.map(item => ({
    name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
    count: item.count,
  })) || [];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ my: 3 }}>Admin Dashboard</Typography>
      
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleIcon />} />
          </Grid>
          {stats.usersByRole?.map(roleStat => (
            <Grid item xs={12} sm={6} md={4} key={roleStat.role}>
              <StatCard 
                title={`Total ${roleStat.role.charAt(0).toUpperCase() + roleStat.role.slice(1)}s`} 
                value={roleStat.count} 
                icon={roleIcons[roleStat.role] || <PeopleIcon />} 
                color={roleStat.role === '3' ? 'secondary.main' : 'primary.main'}
              />
            </Grid>
          ))}

          {chartData.length > 0 && (
            <Grid item xs={12} md={8}>
              <Card sx={{p:2}}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Users by Role</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {stats.recentRegistrations && stats.recentRegistrations.length > 0 && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Registrations</Typography>
                  <List dense>
                    {stats.recentRegistrations.slice(0,5).map((user, index) => (
                      <React.Fragment key={user.email || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                                {roleIcons[user.role] || <FiberNewIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.name}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {user.email}
                                </Typography>
                                {` - ${user.role} on ${new Date(user.createdAt).toLocaleDateString()}`}
                              </>
                            }
                          />
                        </ListItem>
                        {index < stats.recentRegistrations.slice(0,5).length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default AdminDashboardPage;