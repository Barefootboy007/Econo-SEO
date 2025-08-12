import { Link } from "@tanstack/react-router"
import UserMenu from "./UserMenu"

function Navbar() {
  return (
    <div className="sticky top-0 z-10 hidden w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex">
      <div className="flex w-full items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">SEO Optimizer</span>
        </Link>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </div>
  )
}

export default Navbar
