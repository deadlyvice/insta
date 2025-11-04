import { Client } from 'pg'
import { AppError } from '../../plugins/errors'

export class PostRepository {
	constructor(private db: Client) {}

	async readById(id: number) {
		const posts = await this.db.query<IPost>('SELECT * FROM posts WHERE posts.id = $1', [id])
		return posts.rows
	}

	async readAll() {
		const posts = await this.db.query<IPost>('SELECT * FROM posts')
		return posts.rows
	}

	async create(post: IPost) {
		const { title, content, img_urls, author_id } = post
		const result = await this.db.query<IPost>(
			'INSERT INTO posts(title,content,author_id,img_urls) values ($1,$2,$3,$4) RETURNING *;',
			[title, content, author_id, JSON.stringify(img_urls)]
		)

		if (result.rowCount) return result.rows[0]
		throw new AppError(400, 'error: failed to create post')
	}

	async update(id: number, post: Partial<IPost>) {
		post.img_urls = JSON.stringify(post.img_urls)
		const keys = Object.keys(post)
		const values = Object.values(post)

		if (keys.length === 0) throw new AppError(400, 'No fields to update')

		// parameter placeholders: $2, $3, ...
		const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ')

		const query = `
            UPDATE posts 
            SET ${setClause}, updated_at = NOW()
            WHERE id = $1
            RETURNING *;`

		const result = await this.db.query<IPost>(query, [id, ...values])

		if (result.rowCount) return result.rows[0]
		throw new AppError(404, 'ERROR: post not found or wrong req body')
	}

	async delete(id: number) {
		const result = await this.db.query<IPost>(
			`DELETE FROM posts where id = $1
             RETURNING *;
            `,
			[id]
		)
		if (result.rowCount) return result.rows
		throw new AppError(404, 'ERROR: post not found')
	}
}
