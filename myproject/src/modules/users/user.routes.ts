import { FastifyInstance } from 'fastify'
import { UserRepository } from './user.repository'
import { db } from '../../config/db'
import { createUserSchema, getUserByIdSchema, updateUserSchema } from './user.schema'
import { AppError } from '../../plugins/errors'

export async function userRoutes(app: FastifyInstance) {
	const usersRepo = new UserRepository(db)

	app.get('/', async () => {
		const users = await usersRepo.readAll()
		return users
	})

	app.get<{ Params: { id: number } }>('/:id', { schema: getUserByIdSchema }, async (req) => {
		const user = await usersRepo.readById(req.params.id)
		if (!user.length) throw new AppError(404, 'ERROR: user not found')
		return user[0]
	})

	app.post<{ Body: IUser }>('/', { schema: createUserSchema }, async (req) => {
		return await usersRepo.create(req.body)
	})

	app.patch<{ Params: { id: number }; Body: Partial<IPost> }>(
		'/:id',
		{ schema: updateUserSchema },
		async (req) => {
			return await usersRepo.update(req.params.id, req.body)
		}
	)

	app.delete<{ Params: { id: number } }>('/:id', { schema: getUserByIdSchema }, async (req) => {
		const deleted = await usersRepo.delete(req.params.id)
		if (!deleted.length) throw new AppError(404, 'ERROR: user not found')
		return deleted[0]
	})
}
