import { useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { Home, Package, Settings, Users, Globe, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import type { UserPublic } from "@/client"

interface Item {
  icon: LucideIcon
  title: string
  path: string
}

const items: Item[] = [
  { icon: Home, title: "Dashboard", path: "/dashboard" },
  { icon: Package, title: "Items", path: "/items" },
  { icon: Globe, title: "Scraper Settings", path: "/scraper-settings" },
  { icon: Settings, title: "User Settings", path: "/settings" },
]

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  const finalItems: Item[] = currentUser?.is_superuser
    ? [...items, { icon: Users, title: "Admin", path: "/admin" }]
    : items

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
        MENU
      </h2>
      <div className="space-y-1">
        {finalItems.map(({ icon: Icon, title, path }) => (
          <RouterLink
            key={title}
            to={path}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{title}</span>
          </RouterLink>
        ))}
      </div>
    </div>
  )
}

export default SidebarItems
