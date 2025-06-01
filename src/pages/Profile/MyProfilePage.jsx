import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileService from '../../services/profileService';
import {
  Container, Typography, Card, CardContent, CardActions, Button, Box, CircularProgress, Alert,
  Avatar, Grid, TextField, Paper, IconButton, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/CloudDownload';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../../components/common/ConfirmationDialog'; // You'd create this

const MyProfilePage = () => {
  const { user, logout, updateUserContext, refetchUser: refetchAuthUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [resumeFile, setResumeFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Fetch profile data using React Query (even though we have some in AuthContext, this ensures it's fresh)
  const { data: profileData, isLoading, error, } = useQuery({
    queryKey: ['myProfile'],
    queryFn: profileService.getCurrentUser,
    enabled: !!user, // Only run if user is available from AuthContext
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const displayedUser = profileData?.data?.user || user; // Prefer fresh data, fallback to context data

  const uploadResumeMutation = useMutation({
    mutationFn: profileService.uploadResume,
    onSuccess: (data) => {
      enqueueSnackbar(data.message || 'Resume uploaded successfully!', { variant: 'success' });
      queryClient.invalidateQueries(['myProfile']); // Refetch profile
      refetchAuthUser(); // Refetch user in auth context too
      setResumeFile(null);
    },
    onError: (err) => {
      enqueueSnackbar(err.message || 'Failed to upload resume.', { variant: 'error' });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: profileService.uploadProfilePicture,
    onSuccess: (data) => {
      enqueueSnackbar(data.message || 'Profile picture updated!', { variant: 'success' });
      updateUserContext({ profilePictureUrl: data.data.profilePictureUrl }); // Optimistic update in context
      queryClient.invalidateQueries(['myProfile']);
      refetchAuthUser();
      setAvatarFile(null);
    },
    onError: (err) => {
      enqueueSnackbar(err.message || 'Failed to upload profile picture.', { variant: 'error' });
    },
  });
  
  const deleteAccountMutation = useMutation({
    mutationFn: profileService.deleteMyAccount,
    onSuccess: () => {
        enqueueSnackbar('Account deleted successfully.', { variant: 'success' });
        logout();
        navigate('/login');
    },
    onError: (err) => {
        enqueueSnackbar(err.message || 'Failed to delete account.', { variant: 'error' });
    }
  });

  const handleResumeUpload = () => {
    if (resumeFile) {
      uploadResumeMutation.mutate(resumeFile);
    }
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      uploadAvatarMutation.mutate(avatarFile);
    }
  };

  const handleDownloadResume = async () => {
    try {
      await profileService.downloadResume();
      // Snackbar success is handled inside downloadResume on actual completion
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to download resume.', { variant: 'error' });
    }
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAccount = () => {
    setDeleteConfirmOpen(false);
    deleteAccountMutation.mutate();
  };


  if (isLoading && !displayedUser) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error && !displayedUser) return <Alert severity="error">Error loading profile: {error.message}</Alert>;
  if (!displayedUser) return <Alert severity="info">No profile data available. You might need to login again.</Alert>;

  const { name, email, role, profile, profilePictureUrl } = displayedUser;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar
            src={profilePictureUrl || undefined}
            alt={name}
            sx={{ width: 100, height: 100, mr: 2, fontSize: '2.5rem' }}
          >
            {!profilePictureUrl ? name?.charAt(0).toUpperCase() : null}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>{name}</Typography>
            <Typography variant="subtitle1" color="textSecondary">{email}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{textTransform: 'capitalize'}}>{role}</Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            component={RouterLink}
            to="/profile/edit"
            sx={{ ml: 'auto' }}
          >
            Edit Profile
          </Button>
        </Box>

        <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
                <Typography variant="h6">Upload Profile Picture</Typography>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload-input"
                    type="file"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                />
                <label htmlFor="avatar-upload-input">
                    <Button variant="contained" component="span" startIcon={<FileUploadIcon />} sx={{mr: 1}}>
                        Choose Image
                    </Button>
                </label>
                {avatarFile && <Typography variant="caption" sx={{mr:1}}>{avatarFile.name}</Typography>}
                <Button onClick={handleAvatarUpload} disabled={!avatarFile || uploadAvatarMutation.isLoading} variant="outlined">
                    {uploadAvatarMutation.isLoading ? <CircularProgress size={20}/> : "Upload Avatar"}
                </Button>
            </Grid>
            {role === '1' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Resume</Typography>
                 <input
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="resume-upload-input"
                    type="file"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <label htmlFor="resume-upload-input">
                    <Button variant="contained" component="span" startIcon={<FileUploadIcon />} sx={{mr: 1}}>
                        Choose Resume
                    </Button>
                </label>
                {resumeFile && <Typography variant="caption" sx={{mr:1}}>{resumeFile.name}</Typography>}

                <Button onClick={handleResumeUpload} disabled={!resumeFile || uploadResumeMutation.isLoading} variant="outlined" sx={{mr:1}}>
                   {uploadResumeMutation.isLoading ? <CircularProgress size={20}/> : "Upload Resume"}
                </Button>
                {profile?.resumeGCSPath && (
                  <Tooltip title="Download Your Resume">
                    <IconButton onClick={handleDownloadResume} color="primary">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            )}
        </Grid>


        <Typography variant="h5" gutterBottom mt={4}>Profile Details</Typography>
        {profile ? (
          <Grid container spacing={2}>
            {/* Job Seeker Specific Fields */}
            {role === '1' && (
              <>
                <Grid item xs={12} sm={6}><Typography><strong>Full Name:</strong> {profile.fullName || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Headline:</strong> {profile.headline || 'N/A'}</Typography></Grid>
                <Grid item xs={12}><Typography><strong>Bio:</strong> {profile.bio || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Location:</strong> {`${profile.location?.city || ''}, ${profile.location?.country || ''}`.replace(/^,|,$/g, '') || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Skills:</strong> {profile.skills?.join(', ') || 'N/A'}</Typography></Grid>
                {/* Add more job seeker fields here */}
              </>
            )}

            {/* Recruiter Specific Fields */}
            {role === '2' && (
              <>
                <Grid item xs={12} sm={6}><Typography><strong>Company Name:</strong> {profile.companyName || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Company Website:</strong> {profile.companyWebsite ? <Link href={profile.companyWebsite} target="_blank" rel="noopener noreferrer">{profile.companyWebsite}</Link> : 'N/A'}</Typography></Grid>
                {/* Add more recruiter fields here */}
              </>
            )}
          </Grid>
        ) : (
          <Typography>No detailed profile information available. Please complete your profile.</Typography>
        )}

        <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isLoading}
            >
                {deleteAccountMutation.isLoading ? <CircularProgress size={24} color="inherit" /> : "Delete My Account"}
            </Button>
        </Box>
      </Paper>
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account?"
        contentText="Are you sure you want to delete your account? This action cannot be undone."
      />
    </Container>
  );
};

export default MyProfilePage;