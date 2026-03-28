import * as React from "react"
import { Moon, Sun } from "lucide-react"

import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const [theme, setThemeState] = React.useState<
    "theme-light" | "dark" | "system"
  >("system")

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setThemeState(isDarkMode ? "dark" : "theme-light")
  }, [])

  React.useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)

    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
  }, [theme])

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant="outline" size="icon" className="relative backdrop-blur-2xl">
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all dark:scale-0 dark:rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        }
      ></MenuTrigger>

      <MenuPopup align="end" sideOffset={4}>
        <MenuRadioGroup
          value={theme}
          onValueChange={(value) =>
            setThemeState(value as "theme-light" | "dark" | "system")
          }
        >
          <MenuRadioItem value="theme-light">Light</MenuRadioItem>
          <MenuRadioItem value="dark">Dark</MenuRadioItem>
          <MenuRadioItem value="system">System</MenuRadioItem>
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  )
}
