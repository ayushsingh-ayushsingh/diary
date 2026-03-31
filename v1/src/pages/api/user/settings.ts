import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { user, author } from "@/db/schema"
import { eq } from "drizzle-orm"

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const { name, image } = await request.json()

    if (!name?.trim()) {
      return new Response("Name is required", { status: 400 })
    }

    await db.update(user).set({ name: name.trim(), image: image?.trim() || null }).where(eq(user.id, session.user.id))
    
    // Cascading explicitly onto the author table for public profile representations
    await db.update(author).set({ displayName: name.trim(), avatar: image?.trim() || null }).where(eq(author.userId, session.user.id))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error: any) {
    return new Response(error.message, { status: 500 })
  }
}
