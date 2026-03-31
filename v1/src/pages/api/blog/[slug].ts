import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { isNull } from "drizzle-orm"

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const slug = params.slug

    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug required" }), { status: 400 })
    }

    const fetchedBlog = await db.query.blog.findFirst({
      where: (blog, { eq, and }) => and(eq(blog.slug, slug), isNull(blog.deletedAt)),
      with: {
        author: true,
        tags: {
          with: { tag: true }
        }
      }
    })

    if (!fetchedBlog) {
      return new Response(JSON.stringify({ error: "Blog not found" }), { status: 404 })
    }

    const session = await auth.api.getSession({ headers: request.headers })
    const isOwner = session && session.user.id === fetchedBlog.author.userId

    // Visibility rules
    if (fetchedBlog.visibility === 'private' && !isOwner) {
      return new Response(JSON.stringify({ error: "Blog not found" }), { status: 404 })
    }

    // Anonymize author if private or blog is anonymous
    if ((!fetchedBlog.author.isPublic || fetchedBlog.isAnonymous) && !isOwner) {
      fetchedBlog.author.displayName = "Anonymous"
      fetchedBlog.author.avatar = null
      fetchedBlog.author.bio = null
      fetchedBlog.author.userId = "anonymous" 
    }

    return new Response(JSON.stringify(fetchedBlog), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
