import { getCollection } from 'astro:content'

/**
 * Shared data loader for SpatialLayout pages.
 * Each page (/, /blog/, /docs/) calls this to pre-render all three panels.
 */

export async function getSortedPosts() {
	const currentDate = new Date()
	const posts = await getCollection('blog', ({ data }) => !data.draft && data.publishedAt <= currentDate)
	return posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
}

export function partitionPosts(posts: ReturnType<typeof getSortedPosts> extends Promise<infer T> ? T : never) {
	return {
		pinnedPosts: posts.filter((p) => p.data.pinned),
		latestPosts: posts.filter((p) => !p.data.pinned),
	}
}
