import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { comment, blog } from "@/db/schema"
import { eq } from "drizzle-orm"

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()
    const { commentId, isHidden } = body

    if (!commentId || isHidden === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    const existingComment = await db.query.comment.findFirst({
      where: eq(comment.id, commentId),
      with: { blog: { with: { author: true } } }
    })

    if (!existingComment) {
      return new Response(JSON.stringify({ error: "Comment not found" }), { status: 404 })
    }

    // Only the author of the blog can hide comments
    if (existingComment.blog.author.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden: Only blog author can hide comments" }), { status: 403 })
    }

    const updatedComment = await db.update(comment)
      .set({ isHidden })
      .where(eq(comment.id, commentId))
      .returning()

    return new Response(JSON.stringify(updatedComment[0]), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
