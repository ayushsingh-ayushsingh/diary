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
import { Field, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, Settings } from "lucide-react"

export function SettingsModal({
  currentName,
  currentImage,
  trigger,
}: {
  currentName: string
  currentImage: string | null
  trigger?: React.ReactNode
}) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(currentName)
  const [image, setImage] = useState(currentImage || "")

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image: image.trim() === "" ? null : image,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      window.location.reload()
    } catch (err: any) {
      console.error(err)
      alert("Failed to save settings: " + err.message)
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        {trigger || (
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogPopup>
        <DialogPanel className="p-0">
          <Form className="contents" onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>Account Settings</DialogTitle>
              <DialogDescription>
                Update your public profile details.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel className="grid gap-4 py-4">
              <Field>
                <FieldLabel>Display Name</FieldLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="mb-2 flex items-center gap-4">
                  <div className="h-18 w-18 shrink-0 overflow-hidden rounded-full border bg-muted">
                    {image ? (
                      <img
                        src={image}
                        alt="Avatar Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground uppercase">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <FieldLabel>Profile Image (Max 5MB)</FieldLabel>
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        const allowedTypes = [
                          "image/png",
                          "image/jpeg",
                          "image/jpg",
                          "image/webp",
                        ]
                        if (!allowedTypes.includes(file.type)) {
                          alert(
                            "Invalid file type. Please upload PNG, JPG, or WEBP."
                          )
                          e.target.value = ""
                          return
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          alert("File size exceeds 5MB limit.")
                          e.target.value = ""
                          return
                        }

                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const result = reader.result as string
                          setImage(result)
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                    <p className="mt-1 text-bottom text-muted-foreground">
                      PNG, JPG, or WEBP. Max 5MB.
                    </p>
                  </div>
                </div>
              </Field>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" type="button" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Save Changes
              </Button>
            </DialogFooter>
          </Form>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}
