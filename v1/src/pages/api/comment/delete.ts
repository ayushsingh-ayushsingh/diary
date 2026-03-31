import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { comment } from "@/db/schema"
import { eq } from "drizzle-orm"

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()
    const { commentId } = body

    if (!commentId) {
      return new Response(JSON.stringify({ error: "Missing commentId" }), { status: 400 })
    }

    const existingComment = await db.query.comment.findFirst({
      where: eq(comment.id, commentId),
      with: { blog: { with: { author: true } } }
    })

    if (!existingComment) {
      return new Response(JSON.stringify({ error: "Comment not found" }), { status: 404 })
    }

    const isCommentAuthor = existingComment.userId === session.user.id
    const isBlogAuthor = existingComment.blog.author.userId === session.user.id

    if (!isCommentAuthor && !isBlogAuthor) {
      return new Response(JSON.stringify({ error: "Forbidden: You don't have permission to delete this comment" }), { status: 403 })
    }

    await db.delete(comment).where(eq(comment.id, commentId))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
