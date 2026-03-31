import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { blog, blogVersion, author } from "@/db/schema"
import { eq, desc, and, notInArray } from "drizzle-orm"

export const PUT: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()
    const { id, title, content, visibility, allowComments, isDraft, isAnonymous, readingTime } = body

    if (!id || !content) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    const existingBlog = await db.query.blog.findFirst({
      where: eq(blog.id, id),
      with: { author: true },
    })

    if (!existingBlog) {
      return new Response(JSON.stringify({ error: "Blog not found" }), { status: 404 })
    }

    if (existingBlog.author.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
    }

    // Insert into blog_version history
    await db.insert(blogVersion).values({
      id: crypto.randomUUID(),
      blogId: existingBlog.id,
      content: existingBlog.content,
    })

    // Update blog
    const updatedBlog = await db.update(blog).set({
      title: title ?? existingBlog.title,
      content: content,
      visibility: visibility ?? existingBlog.visibility,
      allowComments: allowComments ?? existingBlog.allowComments,
      isDraft: isDraft ?? existingBlog.isDraft,
      isAnonymous: isAnonymous ?? existingBlog.isAnonymous,
      readingTime: readingTime ?? existingBlog.readingTime,
    }).where(eq(blog.id, id)).returning()

    // Keep only last 2 versions + current latest
    const versionsToKeep = await db.query.blogVersion.findMany({
      where: eq(blogVersion.blogId, existingBlog.id),
      orderBy: [desc(blogVersion.createdAt)],
      limit: 2,
      columns: { id: true }
    })

    const keepIds = versionsToKeep.map(v => v.id)
    if (keepIds.length > 0) {
      await db.delete(blogVersion).where(
        and(
          eq(blogVersion.blogId, existingBlog.id),
          notInArray(blogVersion.id, keepIds)
        )
      )
    }

    return new Response(JSON.stringify(updatedBlog[0]), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
