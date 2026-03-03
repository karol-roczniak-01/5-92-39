import { z } from 'zod'

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"]/g, '').replace(/\s+/g, ' ').trim()
}

// ============================================================================
// PRIMITIVE SCHEMAS
// ============================================================================

export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .max(100, 'Username is too long')
  .trim()
  .transform(sanitizeInput)
  .refine((val) => /^[a-zA-Z0-9_-]+$/.test(val), {
    message: 'Username can only contain letters, numbers, underscores, and hyphens',
  })

export const emailSchema = z
  .email('Invalid email format')
  .min(1, 'Email is required')
  .trim()
  .transform((val) => val.toLowerCase())

// ============================================================================
// REQUEST BODY SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// ============================================================================
// JWT SCHEMA
// ============================================================================

export const jwtPayloadSchema = z.object({
  userId: z.uuid(),
  email: z.string(),
  iat: z.number().optional(),
  exp: z.number().optional(),
})

// ============================================================================
// DB / API SCHEMAS
// ============================================================================

export const dbAuthUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  fullName: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  verified: z.number(),
  bio: z.string(),
  avatar: z.string(),
})

export const dbUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  fullName: z.string(),
  email: z.string(),
  verified: z.number(),
  bio: z.string(),
  avatar: z.string(),
})

export const apiUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  fullName: z.string(),
  email: z.string(),
  verified: z.boolean(),
  bio: z.string(),
  avatar: z.string(),
})

// ============================================================================
// TYPES
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>
export type JwtPayload = z.infer<typeof jwtPayloadSchema>
export type DbAuthUser = z.infer<typeof dbAuthUserSchema>
export type DbUser = z.infer<typeof dbUserSchema>
export type ApiAuthUser = z.infer<typeof apiUserSchema>