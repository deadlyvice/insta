import { FastifyInstance } from 'fastify'
import { PostRepository } from './post.repository'
import { db } from '../../config/db'
import { AppError } from '../../plugins/errors'
import {
	createPostSchema,
	getPostByIdSchema,
	postReactionSchema,
	updatePostSchema,
} from './post.schema'
import { ReactionsRepository } from './reactions.repository'
import { protect } from '../auth/auth.utils'

const posts = new PostRepository(db)
const users = new ReactionsRepository(db)

export async function publicPosts(app: FastifyInstance) {
	app.get('/', async () => {
		return posts.readAll()
	})

	app.get<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		const post = await users.getSingleUserPost(req.params.id)
		if (!post.length) throw new AppError(404, 'ERROR: post not found')
		return post[0]
	})
}

export async function privatePosts(app: FastifyInstance) {
	await protect(app)

	app.post<{ Body: IPost }>('/', { schema: createPostSchema }, async (req) => {
		const post = await posts.create(req.body)
		const result = await users.createUserPost(post.author_id, post.id)
		return { ...post, user_post: result }
	})

	app.patch<{ Params: { id: number }; Body: Partial<IPost> }>(
		'/:id',
		{ schema: updatePostSchema },
		async (req) => {
			return await posts.update(req.params.id, req.body)
		}
	)

	app.delete<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		const deleted = await posts.delete(req.params.id)
		if (!deleted.length) throw new AppError(404, 'ERROR: post not found')
		return deleted[0]
	})

	app.post<{ Params: { id: number }; Body: IReaction }>(
		'/:id/reaction',
		{ schema: postReactionSchema },
		async (req, res) => {
			return users.setReaction(req.params.id, req.user.id, req.body)
		}
	)
}
