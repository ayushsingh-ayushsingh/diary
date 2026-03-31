import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { blog, author } from "@/db/schema"
import { generateSlug } from "@/lib/slug"
import { rateLimit } from "@/lib/rate-limit"
import { eq } from "drizzle-orm"

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    // Rate Limit: 5 per hour
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const rl = rateLimit(`blog_create_${session.user.id}_${ip}`, 5, 60 * 60 * 1000)
    if (!rl.success) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 })
    }

    const body = await request.json()
    const { title, content, visibility, allowComments, isDraft, isAnonymous, readingTime } = body

    if (!title || !content || !visibility) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    // Ensure author exists for this user, if not create a default one
    let authorRecord = await db.query.author.findFirst({
      where: eq(author.userId, session.user.id),
    })

    if (!authorRecord) {
      const newAuthor = await db.insert(author).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        displayName: session.user.name || "Anonymous",
        isPublic: true,
      }).returning()
      authorRecord = newAuthor[0]
    }

    const slug = generateSlug(title)

    const newBlog = await db.insert(blog).values({
      id: crypto.randomUUID(),
      authorId: authorRecord.id,
      title,
      slug,
      content,
      visibility,
      allowComments: allowComments ?? true,
      isDraft: isDraft ?? false,
      isAnonymous: isAnonymous ?? false,
      readingTime: readingTime || null,
      views: "0",
    }).returning()

    return new Response(JSON.stringify(newBlog[0]), { status: 201 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
