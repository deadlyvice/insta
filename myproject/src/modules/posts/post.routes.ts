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
import { UsersPostsRepository } from './users_posts.repository'

export async function postRoutes(app: FastifyInstance) {
	const postsRepo = new PostRepository(db)
	const usersPostsRepo = new UsersPostsRepository(db)

	app.get('/', async () => {
		const posts = await postsRepo.readAll()
		return posts
	})

	app.get<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		const post = await usersPostsRepo.getSingleUserPost(req.params.id)
		if (!post.length) throw new AppError(404, 'ERROR: post not found')
		return post[0]
	})

	app.post<{ Body: IPost }>('/', { schema: createPostSchema }, async (req) => {
		const post = await postsRepo.create(req.body)
		const result = await usersPostsRepo.createUserPost(post.author_id, post.id)
		return { ...post, user_post: result }
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

	app.post<{ Params: { id: number }; Body: { reaction: {} } }>(
		'/:id/reaction',
		//use empty object for disable reaction``
		{ schema: postReactionSchema },

		async (req) => {
			return await usersPostsRepo.updateReaction(
				req.params.id,
				req.body.reaction,
				33 // TODO: replace with actual user ID from auth
			)
		}
	)
}
