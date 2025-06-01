// src/utils/profileFormSchemas.js
import { z } from 'zod';

const MAX_FILE_SIZE_PROFILE_PICTURE = 2 * 1024 * 1024; // 2MB
const MAX_FILE_SIZE_RESUME = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const fileSchemaOptional = (maxSize, allowedTypes) => z.instanceof(File)
  // The `!file ||` parts in refine are redundant here because if `optional().nullable()` are used,
  // refine will only be called on actual File instances.
  // However, they don't harm, as `!file` would be false for a File instance.
  .refine(file => file.size <= maxSize, `Max file size is ${maxSize / (1024 * 1024)}MB.`)
  .refine(file => allowedTypes.includes(file.type), `Invalid file type. Allowed: ${allowedTypes.join(', ')}.`)
  .optional()
  .nullable();

// Define baseUserSchema as a ZodObject, without the .refine() call here.
// This allows .extend() and .deepPartial() to be called on it.
export const baseUserSchema = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  profilePicture: fileSchemaOptional(MAX_FILE_SIZE_PROFILE_PICTURE, ALLOWED_IMAGE_TYPES),
});

// Define the refinement logic separately to apply it to derived schemas.
const passwordConfirmationRefinement = (data) => data.password === data.confirmPassword;
const passwordConfirmationRefinementOptions = {
  message: "Passwords don't match",
  path: ['confirmPassword'],
};

// --- JobSeeker Specific Schemas ---
const locationSchema = z.object({
  street: z.string().trim().optional().default(''),
  city: z.string().trim().optional().default(''),
  state: z.string().trim().optional().default(''),
  country: z.string().trim().optional().default(''),
  zipCode: z.string().trim().optional().default(''),
  lat: z.number().optional().nullable(),
  lon: z.number().optional().nullable(),
}).optional();

const salaryExpectationSchema = z.object({
  min: z.number().min(0).optional().nullable(),
  max: z.number().min(0).optional().nullable(),
  currency: z.string().trim().optional().default('USD'),
  period: z.enum(['year', 'month', 'hour']).optional().nullable(),
}).optional();

const workExperienceSchema = z.object({
  _id: z.string().optional(),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  company: z.string().trim().min(1, "Company is required"),
  location: z.string().trim().optional().default(''),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  currentlyWorking: z.boolean().optional().default(false),
  description: z.string().trim().max(2000, "Description too long").optional().default(''),
  achievements: z.array(z.string().trim().min(1)).optional().default([]),
  technologiesUsed: z.array(z.string().trim().min(1)).optional().default([]),
}).refine(data => !data.endDate || !data.startDate || data.currentlyWorking || data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
});

const educationSchema = z.object({
  _id: z.string().optional(),
  institution: z.string().trim().min(1, "Institution is required"),
  degree: z.string().trim().min(1, "Degree is required"),
  fieldOfStudy: z.string().trim().optional().default(''),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  grade: z.string().trim().optional().default(''),
  honors: z.string().trim().optional().default(''),
}).refine(data => !data.endDate || !data.startDate || data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
});

const certificationSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, "Certification name is required"),
  issuingOrganization: z.string().trim().min(1, "Organization is required"),
  issueDate: z.date().nullable(),
  expirationDate: z.date().nullable(),
}).refine(data => !data.expirationDate || !data.issueDate || data.expirationDate >= data.issueDate, {
    message: "Expiration date cannot be before issue date",
    path: ["expirationDate"],
});

const projectSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().max(1000).optional().default(''),
  technologies: z.array(z.string().trim().min(1)).optional().default([]),
  link: z.string().url("Invalid URL").or(z.literal('')).optional().default(''),
  githubRepo: z.string().url("Invalid URL").or(z.literal('')).optional().default(''),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

export const jobSeekerProfileUpdatesOnlySchema = z.object({
  location: locationSchema,
  github: z.string().url("Invalid GitHub URL").or(z.literal('')).optional().default(''),
  linkedin: z.string().url("Invalid LinkedIn URL").or(z.literal('')).optional().default(''),
  portfolio: z.string().url("Invalid Portfolio URL").or(z.literal('')).optional().default(''),
  personalWebsite: z.string().url("Invalid Website URL").or(z.literal('')).optional().default(''),
  twitter: z.string().url("Invalid Twitter URL").or(z.literal('')).optional().default(''),
  bio: z.string().trim().max(2000, "Bio is too long").optional().default(''),
  headline: z.string().trim().max(150, "Headline is too long").optional().default(''),
  currentJobTitle: z.string().trim().optional().default(''),
  currentCompany: z.string().trim().optional().default(''),
  noticePeriod: z.string().trim().optional().default(''),
  skills: z.array(z.string().trim().min(1)).max(50, "Max 50 skills").optional().default([]),
  techStack: z.array(z.string().trim().min(1)).max(50, "Max 50 tech stack items").optional().default([]),
  yearsOfExperience: z.number().min(0).max(60).optional().nullable(),
  seniorityLevel: z.enum(['Intern', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Architect', 'Manager']).optional().nullable(),
  desiredJobTitle: z.string().trim().optional().default(''),
  desiredEmploymentTypes: z.array(z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance'])).optional().default([]),
  desiredIndustries: z.array(z.string().trim().min(1)).optional().default([]),
  openToRemote: z.boolean().optional().default(false),
  openToRelocation: z.boolean().optional().default(false),
  preferredLocations: z.array(z.string().trim().min(1)).optional().default([]),
  salaryExpectation: salaryExpectationSchema,
  workExperience: z.array(workExperienceSchema).optional().default([]),
  education: z.array(educationSchema).optional().default([]),
  certifications: z.array(certificationSchema).optional().default([]),
  projects: z.array(projectSchema).optional().default([]),
  languages: z.array(z.string().trim().min(1)).optional().default([]),
  availableFrom: z.date().optional().nullable(),
  jobSearchStatus: z.enum(['Actively looking', 'Open to opportunities', 'Not looking', 'Employed, but open']).optional().nullable(),
}).deepPartial();

// Full form schema for JobSeeker (including base user fields and resume)
// Now baseUserSchema.extend() works, and we apply the refinement at the end.
export const jobSeekerFormSchema = baseUserSchema.extend({
  profileUpdates: jobSeekerProfileUpdatesOnlySchema.optional(),
  resume: fileSchemaOptional(MAX_FILE_SIZE_RESUME, ALLOWED_RESUME_TYPES),
}).refine(passwordConfirmationRefinement, passwordConfirmationRefinementOptions);

// --- Recruiter Specific Schemas ---
export const recruiterProfileUpdatesOnlySchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").optional(),
  companyWebsite: z.string().url("Invalid company website URL").or(z.literal('')).optional().default(''),
}).deepPartial();

// Now baseUserSchema.extend() works, and we apply the refinement at the end.
export const recruiterFormSchema = baseUserSchema.extend({
  profileUpdates: recruiterProfileUpdatesOnlySchema.optional(),
}).refine(passwordConfirmationRefinement, passwordConfirmationRefinementOptions);

// --- Admin ---
// Admin updates their own profile (name, email, password) via the same /profile endpoint
// Now baseUserSchema.deepPartial() works, and we apply the refinement at the end.
export const adminFormSchema = baseUserSchema
  .deepPartial()
  .refine(passwordConfirmationRefinement, passwordConfirmationRefinementOptions);