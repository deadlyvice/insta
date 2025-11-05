import { RouteShorthandOptions } from 'fastify'

export interface IPostLogin {
	Body: { email: string; password: string }
}
export const postLoginSchema: RouteShorthandOptions = {
	schema: {
		body: {
			type: 'object',
			additionalProperties: false,
			required: ['email', 'password'],
			properties: {
				email: { type: 'string', format: 'email' },
				password: { type: 'string', minLength: 6 },
			},
		},
	},
}

export const postRegisterSchema: RouteShorthandOptions = {
	schema: {
		body: {
			type: 'object',
			additionalProperties: false,
			required: ['name', 'email', 'nickname', 'password'],
			properties: {
				name: { type: 'string', minLength: 1 },
				email: { type: 'string', format: 'email' },
				nickname: { type: 'string', minLength: 1 },
				password: { type: 'string', minLength: 6 },
			},
		},
	},
}
