import { Client } from 'pg'
import { AppError } from '../../plugins/errors'
// import * as bcrypt from 'bcryptjs'

export class AuthRepository {
	constructor(private db: Client) {}

	async register(user: Omit<IUser, 'id'>): Promise<IUser> {
		const { name, nickname, email, password } = user

		const checkQuery = 'SELECT id FROM users WHERE email = $1'
		const checkResult = await this.db.query(checkQuery, [email])
		if (checkResult.rows.length) {
			throw new AppError(409, 'ERROR: email already exists')
		}

		// const hashedPassword = await bcrypt.hash(password, 10)

		const insertQuery = `
			INSERT INTO users (name, nickname, password, email)
			VALUES ($1, $2, $3, $4)
			RETURNING id, name, nickname, email;
    `
		const createdUser = await this.db.query<IUser>(insertQuery, [
			name,
			nickname,
			password,
			email,
		])

		if (!createdUser.rows.length) {
			throw new AppError(400, 'ERROR: failed to create user')
		}
		return createdUser.rows[0]
	}

	async login(email: string, password: string) {
		const query = 'SELECT * FROM users WHERE email = $1'
		const result = await this.db.query<IUser>(query, [email])

		if (!result.rows.length) throw new AppError(401, 'ERROR: invalid email')

		const user = result.rows[0]
		const isMatch = password === user.password
		//await bcrypt.compare(password, user.password)

		if (!isMatch) throw new AppError(401, 'ERROR: invalid password')

		delete user.password
		return user
	}
}
