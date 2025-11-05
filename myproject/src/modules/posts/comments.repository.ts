import { Client } from 'pg'
import { AppError } from '../../plugins/errors'
// import { AppError } from '../../plugins/errors'

export class CommentsRepository {
	constructor(private db: Client) {}

	async readById(id: number): Promise<IComment[]> {
		const getCommentQuery = 'SELECT * FROM comments WHERE id = $1'
		const result = await this.db.query(getCommentQuery, [id])
		return result.rows
	}
	async readAll(): Promise<IComment[]> {
		const getAllCommentsQuery = 'SELECT * FROM comments'
		const result = await this.db.query(getAllCommentsQuery)
		return result.rows
	}

	async create(comment: IComment): Promise<IComment> {
		const createCommentQuery = `
			INSERT INTO comments (post_id, user_id, data) 
			VALUES ($1, $2, $3) RETURNING *`
		const values = [comment.post_id, comment.user_id, comment.data]
		const result = await this.db.query(createCommentQuery, values)
		return result.rows[0]
	}

	async update(id: number, comment: Pick<IComment, 'data'>): Promise<IComment> {
		const keys = Object.keys(comment)
		const values = Object.values(comment)

		if (keys.length === 0) throw new AppError(400, 'No fields to update')

		// parameter placeholders: $2, $3, ...
		const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ')

		const query = `
			UPDATE comments 
			SET ${setClause}
			WHERE id = $1
			RETURNING *;`

		const result = await this.db.query<IComment>(query, [id, ...values])

		if (result.rowCount) return result.rows[0]
		throw new AppError(404, 'ERROR: comment not found or wrong req body')
	}
	async delete(id: number): Promise<IComment> {
		const result = await this.db.query<IComment>(
			`DELETE FROM comments WHERE id = $1 RETURNING *;`,
			[id]
		)

		return result.rows[0]
	}
}
