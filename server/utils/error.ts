import type { H3Event, EventHandler } from 'h3'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Wrap a route handler with uniform error handling.
 * Converts ZodErrors, ApiErrors, and unknown errors into the standard error shape.
 */
export function withErrorHandler<T>(handler: (event: H3Event) => Promise<T>): EventHandler {
  return defineEventHandler(async (event: H3Event) => {
    try {
      return await handler(event)
    } catch (err: unknown) {
      // Zod validation errors → 400
      if (err instanceof ZodError) {
        const issues = err.issues || (err as any).errors || []
        const messages = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')
        setResponseStatus(event, 400)
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: messages,
            details: issues
          }
        }
      }

      // Our own ApiError
      if (err instanceof ApiError) {
        setResponseStatus(event, err.statusCode)
        return {
          success: false,
          error: { code: err.code, message: err.message }
        }
      }

      // H3 errors (createError)
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const h3Err = err as { statusCode: number; message: string; statusMessage?: string }
        setResponseStatus(event, h3Err.statusCode)
        return {
          success: false,
          error: {
            code: `HTTP_${h3Err.statusCode}`,
            message: h3Err.statusMessage || h3Err.message || 'An error occurred'
          }
        }
      }

      // PostgreSQL / Drizzle errors — map common codes to proper HTTP statuses
      const pgErr = (err && typeof err === 'object')
        ? ((err as any).code ? (err as any) : ((err as any).cause?.code ? (err as any).cause : ((err as any).originalError?.code ? (err as any).originalError : null)))
        : null

      if (pgErr && pgErr.code) {
        if (pgErr.code === '23505') {
          // Unique constraint violation (duplicate email, username, etc.)
          const detail = pgErr.detail || ''
          let message = 'A record with this information already exists.'
          if (detail.includes('email')) {
            message = 'This email address is already registered. Please log in or use a different email.'
          } else if (detail.includes('username')) {
            message = 'This username is already taken. Please choose another username.'
          } else if (detail.includes('account_number')) {
            message = 'Account number collision occurred. Please try submitting again.'
          }
          setResponseStatus(event, 409)
          return {
            success: false,
            error: { code: 'CONFLICT', message }
          }
        }
        if (pgErr.code === '23503') {
          // Foreign key violation
          setResponseStatus(event, 409)
          return {
            success: false,
            error: { code: 'CONFLICT', message: 'Referenced resource does not exist.' }
          }
        }
        if (pgErr.code === '22001') {
          // String length exceeded
          setResponseStatus(event, 400)
          return {
            success: false,
            error: { code: 'BAD_REQUEST', message: 'One or more fields exceed maximum allowed character length.' }
          }
        }
        if (pgErr.code === '22P02') {
          // Invalid input syntax for type uuid — usually a corrupt/mock token with a non-UUID user ID
          setResponseStatus(event, 401)
          return {
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Invalid session. Please log in again.' }
          }
        }
        if (pgErr.code === 'ECONNREFUSED' || pgErr.code === 'ETIMEDOUT' || pgErr.code === '08006' || pgErr.code === '08001' || pgErr.code === '57P01' || pgErr.code === '57P02' || pgErr.code === '57P03') {
          // Database connection error / Neon cold start
          console.error('[Evermont DB Connection Error]', err)
          setResponseStatus(event, 503)
          return {
            success: false,
            error: { code: 'SERVICE_UNAVAILABLE', message: 'Database is temporarily waking up or reconnecting. Please try again in a few seconds.' }
          }
        }
      }

      // Unknown errors — don't leak internals
      console.error('[Evermont API Error]', err)
      setResponseStatus(event, 500)
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' }
      }
    }
  })
}

export function notFound(resource = 'Resource') {
  throw new ApiError(`${resource} not found`, 404, 'NOT_FOUND')
}

export function unauthorized(message = 'Authentication required') {
  throw new ApiError(message, 401, 'UNAUTHORIZED')
}

export function forbidden(message = 'Access denied') {
  throw new ApiError(message, 403, 'FORBIDDEN')
}

export function conflict(message: string) {
  throw new ApiError(message, 409, 'CONFLICT')
}

export function badRequest(message: string) {
  throw new ApiError(message, 400, 'BAD_REQUEST')
}
