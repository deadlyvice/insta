import { FastifyInstance } from 'fastify'
import { UserRepository } from './user.repository'
import { db } from '../../config/db'
import {
	createUserSchema,
	getUserByIdSchema,
	updateUserSchema,
} from './user.schema'

export async function userRoutes(app: FastifyInstance) {
	const usersRepo = new UserRepository(db)

	app.get('/', {
		handler: async (req, res) => {
			const users = await usersRepo.readAll()
			res.send(users)
		},
	})

	app.get<{ Params: { id: number } }>('/:id', {
		schema: getUserByIdSchema,
		handler: async (req, res) => {
			const user = await usersRepo.readById(req.params.id)
			res.send(user)
		},
	})

	app.post<{ Body: IUser }>('/', {
		schema: createUserSchema,
		handler: async (req, res) => {
			const userToCreate = await usersRepo.create(req.body)
			res.code(201).send(userToCreate)
		},
	})

	app.patch<{ Body: Partial<IUser>; Params: { id: number } }>('/:id', {
		schema: updateUserSchema,

		handler: async (req, res) => {
			const updatedUser = await usersRepo.update(req.params.id, req.body)
			res.send(updatedUser)
		},
	})

	app.delete<{ Params: { id: number } }>('/:id', {
		handler: async (req, res) => {
			const deletedUser = await usersRepo.delete(req.params.id)
			res.send(deletedUser)
		},
	})
}
