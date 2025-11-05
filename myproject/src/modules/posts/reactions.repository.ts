import { Client } from 'pg'
import { AppError } from '../../plugins/errors'

export class ReactionsRepository {
	constructor(private db: Client) {}

	async createUserPost(authorId: number, postId: number) {
		const query = `
			INSERT INTO reactions (user_id, post_id)
			VALUES ($1, $2)
			RETURNING *;
		`
		const result = await this.db.query<IUsersPost>(query, [authorId, postId])
		if (result.rowCount) return result.rows[0]
		throw new AppError(404, 'user or post not found')
	}

	async getSingleUserPost(postId: number) {
		const query = `
			SELECT * FROM reactions
			--JOIN users ON users.id = reactions.user_id
			WHERE post_id = $1;
		`
		const result = await this.db.query<IUsersPost>(query, [postId])
		return result.rows
	}

	async setReaction(
		postId: number,
		userId: number,
		{ reaction }: IReaction
	): Promise<IUsersPost> {
		const query = `
			UPDATE reactions
			SET reaction = $3, reaction_date = NOW()
			WHERE post_id = $2 AND user_id = $1
			RETURNING *;
    `

		const result = await this.db.query<IUsersPost>(query, [userId, postId, reaction])
		return result.rows[0]
	}
}
