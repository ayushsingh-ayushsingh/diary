import type { APIRoute } from "astro"
import { db } from "@/db"
import { sql } from "drizzle-orm"

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get("q")

    if (!q) {
      return new Response(JSON.stringify([]), { status: 200 })
    }

    // Construct raw query to use Full Text Search (GIN index) safely
    // Filtering for visibility = 'public', isDraft = false, deletedAt IS NULL
    const searchResult = await db.execute(sql`
      SELECT 
        b.id, b.title, b.slug, b.reading_time, b.views, b.created_at, b.is_anonymous as "isAnonymous",
        a.display_name as "authorName", a.is_public as "authorIsPublic"
      FROM blog b
      JOIN author a ON b.author_id = a.id
      WHERE 
        b.visibility = 'public' 
        AND b.is_draft = false 
        AND b.deleted_at IS NULL
        AND b.tsv @@ plainto_tsquery('english', ${q})
      ORDER BY ts_rank(b.tsv, plainto_tsquery('english', ${q})) DESC
      LIMIT 20
    `)

    // Mask author name if author is not public or blog is anonymous
    const mapped = searchResult.rows.map((row: any) => ({
      ...row,
      authorName: (row.authorIsPublic && !row.isAnonymous) ? row.authorName : "Anonymous"
    }))

    return new Response(JSON.stringify(mapped), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
