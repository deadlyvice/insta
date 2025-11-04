import { FastifySchema } from 'fastify'

const idParam = {
	type: 'object',
	required: ['id'],
	properties: {
		id: { type: 'number' },
	},
}

export const getPostByIdSchema: FastifySchema = {
	params: idParam,
}

export const createPostSchema: FastifySchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		required: ['title', 'content'],
		properties: {
			title: { type: 'string', minLength: 1 },
			content: { type: 'string', minLength: 1 },
			img_urls: { type: 'array', maxItems: 9, items: { type: 'string' } },
		},
	},
}

export const updatePostSchema: FastifySchema = {
	params: idParam,
	body: {
		type: 'object',
		minProperties: 1,
		additionalProperties: false,
		properties: {
			title: { type: 'string', minLength: 1 },
			content: { type: 'string', minLength: 1 },
			img_urls: { type: 'array', maxItems: 9, items: { type: 'string' } },
		},
	},
}
