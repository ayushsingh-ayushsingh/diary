import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { blog, blogView } from "@/db/schema"
import { eq, and, gt } from "drizzle-orm"

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const body = await request.json()
    const { blogId, sessionId } = body // sessionId from frontend for anon users

    if (!blogId) {
      return new Response(JSON.stringify({ error: "Missing blogId" }), { status: 400 })
    }

    const targetBlog = await db.query.blog.findFirst({
      where: eq(blog.id, blogId)
    })

    if (!targetBlog) {
      return new Response(JSON.stringify({ error: "Blog not found" }), { status: 404 })
    }

    const userId = session?.user.id || null
    const effectiveSessionId = sessionId || "anon_session"

    // Prevent duplicate spam: 1 view per 24h per blog
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    let existingView
    if (userId) {
      existingView = await db.query.blogView.findFirst({
        where: and(
          eq(blogView.blogId, blogId),
          eq(blogView.userId, userId),
          gt(blogView.createdAt, twentyFourHoursAgo)
        )
      })
    } else {
      existingView = await db.query.blogView.findFirst({
        where: and(
          eq(blogView.blogId, blogId),
          eq(blogView.sessionId, effectiveSessionId),
          gt(blogView.createdAt, twentyFourHoursAgo)
        )
      })
    }

    if (existingView) {
      return new Response(JSON.stringify({ message: "View already counted recently" }), { status: 200 })
    }

    // Insert into blog_view
    await db.insert(blogView).values({
      id: crypto.randomUUID(),
      blogId,
      userId,
      sessionId: userId ? null : effectiveSessionId,
    })

    // Increment blog.views
    const currentViews = parseInt(targetBlog.views || "0", 10)
    await db.update(blog).set({
      views: (currentViews + 1).toString()
    }).where(eq(blog.id, blogId))

    return new Response(JSON.stringify({ success: true, views: currentViews + 1 }), { status: 201 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
