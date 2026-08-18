import Link from "next/link"
import { Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthLogo } from "@/components/auth/auth-logo"

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <AuthLogo />
        </div>

        <div className="relative mb-6">
          <h1 className="text-[120px] sm:text-[150px] font-bold text-gray-900 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-secondary-500/10 blur-2xl" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Page not found
        </h2>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or may have
          been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/landing">
            <Button className="w-full sm:w-auto bg-gray-900 text-white hover:bg-secondary-500 transition-colors duration-300 rounded-full gap-2">
              <Home className="w-4 h-4" />
              Back to home
            </Button>
          </Link>
          <Link href="/search">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors duration-300 rounded-full gap-2"
            >
              <Search className="w-4 h-4" />
              Search properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}