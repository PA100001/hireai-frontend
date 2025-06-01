import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAuth from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileService from '../../services/profileService';
import {
  jobSeekerFormSchema, recruiterFormSchema, adminFormSchema,
  jobSeekerProfileUpdatesOnlySchema,
  recruiterProfileUpdatesOnlySchema,
} from '../../utils/profileFormSchemas';
import {
  Container, Box, TextField, Button, Typography, Alert, CircularProgress, Grid, Paper,
  MenuItem, Select, FormControl, InputLabel, FormHelperText, Switch, FormControlLabel,
  Divider, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import ArrayFieldset from '../../components/profile/formFields/ArrayFieldset';
import SkillsAutocomplete from '../../components/profile/formFields/SkillsAutocomplete';
import ControlledDatePicker from '../../components/profile/formFields/ControlledDatePicker';
import FileUploaderV2 from '../../components/common/FileUploaderV2';
import { cloneDeep, isEmpty, omitBy, get as lodashGet } from 'lodash'; // Added lodashGet
import { z } from 'zod';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const newWorkExperience = { jobTitle: '', company: '', startDate: null, endDate: null, currentlyWorking: false, description: '', achievements: [], technologiesUsed: [] };
const newEducation = { institution: '', degree: '', fieldOfStudy: '', startDate: null, endDate: null, grade: '' };
const newCertification = { name: '', issuingOrganization: '', issueDate: null, expirationDate: null };
const newProject = { name: '', description: '', technologies: [], link: '', githubRepo: '', startDate: null, endDate: null };

const cleanDeep = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => (v && typeof v === 'object') ? cleanDeep(v) : v).filter(v => v != null && (typeof v !== 'string' || v.trim() !== '')); // Ensure empty strings in arrays are also handled if desired, or remove string check
  } else if (obj != null && typeof obj === 'object') {
    return Object.entries(obj)
      .map(([k, v]) => [k, v && typeof v === 'object' ? cleanDeep(v) : v])
      .reduce((a, [k, v]) => {
        if (v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0 && !Object.keys(obj).some(key => key === k && Array.isArray(obj[k])) )) { // Keep empty arrays if they were intentionally set
          return a;
        }
        a[k] = v;
        return a;
      }, {});
  }
  return obj;
};


const EditProfilePage = () => {
  const { user, updateUserContext, refetchUser: refetchAuthUser } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [initialProfileData, setInitialProfileData] = useState(null); // Renamed from initialProfileDataForDiff
  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const getCurrentSchema = useCallback(() => {
    if (!user?.role) return z.object({});
    if (user.role === '1') return jobSeekerFormSchema;
    if (user.role === '2') return recruiterFormSchema;
    if (user.role === '3') return adminFormSchema;
    return z.object({});
  }, [user?.role]);

  const { data: profileDataResponse, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['myProfileEditData'],
    queryFn: profileService.getCurrentUser,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (response) => { // Changed data to response for clarity
      console.log("success")
      console.dir(response)
      const fetchedUser = response?.data?.user; // Use response.data.user
        if (fetchedUser) {
                console.log("success")
      console.dir(response)
            const initial = {
                name: fetchedUser.name || '',
                email: fetchedUser.email || '',
                profileUpdates: cloneDeep(fetchedUser.profile || {}),
                existingProfilePictureUrl: fetchedUser.profilePictureUrl,
                existingResumeUrl: user?.role === '1' ? fetchedUser.profile?.resumeGCSPath : null,
                existingResumeName: user?.role === '1' ? fetchedUser.profile?.resumeOriginalName : null,
            };
            setInitialProfileData(initial); // Use renamed setter
                  console.log("success")
      console.dir(response)
        }
    }
  });

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting, dirtyFields }, getValues, trigger, setValue } = useForm({
    resolver: zodResolver(getCurrentSchema()),
    defaultValues: {},
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({ control, name: "profileUpdates.workExperience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "profileUpdates.education" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: "profileUpdates.certifications" });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: "profileUpdates.projects" });

  useEffect(() => {
    if (initialProfileData && profileDataResponse?.data?.user) { // Check profileDataResponse too
      const fetchedUser = profileDataResponse.data.user;
      const defaultVals = {
        name: fetchedUser.name || '',
        email: fetchedUser.email || '',
        password: '', confirmPassword: '',
        profilePicture: null, resume: null,
        profileUpdates: user?.role === '1' ? {
          headline: fetchedUser.profile?.headline || '',
          bio: fetchedUser.profile?.bio || '',
          location: fetchedUser.profile?.location || { street: '', city: '', state: '', country: '', zipCode: '' },
          linkedin: fetchedUser.profile?.linkedin || '',
          github: fetchedUser.profile?.github || '',
          portfolio: fetchedUser.profile?.portfolio || '',
          personalWebsite: fetchedUser.profile?.personalWebsite || '',
          twitter: fetchedUser.profile?.twitter || '',
          currentJobTitle: fetchedUser.profile?.currentJobTitle || '',
          currentCompany: fetchedUser.profile?.currentCompany || '',
          yearsOfExperience: fetchedUser.profile?.yearsOfExperience || null,
          seniorityLevel: fetchedUser.profile?.seniorityLevel || '',
          skills: fetchedUser.profile?.skills || [],
          techStack: fetchedUser.profile?.techStack || [],
          noticePeriod: fetchedUser.profile?.noticePeriod || '',
          workExperience: fetchedUser.profile?.workExperience?.map(exp => ({ ...newWorkExperience, ...exp, startDate: exp.startDate ? new Date(exp.startDate) : null, endDate: exp.endDate ? new Date(exp.endDate) : null, achievements: exp.achievements || [], technologiesUsed: exp.technologiesUsed || [] })) || [],
          education: fetchedUser.profile?.education?.map(edu => ({ ...newEducation, ...edu, startDate: edu.startDate ? new Date(edu.startDate) : null, endDate: edu.endDate ? new Date(edu.endDate) : null })) || [],
          certifications: fetchedUser.profile?.certifications?.map(cert => ({ ...newCertification, ...cert, issueDate: cert.issueDate ? new Date(cert.issueDate) : null, expirationDate: cert.expirationDate ? new Date(cert.expirationDate) : null })) || [],
          projects: fetchedUser.profile?.projects?.map(proj => ({ ...newProject, ...proj, startDate: proj.startDate ? new Date(proj.startDate) : null, endDate: proj.endDate ? new Date(proj.endDate) : null, technologies: proj.technologies || [] })) || [],
          desiredJobTitle: fetchedUser.profile?.desiredJobTitle || '',
          desiredEmploymentTypes: fetchedUser.profile?.desiredEmploymentTypes || [],
          desiredIndustries: fetchedUser.profile?.desiredIndustries || [],
          openToRemote: fetchedUser.profile?.openToRemote || false,
          openToRelocation: fetchedUser.profile?.openToRelocation || false,
          preferredLocations: fetchedUser.profile?.preferredLocations || [],
          salaryExpectation: fetchedUser.profile?.salaryExpectation || { min: null, max: null, currency: 'USD', period: 'year' },
          availableFrom: fetchedUser.profile?.availableFrom ? new Date(fetchedUser.profile.availableFrom) : null,
          jobSearchStatus: fetchedUser.profile?.jobSearchStatus || '',
          languages: fetchedUser.profile?.languages || [],
        } : user?.role === '2' ? {
          companyName: fetchedUser.profile?.companyName || '',
          companyWebsite: fetchedUser.profile?.companyWebsite || '',
        } : {}
      };
      reset(defaultVals);
    }
  }, [initialProfileData, profileDataResponse, user?.role, reset]);


  const profileUpdateMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (response) => { // Changed data to response
      enqueueSnackbar('Profile section updated successfully!', { variant: 'success' });
      const updatedUser = response.data.user; // Use response.data.user
      updateUserContext(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['myProfileEditData'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });

      refetchAuthUser();

      setInitialProfileData(prev => ({
        ...prev,
        name: updatedUser.name,
        email: updatedUser.email,
        profileUpdates: cloneDeep(updatedUser.profile || {}),
        // Use the latest from backend if available, otherwise keep what was set by direct file upload
        existingProfilePictureUrl: updatedUser.profilePictureUrl || prev.existingProfilePictureUrl,
        existingResumeUrl: user?.role === '1' ? (updatedUser.profile?.resumeGCSPath || prev.existingResumeUrl) : null,
        existingResumeName: user?.role === '1' ? (updatedUser.profile?.resumeOriginalName || prev.existingResumeName) : null,
      }));
      // Reset dirty state for the whole form as changes are now "saved"
      // reset(getValues(), { keepValues: true }); // This might be too broad, consider resetting dirtyFields more selectively or let RHF handle it with new defaultValues from useEffect
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || error.message || 'Failed to update profile section.', { variant: 'error' });
    }
  });

  const handleSectionSubmit = async (sectionName, fieldPaths, sectionSchema = null) => {
    const currentValues = getValues();
    let dataToSubmit = {};
    let filesToUpload = {};

    if (sectionName === 'common') {
        const topLevelFieldsToConsider = ['name', 'email', 'password']; // profilePicture & resume are handled as files
        topLevelFieldsToConsider.forEach(path => {
            if (dirtyFields[path]) {
                if (path === 'password' && currentValues.password === '') {
                    // Don't send empty password
                } else {
                    dataToSubmit[path] = currentValues[path];
                }
            }
        });
        if (dirtyFields.profilePicture && currentValues.profilePicture instanceof File) {
            filesToUpload.profilePicture = currentValues.profilePicture;
        }
        if (user.role === '1' && dirtyFields.resume && currentValues.resume instanceof File) {
            filesToUpload.resume = currentValues.resume;
        }
    }

    let profileUpdatesPayload = {};
    if (sectionName !== 'common' && currentValues.profileUpdates && fieldPaths) {
        fieldPaths.forEach(path => {
            const fullPath = `profileUpdates.${path}`;
            if (lodashGet(dirtyFields, fullPath)) { // Use lodashGet for nested dirty check
                let value = currentValues.profileUpdates;
                path.split('.').forEach(p => { value = value?.[p]; });
                
                if (value !== undefined) {
                    let target = profileUpdatesPayload;
                    const parts = path.split('.');
                    parts.forEach((p, i) => {
                        if (i === parts.length - 1) {
                            target[p] = value;
                        } else {
                            target[p] = target[p] || (Array.isArray(lodashGet(currentValues.profileUpdates, parts.slice(0, i + 1).join('.'))) ? [] : {});
                            target = target[p];
                        }
                    });
                }
            }
        });
    }
    
    if (sectionSchema && !isEmpty(profileUpdatesPayload)) {
        try {
            await sectionSchema.parseAsync(profileUpdatesPayload);
        } catch (validationError) {
            console.error("Section validation error:", validationError.errors);
            validationError.errors.forEach(err => {
                const errorPath = err.path.join('.');
                // Try to set error using RHF's setError if possible, or use snackbar
                // setError(`profileUpdates.${errorPath}`, { type: 'manual', message: err.message });
                enqueueSnackbar(`Error in ${sectionName} section (${errorPath}): ${err.message}`, {variant: 'error'});
            });
            return;
        }
    }

    if (!isEmpty(profileUpdatesPayload)) {
        dataToSubmit.profileUpdates = cleanDeep(profileUpdatesPayload);
    }
    
    const noProfileUpdatesData = isEmpty(dataToSubmit.profileUpdates) || Object.keys(dataToSubmit.profileUpdates).length === 0;
    const noTopLevelData = isEmpty(omitBy(dataToSubmit, (v,k) => k === 'profileUpdates' || k === 'password' && v ==='')); // Exclude empty passwords from this check
    const noFiles = isEmpty(filesToUpload);

    if (noProfileUpdatesData && noTopLevelData && noFiles) {
      enqueueSnackbar('No changes detected in this section.', { variant: 'info' });
      return;
    }
    
    console.log("Submitting section:", sectionName, "Data:", dataToSubmit, "Files:", filesToUpload);

    try {
        let profilePictureUpdated = false;
        let resumeUpdated = false;

        if (filesToUpload.profilePicture) {
            const picUploadResponse = await profileService.uploadProfilePicture(filesToUpload.profilePicture);
            enqueueSnackbar('Profile picture updated!', { variant: 'success' });
            reset({...getValues(), profilePicture: null}, { keepDirtyFields: dirtyFields.profilePicture ? undefined : {profilePicture: false} }); // Keep other dirty states
            
            const newProfilePictureUrl = picUploadResponse.data.profilePictureUrl;
            queryClient.setQueryData(['myProfileEditData'], (oldData) => {
                if (!oldData || !oldData.data || !oldData.data.user) return oldData;
                return {
                    ...oldData,
                    data: { ...oldData.data, user: { ...oldData.data.user, profilePictureUrl: newProfilePictureUrl }}
                }
            });
            setInitialProfileData(prev => ({...prev, existingProfilePictureUrl: newProfilePictureUrl}));
            profilePictureUpdated = true;
        }
        if (filesToUpload.resume && user.role === '1') {
            const resumeUploadResponse = await profileService.uploadResume(filesToUpload.resume);
            enqueueSnackbar('Resume uploaded!', { variant: 'success' });
            reset({...getValues(), resume: null}, { keepDirtyFields: dirtyFields.resume ? undefined : {resume: false} });

            const newResumePath = resumeUploadResponse.data.data.user.profile.resumeGCSPath;
            const newResumeName = filesToUpload.resume.name;
            queryClient.setQueryData(['myProfileEditData'], (oldData) => {
                if (!oldData || !oldData.data || !oldData.data.user || !oldData.data.user.profile) return oldData;
                return {
                    ...oldData,
                    data: { ...oldData.data, user: { ...oldData.data.user, profile: {...oldData.data.user.profile, resumeGCSPath: newResumePath, resumeOriginalName: newResumeName } }}
                }
            });
            setInitialProfileData(prev => ({...prev, existingResumeUrl: newResumePath, existingResumeName: newResumeName}));
            resumeUpdated = true;
        }

        // Only call main profile update if there are non-file changes or if no files were uploaded but other data exists.
        const hasOtherDataToSubmit = !isEmpty(dataToSubmit.profileUpdates) || dataToSubmit.name || dataToSubmit.email || (dataToSubmit.password && dataToSubmit.password !== '');
        
        if (hasOtherDataToSubmit) {
            profileUpdateMutation.mutate(dataToSubmit);
        } else if (!profilePictureUpdated && !resumeUpdated) { 
            // This case means no files were uploaded AND no other data was submitted (already caught by the first check)
            // However, if ONLY files were uploaded and successfully, we might not need this message.
            // The first check `if (noProfileUpdatesData && noTopLevelData && noFiles)` should handle "no changes".
            // This condition is if there's no data in `dataToSubmit` AND no files were just uploaded.
        }

    } catch (uploadError) {
        enqueueSnackbar(uploadError.response?.data?.message || uploadError.message || 'File upload failed.', { variant: 'error' });
    }
  };

  const SectionWrapper = ({ title, children, sectionKey, fieldPaths, schemaForValidation }) => (
    <Accordion defaultExpanded sx={{mb:2, '&.Mui-expanded:before': { opacity: 1 }}}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {children}
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            variant="contained"
            onClick={() => handleSectionSubmit(sectionKey, fieldPaths, schemaForValidation)}
            startIcon={<SaveIcon />}
            disabled={profileUpdateMutation.isPending || isLoadingProfile} // Changed from isLoading
          >
            Save {title}
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const renderCommonFields = () => (
    <SectionWrapper title="Basic Information" sectionKey="common" fieldPaths={['name', 'email', 'password', 'profilePicture', 'resume']}> {/* Added resume here */}
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Controller name="name" control={control} render={({ field }) => <TextField {...field} label="Display Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email Address" fullWidth type="email" error={!!errors.email} helperText={errors.email?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="password" control={control} render={({ field }) => <TextField {...field} label="New Password (optional)" fullWidth type="password" error={!!errors.password} helperText={errors.password?.message} autoComplete="new-password"/>}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="confirmPassword" control={control} render={({ field }) => <TextField {...field} label="Confirm New Password" fullWidth type="password" error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} autoComplete="new-password"/>}/></Grid>
            <Grid item xs={12}>
                <Controller
                    name="profilePicture"
                    control={control}
                    render={({ field }) => ( // field now contains onChange from RHF
                        <FileUploaderV2
                            label="Upload Profile Picture"
                            acceptedFileTypes={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] }}
                            maxFileSize={2 * 1024 * 1024}
                            existingFileUrl={initialProfileData?.existingProfilePictureUrl}
                            error={errors.profilePicture}
                            onFileChange={field.onChange} // Use RHF's onChange
                            // The custom setValue prop if FileUploaderV2 needs it for its own clear button:
                            // customClearAction={() => setValue('profilePicture', null, { shouldDirty: true })}
                            // Assuming FileUploaderV2 will call onFileChange(null) if its internal clear is used.
                        />
                    )}
                />
            </Grid>
             {user.role === '1' && ( // Resume only for jobseeker in common section
                <Grid item xs={12}>
                    <Controller
                        name="resume"
                        control={control}
                        render={({ field }) => (
                            <FileUploaderV2
                                label="Upload Resume"
                                acceptedFileTypes={{ 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
                                maxFileSize={5 * 1024 * 1024}
                                existingFileUrl={initialProfileData?.existingResumeUrl}
                                existingFileName={initialProfileData?.existingResumeName}
                                error={errors.resume}
                                onFileChange={field.onChange} // Use RHF's onChange
                                // customClearAction={() => setValue('resume', null, { shouldDirty: true })}
                            />
                        )}
                    />
                </Grid>
            )}
        </Grid>
    </SectionWrapper>
  );

  // --- Render functions for Job Seeker ---
  const renderJobSeekerPersonalDetails = () => (
    <SectionWrapper title="Personal & Location" sectionKey="personal" fieldPaths={['headline', 'bio', 'location']} schemaForValidation={jobSeekerProfileUpdatesOnlySchema.pick({headline:true, bio:true, location:true})}>
        <Grid container spacing={2}>
            <Grid item xs={12}><Controller name="profileUpdates.headline" control={control} render={({ field }) => <TextField {...field} label="Headline (e.g. Senior Developer)" fullWidth error={!!errors.profileUpdates?.headline} helperText={errors.profileUpdates?.headline?.message} />}/></Grid>
            <Grid item xs={12}><Controller name="profileUpdates.bio" control={control} render={({ field }) => <TextField {...field} label="Bio / Summary" multiline rows={4} fullWidth error={!!errors.profileUpdates?.bio} helperText={errors.profileUpdates?.bio?.message} />}/></Grid>
            <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:1}}>Location</Typography></Grid>
            <Grid item xs={12} sm={6} md={4}><Controller name="profileUpdates.location.street" control={control} render={({ field }) => <TextField {...field} label="Street" fullWidth error={!!errors.profileUpdates?.location?.street} helperText={errors.profileUpdates?.location?.street?.message} />}/></Grid>
            <Grid item xs={12} sm={6} md={4}><Controller name="profileUpdates.location.city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth error={!!errors.profileUpdates?.location?.city} helperText={errors.profileUpdates?.location?.city?.message} />}/></Grid>
            <Grid item xs={12} sm={6} md={4}><Controller name="profileUpdates.location.state" control={control} render={({ field }) => <TextField {...field} label="State/Province" fullWidth error={!!errors.profileUpdates?.location?.state} helperText={errors.profileUpdates?.location?.state?.message} />}/></Grid>
            <Grid item xs={12} sm={6} md={6}><Controller name="profileUpdates.location.country" control={control} render={({ field }) => <TextField {...field} label="Country" fullWidth error={!!errors.profileUpdates?.location?.country} helperText={errors.profileUpdates?.location?.country?.message} />}/></Grid>
            <Grid item xs={12} sm={6} md={6}><Controller name="profileUpdates.location.zipCode" control={control} render={({ field }) => <TextField {...field} label="Zip/Postal Code" fullWidth error={!!errors.profileUpdates?.location?.zipCode} helperText={errors.profileUpdates?.location?.zipCode?.message} />}/></Grid>
        </Grid>
    </SectionWrapper>
  );

  const renderJobSeekerOnlinePresence = () => (
    <SectionWrapper title="Online Presence" sectionKey="onlinePresence" fieldPaths={['linkedin', 'github', 'portfolio', 'personalWebsite', 'twitter']} schemaForValidation={jobSeekerProfileUpdatesOnlySchema.pick({linkedin:true, github:true, portfolio:true, personalWebsite:true, twitter:true})}>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.linkedin" control={control} render={({ field }) => <TextField {...field} label="LinkedIn Profile URL" fullWidth error={!!errors.profileUpdates?.linkedin} helperText={errors.profileUpdates?.linkedin?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.github" control={control} render={({ field }) => <TextField {...field} label="GitHub Profile URL" fullWidth error={!!errors.profileUpdates?.github} helperText={errors.profileUpdates?.github?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.portfolio" control={control} render={({ field }) => <TextField {...field} label="Portfolio URL" fullWidth error={!!errors.profileUpdates?.portfolio} helperText={errors.profileUpdates?.portfolio?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.personalWebsite" control={control} render={({ field }) => <TextField {...field} label="Personal Website URL" fullWidth error={!!errors.profileUpdates?.personalWebsite} helperText={errors.profileUpdates?.personalWebsite?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.twitter" control={control} render={({ field }) => <TextField {...field} label="Twitter Profile URL" fullWidth error={!!errors.profileUpdates?.twitter} helperText={errors.profileUpdates?.twitter?.message} />}/></Grid>
        </Grid>
    </SectionWrapper>
  );

  const renderJobSeekerProfessionalInfo = () => (
    <SectionWrapper 
        title="Professional Info" 
        sectionKey="professional" 
        fieldPaths={['currentJobTitle', 'currentCompany', 'yearsOfExperience', 'seniorityLevel', 'skills', 'techStack', 'noticePeriod']} 
        schemaForValidation={jobSeekerProfileUpdatesOnlySchema.pick({currentJobTitle: true, currentCompany: true, yearsOfExperience:true, seniorityLevel:true, skills: true, techStack:true, noticePeriod:true})}
    >
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.currentJobTitle" control={control} render={({ field }) => <TextField {...field} label="Current Job Title" fullWidth error={!!errors.profileUpdates?.currentJobTitle} helperText={errors.profileUpdates?.currentJobTitle?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.currentCompany" control={control} render={({ field }) => <TextField {...field} label="Current Company" fullWidth error={!!errors.profileUpdates?.currentCompany} helperText={errors.profileUpdates?.currentCompany?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.noticePeriod" control={control} render={({ field }) => <TextField {...field} label="Notice Period" fullWidth error={!!errors.profileUpdates?.noticePeriod} helperText={errors.profileUpdates?.noticePeriod?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.yearsOfExperience" control={control} render={({ field }) => <TextField {...field} label="Years of Experience" type="number" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.profileUpdates?.yearsOfExperience} helperText={errors.profileUpdates?.yearsOfExperience?.message} onChange={e => field.onChange(parseFloat(e.target.value) || null)} />}/></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth error={!!errors.profileUpdates?.seniorityLevel}><InputLabel>Seniority Level</InputLabel><Controller name="profileUpdates.seniorityLevel" control={control} render={({ field }) => (<Select {...field} label="Seniority Level" MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>{['Intern', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Architect', 'Manager', 'Staff', 'Distinguished', 'Fellow'].map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}</Select>)}/>{errors.profileUpdates?.seniorityLevel && <FormHelperText>{errors.profileUpdates.seniorityLevel.message}</FormHelperText>}</FormControl></Grid>
            <Grid item xs={12}><SkillsAutocomplete name="profileUpdates.skills" control={control} label="Skills" placeholder="Type skill and press Enter" errors={errors.profileUpdates?.skills} /></Grid>
            <Grid item xs={12}><SkillsAutocomplete name="profileUpdates.techStack" control={control} label="Tech Stack" placeholder="Type tech/tool and press Enter" errors={errors.profileUpdates?.techStack} /></Grid>
        </Grid>
    </SectionWrapper>
  );

  const renderJobSeekerWorkExperience = () => (
    <SectionWrapper title="Work Experience" sectionKey="workExperience" fieldPaths={['workExperience']} schemaForValidation={jobSeekerProfileUpdatesOnlySchema.pick({workExperience: true})}>
        <ArrayFieldset
            title={{singular:"Experience", plural: "Experiences"}} fields={workFields} append={() => appendWork(newWorkExperience)} remove={removeWork}
            newItemData={newWorkExperience} control={control} errors={errors.profileUpdates?.workExperience} namePrefix="profileUpdates.workExperience"
            renderItem={(item, index, itemControl, itemErrors, prefix) => (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.jobTitle`} control={itemControl} render={({ field }) => <TextField {...field} label="Job Title" fullWidth required error={!!itemErrors?.[index]?.jobTitle} helperText={itemErrors?.[index]?.jobTitle?.message} />}/></Grid>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.company`} control={itemControl} render={({ field }) => <TextField {...field} label="Company" fullWidth required error={!!itemErrors?.[index]?.company} helperText={itemErrors?.[index]?.company?.message} />}/></Grid>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.location`} control={itemControl} render={({ field }) => <TextField {...field} label="Location" fullWidth />}/></Grid>
                    <Grid item xs={12} sm={6}><FormControlLabel control={<Controller name={`${prefix}.${index}.currentlyWorking`} control={itemControl} render={({ field }) => <Switch {...field} checked={field.value || false} onChange={e => { field.onChange(e.target.checked); if(e.target.checked) { setValue(`${prefix}.${index}.endDate`, null);}}} />} />} label="Currently Working Here" /></Grid>
                    <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.startDate`} control={itemControl} label="Start Date" errors={itemErrors?.[index]?.startDate} /></Grid>
                    <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.endDate`} control={itemControl} label="End Date" errors={itemErrors?.[index]?.endDate} disabled={watch(`${prefix}.${index}.currentlyWorking`)} /></Grid>
                    <Grid item xs={12}><Controller name={`${prefix}.${index}.description`} control={itemControl} render={({ field }) => <TextField {...field} label="Description" multiline rows={3} fullWidth />}/></Grid>
                    <Grid item xs={12}><SkillsAutocomplete name={`${prefix}.${index}.achievements`} control={itemControl} label="Key Achievements (press Enter after each)" placeholder="Add achievement" errors={itemErrors?.[index]?.achievements} /></Grid>
                    <Grid item xs={12}><SkillsAutocomplete name={`${prefix}.${index}.technologiesUsed`} control={itemControl} label="Technologies Used (press Enter after each)" placeholder="Add technology" errors={itemErrors?.[index]?.technologiesUsed} /></Grid>
                </Grid>
            )}
        />
    </SectionWrapper>
  );

  const renderJobSeekerEducation = () => (
    <SectionWrapper title="Education" sectionKey="education" fieldPaths={['education']} schemaForValidation={jobSeekerProfileUpdatesOnlySchema.pick({education: true})}>
        <ArrayFieldset
            title={{singular:"Education Record", plural: "Education Records"}} fields={eduFields} append={() => appendEdu(newEducation)} remove={removeEdu}
            newItemData={newEducation} control={control} errors={errors.profileUpdates?.education} namePrefix="profileUpdates.education"
            renderItem={(item, index, itemControl, itemErrors, prefix) => (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.institution`} control={itemControl} render={({ field }) => <TextField {...field} label="Institution" fullWidth required error={!!itemErrors?.[index]?.institution} helperText={itemErrors?.[index]?.institution?.message} />}/></Grid>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.degree`} control={itemControl} render={({ field }) => <TextField {...field} label="Degree" fullWidth required error={!!itemErrors?.[index]?.degree} helperText={itemErrors?.[index]?.degree?.message} />}/></Grid>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.fieldOfStudy`} control={itemControl} render={({ field }) => <TextField {...field} label="Field of Study" fullWidth />}/></Grid>
                    <Grid item xs={12} sm={3}><Controller name={`${prefix}.${index}.grade`} control={itemControl} render={({ field }) => <TextField {...field} label="Grade/GPA" fullWidth />}/></Grid>
                    <Grid item xs={12} sm={3}><Controller name={`${prefix}.${index}.honors`} control={itemControl} render={({ field }) => <TextField {...field} label="Honors/Awards" fullWidth />}/></Grid>
                    <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.startDate`} control={itemControl} label="Start Date" errors={itemErrors?.[index]?.startDate} /></Grid>
                    <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.endDate`} control={itemControl} label="End Date" errors={itemErrors?.[index]?.endDate} /></Grid>
                </Grid>
            )}
        />
    </SectionWrapper>
  );

  const renderJobSeekerCertifications = () => (
    <SectionWrapper title="Certifications" sectionKey="certifications" fieldPaths={['certifications']} schemaForValidation={jobSeekerProfileUpdatesOnlySchema.pick({certifications:true})}>
         <ArrayFieldset
            title={{singular:"Certification", plural: "Certifications"}} fields={certFields} append={() => appendCert(newCertification)} remove={removeCert}
            newItemData={newCertification} control={control} errors={errors.profileUpdates?.certifications} namePrefix="profileUpdates.certifications"
            renderItem={(item, index, itemControl, itemErrors, prefix) => (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.name`} control={itemControl} render={({ field }) => <TextField {...field} label="Certification Name" fullWidth required error={!!itemErrors?.[index]?.name} helperText={itemErrors?.[index]?.name?.message} />}/></Grid>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.issuingOrganization`} control={itemControl} render={({ field }) => <TextField {...field} label="Issuing Organization" fullWidth required error={!!itemErrors?.[index]?.issuingOrganization} helperText={itemErrors?.[index]?.issuingOrganization?.message} />}/></Grid>
                    <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.issueDate`} control={itemControl} label="Issue Date" views={['year', 'month']} errors={itemErrors?.[index]?.issueDate} /></Grid>
                    <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.expirationDate`} control={itemControl} label="Expiration Date (optional)" views={['year', 'month']} errors={itemErrors?.[index]?.expirationDate} /></Grid>
                    <Grid item xs={12}><Controller name={`${prefix}.${index}.credentialId`} control={itemControl} render={({ field }) => <TextField {...field} label="Credential ID (optional)" fullWidth />}/></Grid>
                    <Grid item xs={12}><Controller name={`${prefix}.${index}.credentialUrl`} control={itemControl} render={({ field }) => <TextField {...field} label="Credential URL (optional)" fullWidth />}/></Grid>
                </Grid>
            )}
        />
    </SectionWrapper>
  );

  const renderJobSeekerProjects = () => (
     <SectionWrapper title="Projects" sectionKey="projects" fieldPaths={['projects']} schemaForValidation={jobSeekerProfileUpdatesOnlySchema.pick({projects: true})}>
        <ArrayFieldset
            title={{singular:"Project", plural: "Projects"}} fields={projectFields} append={() => appendProject(newProject)} remove={removeProject}
            newItemData={newProject} control={control} errors={errors.profileUpdates?.projects} namePrefix="profileUpdates.projects"
            renderItem={(item, index, itemControl, itemErrors, prefix) => (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.name`} control={itemControl} render={({ field }) => <TextField {...field} label="Project Name" fullWidth required error={!!itemErrors?.[index]?.name} helperText={itemErrors?.[index]?.name?.message} />}/></Grid>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.link`} control={itemControl} render={({ field }) => <TextField {...field} label="Project URL" fullWidth error={!!itemErrors?.[index]?.link} helperText={itemErrors?.[index]?.link?.message} />}/></Grid>
                    <Grid item xs={12} sm={6}><Controller name={`${prefix}.${index}.githubRepo`} control={itemControl} render={({ field }) => <TextField {...field} label="GitHub Repo URL" fullWidth error={!!itemErrors?.[index]?.githubRepo} helperText={itemErrors?.[index]?.githubRepo?.message} />}/></Grid>
                    <Grid item xs={12}><Controller name={`${prefix}.${index}.description`} control={itemControl} render={({ field }) => <TextField {...field} label="Description" multiline rows={2} fullWidth />}/></Grid>
                    <Grid item xs={12}><SkillsAutocomplete name={`${prefix}.${index}.technologies`} control={itemControl} label="Technologies Used (press Enter after each)" placeholder="Add technology" errors={itemErrors?.[index]?.technologies} /></Grid>
                    <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.startDate`} control={itemControl} label="Start Date" errors={itemErrors?.[index]?.startDate} /></Grid>
                    <Grid item xs={12} sm={6}><ControlledDatePicker name={`${prefix}.${index}.endDate`} control={itemControl} label="End Date" errors={itemErrors?.[index]?.endDate} /></Grid>
                </Grid>
            )}
        />
    </SectionWrapper>
  );

  const renderJobSeekerPreferences = () => (
    <SectionWrapper 
        title="Job Preferences & Availability" 
        sectionKey="preferences" 
        fieldPaths={['desiredJobTitle', 'desiredEmploymentTypes', 'desiredIndustries', 'openToRemote', 'openToRelocation', 'preferredLocations', 'salaryExpectation', 'availableFrom', 'jobSearchStatus', 'languages']} 
        schemaForValidation={jobSeekerProfileUpdatesOnlySchema.pick({desiredJobTitle:true, desiredEmploymentTypes: true, desiredIndustries:true, openToRemote:true, openToRelocation:true, preferredLocations:true, salaryExpectation:true, availableFrom:true, jobSearchStatus:true, languages:true})}
    >
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.desiredJobTitle" control={control} render={({ field }) => <TextField {...field} label="Desired Job Title(s)" fullWidth />}/></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth error={!!errors.profileUpdates?.jobSearchStatus}><InputLabel>Job Search Status</InputLabel><Controller name="profileUpdates.jobSearchStatus" control={control} render={({ field }) => (<Select {...field} label="Job Search Status">{['Actively looking', 'Open to opportunities', 'Not looking', 'Employed, but open'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>)}/>{errors.profileUpdates?.jobSearchStatus && <FormHelperText>{errors.profileUpdates.jobSearchStatus.message}</FormHelperText>}</FormControl></Grid>
            <Grid item xs={12} sm={6}><ControlledDatePicker name="profileUpdates.availableFrom" control={control} label="Available From" errors={errors.profileUpdates?.availableFrom} /></Grid>
            <Grid item xs={12} sm={6}><SkillsAutocomplete name="profileUpdates.languages" control={control} label="Languages Spoken (press Enter after each)" placeholder="Add language" errors={errors.profileUpdates?.languages} /></Grid>
            <Grid item xs={12}><SkillsAutocomplete name="profileUpdates.desiredEmploymentTypes" control={control} label="Desired Employment Types (press Enter after each)" placeholder="e.g., Full-time" options={['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary']} errors={errors.profileUpdates?.desiredEmploymentTypes} /></Grid>
            <Grid item xs={12}><SkillsAutocomplete name="profileUpdates.desiredIndustries" control={control} label="Desired Industries (press Enter after each)" placeholder="e.g., Technology" errors={errors.profileUpdates?.desiredIndustries} /></Grid>
            <Grid item xs={12}><SkillsAutocomplete name="profileUpdates.preferredLocations" control={control} label="Preferred Locations (press Enter after each)" placeholder="e.g., Remote, New York" errors={errors.profileUpdates?.preferredLocations} /></Grid>
            <Grid item xs={6} sm={3}><FormControlLabel control={<Controller name="profileUpdates.openToRemote" control={control} render={({ field }) => <Switch {...field} checked={field.value || false} />} />} label="Open to Remote" /></Grid>
            <Grid item xs={6} sm={3}><FormControlLabel control={<Controller name="profileUpdates.openToRelocation" control={control} render={({ field }) => <Switch {...field} checked={field.value || false} />} />} label="Open to Relocation" /></Grid>

            <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:1}}>Salary Expectation</Typography></Grid>
            <Grid item xs={12} sm={3}><Controller name="profileUpdates.salaryExpectation.min" control={control} render={({ field }) => <TextField {...field} label="Min Salary" type="number" fullWidth onChange={e => field.onChange(parseFloat(e.target.value) || null)} error={!!errors.profileUpdates?.salaryExpectation?.min} helperText={errors.profileUpdates?.salaryExpectation?.min?.message}/>}/></Grid>
            <Grid item xs={12} sm={3}><Controller name="profileUpdates.salaryExpectation.max" control={control} render={({ field }) => <TextField {...field} label="Max Salary" type="number" fullWidth onChange={e => field.onChange(parseFloat(e.target.value) || null)} error={!!errors.profileUpdates?.salaryExpectation?.max} helperText={errors.profileUpdates?.salaryExpectation?.max?.message}/>}/></Grid>
            <Grid item xs={12} sm={3}><Controller name="profileUpdates.salaryExpectation.currency" control={control} render={({ field }) => <TextField {...field} label="Currency" defaultValue="USD" fullWidth error={!!errors.profileUpdates?.salaryExpectation?.currency} helperText={errors.profileUpdates?.salaryExpectation?.currency?.message}/>}/></Grid>
            <Grid item xs={12} sm={3}><FormControl fullWidth error={!!errors.profileUpdates?.salaryExpectation?.period}><InputLabel>Period</InputLabel><Controller name="profileUpdates.salaryExpectation.period" control={control} render={({ field }) => (<Select {...field} label="Period" defaultValue="year">{['year', 'month', 'hour'].map(p => <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>)}</Select>)}/>{errors.profileUpdates?.salaryExpectation?.period && <FormHelperText>{errors.profileUpdates.salaryExpectation.period.message}</FormHelperText>}</FormControl></Grid>
        </Grid>
    </SectionWrapper>
  );

  // --- Render function for Recruiter ---
  const renderRecruiterFields = () => (
    <SectionWrapper title="Company Information" sectionKey="recruiterInfo" fieldPaths={['companyName', 'companyWebsite', 'companyIndustry', 'companySize', 'companyDescription']} schemaForValidation={recruiterProfileUpdatesOnlySchema.pick({companyName:true, companyWebsite:true, companyIndustry:true, companySize:true, companyDescription:true })}>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.companyName" control={control} render={({ field }) => <TextField {...field} label="Company Name" fullWidth error={!!errors.profileUpdates?.companyName} helperText={errors.profileUpdates?.companyName?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.companyWebsite" control={control} render={({ field }) => <TextField {...field} label="Company Website" fullWidth error={!!errors.profileUpdates?.companyWebsite} helperText={errors.profileUpdates?.companyWebsite?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.companyIndustry" control={control} render={({ field }) => <TextField {...field} label="Company Industry" fullWidth error={!!errors.profileUpdates?.companyIndustry} helperText={errors.profileUpdates?.companyIndustry?.message} />}/></Grid>
            <Grid item xs={12} sm={6}><Controller name="profileUpdates.companySize" control={control} render={({ field }) => <TextField {...field} label="Company Size (e.g., 10-50 employees)" fullWidth error={!!errors.profileUpdates?.companySize} helperText={errors.profileUpdates?.companySize?.message} />}/></Grid>
            <Grid item xs={12}><Controller name="profileUpdates.companyDescription" control={control} render={({ field }) => <TextField {...field} label="Company Description" multiline rows={3} fullWidth error={!!errors.profileUpdates?.companyDescription} helperText={errors.profileUpdates?.companyDescription?.message} />}/></Grid>
        </Grid>
    </SectionWrapper>
  );


  if (isLoadingProfile && !initialProfileData) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (profileError) return <Alert severity="error" sx={{ m: 2 }}>Error loading profile: {profileError.message}</Alert>;
  if (!user || !initialProfileData) return <Alert severity="info" sx={{m:2}}>Loading user data or profile not yet created...</Alert>;


  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 1, sm:2, md: 3 }, my: { xs:1, sm:2, md: 3 } }} component="div">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">Edit Profile</Typography>
          <Button variant="outlined" onClick={() => navigate(user?.role === '3' ? '/admin/dashboard' : '/profile')} startIcon={<CancelIcon />} disabled={profileUpdateMutation.isPending}>
            {user?.role === '3' ? 'Back to Dashboard' : 'Back to Profile'}
          </Button>
        </Box>
        <Divider sx={{mb:2}}/>

        {renderCommonFields()}
        <Divider sx={{my:3}}/>

        {user.role === '1' && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb:2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="jobseeker profile sections" variant="scrollable" scrollButtons="auto">
                <Tab label="Personal" />
                <Tab label="Online Presence" />
                <Tab label="Professional" />
                <Tab label="Work Experience" />
                <Tab label="Education" />
                <Tab label="Certifications" />
                <Tab label="Projects" />
                <Tab label="Preferences" />
                </Tabs>
            </Box>
            <TabPanel value={activeTab} index={0}>{renderJobSeekerPersonalDetails()}</TabPanel>
            <TabPanel value={activeTab} index={1}>{renderJobSeekerOnlinePresence()}</TabPanel>
            <TabPanel value={activeTab} index={2}>{renderJobSeekerProfessionalInfo()}</TabPanel>
            <TabPanel value={activeTab} index={3}>{renderJobSeekerWorkExperience()}</TabPanel>
            <TabPanel value={activeTab} index={4}>{renderJobSeekerEducation()}</TabPanel>
            <TabPanel value={activeTab} index={5}>{renderJobSeekerCertifications()}</TabPanel>
            <TabPanel value={activeTab} index={6}>{renderJobSeekerProjects()}</TabPanel>
            <TabPanel value={activeTab} index={7}>{renderJobSeekerPreferences()}</TabPanel>
          </>
        )}

        {user.role === '2' && renderRecruiterFields()}
        {/* Admin view doesn't typically have more profile fields beyond common ones (name, email) in this setup */}

      </Paper>
    </Container>
  );
};

export default EditProfilePage;