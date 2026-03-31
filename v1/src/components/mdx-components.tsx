import type { MDXComponents } from "mdx/types"
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "@/components/blocks/headings"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

export const components: MDXComponents = {
  h1: (props) => <Heading1 {...props} />,
  h2: (props) => <Heading2 {...props} />,
  h3: (props) => <Heading3 {...props} />,
  h4: (props) => <Heading4 {...props} />,
  h5: (props) => <Heading5 {...props} />,
  h6: (props) => <Heading6 {...props} />,

  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || "")
    const code = String(children).trim()

    if (match) {
      return (
        <SyntaxHighlighter language={match[1]} style={oneDark}>
          {code}
        </SyntaxHighlighter>
      )
    }

    return <code className={className}>{children}</code>
  },

  img: (props) => <img {...props} className="mx-auto" />,
  hr: () => <div className="mt-12 border-b-4" />,
}
