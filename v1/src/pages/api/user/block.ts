import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { blockedUser, blog } from "@/db/schema"
import { eq, and, isNull } from "drizzle-orm"

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const { blockedId, blogId } = await request.json()

    if (!blockedId) {
      return new Response("Missing blockedId", { status: 400 })
    }

    // Optional verification: if blogId is provided, make sure the user owns it
    if (blogId) {
      const targetBlog = await db.query.blog.findFirst({
        where: eq(blog.id, blogId),
        with: { author: true },
      })
      if (!targetBlog || targetBlog.author.userId !== session.user.id) {
        return new Response("Forbidden to block on this blog", { status: 403 })
      }
    }

    // Check if already blocked
    const existing = await db.query.blockedUser.findFirst({
      where: and(
        eq(blockedUser.blockerId, session.user.id),
        eq(blockedUser.blockedId, blockedId),
        blogId ? eq(blockedUser.blogId, blogId) : isNull(blockedUser.blogId)
      ),
    })

    if (!existing) {
      await db.insert(blockedUser).values({
        id: crypto.randomUUID(),
        blockerId: session.user.id,
        blockedId: blockedId,
        blogId: blogId || null,
      })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error: any) {
    return new Response(error.message, { status: 500 })
  }
}
