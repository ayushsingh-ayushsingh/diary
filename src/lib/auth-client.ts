import { createAuthClient } from "better-auth/client"
export const authClient = createAuthClient()

export const signInWithGoogle = async () => {
  authClient.signIn.social({
    provider: "google",
  })
}

export const signInWithGithub = async () => {
  await authClient.signIn.social({
    provider: "github",
  })
}
