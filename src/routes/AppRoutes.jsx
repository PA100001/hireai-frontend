import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import MyProfilePage from '../pages/Profile/MyProfilePage';
import UserProfilePage  from '../pages/Profile/UserProfilePage';
import EditProfilePage from '../pages/Profile/EditProfilePage'; // You'd create this
import SearchSeekersPage from '../pages/Recruiter/SearchSeekersPage';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import UserListPage from '../pages/Admin/UserListPage';
import UserDetailPage from '../pages/Admin/UserDetailPage'; // You'd create this
import NotFoundPage from '../pages/NotFoundPage';
import HomePage from '../pages/HomePage'; // A simple landing/home page

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes - Common for all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          {/* Add more common protected routes here */}
        </Route>

        {/* Protected Routes - Job Seeker Specific (if any, beyond profile) */}
        {/*
        <Route element={<ProtectedRoute allowedRoles={['1']} />}>
           <Route path="/jobseeker/dashboard" element={<JobSeekerDashboardPage />} />
        </Route>
        */}

        {/* Protected Routes - Recruiter Specific */}
        <Route element={<ProtectedRoute allowedRoles={["2", "3"]} />}> {/* Admin can also search */}
          <Route path="/recruiters/search-seekers" element={<SearchSeekersPage />} />
        </Route>

        {/* Protected Routes - Admin Specific */}
        <Route element={<ProtectedRoute allowedRoles={["3"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserListPage />} />
          <Route path="/admin/users/:userId" element={<UserDetailPage />} />
          {/* Add more admin routes here */}
        </Route>

        {/* Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;