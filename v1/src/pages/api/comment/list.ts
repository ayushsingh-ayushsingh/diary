import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { comment } from "@/db/schema"
import { eq, and, asc, isNull, sql } from "drizzle-orm"

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const blogId = url.searchParams.get("blogId")
    if (!blogId) {
      return new Response(JSON.stringify({ error: "Missing blogId" }), { status: 400 })
    }

    const page = parseInt(url.searchParams.get("page") || "1")
    const parentId = url.searchParams.get("parentId")

    const session = await auth.api.getSession({ headers: request.headers })

    const whereClause = parentId
      ? and(eq(comment.blogId, blogId), eq(comment.isHidden, false), eq(comment.parentId, parentId))
      : and(eq(comment.blogId, blogId), eq(comment.isHidden, false), isNull(comment.parentId))

    const comments = await db.query.comment.findMany({
      where: whereClause,
      with: {
        user: {
          columns: { name: true, image: true, id: true }
        },
        blog: {
          with: { author: true }
        }
      },
      extras: {
        replyCount: sql<number>`(SELECT count(*) FROM comment AS c WHERE c.parent_id = comment.id AND c.is_hidden = false)`.mapWith(Number).as("replyCount")
      },
      orderBy: [asc(comment.createdAt)],
      limit: 11,
      offset: (page - 1) * 10
    })

    const hasMore = comments.length > 10
    const finalComments = hasMore ? comments.slice(0, 10) : comments

    const mappedComments = finalComments.map(c => ({
      id: c.id,
      content: c.content,
      parentId: c.parentId,
      createdAt: c.createdAt,
      user: c.user,
      replyCount: c.replyCount,
      isEdited: c.isEdited,
      canDelete: session ? (c.userId === session.user.id || c.blog.author.userId === session.user.id) : false,
      canEdit: session ? (c.userId === session.user.id) : false
    }))

    return new Response(JSON.stringify({ comments: mappedComments, hasMore }), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
