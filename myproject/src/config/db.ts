import { Client, Pool } from 'pg'
const pool = new Pool()

export const db = new Client({
	user: 'postgres',
	password: '2112',
	host: 'localhost',
	port: 5432,
	database: 'insta',
})

export function connectDB() {
	if (pool.totalCount > 0) return console.log('db already connected')

	db.connect((e) => {
		if (e) console.error('❌ ERROR on connect db: ❌' + e)
		else console.log('✅ Connect to db success ✅')
	})
}
