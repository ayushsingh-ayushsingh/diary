import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { blog, author } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const { blogId, isPinned } = await request.json()

    const userAuthor = await db.query.author.findFirst({
      where: eq(author.userId, session.user.id)
    })
    
    if (!userAuthor) return new Response("Author not found", { status: 404 })

    const existingBlog = await db.query.blog.findFirst({
      where: and(eq(blog.id, blogId), eq(blog.authorId, userAuthor.id))
    })

    if (!existingBlog) return new Response("Blog not found or unauthorized", { status: 404 })

    if (isPinned) {
      const pinnedBlogs = await db.query.blog.findMany({
        where: and(eq(blog.authorId, userAuthor.id), eq(blog.isPinned, true))
      })
      if (pinnedBlogs.length >= 3 && !existingBlog.isPinned) {
        return new Response("You can only pin up to 3 blogs", { status: 400 })
      }
    }

    await db.update(blog).set({ isPinned }).where(eq(blog.id, blogId))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error: any) {
    return new Response(error.message, { status: 500 })
  }
}
