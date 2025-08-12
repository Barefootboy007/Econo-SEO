import { Link } from "@tanstack/react-router"
import { User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/shadcn-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import useAuth from "@/hooks/useAuth"

const UserMenu = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          data-testid="user-menu"
        >
          <User className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {user?.full_name || user?.email || "User"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
