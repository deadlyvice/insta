import { FastifySchema } from 'fastify'

const idParam = {
	type: 'object',
	required: ['id'],
	properties: {
		id: { type: 'number' },
	},
}

export const getUserByIdSchema: FastifySchema = {
	params: idParam,
}


export const updateUserSchema: FastifySchema = {
	params: idParam,
	body: {
		type: 'object',
		minProperties: 1,
		additionalProperties: false,
		properties: {
			name: { type: 'string', minLength: 1 },
			email: { type: 'string', format: 'email' },
			nickname: { type: 'string', minLength: 1 },
			password: { type: 'string', minLength: 6 },
		},
	},
}
