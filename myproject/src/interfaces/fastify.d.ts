import '@fastify/jwt'
// import { IUser } from '../interfaces/user.interface'

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: IUser // Type for JWT payload (signing/verifying)
		user: IUser // Type for req.user
	}
}
