interface IPost {
	id: number
	title: string
	content: string
	created_at: string
	updated_at: string
	//use string only for push to db
	img_urls: Array<string> | string
}
