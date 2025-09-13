import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

export const signupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  organizationName: z.string().min(2, 'El nombre de la organización debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Expense validation schemas
export const expenseSchema = z.object({
  vendor: z.string().min(1, 'El proveedor es requerido'),
  amount_gross: z.number().min(0.01, 'El importe debe ser mayor a 0'),
  category_id: z.string().uuid('Categoría inválida'),
  expense_date: z.date(),
  notes: z.string().optional(),
  project_code_id: z.string().uuid().optional()
});

// Invitation validation schemas
export const invitationSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'EMPLOYEE'])
});

// Organization validation schemas
export const organizationUpdateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').regex(
    /^[a-z0-9-]+$/,
    'El slug solo puede contener letras minúsculas, números y guiones'
  )
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  department: z.string().optional(),
  region: z.string().optional()
});

// Types
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type InvitationFormData = z.infer<typeof invitationSchema>;
export type OrganizationUpdateFormData = z.infer<typeof organizationUpdateSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;