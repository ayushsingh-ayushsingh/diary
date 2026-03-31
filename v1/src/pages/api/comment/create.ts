import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { comment, blog, blockedUser } from "@/db/schema"
import { rateLimit } from "@/lib/rate-limit"
import { eq, and, or, isNull } from "drizzle-orm"

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    // Rate Limit: 10 per minute
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const rl = rateLimit(`comment_create_${session.user.id}_${ip}`, 10, 60 * 1000)
    if (!rl.success) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 })
    }

    const body = await request.json()
    const { blogId, content, parentId } = body

    if (!blogId || !content) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    // Verify blog allows comments
    const existingBlog = await db.query.blog.findFirst({
      where: eq(blog.id, blogId),
      with: { author: true }
    })

    if (!existingBlog) {
      return new Response(JSON.stringify({ error: "Blog not found" }), { status: 404 })
    }

    if (!existingBlog.allowComments) {
      return new Response(JSON.stringify({ error: "Comments are disabled for this blog" }), { status: 403 })
    }

    // Verify block status
    const blockRule = await db.query.blockedUser.findFirst({
      where: and(
        eq(blockedUser.blockedId, session.user.id),
        eq(blockedUser.blockerId, existingBlog.author.userId),
        or(
          isNull(blockedUser.blogId),
          eq(blockedUser.blogId, blogId)
        )
      )
    })

    if (blockRule) {
      return new Response(JSON.stringify({ error: "You do not have permission to comment on this blog" }), { status: 403 })
    }

    // Optional: verify parent comment exists if parentId is provided
    if (parentId) {
      const parentComment = await db.query.comment.findFirst({
        where: eq(comment.id, parentId)
      })
      if (!parentComment || parentComment.blogId !== blogId) {
        return new Response(JSON.stringify({ error: "Invalid parent comment" }), { status: 400 })
      }
    }

    const newComment = await db.insert(comment).values({
      id: crypto.randomUUID(),
      blogId,
      userId: session.user.id,
      content,
      parentId: parentId || null,
      isHidden: false,
    }).returning()

    return new Response(JSON.stringify(newComment[0]), { status: 201 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
