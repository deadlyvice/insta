import { FastifyInstance, FastifySchema } from 'fastify'
// import { UserRepository } from './user.repository'
import { db } from '../../config/db'
// import { AppError } from '../../plugins/errors'
import { AuthRepository } from './auth.repository'
// add login and register route.
// use JWT token. set this token into cookie header.

export const postLoginSchema: FastifySchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		required: ['email', 'password'],
		properties: {
			email: { type: 'string', format: 'email' },
			password: { type: 'string', minLength: 6 },
		},
	},
}

export const postRegisterSchema: FastifySchema = {
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
}
export async function userRoutes(app: FastifyInstance) {
	const authRepo = new AuthRepository(db)

	app.post('/login', { schema: postLoginSchema }, async (req, reply) => {
		const { email, password } = req.body as { email: string; password: string }
		const user = await authRepo.login(email, password)

		const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '1h' })

		reply.setCookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
			maxAge: 3600, // 1 hour
		})

		return { user, message: 'Logged in successfully' }
	})

	app.post('/register', { schema: postRegisterSchema }, async (req, reply) => {
		const newUser = await authRepo.register(req.body as Omit<IUser, 'id'>)

		const token = app.jwt.sign({ id: newUser.id, email: newUser.email }, { expiresIn: '1h' })

		reply.setCookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
			maxAge: 3600, // 1 hour
		})

		return { user: newUser, message: 'Registered successfully' }
	})
}
