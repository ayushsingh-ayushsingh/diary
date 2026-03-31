import { useState, useEffect, type ComponentPropsWithoutRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import remarkGfm from "remark-gfm"
import ReactMarkdown, { type ExtraProps } from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { TableOfContents } from "@/components/blocks/contents"
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "@/components/blocks/headings"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

type CodeProps = ComponentPropsWithoutRef<"code"> & ExtraProps
type CenterProps = ComponentPropsWithoutRef<"div"> & ExtraProps
type CustomHrProps = ComponentPropsWithoutRef<"hr"> & ExtraProps

function CodeBlock({ children, className }: CodeProps) {
  const match = /language-(\w+)/.exec(className ?? "")
  const code = String(children).replace(/\n$/, "")
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  if (match) {
    return (
      <div className="relative -mx-4 -my-4.75">
        <Button
          onClick={() => copyToClipboard(code)}
          variant={"secondary"}
          size={"icon-sm"}
          className="absolute text-white top-1 right-1 z-10 h-7 px-2 text-xs backdrop-blur-lg"
        >
          {isCopied ? <Check className="text-success" /> : <Copy />}
        </Button>
        <SyntaxHighlighter
          PreTag="div"
          className="code-block"
          language={match[1]}
          style={oneDark}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    )
  }

  return <code className={className}>{children}</code>
}

function Center({ children, ...props }: CenterProps) {
  return (
    <div {...props} style={{ textAlign: "center" }}>
      {children}
    </div>
  )
}

function CustomHr({ ...props }: CustomHrProps) {
  return (
    <div {...props} className="mt-12 border-b-4">
      <hr className="hidden" />
    </div>
  )
}

function CustomImageRenderer({ ...props }: CenterProps) {
  return <img {...props} className="mx-auto" />
}

export function Renderer({ text }: { text: string }) {
  return (
    <div className="mx-auto prose w-full max-w-4xl overflow-auto p-4 pb-42 dark:prose-invert">
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          center: Center,
          h1: Heading1,
          h2: Heading2,
          h3: Heading3,
          h4: Heading4,
          h5: Heading5,
          h6: Heading6,
          hr: CustomHr,
          img: CustomImageRenderer,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export default function RenderingPage({ blogId }: { blogId?: string }) {
  const [text] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("text") ?? ""
  })

  // 60-second view tracking requirement
  useEffect(() => {
    if (!blogId) return;
    
    const timer = setTimeout(() => {
      // Manage simple anonymous sessions in localStorage (fallback if user is not logged in)
      if (!localStorage.getItem("anon_session")) {
        localStorage.setItem("anon_session", crypto.randomUUID())
      }
      
      const sessionId = localStorage.getItem("anon_session")
      
      fetch("/api/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ blogId, sessionId })
      }).catch(console.error)
    }, 60000)

    return () => clearTimeout(timer)
  }, [blogId])

  return (
    <div className="flex">
      <div className="sticky top-0 flex h-screen w-xs items-center truncate overflow-auto"></div>
      <Renderer text={text} />
      <div className="sticky top-0 flex h-screen w-xs items-center opacity-80 transition-all duration-200 hover:opacity-100">
        <ScrollArea scrollFade className="h-[80vh] truncate rounded-md px-4">
          <TableOfContents text={text} />
        </ScrollArea>
      </div>
    </div>
  )
}
