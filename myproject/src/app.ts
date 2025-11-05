import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import { privateUsers, publicUsers } from './modules/users/user.routes'
import { connectDB } from './config/db'
import { responseNormalizerPlugin } from './plugins/response-normalizer'
import { privatePosts, publicPosts } from './modules/posts/post.routes'
import fastifyCookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import { authRouters } from './modules/auth/auth.route'
import { privateComments, publicComments } from './modules/posts/comments.routes'
// import { authMiddleware } from './middleware/auth.middleware'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
	logger: true,
	// ajv: {
	// 	customOptions: { coerceTypes: true },
	// },
}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
	// Place here your custom code!

	// Do not touch the following lines

	// This loads all plugins defined in plugins
	// those should be support plugins that are reused
	// through your application
	// eslint-disable-next-line no-void
	void fastify.register(AutoLoad, { dir: join(__dirname, 'plugins'), options: opts })

	// This loads all plugins defined in routes
	// define your routes in one of these
	// eslint-disable-next-line no-void
	void fastify.register(AutoLoad, { dir: join(__dirname, 'routes'), options: opts })

	// await fastify.register(fastifyCookie)
	// Register cookie plugin (MUST come before routes)
	await fastify.register(fastifyCookie, { secret: process.env.COOKIE_SECRET || 'super-secret' })

	// Register JWT plugin
	await fastify.register(jwt, { secret: process.env.JWT_SECRET || 'super-secret-jwt' })
	await fastify.register(responseNormalizerPlugin)

	// await fastify.register(authMiddleware, { prefix: '/' })

	// ------- auth -------------
	await fastify.register(authRouters, { prefix: '/auth' })
	// ------- users -------------
	await fastify.register(publicUsers, { prefix: '/users' })
	await fastify.register(privateUsers, { prefix: '/users' })
	// ------- posts -------------
	await fastify.register(publicPosts, { prefix: '/posts' })
	await fastify.register(privatePosts, { prefix: '/posts' })

	// ------- comments -------------
	await fastify.register(publicComments, { prefix: '/comments' })
	await fastify.register(privateComments, { prefix: '/comments' })

	connectDB()
}
export default app
export { app, options }
