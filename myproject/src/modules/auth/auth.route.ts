import { FastifyInstance } from 'fastify'
import { db } from '../../config/db'
import { AuthRepository } from './auth.repository'
import { IPostLogin, postLoginSchema, postRegisterSchema } from './auth.schema'
import { setJWTCookie, signInJWT } from './auth.utils'
// add login and register route.
// use JWT token. set this token into cookie header.

export async function authRouters(app: FastifyInstance) {
	const authRepo = new AuthRepository(db)

	app.post<IPostLogin>('/login', postLoginSchema, async (req, reply) => {
		const { email, password } = req.body
		const user = await authRepo.login(email, password)
		const token = signInJWT(app, user)

		setJWTCookie(token, reply)
		return user
	})

	app.post('/register', postRegisterSchema, async (req, reply) => {
		const newUser = await authRepo.register(req.body as Omit<IUser, 'id'>)
		const token = signInJWT(app, newUser)

		setJWTCookie(token, reply)

		return newUser
	})
}
