import { slug } from "github-slugger"
import { useMemo } from "react"

export function TableOfContents({ text }: { text: string }) {
  const headings = useMemo(() => {
    const lines = text.split("\n")
    const result: { level: number; text: string; id: string }[] = []

    for (const line of lines) {
      const match = /^(#{1,6})\s+(.+)/.exec(line)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        result.push({ level, text, id: slug(text) })
      }
    }

    return result
  }, [text])

  if (headings.length === 0) return null

  return (
    <nav className="p-4 text-sm">
      <h3 className="mb-2 text-2xl font-semibold tracking-tight">
        On this page
      </h3>
      <ul className="space-y-1 ml-4">
        {headings.map((h, i) => {
          const indent =
            h.level === 1
              ? "pl-0 font-medium"
              : h.level === 2
                ? "pl-3 text-foreground"
                : "pl-6 text-foreground"
          return (
            <li key={i}>
              <a
                href={`#${h.id}`}
                className={`block truncate leading-relaxed hover:underline underline-offset-2 decoration-0.25 no-underline transition-colors hover:text-foreground ${indent} decoration-chart-4`}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
