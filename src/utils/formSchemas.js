import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'), // Added from User model
  role: z.enum(['1', '2'], { required_error: "Role is required" }),
  companyName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine(data => data.role === '2' ? !!data.companyName && data.companyName.length > 0 : true, {
  message: 'Company name is required for recruiters',
  path: ['companyName'],
});

// Basic profile update schema - expand as needed based on JobSeeker/Recruiter profiles
export const jobSeekerProfileUpdateSchema = z.object({
    name: z.string().min(2, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    profileUpdates: z.object({
        fullName: z.string().min(2, "Full name is required").optional(),
        headline: z.string().optional(),
        bio: z.string().optional(),
        location: z.object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
            zipCode: z.string().optional(),
        }).optional(),
        // ... add more fields from JobSeekerProfile model
        skills: z.array(z.string()).optional(),
        yearsOfExperience: z.number().min(0).optional(),
        // ... etc
    }).optional(),
});

// Add more schemas as needed (e.g., RecruiterProfileUpdateSchema, AdminUserUpdateSchema)