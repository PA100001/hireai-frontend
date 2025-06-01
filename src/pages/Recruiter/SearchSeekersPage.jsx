// src/pages/SearchSeekersPage.jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import * as recruiterService from '../../services/recruiterService'; // Assuming this service exists
import {
  Container, Box, TextField, Button, Typography, Alert, CircularProgress, Grid, Card, Avatar, Chip, Paper
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';


const SeekerResultCard = ({ seeker }) => (
  <Card sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', p:2, width: '100%' }}>
    <Avatar
      src={seeker.profilePictureUrl || undefined}
      alt={seeker.fullName}
      sx={{ width: { xs: 80, sm: 60 }, height: { xs: 80, sm: 60 }, mr: { sm: 2 }, mb: { xs: 1, sm: 0 } }}
    >
      {seeker.fullName ? seeker.fullName.charAt(0).toUpperCase() : '?'}
    </Avatar>
    <Box flexGrow={1} width="100%">
      <Typography
        variant="h6"
        component={RouterLink}
        to={seeker.id ? `/profile/${seeker.id}` : '#'} // Use seeker.id (actual user ID from DB)
        sx={{textDecoration:'none', color: 'primary.main', '&:hover': {textDecoration: 'underline'}}}
      >
          {seeker.fullName || 'N/A'}
      </Typography>
      {seeker.headline && <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>{seeker.headline}</Typography>}
      {seeker.location?.city && (
        <Typography variant="caption" display="block" color="text.secondary">
            {seeker.location.city}{seeker.location.state ? `, ${seeker.location.state}` : ''}{seeker.location.country ? `, ${seeker.location.country}` : ''}
        </Typography>
      )}
      {(seeker.skills && seeker.skills.length > 0) && ( // Ensure skills is an array
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {seeker.skills.slice(0, 7).map((skill, idx) => <Chip key={`${skill}-${idx}`} label={skill} size="small" />)}
          {seeker.skills.length > 7 && <Chip label={`+${seeker.skills.length - 7} more`} size="small" />}
        </Box>
      )}
       {typeof seeker.score === 'number' && ( // Check if score is a number
        <Typography variant="caption" display="block" color="text.secondary" sx={{mt: 1}}>
            Match Score: {(seeker.score * 100).toFixed(1)}%
        </Typography>
      )}
    </Box>
    <Box sx={{ml: {sm: 'auto'}, mt: {xs: 1, sm: 0}, p:1, alignSelf: {sm: 'center'}}}>
        <Button
            variant="outlined"
            size="small"
            component={RouterLink}
            to={seeker.id ? `/profile/${seeker.id}` : '#'} // Use seeker.id
        >
            View Profile
        </Button>
    </Box>
  </Card>
);


const SearchSeekersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchResults, setSearchResults] = useState([]);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { searchQuery: '' }, // Renamed from userQuery for clarity
  });

  const searchMutation = useMutation({
    // The mutationFn expects an object like { userQuery: "...", filters: {...} }
    // So, we pass the `searchQuery` as `userQuery` to the backend.
    mutationFn: (params) => recruiterService.searchSeekers({ userQuery: params.searchQuery, filters: params.filters || {} }),
    onSuccess: (response) => {
      const results = response.data || [];
      setSearchResults(results);
      if (results.length === 0) {
        enqueueSnackbar('No seekers found matching your query.', { variant: 'info' });
      } else {
        enqueueSnackbar(`Found ${results.length} seeker(s).`, { variant: 'success' });
      }
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || error.message || 'Search failed.', { variant: 'error' });
      setSearchResults([]);
    },
  });

  const onSubmit = (data) => {
    if (!data.searchQuery.trim()) {
        enqueueSnackbar('Please enter a search query.', { variant: 'warning' });
        return;
    }
    searchMutation.mutate({ searchQuery: data.searchQuery.trim() });
  };

  return (
    <Container maxWidth="md"> {/* Changed to md for better focus on search */}
      <Paper sx={{p: {xs: 2, sm: 3}, my:3}}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Search Job Seekers
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate
            sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }} // Align items for search box and button
        >
          <Controller
            name="searchQuery"
            control={control}
            rules={{ required: 'Search query cannot be empty' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Enter keywords (e.g., skills, job title, location)"
                variant="outlined"
                error={!!errors.searchQuery}
                helperText={errors.searchQuery?.message}
              />
            )}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={searchMutation.isPending}
            startIcon={searchMutation.isPending ? null : <SearchIcon />}
            sx={{ height: '56px' }} // Match TextField height
          >
            {searchMutation.isPending ? <CircularProgress size={24} color="inherit"/> : 'Search'}
          </Button>
        </Box>
      </Paper>

      {searchMutation.isPending && <Box display="flex" justifyContent="center" my={3}><CircularProgress /></Box>}

      {searchMutation.isError && (
         <Alert severity="error" sx={{my: 2}}>
            Error searching: {searchMutation.error?.message || 'An unknown error occurred.'}
        </Alert>
      )}

      {!searchMutation.isPending && searchResults.length > 0 && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Search Results ({searchResults.length})
          </Typography>
          <Grid container spacing={2}>
            {searchResults.map((seeker, index) => (
              // Ensure seeker.id is the unique MongoDB _id string
              <Grid item xs={12} key={seeker.id || `seeker-${index}`}>
                <SeekerResultCard seeker={seeker} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
       {!searchMutation.isPending && searchMutation.isSuccess && searchResults.length === 0 && (
         <Typography sx={{mt: 3, textAlign: 'center', color: 'text.secondary'}}>
            No candidates found matching your criteria.
         </Typography>
       )}
    </Container>
  );
};

export default SearchSeekersPage;