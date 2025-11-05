import 'fastify'

declare module 'fastify' {
	interface FastifyRequest {
		user?: {
			id: number
			name: string
			nickname: string
			email: string
			iat?: number
			exp?: number
		}
	}
}
