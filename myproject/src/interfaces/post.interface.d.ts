interface IPost {
	id: number
	title: string
	content: string
	created_at: string
	updated_at: string
	author_id: number
	//use string only for push to db
	img_urls: Array<string> | string
}

type IReaction = 'like' | 'dislike' | null

interface IUsersPost {
	user_id: number
	post_id: number
	reaction: IReaction
	reaction_date: string | null
	comment: string | null
	comment_date: string | null
}
