import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'
import {
  jwtPayloadSchema,
  loginSchema,
} from '../schemas/authSchema'
import type { ApiAuthUser, DbAuthUser, JwtPayload } from '../schemas/authSchema'
import type { Env, Variables } from '../index'

const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

// Constants
const JWT_EXPIRATION = '7d'
const COOKIE_NAME = 'auth_token'
const isProduction = import.meta.env.PROD

// ============================================================================
// HELPER: Set Secure Cookie
// ============================================================================
const setAuthCookie = (c: any, token: string) => {
  const cookieFlags = isProduction
    ? 'HttpOnly; Secure; SameSite=Lax; Domain=.19188103.com'
    : 'HttpOnly; SameSite=Lax'

  c.header(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; ${cookieFlags}; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
  )
}

// ============================================================================
// HELPER: Clear Cookie
// ============================================================================
const clearAuthCookie = (c: any) => {
  const cookieFlags = isProduction
    ? 'HttpOnly; Secure; SameSite=Lax; Domain=.19188103.com'
    : 'HttpOnly; SameSite=Lax'

  c.header(
    'Set-Cookie',
    `${COOKIE_NAME}=; ${cookieFlags}; Path=/; Max-Age=0`,
  )
}

// ============================================================================
// HELPER: Parse Cookies
// ============================================================================
const parseCookies = (
  cookieHeader: string | undefined,
): Record<string, string> => {
  if (!cookieHeader) return {}

  return cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) acc[key] = value
      return acc
    },
    {} as Record<string, string>,
  )
}

// ============================================================================
// HELPER: Handle Zod Errors
// ============================================================================
const handleZodError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return {
      error: error.issues[0].message,
      status: 400 as const,
    }
  }
  return null
}

// ============================================================================
// HELPER: Map MOTHER_DB User to API User
// ============================================================================
const mapAuthUserToApi = (user: DbAuthUser): ApiAuthUser => ({
  id: user.id,
  username: user.username,
  fullName: user.fullName,
  email: user.email,
  verified: user.verified === 1,
  bio: user.bio,
  avatar: user.avatar,
})

// ============================================================================
// MIDDLEWARE - Verify JWT from Cookie
// ============================================================================
export const verifyAuth = async (c: any, next: any) => {
  try {
    const cookieHeader = c.req.header('Cookie')
    const cookies = parseCookies(cookieHeader)
    const token = cookies[COOKIE_NAME]

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const jwtSecret = new TextEncoder().encode(c.env.JWT_SECRET_KEY)
    const { payload } = await jwtVerify(token, jwtSecret)

    const validatedPayload = jwtPayloadSchema.parse(payload)
    c.set('user', validatedPayload)

    await next()
  } catch (error) {
    console.error('[verifyAuth] Error:', error)
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}

// ============================================================================
// LOGIN
// ============================================================================
auth.post('/api/users/login', async (c) => {
  try {
    const body = await c.req.json()

    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    const user = await c.env.MOTHER_DB.prepare(
      'SELECT id, username, fullName, email, passwordHash, verified, bio, avatar FROM users WHERE email = ?',
    )
      .bind(email)
      .first<DbAuthUser>()

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)

    if (!validPassword) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    const jwtSecret = new TextEncoder().encode(c.env.JWT_SECRET_KEY)
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(jwtSecret)

    setAuthCookie(c, token)

    return c.json({
      message: 'Login successful',
      user: mapAuthUserToApi(user),
    })
  } catch (error) {
    const zodError = handleZodError(error)
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status)
    }

    console.error('[Login] Error:', error)
    return c.json({ error: 'Failed to login' }, 500)
  }
})

// ============================================================================
// SIGN OUT
// ============================================================================
auth.post('/api/users/signout', (c) => {
  try {
    clearAuthCookie(c)
    return c.json({ message: 'Signed out successfully' })
  } catch (error) {
    console.error('[Signout] Error:', error)
    return c.json({ error: 'Failed to sign out' }, 500)
  }
})

// ============================================================================
// GET CURRENT USER (Protected)
// ============================================================================
auth.get('/api/users/me', verifyAuth, async (c) => {
  try {
    const userPayload = c.get('user') as JwtPayload

    const user = await c.env.MOTHER_DB.prepare(
      'SELECT id, username, fullName, email, verified, bio, avatar FROM users WHERE id = ?',
    )
      .bind(userPayload.userId)
      .first<Omit<DbAuthUser, 'passwordHash'>>()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        verified: user.verified === 1,
        bio: user.bio,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('[Get Current User] Error:', error)
    return c.json({ error: 'Failed to retrieve user' }, 500)
  }
})

export default auth