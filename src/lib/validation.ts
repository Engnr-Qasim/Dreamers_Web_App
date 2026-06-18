import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
});

export const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  phone: z.string().max(20, { message: "Phone must be less than 20 characters" }).optional().or(z.literal('')),
  location: z.string().max(500, { message: "Location must be less than 500 characters" }).optional().or(z.literal('')),
});

// Profile validation schema
export const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).max(255).optional().or(z.literal('')),
  phone: z.string().max(20, { message: "Phone must be less than 20 characters" }).optional().or(z.literal('')),
  location: z.string().max(500, { message: "Location must be less than 500 characters" }).optional().or(z.literal('')),
  description: z.string().max(1000, { message: "Description must be less than 1000 characters" }).optional().or(z.literal('')),
});

// Report validation schema
export const reportSchema = z.object({
  issueType: z.enum([
    'littering', 'illegal-dumping', 'tree-cutting', 'water-pollution',
    'air-pollution', 'noise-pollution', 'wildlife-issue', 'other'
  ], { message: "Please select a valid issue type" }),
  location: z.string().min(1, { message: "Location is required" }).max(500, { message: "Location must be less than 500 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(2000, { message: "Description must be less than 2000 characters" }),
  priority: z.enum(['low', 'medium', 'high', 'critical'], { message: "Please select a valid priority" }),
});

// Photo validation
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const validatePhoto = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_PHOTO_SIZE) {
    return { valid: false, error: 'Photo must be under 5MB' };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'File must be a valid image (JPEG, PNG, GIF, or WebP)' };
  }
  return { valid: true };
};

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
