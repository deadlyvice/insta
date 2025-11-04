import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from './errors' // Import from the new types file
import { DatabaseError } from 'pg' // Import the specific error type from pg

export async function responseNormalizerPlugin(app: FastifyInstance) {
	// Hook for successful responses: wraps them in { ok: true, data }
	app.addHook('preSerialization', (req, reply, payload, done) => {
		// Check if it's a successful response and not an error
		if (reply.statusCode >= 200 && reply.statusCode < 500) {
			// Ensure the payload isn't already in the { ok: true } format
			// This check is simple; adjust if you have payloads that naturally have `ok: true`
			const isAlreadyFormatted = payload && typeof payload === 'object' && 'ok' in payload
			if (isAlreadyFormatted) {
				done(null, payload)
			} else {
				done(null, { ok: true, data: payload })
			}
		} else {
			// Let error payloads pass through as-is
			// They are formatted by the errorHandler
			done(null, payload)
		}
	})

	// Global error handler
	app.setErrorHandler((error: Error, req: FastifyRequest, reply: FastifyReply) => {
		// Log the full error details
		req.log.error(
			{
				error: error.name,
				message: error.message,
				stack: error.stack,
				code: (error as any).code, // Log DB code if present
			},
			'Error occurred'
		)

		// 1. Handle our custom "AppError"
		// These are "known" errors we throw on purpose (e.g., Not Found)
		if (error instanceof AppError) {
			return reply.status(error.status).send({ ok: false, error: error.message })
		}

		// 2. Handle specific Postgres (pg) DatabaseErrors
		// We check for the 'code' property, which is typical for pg errors
		if (error instanceof DatabaseError) {
			const pgError = error as DatabaseError
			req.log.warn({ code: pgError.code, detail: pgError.detail }, 'PostgreSQL Error')

			switch (pgError.code) {
				case '23505': // unique_violation
					return reply.status(409).send({
						ok: false,
						error: `A record with this value already exists. (${pgError.detail})`,
					})
				case '23503': // foreign_key_violation
					return reply.status(409).send({
						ok: false,
						error: `Operation failed due to a related record. (${pgError.detail})`,
					})
				case '23502': // not_null_violation
					return reply.status(400).send({
						ok: false,
						error: `A required field is missing. (${pgError.detail})`,
					})
				case '22P02': // invalid_text_representation (e.g., invalid UUID or int)
					return reply
						.status(400)
						.send({ ok: false, error: 'Invalid format for a parameter.' })
				// Add more PG error codes here as needed
				default:
					// For unhandled PG errors, fall through to the generic 500
					break
			}
		}

		// 3. Fallback for all other/unknown errors
		return reply.status(500).send({ ok: false, error: 'Internal Server Error' })
	})
}
