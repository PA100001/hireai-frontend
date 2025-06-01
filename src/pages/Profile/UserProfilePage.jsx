// src/pages/Profile/UserProfilePage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as profileService from '../../services/profileService'; // You'll need a function here
import { Container, Box, Typography, CircularProgress, Alert, Paper, Avatar, Grid, Chip, Divider, Link as MuiLink, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language'; // For portfolio/personal website
import WorkIcon from '@mui/icons-material/Work'; // For experience
import SchoolIcon from '@mui/icons-material/School'; // For education
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // For Certifications
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // For Projects
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BusinessIcon from '@mui/icons-material/Business'; // For company
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // For achievements/skills


// Helper to format dates (can be moved to a utils file)
const formatDate = (dateString, includeDay = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long' };
  if (includeDay) {
    options.day = 'numeric';
  }
  return date.toLocaleDateString(undefined, options);
};


const UserProfilePage = () => {
  const { userId } = useParams();

  const { data: userProfileResponse, isLoading, error, isError } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => profileService.getUserProfileById(userId), // Needs to be implemented
    enabled: !!userId,
  });

  if (isLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (isError) {
    return <Alert severity="error" sx={{ m: 2 }}>Error loading profile: {error.response?.data?.message || error.message}</Alert>;
  }

  if (!userProfileResponse || !userProfileResponse.data || !userProfileResponse.data.user) {
    return <Alert severity="warning" sx={{ m: 2 }}>User profile not found.</Alert>;
  }

  const user = userProfileResponse.data.user;
  const profile = user.profile || {}; // Fallback to empty object if profile is null/undefined


  // Helper to render an array of strings as chips
  const renderChips = (items, label) => (
    items && items.length > 0 && (
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">{label}:</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {items.map((item, index) => <Chip key={`${label}-${item}-${index}`} label={item} size="small" />)}
        </Box>
      </Box>
    )
  );

  const Section = ({ title, icon, children }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'primary.main' } })}
        <Typography variant="h6" component="h3">{title}</Typography>
      </Box>
      {children}
      <Divider sx={{mt: 2}}/>
    </Box>
  );


  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 3, mb:3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', mb: 3 }}>
          <Avatar
            src={user.profilePictureUrl || undefined}
            alt={user.name}
            sx={{ width: { xs: 100, md: 150 }, height: { xs: 100, md: 150 }, mr: { md: 3 }, mb: { xs: 2, md: 0 }, fontSize: '3rem' }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : ''}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>{user.name}</Typography>
            {profile.headline && <Typography variant="h6" color="text.secondary" gutterBottom>{profile.headline}</Typography>}
            {profile.location?.city && (
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                {profile.location.city}
                {profile.location.state ? `, ${profile.location.state}` : ''}
                {profile.location.country ? `, ${profile.location.country}` : ''}
              </Typography>
            )}
            {user.email && (
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                <MuiLink href={`mailto:${user.email}`}>{user.email}</MuiLink>
              </Typography>
            )}
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {profile.linkedin && <Button size="small" startIcon={<LinkedInIcon />} component={MuiLink} href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</Button>}
                {profile.github && <Button size="small" startIcon={<GitHubIcon />} component={MuiLink} href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</Button>}
                {profile.portfolio && <Button size="small" startIcon={<LanguageIcon />} component={MuiLink} href={profile.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</Button>}
                {profile.personalWebsite && <Button size="small" startIcon={<LanguageIcon />} component={MuiLink} href={profile.personalWebsite} target="_blank" rel="noopener noreferrer">Website</Button>}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />

        {/* Bio/Summary */}
        {profile.bio && (
          <Section title="About Me" icon={<WorkIcon />}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{profile.bio}</Typography>
          </Section>
        )}

        {/* Skills & Tech Stack */}
        {(profile.skills?.length > 0 || profile.techStack?.length > 0) && (
          <Section title="Skills & Technologies" icon={<CheckCircleOutlineIcon />}>
            {renderChips(profile.skills, 'Top Skills')}
            {renderChips(profile.techStack, 'Technology Stack')}
          </Section>
        )}
        

        {/* Work Experience */}
        {profile.workExperience && profile.workExperience.length > 0 && (
          <Section title="Work Experience" icon={<WorkIcon />}>
            {profile.workExperience.map((exp, index) => (
              <Box key={`exp-${index}`} sx={{ mb: 2, pl:1, borderLeft: '3px solid', borderColor: 'divider' }}>
                <Typography variant="h6" component="h4">{exp.jobTitle}</Typography>
                <Typography variant="subtitle1" color="primary.main">{exp.company}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {formatDate(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                  {exp.location && ` | ${exp.location}`}
                </Typography>
                {exp.description && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{exp.description}</Typography>}
                {renderChips(exp.achievements, 'Key Achievements')}
                {renderChips(exp.technologiesUsed, 'Technologies Used')}
                {index < profile.workExperience.length -1 && <Divider sx={{mt:1.5, mb: 1.5}} light />}
              </Box>
            ))}
          </Section>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <Section title="Education" icon={<SchoolIcon />}>
            {profile.education.map((edu, index) => (
              <Box key={`edu-${index}`} sx={{ mb: 2, pl:1, borderLeft: '3px solid', borderColor: 'divider' }}>
                <Typography variant="h6" component="h4">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}`: ''}</Typography>
                <Typography variant="subtitle1" color="primary.main">{edu.institution}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  {edu.grade && ` | Grade: ${edu.grade}`}
                </Typography>
                {edu.honors && <Typography variant="body2" sx={{ mt: 0.5 }}>Honors: {edu.honors}</Typography>}
                {index < profile.education.length -1 && <Divider sx={{mt:1.5, mb: 1.5}} light />}
              </Box>
            ))}
          </Section>
        )}

        {/* Projects */}
        {profile.projects && profile.projects.length > 0 && (
          <Section title="Projects" icon={<AccountTreeIcon />}>
            {profile.projects.map((proj, index) => (
              <Box key={`proj-${index}`} sx={{ mb: 2, pl:1, borderLeft: '3px solid', borderColor: 'divider' }}>
                <Typography variant="h6" component="h4">
                    {proj.name}
                    {proj.link && <MuiLink href={proj.link} target="_blank" rel="noopener noreferrer" sx={{ml:1}}>(View Project)</MuiLink>}
                </Typography>
                {proj.githubRepo && <Typography variant="subtitle2"><MuiLink href={proj.githubRepo} target="_blank" rel="noopener noreferrer">GitHub Repository</MuiLink></Typography>}
                <Typography variant="caption" color="text.secondary" display="block">
                  {formatDate(proj.startDate)} - {formatDate(proj.endDate)}
                </Typography>
                {proj.description && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{proj.description}</Typography>}
                {renderChips(proj.technologies, 'Technologies Used')}
                {index < profile.projects.length -1 && <Divider sx={{mt:1.5, mb: 1.5}} light />}
              </Box>
            ))}
          </Section>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <Section title="Licenses & Certifications" icon={<EmojiEventsIcon />}>
            {profile.certifications.map((cert, index) => (
              <Box key={`cert-${index}`} sx={{ mb: 2, pl:1, borderLeft: '3px solid', borderColor: 'divider' }}>
                <Typography variant="h6" component="h4">{cert.name}</Typography>
                <Typography variant="subtitle1" color="primary.main">{cert.issuingOrganization}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Issued: {formatDate(cert.issueDate)}
                  {cert.expirationDate && ` | Expires: ${formatDate(cert.expirationDate)}`}
                </Typography>
                {cert.credentialId && <Typography variant="body2" sx={{ mt: 0.5 }}>Credential ID: {cert.credentialId}</Typography>}
                {cert.credentialUrl && <Typography variant="body2"><MuiLink href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">View Credential</MuiLink></Typography>}
                 {index < profile.certifications.length -1 && <Divider sx={{mt:1.5, mb: 1.5}} light />}
              </Box>
            ))}
          </Section>
        )}

        {/* Job Preferences (Optional, might be private) */}
        {profile.jobSearchStatus && ( // Example condition to show preferences
          <Section title="Job Preferences" icon={<EventAvailableIcon />}>
            <List dense>
              {profile.jobSearchStatus && <ListItem><ListItemIcon><WorkIcon fontSize="small"/></ListItemIcon><ListItemText primary="Job Search Status" secondary={profile.jobSearchStatus} /></ListItem>}
              {profile.availableFrom && <ListItem><ListItemIcon><CalendarTodayIcon fontSize="small"/></ListItemIcon><ListItemText primary="Available From" secondary={formatDate(profile.availableFrom, true)} /></ListItem>}
              {renderChips(profile.desiredEmploymentTypes, 'Desired Employment Types')}
              {renderChips(profile.desiredIndustries, 'Desired Industries')}
              {profile.openToRemote !== undefined && <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small"/></ListItemIcon><ListItemText primary="Open to Remote" secondary={profile.openToRemote ? 'Yes' : 'No'} /></ListItem>}
              {profile.openToRelocation !== undefined && <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small"/></ListItemIcon><ListItemText primary="Open to Relocation" secondary={profile.openToRelocation ? 'Yes' : 'No'} /></ListItem>}
              {renderChips(profile.preferredLocations, 'Preferred Locations')}
              {profile.salaryExpectation?.min && <ListItem><ListItemIcon><BusinessIcon fontSize="small"/></ListItemIcon><ListItemText primary="Salary Expectation" secondary={`Min: ${profile.salaryExpectation.min} ${profile.salaryExpectation.currency}/${profile.salaryExpectation.period}`} /></ListItem>}
            </List>
          </Section>
        )}

      </Paper>
    </Container>
  );
};

export default UserProfilePage;