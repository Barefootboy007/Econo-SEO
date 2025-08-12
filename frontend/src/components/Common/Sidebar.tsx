import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/shadcn-button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import type { UserPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import SidebarItems from "./SidebarItems"

const Sidebar = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-50 md:hidden"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-4">
                <span className="text-xl font-bold text-primary">SEO Optimizer</span>
              </div>
              <SidebarItems onClose={() => setOpen(false)} />
              <button
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
            {currentUser?.email && (
              <div className="border-t pt-4">
                <p className="truncate px-3 text-sm text-muted-foreground">
                  Logged in as: {currentUser.email}
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <div className="sticky top-0 hidden h-screen w-64 border-r bg-background p-4 md:flex">
        <div className="w-full">
          <SidebarItems />
        </div>
      </div>
    </>
  )
}

export default Sidebar
