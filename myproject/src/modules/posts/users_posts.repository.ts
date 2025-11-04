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

	async getSingleUserPost(postId: number) {
		const query = `
			SELECT * FROM users_posts
			--JOIN users ON users.id = users_posts.user_id
			WHERE post_id = $1;
		`
		const result = await this.db.query<IUsersPost>(query, [postId])
		return result.rows
	}

	async updateReaction(
		postId: number,
		reaction: {},
		userId: number
	): Promise<IUsersPost> {
		const query = `
			UPDATE users_posts
			SET reaction = $3
			WHERE post_id = $2 AND user_id = $1
			RETURNING *;
    `

		const result = await this.db.query<IUsersPost>(query, [userId, postId, reaction])
		return result.rows[0]
	}
}
