import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAuth from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileService from '../../services/profileService';
import { jobSeekerFormSchema, recruiterFormSchema, adminFormSchema } from '../../utils/profileFormSchemas';
import {
  Container, Box, TextField, Button, Typography, Alert, CircularProgress, Grid, Paper,
  MenuItem, Select, FormControl, InputLabel, FormHelperText, Switch, FormControlLabel,
  Divider, Tabs, Tab, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';

// Import custom field components
import ArrayFieldset from './formFields/ArrayFieldset';
import SkillsAutocomplete from './formFields/SkillsAutocomplete';
import ControlledDatePicker from './formFields/ControlledDatePicker';
import {z} from 'zod'

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: {xs:1, sm:2, md:3} }}>{children}</Box>}
    </div>
  );
};

// Default new item structures for array fields
const newWorkExperience = { jobTitle: '', company: '', startDate: null, endDate: null, currentlyWorking: false, description: '', achievements: [], technologiesUsed: [] };
const newEducation = { institution: '', degree: '', fieldOfStudy: '', startDate: null, endDate: null, grade: '' };
const newCertification = { name: '', issuingOrganization: '', issueDate: null, expirationDate: null };
const newProject = { name: '', description: '', technologies: [], link: '', githubRepo: '', startDate: null, endDate: null };


const EditProfilePage = () => {
  const { user, updateUserContext, refetchUser: refetchAuthUser } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [currentSchema, setCurrentSchema] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  // Determine schema and default values based on user role
  useEffect(() => {
    if (user?.role) {
      if (user.role === '1') setCurrentSchema(jobSeekerFormSchema);
      else if (user.role === '2') setCurrentSchema(recruiterFormSchema);
      else if (user.role === '3') setCurrentSchema(adminFormSchema);
    }
  }, [user?.role]);

  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['myProfileEditData'],
    queryFn: profileService.getCurrentUser,
    enabled: !!user && !!currentSchema, // Only run if user and schema are available
    staleTime: 5 * 60 * 1000,
  });

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(currentSchema || z.object({})), // Start with empty schema, will be updated
    defaultValues: {} // Default values will be populated by useEffect below
  });

  // --- Field Arrays for Job Seeker ---
  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({ control, name: "profileUpdates.workExperience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "profileUpdates.education" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: "profileUpdates.certifications" });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: "profileUpdates.projects" });

  // Populate form with fetched data
  useEffect(() => {
    if (profileData?.data?.user && currentSchema) {
      const fetchedUser = profileData.data.user;
      const defaultVals = {
        name: fetchedUser.name || '',
        email: fetchedUser.email || '',
        password: '', // Don't prefill password
        confirmPassword: '',
        profilePicture: null, // Handled separately
        resume: null, // Handled separately

        profileUpdates: user?.role === '1' ? {
          fullName: fetchedUser.profile?.fullName || fetchedUser.name || '',
          location: fetchedUser.profile?.location || {},
          github: fetchedUser.profile?.github || '',
          linkedin: fetchedUser.profile?.linkedin || '',
          portfolio: fetchedUser.profile?.portfolio || '',
          personalWebsite: fetchedUser.profile?.personalWebsite || '',
          twitter: fetchedUser.profile?.twitter || '',
          bio: fetchedUser.profile?.bio || '',
          headline: fetchedUser.profile?.headline || '',
          currentJobTitle: fetchedUser.profile?.currentJobTitle || '',
          currentCompany: fetchedUser.profile?.currentCompany || '',
          noticePeriod: fetchedUser.profile?.noticePeriod || '',
          skills: fetchedUser.profile?.skills || [],
          techStack: fetchedUser.profile?.techStack || [],
          yearsOfExperience: fetchedUser.profile?.yearsOfExperience ?? null,
          seniorityLevel: fetchedUser.profile?.seniorityLevel || undefined,
          desiredJobTitle: fetchedUser.profile?.desiredJobTitle || '',
          desiredEmploymentTypes: fetchedUser.profile?.desiredEmploymentTypes || [],
          desiredIndustries: fetchedUser.profile?.desiredIndustries || [],
          openToRemote: fetchedUser.profile?.openToRemote ?? false,
          openToRelocation: fetchedUser.profile?.openToRelocation ?? false,
          preferredLocations: fetchedUser.profile?.preferredLocations || [],
          salaryExpectation: fetchedUser.profile?.salaryExpectation || {},
          workExperience: fetchedUser.profile?.workExperience?.map(exp => ({ ...exp, startDate: exp.startDate ? new Date(exp.startDate) : null, endDate: exp.endDate ? new Date(exp.endDate) : null })) || [],
          education: fetchedUser.profile?.education?.map(edu => ({ ...edu, startDate: edu.startDate ? new Date(edu.startDate) : null, endDate: edu.endDate ? new Date(edu.endDate) : null })) || [],
          certifications: fetchedUser.profile?.certifications?.map(cert => ({ ...cert, issueDate: cert.issueDate ? new Date(cert.issueDate) : null, expirationDate: cert.expirationDate ? new Date(cert.expirationDate) : null })) || [],
          projects: fetchedUser.profile?.projects?.map(proj => ({ ...proj, startDate: proj.startDate ? new Date(proj.startDate) : null, endDate: proj.endDate ? new Date(proj.endDate) : null })) || [],
          languages: fetchedUser.profile?.languages || [],
          availableFrom: fetchedUser.profile?.availableFrom ? new Date(fetchedUser.profile.availableFrom) : null,
          jobSearchStatus: fetchedUser.profile?.jobSearchStatus || undefined,
        } : user?.role === '2' ? {
          companyName: fetchedUser.profile?.companyName || '',
          companyWebsite: fetchedUser.profile?.companyWebsite || '',
        } : {} // Admin has no profileUpdates object
      };
      reset(defaultVals);
    }
  }, [profileData, user?.role, currentSchema, reset]);


  const updateProfileMutation = useMutation({
    mutationFn: async (formData) => {
      // Separate file uploads from other data
      const { profilePicture, resume, password, confirmPassword, ...otherData } = formData;
      let profilePictureUrl = user.profilePictureUrl; // Keep existing if not changed

      if (profilePicture) {
        const picUploadResponse = await profileService.uploadProfilePicture(profilePicture);
        profilePictureUrl = picUploadResponse.data.profilePictureUrl; // Get new URL
      }
      if (user.role === '1' && resume) {
        await profileService.uploadResume(resume);
      }

      // Prepare data for PATCH /profile (name, email, stringified profileUpdates)
      const apiPayload = {
        name: otherData.name,
        email: otherData.email,
      };
      if (password && password.length > 0) {
        apiPayload.password = password;
      }
      if (otherData.profileUpdates && Object.keys(otherData.profileUpdates).length > 0) {
        apiPayload.profileUpdates = otherData.profileUpdates;
      }
      
      const mainUpdateResponse = await profileService.updateProfile(apiPayload);
      // Return combined data or just main response, ensure auth context gets updated URL
      return { ...mainUpdateResponse.data, user: { ...mainUpdateResponse.data.user, profilePictureUrl } };
    },
    onSuccess: (data) => {
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      updateUserContext(data.user);
      queryClient.invalidateQueries(['myProfileEditData']);
      queryClient.invalidateQueries(['myProfile']); // For MyProfilePage
      refetchAuthUser();
      // navigate('/profile'); // Or stay on page
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to update profile.', { variant: 'error' });
    }
  });

  const onSubmit = (data) => {
    console.log("Form data submitted:", data);
    updateProfileMutation.mutate(data);
  };

  if (isLoadingProfile && !profileData) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (profileError) return <Alert severity="error" sx={{ m: 2 }}>Error loading profile: {profileError.message}</Alert>;
  if (!user || !currentSchema) return <Alert severity="info" sx={{m:2}}>Loading user data or selecting schema...</Alert>;

  const isLoading = isSubmitting || updateProfileMutation.isLoading || isLoadingProfile;

  // Common fields section
  const renderCommonFields = () => (
    <Grid container spacing={2} sx={{mb:3}}>
      <Grid item xs={12} sm={6}>
        <Controller name="name" control={control} render={({ field }) => <TextField {...field} label="Display Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email Address" fullWidth type="email" error={!!errors.email} helperText={errors.email?.message} />} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller name="password" control={control} render={({ field }) => <TextField {...field} label="New Password (optional)" fullWidth type="password" error={!!errors.password} helperText={errors.password?.message} autoComplete="new-password"/>} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller name="confirmPassword" control={control} render={({ field }) => <TextField {...field} label="Confirm New Password" fullWidth type="password" error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} autoComplete="new-password"/>} />
      </Grid>
      <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Profile Picture (Max 2MB, JPG/PNG)</Typography>
          <Controller
            name="profilePicture"
            control={control}
            render={({ field: { onChange, value, ...restField }}) => (
                <TextField
                    {...restField}
                    type="file"
                    onChange={(e) => onChange(e.target.files[0])}
                    error={!!errors.profilePicture}
                    helperText={errors.profilePicture?.message || (value ? value.name : "No file chosen")}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{
                        "& .MuiInputBase-input": { // Better display for file input
                            padding: "10px 14px", 
                            cursor: "pointer"
                        },
                        "& .MuiInputLabel-root": { // Adjust label position
                            transform: "translate(14px, -9px) scale(0.75)"
                        }
                    }}
                />
            )}
        />
      </Grid>
    </Grid>
  );

  // Job Seeker specific fields sections (example for one tab)
  const renderJobSeekerPersonalDetails = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}><Controller name="profileUpdates.fullName" control={control} render={({ field }) => <TextField {...field} label="Full Name" fullWidth error={!!errors.profileUpdates?.fullName} helperText={errors.profileUpdates?.fullName?.message} />}/></Grid>
      <Grid item xs={12} sm={6}><Controller name="profileUpdates.headline" control={control} render={({ field }) => <TextField {...field} label="Headline (e.g. Senior Developer)" fullWidth error={!!errors.profileUpdates?.headline} helperText={errors.profileUpdates?.headline?.message} />}/></Grid>
      <Grid item xs={12}><Controller name="profileUpdates.bio" control={control} render={({ field }) => <TextField {...field} label="Bio / Summary" multiline rows={4} fullWidth error={!!errors.profileUpdates?.bio} helperText={errors.profileUpdates?.bio?.message} />}/></Grid>
      <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:1}}>Location</Typography></Grid>
      <Grid item xs={12} sm={6} md={3}><Controller name="profileUpdates.location.street" control={control} render={({ field }) => <TextField {...field} label="Street" fullWidth error={!!errors.profileUpdates?.location?.street} />}/></Grid>
      <Grid item xs={12} sm={6} md={3}><Controller name="profileUpdates.location.city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth error={!!errors.profileUpdates?.location?.city} />}/></Grid>
      <Grid item xs={12} sm={6} md={2}><Controller name="profileUpdates.location.state" control={control} render={({ field }) => <TextField {...field} label="State" fullWidth error={!!errors.profileUpdates?.location?.state} />}/></Grid>
      <Grid item xs={12} sm={6} md={2}><Controller name="profileUpdates.location.country" control={control} render={({ field }) => <TextField {...field} label="Country" fullWidth error={!!errors.profileUpdates?.location?.country} />}/></Grid>
      <Grid item xs={12} sm={6} md={2}><Controller name="profileUpdates.location.zipCode" control={control} render={({ field }) => <TextField {...field} label="Zip Code" fullWidth error={!!errors.profileUpdates?.location?.zipCode} />}/></Grid>
    </Grid>
  );
  const renderJobSeekerOnlinePresence = () => (
    <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><Controller name="profileUpdates.linkedin" control={control} render={({ field }) => <TextField {...field} label="LinkedIn Profile URL" fullWidth error={!!errors.profileUpdates?.linkedin} helperText={errors.profileUpdates?.linkedin?.message} />}/></Grid>
        <Grid item xs={12} sm={6}><Controller name="profileUpdates.github" control={control} render={({ field }) => <TextField {...field} label="GitHub Profile URL" fullWidth error={!!errors.profileUpdates?.github} helperText={errors.profileUpdates?.github?.message} />}/></Grid>
        <Grid item xs={12} sm={6}><Controller name="profileUpdates.portfolio" control={control} render={({ field }) => <TextField {...field} label="Portfolio URL" fullWidth error={!!errors.profileUpdates?.portfolio} helperText={errors.profileUpdates?.portfolio?.message} />}/></Grid>
        <Grid item xs={12} sm={6}><Controller name="profileUpdates.personalWebsite" control={control} render={({ field }) => <TextField {...field} label="Personal Website URL" fullWidth error={!!errors.profileUpdates?.personalWebsite} helperText={errors.profileUpdates?.personalWebsite?.message} />}/></Grid>
        <Grid item xs={12} sm={6}><Controller name="profileUpdates.twitter" control={control} render={({ field }) => <TextField {...field} label="Twitter Profile URL" fullWidth error={!!errors.profileUpdates?.twitter} helperText={errors.profileUpdates?.twitter?.message} />}/></Grid>
    </Grid>
  );

  const renderJobSeekerProfessionalInfo = () => (
    <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><Controller name="profileUpdates.currentJobTitle" control={control} render={({ field }) => <TextField {...field} label="Current Job Title" fullWidth error={!!errors.profileUpdates?.currentJobTitle} helperText={errors.profileUpdates?.currentJobTitle?.message} />}/></Grid>
        <Grid item xs={12} sm={6}><Controller name="profileUpdates.currentCompany" control={control} render={({ field }) => <TextField {...field} label="Current Company" fullWidth error={!!errors.profileUpdates?.currentCompany} helperText={errors.profileUpdates?.currentCompany?.message} />}/></Grid>
        <Grid item xs={12} sm={6}><Controller name="profileUpdates.yearsOfExperience" control={control} render={({ field }) => <TextField {...field} label="Years of Experience" type="number" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.profileUpdates?.yearsOfExperience} helperText={errors.profileUpdates?.yearsOfExperience?.message} onChange={e => field.onChange(parseFloat(e.target.value) || null)} />}/></Grid>
        <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.profileUpdates?.seniorityLevel}>
                <InputLabel>Seniority Level</InputLabel>
                <Controller name="profileUpdates.seniorityLevel" control={control} render={({ field }) => (
                    <Select {...field} label="Seniority Level">
                        {['Intern', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Architect', 'Manager'].map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                    </Select>
                )}/>
                {errors.profileUpdates?.seniorityLevel && <FormHelperText>{errors.profileUpdates.seniorityLevel.message}</FormHelperText>}
            </FormControl>
        </Grid>
        <Grid item xs={12}><SkillsAutocomplete name="profileUpdates.skills" control={control} label="Skills" placeholder="Type skill and press Enter" errors={errors.profileUpdates?.skills} /></Grid>
        <Grid item xs={12}><SkillsAutocomplete name="profileUpdates.techStack" control={control} label="Tech Stack" placeholder="Type tech/tool and press Enter" errors={errors.profileUpdates?.techStack} /></Grid>
        <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{mt:2}}>Resume (Max 5MB, PDF/DOC/DOCX)</Typography>
            <Controller name="resume" control={control} render={({ field: { onChange, value, ...restField }}) => (
                <TextField {...restField} type="file" onChange={(e) => onChange(e.target.files[0])} error={!!errors.resume} helperText={errors.resume?.message || (value ? value.name : "No resume chosen")} InputLabelProps={{ shrink: true }} fullWidth />
            )}/>
        </Grid>
    </Grid>
  );

  const renderJobSeekerWorkExperience = () => (
    <ArrayFieldset
        title="Work Experience"
        fields={workFields} append={appendWork} remove={removeWork}
        newItemData={newWorkExperience} control={control} errors={errors}
        namePrefix="profileUpdates.workExperience"
        renderItem={(item, index, itemControl, itemErrors, prefix) => (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.jobTitle`} control={itemControl} render={({ field }) => <TextField {...field} label="Job Title" fullWidth required error={!!itemErrors?.[index]?.jobTitle} helperText={itemErrors?.[index]?.jobTitle?.message} />}/></Grid>
                <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.company`} control={itemControl} render={({ field }) => <TextField {...field} label="Company" fullWidth required error={!!itemErrors?.[index]?.company} helperText={itemErrors?.[index]?.company?.message} />}/></Grid>
                <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.location`} control={itemControl} render={({ field }) => <TextField {...field} label="Location" fullWidth />}/></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Controller name={`${prefix}.${index}.currentlyWorking`} control={itemControl} render={({ field }) => <Switch {...field} checked={field.value || false} />} />} label="Currently Working Here" /></Grid>
                <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.startDate`} control={itemControl} label="Start Date" errors={itemErrors?.[index]?.startDate} /></Grid>
                <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.endDate`} control={itemControl} label="End Date" errors={itemErrors?.[index]?.endDate} disabled={watch(`${prefix}.${index}.currentlyWorking`)} /></Grid>
                <Grid item xs={12}><Controller name={`${prefix}.${index}.description`} control={itemControl} render={({ field }) => <TextField {...field} label="Description" multiline rows={3} fullWidth />}/></Grid>
                 {/* achievements, technologiesUsed (use SkillsAutocomplete or similar) */}
            </Grid>
        )}
    />
  );
  // ... Implement renderJobSeekerEducation, renderJobSeekerCertifications, renderJobSeekerProjects similarly using ArrayFieldset
  // ... Implement renderJobSeekerPreferences (salary, job types etc.)


  // Recruiter specific fields
  const renderRecruiterFields = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Controller name="profileUpdates.companyName" control={control} render={({ field }) => <TextField {...field} label="Company Name" fullWidth error={!!errors.profileUpdates?.companyName} helperText={errors.profileUpdates?.companyName?.message} />} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller name="profileUpdates.companyWebsite" control={control} render={({ field }) => <TextField {...field} label="Company Website" fullWidth error={!!errors.profileUpdates?.companyWebsite} helperText={errors.profileUpdates?.companyWebsite?.message} />} />
      </Grid>
    </Grid>
  );


  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 1, md: 3 }, my: 3 }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Edit Profile
          </Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate('/profile')}
              startIcon={<CancelIcon />}
              sx={{ mr: 1 }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !isDirty}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
        <Divider sx={{mb:2}}/>

        {renderCommonFields()}

        {user.role === '1' && (
          <>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="jobseeker profile sections" variant="scrollable" scrollButtons="auto">
              <Tab label="Personal" />
              <Tab label="Online Presence" />
              <Tab label="Professional" />
              <Tab label="Work Experience" />
              <Tab label="Education" />
              {/* Add more tabs for Certifications, Projects, Preferences */}
            </Tabs>
            <TabPanel value={activeTab} index={0}>{renderJobSeekerPersonalDetails()}</TabPanel>
            <TabPanel value={activeTab} index={1}>{renderJobSeekerOnlinePresence()}</TabPanel>
            <TabPanel value={activeTab} index={2}>{renderJobSeekerProfessionalInfo()}</TabPanel>
            <TabPanel value={activeTab} index={3}>{renderJobSeekerWorkExperience()}</TabPanel>
            <TabPanel value={activeTab} index={4}>{/* Placeholder for renderJobSeekerEducation() */ <Typography>Education Form Here</Typography>}</TabPanel>
          </>
        )}

        {user.role === '2' && renderRecruiterFields()}
        {/* Admin has no extra profileUpdates, common fields are enough */}

        {updateProfileMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>{updateProfileMutation.error.message}</Alert>
        )}
      </Paper>
    </Container>
  );
};

export default EditProfilePage;