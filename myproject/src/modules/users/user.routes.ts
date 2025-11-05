import { FastifyInstance } from 'fastify'
import { UserRepository } from './user.repository'
import { db } from '../../config/db'
import { getUserByIdSchema, updateUserSchema } from './user.schema'
import { AppError } from '../../plugins/errors'
// import { authMiddleware } from '../../middleware/auth.middleware'
import { protect } from '../auth/auth.utils'

const users = new UserRepository(db)

export async function publicUsers(app: FastifyInstance) {
	app.get('/', async () => {
		return await users.readAll()
	})

	app.get<{ Params: { id: number } }>('/:id', { schema: getUserByIdSchema }, async (req) => {
		const user = await users.readById(req.params.id)
		if (!user.length) throw new AppError(404, 'ERROR: user not found')
		return user[0]
	})
}

export async function privateUsers(app: FastifyInstance) {
	await protect(app)

	app.register(async (app) => {
		app.patch<{ Params: { id: number }; Body: Partial<IPost> }>(
			'/:id',
			{ schema: updateUserSchema },
			async (req) => {
				return await users.update(req.params.id, req.body)
			}
		)

		app.delete<{ Params: { id: number } }>(
			'/:id',
			{ schema: getUserByIdSchema },
			async (req) => {
				const deleted = await users.delete(req.params.id)
				if (!deleted.length) throw new AppError(404, 'ERROR: user not found')
				return deleted[0]
			}
		)
	})
}
