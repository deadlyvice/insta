import { FastifyInstance } from 'fastify'
import { PostRepository } from './post.repository'
import { db } from '../../config/db'
import { AppError } from '../../plugins/errors'
import { createPostSchema, getPostByIdSchema, updatePostSchema } from './post.schema'

export async function postRoutes(app: FastifyInstance) {
	const postsRepo = new PostRepository(db)

	app.get('/', async () => {
		const posts = await postsRepo.readAll()
		return posts
	})

	app.get<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		const post = await postsRepo.readById(req.params.id)
		if (!post.length) throw new AppError(404, 'ERROR: post not found')
		return post[0]
	})

	app.post<{ Body: IPost }>('/', { schema: createPostSchema }, async (req) => {
		return await postsRepo.create(req.body)
	})

	app.patch<{ Params: { id: number }; Body: Partial<IPost> }>(
		'/:id',
		{ schema: updatePostSchema },
		async (req) => {
			return await postsRepo.update(req.params.id, req.body)
		}
	)

	app.delete<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		const deleted = await postsRepo.delete(req.params.id)
		if (!deleted.length) throw new AppError(404, 'ERROR: post not found')
		return deleted[0]
	})
}
