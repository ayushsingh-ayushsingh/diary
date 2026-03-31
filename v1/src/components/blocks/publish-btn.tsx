import { useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPanel,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu"

export function PublishButton({ text }: { text: string }) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [allowComments, setAllowComments] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !text.trim()) {
      alert("Title and content are required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: text.trim(),
          visibility,
          allowComments,
          isAnonymous,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to publish")
      }
      const data = await res.json()
      window.location.href = `/${data.slug}`
    } catch (error: any) {
      console.error(error)
      alert("Failed to publish: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant={"outline"}
            size={"icon"}
            className="fixed top-2 right-2"
            disabled={!text}
          >
            <Send className="h-4 w-4" />
          </Button>
        }
      ></DialogTrigger>
      <DialogPopup>
        <DialogPanel>
          <Form className="contents" onSubmit={handlePublish}>
            <DialogHeader>
              <DialogTitle>Publish Blog</DialogTitle>
              <DialogDescription>
                Configure your blog visibility and settings before publishing.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel className="grid gap-4 py-4">
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a captivating title..."
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Visibility</FieldLabel>
                <Menu>
                  <MenuTrigger className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                    {visibility === "public"
                      ? "Public - visible to everyone"
                      : visibility === "unlisted"
                        ? "Unlisted - direct link only"
                        : "Private - only you"}
                  </MenuTrigger>
                  <MenuPopup
                    align="start"
                    sideOffset={4}
                    className="w-[--button-width]"
                  >
                    <MenuRadioGroup
                      value={visibility}
                      onValueChange={setVisibility}
                    >
                      <MenuRadioItem value="public">
                        Public - visible to everyone
                      </MenuRadioItem>
                      <MenuRadioItem value="unlisted">
                        Unlisted - direct link only
                      </MenuRadioItem>
                      <MenuRadioItem value="private">
                        Private - only you
                      </MenuRadioItem>
                    </MenuRadioGroup>
                  </MenuPopup>
                </Menu>
              </Field>
              <Field className="mt-2 flex flex-row items-center gap-2">
                <Checkbox
                  id="allowComments"
                  checked={allowComments}
                  onCheckedChange={(e) => setAllowComments(e)}
                  className="font-inherit h-4 w-4 rounded border-gray-300"
                />
                <FieldLabel
                  htmlFor="allowComments"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Allow Comments
                </FieldLabel>
              </Field>
              <Field className="mt-2 flex flex-row items-center gap-2">
                <Checkbox
                  id="isAnonymous"
                  checked={isAnonymous}
                  onCheckedChange={(e) => setIsAnonymous(e)}
                  className="font-inherit h-4 w-4 rounded border-gray-300"
                />
                <FieldLabel
                  htmlFor="isAnonymous"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Publish Anonymously
                </FieldLabel>
              </Field>
            </DialogPanel>
            <DialogFooter variant="bare">
              <DialogClose render={<Button variant="ghost" type="button" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Now
              </Button>
            </DialogFooter>
          </Form>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}
