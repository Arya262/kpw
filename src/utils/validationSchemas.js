import { z } from 'zod';

// ==================== COMMON PATTERNS ====================

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^[6-9]\d{9}$/;
const phoneWithCountryRegex = /^\+?[1-9]\d{6,14}$/;

// ==================== REUSABLE FIELD SCHEMAS ====================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const mobileSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .regex(mobileRegex, 'Enter a valid 10-digit mobile number starting with 6-9');

export const emailOrMobileSchema = z
  .string()
  .min(1, 'Email or mobile number is required')
  .refine(
    (value) => emailRegex.test(value) || mobileRegex.test(value),
    'Enter a valid email or 10-digit mobile number starting with 6-9'
  );

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters');

export const strongPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be 50 characters or less');

export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || phoneWithCountryRegex.test(val.replace(/\s/g, '')),
    'Please enter a valid phone number'
  );

export const requiredPhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(
    (val) => phoneWithCountryRegex.test(val.replace(/\s/g, '')),
    'Please enter a valid phone number'
  );

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  loginMethod: emailOrMobileSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: z.string().optional(),
  email: emailSchema,
  phone: phoneSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  identifier: emailOrMobileSchema,
});

// ==================== USER MANAGEMENT SCHEMAS ====================

export const userFormSchema = z.object({
  firstName: nameSchema,
  lastName: z.string().optional(),
  email: emailSchema,
  password: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  allowedRoutes: z.array(z.string()).optional(),
});

export const createUserSchema = userFormSchema.extend({
  password: passwordSchema,
});

export const updateUserSchema = userFormSchema;

// ==================== CONTACT SCHEMAS ====================

export const contactSchema = z.object({
  name: nameSchema,
  phone: requiredPhoneSchema,
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  countryCode: z.string().optional(),
  tags: z.array(z.string()).optional(),
  groups: z.array(z.string()).optional(),
  optStatus: z.enum(['opt_in', 'opt_out']).optional(),
});

export const bulkContactRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
});

// ==================== GROUP SCHEMAS ====================

export const groupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name is required')
    .min(2, 'Group name must be at least 2 characters')
    .max(100, 'Group name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

// ==================== TAG SCHEMAS ====================

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .min(2, 'Tag name must be at least 2 characters')
    .max(50, 'Tag name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Tag name can only contain letters, numbers, underscores and hyphens'),
  color: z.string().optional(),
});

// ==================== TEMPLATE SCHEMAS ====================

export const templateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(50, 'Template name must be 50 characters or less')
    .regex(
      /^[a-z0-9_]+$/,
      'Template name must contain only lowercase letters, numbers and underscores'
    ),
  category: z.string().min(1, 'Category is required'),
  sub_category: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  format: z.string().min(1, 'Message body is required'),
  header_type: z.enum(['none', 'text', 'image', 'video', 'document']).optional(),
  header_text: z.string().optional(),
  footer: z.string().max(60, 'Footer must be 60 characters or less').optional(),
});

// ==================== SEQUENCE/DRIP SCHEMAS ====================

export const sequenceSchema = z.object({
  name: z
    .string()
    .min(1, 'Sequence name is required')
    .min(3, 'Sequence name must be at least 3 characters')
    .max(100, 'Sequence name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  triggerType: z.string().min(1, 'Trigger type is required'),
});

export const sequenceMessageSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  delayValue: z.number().min(0, 'Delay must be 0 or greater'),
  delayUnit: z.enum(['minutes', 'hours', 'days']),
});

// ==================== FLOW SCHEMAS ====================

export const flowNodeSchema = z.object({
  name: z.string().min(1, 'Node name is required'),
  type: z.string().min(1, 'Node type is required'),
});

export const flowTriggerSchema = z.object({
  keywords: z.array(z.string()).optional(),
  regex: z.string().optional(),
  caseSensitive: z.boolean().optional(),
});

// ==================== PROFILE SCHEMAS ====================

export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: z.string().optional(),
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().max(100, 'Company name must be 100 characters or less').optional(),
  address: z.string().max(500, 'Address must be 500 characters or less').optional(),
});

// ==================== BROADCAST SCHEMAS ====================

export const broadcastSchema = z.object({
  name: z
    .string()
    .min(1, 'Broadcast name is required')
    .max(100, 'Broadcast name must be 100 characters or less'),
  templateId: z.string().min(1, 'Template is required'),
  recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
  scheduledAt: z.date().optional(),
});

// ==================== HELPER FUNCTIONS ====================

export const validateField = (schema, value) => {
  try {
    schema.parse(value);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Invalid value' };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};


export const validateForm = (schema, data) => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { _form: 'Validation failed' } };
  }
};


export const createValidator = (schema) => {
  return (data) => validateForm(schema, data);
};

// ==================== CUSTOM VALIDATORS ====================


export const validateBulkContacts = (rows) => {
  const errors = [];
  const validRows = [];

  rows.forEach((row, index) => {
    const result = bulkContactRowSchema.safeParse(row);
    if (result.success) {
      validRows.push(row);
    } else {
      errors.push({
        row: index + 1,
        errors: result.error.errors.map((e) => e.message),
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validRows,
    totalRows: rows.length,
    validCount: validRows.length,
    errorCount: errors.length,
  };
};


export const validatePhoneWithCountry = (phone, countryCode = '91') => {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullNumber = `+${countryCode}${cleanPhone}`;

  if (!phoneWithCountryRegex.test(fullNumber)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number',
      formatted: null,
    };
  }

  return {
    isValid: true,
    error: null,
    formatted: fullNumber,
  };
};

export default {
  // Auth
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  // User
  userFormSchema,
  createUserSchema,
  updateUserSchema,
  // Contact
  contactSchema,
  bulkContactRowSchema,
  // Group
  groupSchema,
  // Tag
  tagSchema,
  // Template
  templateSchema,
  // Sequence
  sequenceSchema,
  sequenceMessageSchema,
  // Flow
  flowNodeSchema,
  flowTriggerSchema,
  // Profile
  profileSchema,
  // Broadcast
  broadcastSchema,
  // Helpers
  validateField,
  validateForm,
  createValidator,
  validateBulkContacts,
  validatePhoneWithCountry,
};
