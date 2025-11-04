import { Client } from 'pg'
import { AppError } from '../../plugins/errors'

export class UsersPostsRepository {
	constructor(private db: Client) {}

	async createUserPost(authorId: number, postId: number) {
		const query = `
			INSERT INTO users_posts (user_id, post_id)
			VALUES ($1, $2)
			RETURNING *;
		`
		const result = await this.db.query<IUsersPost>(query, [authorId, postId])
		if (result.rowCount) return result.rows[0]
		throw new AppError(404, 'user or post not found')
	}
}
