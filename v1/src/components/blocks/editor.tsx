import {
  useCallback,
  useState,
  useEffect,
  useMemo,
  type ComponentPropsWithoutRef,
} from "react"
import remarkGfm from "remark-gfm"
import ReactMarkdown, { type ExtraProps } from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { debounce } from "lodash"
import { TableOfContents } from "@/components/blocks/contents"
import CodeMirror from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import {PublishButton} from "@/components/blocks/publish-btn"
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "@/components/blocks/headings"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode"
import { languages } from "@codemirror/language-data"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "@/components/ui/button"
import { Check, Copy, Send } from "lucide-react"

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
          variant={"ghost"}
          size={"icon-xs"}
          className="absolute text-white border-white/20 bg-white/5 rounded-2xl top-1 right-1 z-10 h-7 px-2 text-xs backdrop-blur-lg"
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

export function Renderer({ text }: { text: string }) {
  return (
    <div className="mx-auto prose w-full max-w-4xl overflow-auto p-4 dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
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
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export default function EditorPage() {
  const [text, setText] = useState<string>(
    () => localStorage.getItem("text") ?? ""
  )

  const [theme, setThemeState] = useState<"theme-light" | "dark" | "system">(
    () => {
      if (typeof document === "undefined") return "system"

      const isDarkMode = document.documentElement.classList.contains("dark")
      return isDarkMode ? "dark" : "theme-light"
    }
  )

  const onChange = useCallback((val: string) => {
    console.log("val:", val)
    setText(val)
  }, [])

  const debouncedSave = useMemo(
    () =>
      debounce((value: string) => {
        localStorage.setItem("text", value)
      }, 500),
    []
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      setThemeState(isDark ? "dark" : "theme-light")
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    debouncedSave(text)

    return () => {
      debouncedSave.cancel()
    }
  }, [text, debouncedSave])

  return (
    <div className="flex">
      <div className="sticky top-0 h-screen w-4/10 overflow-auto rounded-none border-r">
        <CodeMirror
          value={text}
          placeholder={"# Hello, World! This is a *Markdown* editor..."}
          theme={
            theme === "dark" || theme === "system" ? vscodeDark : vscodeLight
          }
          height="100vh"
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            EditorView.lineWrapping,
            EditorView.theme({
              ".cm-gutters": { display: "none" },
            }),
          ]}
          onChange={onChange}
        />
        <PublishButton text={text} />
      </div>
      <div className="w-6/10">
        <div className="text-[156px] h-28 select-none heading text-primary/25 max-w-4xl mx-auto" aria-hidden>
          &ldquo;
        </div>
        <Renderer text={text} />
        <div className="py-24 max-w-4xl mx-auto">
          <TableOfContents text={text} />
        </div>
      </div>
    </div>
  )
}
