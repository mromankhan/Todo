"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("light")}
        className="justify-start"
      >
        <Sun className="h-4 w-4 mr-2" />
        Light
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("dark")}
        className="justify-start"
      >
        <Moon className="h-4 w-4 mr-2" />
        Dark
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("system")}
        className="justify-start"
      >
        <div className="h-4 w-4 mr-2 rounded-full bg-current"></div>
        System
      </Button>
    </div>
  )
}