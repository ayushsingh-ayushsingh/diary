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
    const { commentId, content } = body

    if (!commentId || !content?.trim()) {
      return new Response(JSON.stringify({ error: "Missing commentId or content" }), { status: 400 })
    }

    const existingComment = await db.query.comment.findFirst({
      where: eq(comment.id, commentId)
    })

    if (!existingComment) {
      return new Response(JSON.stringify({ error: "Comment not found" }), { status: 404 })
    }

    if (existingComment.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden: You don't have permission to edit this comment" }), { status: 403 })
    }

    await db.update(comment)
      .set({ content: content.trim(), isEdited: true })
      .where(eq(comment.id, commentId))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
