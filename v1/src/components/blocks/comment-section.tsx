import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type CommentData = {
  id: string
  content: string
  parentId: string | null
  createdAt: string
  user: { name: string; image: string | null; id: string }
  canDelete?: boolean
  canEdit?: boolean
  isEdited?: boolean
  replyCount: number
}

function CommentItem({
  comment,
  allComments,
  onReply,
  onDelete,
  onBlock,
  onEdit,
  onLoadReplies,
  isBlogAuthor,
}: {
  comment: CommentData
  allComments: CommentData[]
  onReply: (parentId: string) => void
  onDelete: (id: string) => void
  onBlock: (userId: string, global: boolean) => void
  onEdit: (id: string, newContent: string) => Promise<void>
  onLoadReplies: (parentId: string, pageNum: number) => Promise<boolean>
  isBlogAuthor: boolean
}) {
  const replies = allComments.filter((c) => c.parentId === comment.id)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyPage, setReplyPage] = useState(1)
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [hasMoreReplies, setHasMoreReplies] = useState(
    comment.replyCount > replies.length
  )
  const [showReplies, setShowReplies] = useState(true)

  const handleLoadReplies = async () => {
    setLoadingReplies(true)
    setShowReplies(true)
    try {
      const hasMore = await onLoadReplies(comment.id, replyPage)
      setHasMoreReplies(hasMore)
      setReplyPage(replyPage + 1)
    } finally {
      setLoadingReplies(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false)
      return
    }
    setIsSubmitting(true)
    try {
      await onEdit(comment.id, editContent)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleEditSubmit()
    }
  }

  return (
    <div className="mt-4 first:mt-0">
      <div className="flex space-x-3">
        <div className="shrink-0">
          {comment.user.image ? (
            <img
              className="h-8 w-8 rounded-full"
              src={comment.user.image}
              alt={comment.user.name}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="grow">
          <div className="text-sm font-medium">
            {comment.user.name}
            {comment.isEdited && (
              <span className="ml-2 text-xs font-normal text-foreground/50">
                (edited)
              </span>
            )}
          </div>
          {isEditing ? (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full resize-y rounded-md border border-input bg-transparent p-3 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEditSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-sm whitespace-pre-wrap text-foreground/80">
              {comment.content}
            </div>
          )}
          <div className="mt-2 flex items-center space-x-4 text-xs text-foreground/50">
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            {!isEditing && (
              <>
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center space-x-1 transition-colors hover:text-primary"
                >
                  <span>Reply</span>
                </button>
                {comment.canEdit && (
                  <button
                    onClick={() => {
                      setEditContent(comment.content)
                      setIsEditing(true)
                    }}
                    className="flex items-center space-x-1 transition-colors hover:text-primary"
                  >
                    <span>Edit</span>
                  </button>
                )}
                {comment.canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <button className="flex items-center space-x-1 transition-colors hover:text-red-500" />
                      }
                    >
                      <span>Delete</span>
                    </AlertDialogTrigger>
                    <AlertDialogPopup>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your comment from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogClose render={<Button variant="ghost" />}>
                          Cancel
                        </AlertDialogClose>
                        <AlertDialogClose
                          render={
                            <Button
                              variant="destructive"
                              onClick={() => onDelete(comment.id)}
                            />
                          }
                        >
                          Delete Comment
                        </AlertDialogClose>
                      </AlertDialogFooter>
                    </AlertDialogPopup>
                  </AlertDialog>
                )}
                {isBlogAuthor && comment.canDelete && !comment.canEdit && (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <button className="flex items-center space-x-1 transition-colors hover:text-red-500">
                          <span>Block</span>
                        </button>
                      }
                    />
                    <AlertDialogPopup>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Block User?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Select the scope of the block for {comment.user.name}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogClose render={<Button variant="ghost" />}>
                          Cancel
                        </AlertDialogClose>
                        <AlertDialogClose
                          render={
                            <Button
                              variant="outline"
                              onClick={() => onBlock(comment.user.id, false)}
                            />
                          }
                        >
                          Block from this Blog
                        </AlertDialogClose>
                        <AlertDialogClose
                          render={
                            <Button
                              variant="destructive"
                              onClick={() => onBlock(comment.user.id, true)}
                            />
                          }
                        >
                          Block from Account
                        </AlertDialogClose>
                      </AlertDialogFooter>
                    </AlertDialogPopup>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showReplies && replies.length > 0 && (
        <div className="mt-4 ml-4 border-l-2 border-border/75 pl-5">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              onReply={onReply}
              onDelete={onDelete}
              onBlock={onBlock}
              onEdit={onEdit}
              onLoadReplies={onLoadReplies}
              isBlogAuthor={isBlogAuthor}
            />
          ))}
        </div>
      )}

      <div className="mt-3 ml-4 flex items-center space-x-4">
        {hasMoreReplies && (
          <button
            onClick={handleLoadReplies}
            disabled={loadingReplies}
            className="flex items-center space-x-2 text-xs font-semibold text-primary hover:underline"
          >
            {loadingReplies && <Loader2 className="h-3 w-3 animate-spin" />}
            <span className="border-l-2 px-6">
              {replyPage === 1 && replies.length === 0
                ? "Show Replies"
                : "Load more replies"}
            </span>
          </button>
        )}

        {replies.length > 0 && showReplies && (
          <button
            onClick={() => setShowReplies(false)}
            className="text-xs font-semibold text-foreground/50 hover:underline"
          >
            Hide replies
          </button>
        )}

        {replies.length > 0 && !showReplies && (
          <button
            onClick={() => setShowReplies(true)}
            className="border-l-2 px-6 text-xs font-semibold text-primary hover:underline"
          >
            Show replies
          </button>
        )}
      </div>
    </div>
  )
}

export default function CommentSection({
  blogId,
  isBlogAuthor,
}: {
  blogId?: string
  isBlogAuthor?: boolean
}) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchComments = (pageNum: number) => {
    return fetch(`/api/comment/list?blogId=${blogId}&page=${pageNum}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.comments && Array.isArray(data.comments)) {
          if (pageNum === 1) {
            setComments(data.comments)
          } else {
            setComments((prev) => [...prev, ...data.comments])
          }
          setHasMore(data.hasMore)
        }
      })
      .catch(console.error)
  }

  useEffect(() => {
    if (!blogId) return
    setLoading(true)
    fetchComments(1).finally(() => setLoading(false))
  }, [blogId])

  const loadReplies = async (parentId: string, pageNum: number) => {
    const res = await fetch(
      `/api/comment/list?blogId=${blogId}&parentId=${parentId}&page=${pageNum}`
    )
    const data = await res.json()
    if (data.comments && Array.isArray(data.comments)) {
      setComments((prev) => {
        const newComments = data.comments.filter(
          (newC: any) => !prev.some((p) => p.id === newC.id)
        )
        return [...prev, ...newComments]
      })
      return data.hasMore
    }
    return false
  }

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    fetchComments(nextPage).finally(() => {
      setPage(nextPage)
      setLoadingMore(false)
    })
  }

  const handleEdit = async (id: string, newContent: string) => {
    const res = await fetch("/api/comment/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: id, content: newContent }),
    })

    if (!res.ok) {
      throw new Error(await res.text())
    }

    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, content: newContent, isEdited: true } : c
      )
    )
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/comment/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: id }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      setComments((prev) =>
        prev.filter((c) => c.id !== id && c.parentId !== id)
      )
    } catch (error: any) {
      console.error(error)
      alert("Failed to delete comment")
    }
  }

  const handleBlock = async (userId: string, global: boolean) => {
    try {
      const res = await fetch("/api/user/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedId: userId, blogId: global ? null : blogId }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      alert(`User blocked ${global ? "globally" : "from this blog"}`)
    } catch (error: any) {
      console.error(error)
      alert("Failed to block user")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogId) {
      alert("Please save the blog first or wait for it to load.")
      return
    }
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/comment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId,
          content: content.trim(),
          parentId: replyTo,
        }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const newComment = await res.json()

      // Refetch page 1 to sync latest state (or prepend optimally, but refetch preserves strict list purity)
      setPage(1)
      await fetchComments(1)

      setContent("")
      setReplyTo(null)
    } catch (error: any) {
      console.error(error)
      window.location.href = "/auth"
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (!submitting && content.trim()) {
        handleSubmit(e as any)
      }
    }
  }

  // Top level comments only
  const topLevelComments = comments.filter((c) => !c.parentId)

  if (!blogId) {
    return (
      <div className="mt-12 border-t px-4 py-8 text-center text-foreground/60">
        <p>Comments are disabled in preview mode.</p>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-12 mb-24 border-t pt-8">
      <h3 className="mb-6 text-xl font-semibold">
        Responses ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-8">
        {replyTo && (
          <div className="flex items-center justify-between rounded-t-md bg-primary/10 px-3 py-2 text-sm text-primary">
            <span>Replying to a comment...</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts... (Ctrl + Enter to publish)"
            className={`min-h-[100px] w-full resize-y rounded-md border border-input bg-transparent p-4 focus:ring-1 focus:ring-ring focus:outline-none ${replyTo ? "rounded-t-none border-t-0" : ""}`}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !content.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-foreground/50" />
        </div>
      ) : (
        <div className="space-y-6">
          {topLevelComments.length === 0 ? (
            <div className="py-8 text-center text-foreground/50">
              No responses yet. Be the first to share your thoughts!
            </div>
          ) : (
            topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                allComments={comments}
                onDelete={handleDelete}
                onBlock={handleBlock}
                onEdit={handleEdit}
                onLoadReplies={loadReplies}
                isBlogAuthor={!!isBlogAuthor}
                onReply={(id) => {
                  setReplyTo(id)
                  setContent("")
                  window.scrollTo({
                    top:
                      document.querySelector("form")?.getBoundingClientRect()
                        .top! +
                      window.scrollY -
                      100,
                    behavior: "smooth",
                  })
                }}
              />
            ))
          )}

          {comments.length > 0 && (
            <div className="pt-6 text-center">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                disabled={!hasMore || loadingMore}
                onClick={handleLoadMore}
              >
                {loadingMore && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {hasMore ? "Load More" : "No More Comments"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
