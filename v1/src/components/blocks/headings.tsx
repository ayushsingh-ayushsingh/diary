import React, { type ComponentPropsWithoutRef } from "react"
import { type ExtraProps } from "react-markdown"
import { slug } from "github-slugger"

function getText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return children.toString()
  if (Array.isArray(children)) return children.map(getText).join("")
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode }
    return getText(props.children)
  }
  return ""
}

type HeadingProps = ComponentPropsWithoutRef<
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
> &
  ExtraProps

export function Heading1({ children, ...props }: HeadingProps) {
  const id = slug(getText(children))

  return (
    <h1
      id={id}
      {...props}
      className="group mt-12 mb-4 border-b-2 pb-1 text-5xl tracking-tight"
    >
      <a
        href={`#${id}`}
        className="border-chart-4/60 no-underline transition-all duration-100 hover:border-b-10"
      >
        {children}
        <span className="px-2 font-extralight text-chart-4 opacity-0 group-hover:opacity-100">
          #
        </span>
      </a>
    </h1>
  )
}

export function Heading2({ children, ...props }: HeadingProps) {
  const id = slug(getText(children))

  return (
    <h2
      id={id}
      {...props}
      className="group mt-8 mb-4 border-b-2 pb-0.75 text-4xl tracking-tight"
    >
      <a
        href={`#${id}`}
        className="border-chart-4/60 pb-0.75 no-underline transition-all duration-100 hover:border-b-10"
      >
        {children}
        <span className="px-2 font-extralight text-chart-4 opacity-0 group-hover:opacity-100">
          #
        </span>
      </a>
    </h2>
  )
}

export function Heading3({ children, ...props }: HeadingProps) {
  const id = slug(getText(children))

  return (
    <h3 id={id} {...props} className="group text-3xl font-bold tracking-tight">
      <a
        href={`#${id}`}
        className="border-chart-4/60 no-underline decoration-chart-4 underline-offset-2 transition-all duration-300 hover:underline"
      >
        {children}
        <span className="px-2 font-extralight text-chart-4 opacity-0 group-hover:opacity-100">
          #
        </span>
      </a>
    </h3>
  )
}
export function Heading4({ children, ...props }: HeadingProps) {
  const id = slug(getText(children))

  return (
    <h4 id={id} {...props} className="group text-2xl font-bold tracking-tight">
      <a
        href={`#${id}`}
        className="border-chart-4/60 no-underline decoration-chart-4 underline-offset-2 transition-all duration-300 hover:underline"
      >
        {children}
        <span className="px-2 font-extralight text-chart-4 opacity-0 group-hover:opacity-100">
          #
        </span>
      </a>
    </h4>
  )
}

export function Heading5({ children, ...props }: HeadingProps) {
  const id = slug(getText(children))

  return (
    <h5 id={id} {...props} className="group text-xl font-bold tracking-tight">
      <a
        href={`#${id}`}
        className="border-chart-4/60 no-underline decoration-chart-4 underline-offset-2 transition-all duration-300 hover:underline"
      >
        {children}
        <span className="px-2 font-extralight text-chart-4 opacity-0 group-hover:opacity-100">
          #
        </span>
      </a>
    </h5>
  )
}

export function Heading6({ children, ...props }: HeadingProps) {
  const id = slug(getText(children))

  return (
    <h6 id={id} {...props} className="group text-lg font-bold tracking-tight">
      <a
        href={`#${id}`}
        className="border-chart-4/60 no-underline decoration-chart-4 underline-offset-2 transition-all duration-300 hover:underline"
      >
        {children}
        <span className="px-2 font-extralight text-chart-4 opacity-0 group-hover:opacity-100">
          #
        </span>
      </a>
    </h6>
  )
}
