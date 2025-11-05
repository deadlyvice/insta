import { FastifyInstance } from 'fastify'

export function signInJWT(app: FastifyInstance, user: IUser): string {
	return app.jwt.sign({ ...user }, { expiresIn: '1h' })
}

export function setJWTCookie(token: string, reply: any) {
	reply.setCookie('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/',
		maxAge: 3600, // 1 hour
	})
}
