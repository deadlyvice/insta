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
		required: ['title', 'content', 'author_id'],
		properties: {
			title: { type: 'string', minLength: 1 },
			content: { type: 'string', minLength: 1 },
			author_id: { type: 'number' },
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

export const postReactionSchema: FastifySchema = {
	params: idParam,
	body: {
		type: 'object',
		required: ['reaction'],
		properties: {
			reaction: { type: ['boolean', 'null'] },
		},
	},
}

export const createCommentShema: FastifySchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		required: ['post_id', 'user_id', 'data'],
		properties: {
			data: { type: 'string', minLength: 1 },
			post_id: { type: 'number' },
			user_id: { type: 'number' },
		},
	},
}

export const updateCommentShema: FastifySchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		required: ['data'],
		properties: {
			data: { type: 'string', minLength: 1 },
		},
	},
}
