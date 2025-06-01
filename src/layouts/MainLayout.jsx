// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Menu, MenuItem, Tooltip,
CssBaseline // Import CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../hooks/useThemeMode';

const drawerWidth = 240;

const NavItem = ({ to, icon, text, onClick, mobile = false }) => (
  <ListItem disablePadding onClick={onClick}>
    <ListItemButton component={RouterLink} to={to} sx={{ ...(mobile && { pl: 4 }) }}> {/* Indent mobile items */}
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItemButton>
  </ListItem>
);

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main', fontWeight: 'bold' }}>
        Job Portal
      </Typography>
      <Divider />
      <List>
        <NavItem to="/" icon={<HomeIcon />} text="Home" mobile />
        {isAuthenticated && user && (
          <>
            <NavItem to="/profile" icon={<PersonIcon />} text="My Profile" mobile />
            {user.role === '2' && (
              <NavItem to="/recruiters/search-seekers" icon={<WorkIcon />} text="Search Seekers" mobile />
            )}
            {user.role === '3' && (
              <NavItem to="/admin/dashboard" icon={<AdminPanelSettingsIcon />} text="Admin Dashboard" mobile />
            )}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}> {/* Ensure full viewport height */}
      <CssBaseline /> {/* Ensures consistent baseline and applies background to html/body */}
      <AppBar
        component="nav"
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          // Example: Slightly different AppBar background in light mode for distinction
          // backgroundColor: mode === 'light' ? theme.palette.grey[100] : theme.palette.background.paper,
          // color: mode === 'light' ? theme.palette.text.primary : theme.palette.text.primary,
          // boxShadow: mode === 'light' ? theme.shadows[2] : theme.shadows[0],
          // borderBottom: `1px solid ${theme.palette.divider}` // Already in theme.js
        }}
        // elevation={mode === 'light' ? 1 : 0} // Subtle elevation
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit', // Uses AppBar's text color
              fontWeight: 'bold',
              '&:hover': {
                color: 'primary.light' // Example hover
              }
            }}
          >
            Job Portal
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button component={RouterLink} to="/" color="inherit">Home</Button>
            {isAuthenticated && user && (
              <>
                {user.role === '2' && (
                  <Button component={RouterLink} to="/recruiters/search-seekers" color="inherit">Search Candidates</Button>
                )}
                {user.role === '3' && (
                  <Button component={RouterLink} to="/admin/dashboard" color="inherit">Admin</Button>
                )}
              </>
            )}
          </Box>
          <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit" title={mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {isAuthenticated && user ? (
            <Box sx={{ flexGrow: 0, ml: { xs: 1, sm: 2 } }}> {/* Adjusted margin for mobile */}
              <Tooltip title="Open user menu">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.name} src={user.profilePictureUrl || undefined} sx={{ bgcolor: 'secondary.main' }}>
                    {!user.profilePictureUrl && user.name ? user.name.charAt(0).toUpperCase() : <AccountCircle />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
                  <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><ExitToAppIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{display: {xs: 'none', sm: 'flex'}}}> {/* Hide login/register on small screens if drawer is primary nav */}
              <Button component={RouterLink} to="/login" color="inherit">Login</Button>
              <Button component={RouterLink} to="/register" color="inherit">Register</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, 
        flexShrink: { sm: 0 },
        display: { xs: 'block', sm: 'none' },
       }}
        aria-label="mailbox folders"
        
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: theme.palette.background.default },
          }}
        >
          {drawerContent}
          {!isAuthenticated && ( // Add Login/Register to mobile drawer if not logged in
            <Box sx={{p:2, textAlign: 'center'}}>
              <Button component={RouterLink} to="/login" variant="contained" fullWidth sx={{mb:1}} onClick={handleDrawerToggle}>Login</Button>
              <Button component={RouterLink} to="/register" variant="outlined" fullWidth onClick={handleDrawerToggle}>Register</Button>
            </Box>
          )}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // p: 3, // Padding handled by Container in pages usually
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default, // Applied by CssBaseline as well
          mt: { xs: '56px', sm: '64px' }, // Account for AppBar height
          overflowY: 'auto' // Allow content to scroll
        }}
      >
        {/* <Toolbar /> Removed as mt above handles spacing */}
        <Outlet /> {/* Page content will be rendered here */}
      </Box>
    </Box>
  );
};

export default MainLayout;