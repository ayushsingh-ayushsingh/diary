import type { ComponentPropsWithoutRef } from "react"
import remarkGfm from "remark-gfm"
import ReactMarkdown, { type ExtraProps } from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
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
          className="absolute top-1 right-1 z-10 h-7 px-2 text-xs text-white backdrop-blur-lg"
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

