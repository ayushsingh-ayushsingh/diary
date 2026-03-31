import GithubSlugger from "github-slugger"

const slugger = new GithubSlugger()

export function generateSlug(title: string): string {
  const base = slugger.slug(title)
  // 6 chars random string
  const random = Math.random().toString(36).substring(2, 8)
  return `${base}-${random}`
}
