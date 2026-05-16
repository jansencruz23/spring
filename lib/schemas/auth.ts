import { z } from 'zod';

export const EmailSchema = z
  .string()
  .trim()
  .min(1, 'Email required')
  .email('Enter a valid email');

export const PasswordSchema = z
  .string()
  .min(8, 'At least 8 characters');

export const CredentialsSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});
export type Credentials = z.infer<typeof CredentialsSchema>;

export const SignUpSchema = CredentialsSchema;
export type SignUpInput = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password required'),
});
export type SignInInput = z.infer<typeof SignInSchema>;

export const ResetRequestSchema = z.object({
  email: EmailSchema,
});
export type ResetRequestInput = z.infer<typeof ResetRequestSchema>;

export const ChangePasswordSchema = z.object({
  password: PasswordSchema,
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
