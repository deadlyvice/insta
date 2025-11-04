import { FastifySchema } from 'fastify'

const requiredIdParam = {
	type: 'object',
	required: ['id'],
	properties: {
		id: { type: 'number' },
	},
}

export const getUserByIdSchema: FastifySchema = {
	params: requiredIdParam,
}

export const createUserSchema: FastifySchema = {
	body: {
		required: ['email', 'password', 'name', 'nickname'],
		type: 'object',
		properties: {
			name: { type: 'string', minLength: 1 },
			email: { type: 'string', format: 'email' },
			nickname: { type: 'string', minLength: 1 },
			password: { type: 'string', minLength: 6 },
		},
	},
}

export const updateUserSchema: FastifySchema = {
	params: requiredIdParam,
	body: {
		type: 'object',
		properties: {
			name: { type: 'string', minLength: 1 },
			email: { type: 'string', format: 'email' },
			nickname: { type: 'string', minLength: 1 },
			password: { type: 'string', minLength: 6 },
		},
		additionalProperties: false,
	},
}
