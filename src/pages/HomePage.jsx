// src/pages/HomePage.jsx
import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Icon } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
 import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
 import GroupAddIcon from '@mui/icons-material/GroupAdd';
 import FindInPageIcon from '@mui/icons-material/FindInPage';

const FeatureCard = ({ icon, title, description, linkTo, linkText }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Icon component={icon} sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>{description}</Typography>
      </Box>
      {linkTo && linkText && (
        <Button component={RouterLink} to={linkTo} variant="outlined" sx={{ mt: 2 }}>
          {linkText}
        </Button>
      )}
    </Paper>
  </Grid>
);


const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    // Using Box for full width potential, Container inside for centered content
    <Box sx={{ flexGrow: 1, py: {xs: 4, md: 8} }}> {/* Add vertical padding */}
       <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: {xs: 4, md: 6} // Margin bottom for spacing
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: {xs: '2.5rem', sm: '3rem', md: '3.75rem'} }}>
            Welcome to Job Portal
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph sx={{fontSize: {xs: '1.1rem', sm: '1.25rem'}}}>
            Find your dream job or the perfect candidate.
          </Typography>

          {isAuthenticated && user ? (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Hello, {user?.name}!
              </Typography>
              <Button
                component={RouterLink}
                to="/profile"
                variant="contained"
                size="large"
                sx={{ m: 1 }} // Use m for margin on all sides
              >
                View My Profile
              </Button>
              {user?.role === '2' && (
                <Button
                  component={RouterLink}
                  to="/recruiters/search-seekers"
                  variant="outlined"
                  size="large"
                  sx={{ m: 1 }}
                >
                  Search Candidates
                </Button>
              )}
              {user?.role === '3' && (
                <Button
                  component={RouterLink}
                  to="/admin/dashboard"
                  variant="outlined"
                  size="large"
                  sx={{ m: 1 }}
                >
                  Admin Dashboard
                </Button>
              )}
            </Box>
          ) : (
           <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                sx={{ mr: 2 }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                size="large"
              >
                Register
              </Button>
            </Box>
          )}
        </Box>

        {!isAuthenticated && ( // Show features only if not logged in, or adjust as needed
          <Box sx={{my: {xs:4, md: 8}}}>
            <Typography variant="h4" textAlign="center" gutterBottom sx={{mb:4}}>
                Why Choose Us?
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                <FeatureCard
                    icon={WorkOutlineIcon}
                    title="For Job Seekers"
                    description="Create a stunning profile, upload your resume, and get discovered by top recruiters."
                    linkTo="/register"
                    linkText="Create Profile"
                />
                <FeatureCard
                    icon={GroupAddIcon}
                    title="For Recruiters"
                    description="Access a vast pool of talented candidates. Use our advanced search to find the perfect match."
                    linkTo="/register"
                    linkText="Find Talent"
                />
                <FeatureCard
                    icon={FindInPageIcon}
                    title="Advanced Search"
                    description="Our intelligent search helps you pinpoint exactly what you're looking for, saving you time and effort."
                />
            </Grid>
          </Box>
        )}
       </Container>
    </Box>
  );
};

export default HomePage;