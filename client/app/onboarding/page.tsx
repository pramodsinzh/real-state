"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLogo } from "@/components/auth/auth-logo"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const { update } = useSession()
  const router = useRouter()
  const [role, setRole] = useState<"tenant" | "manager" | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    setError("")

    if (!role) {
      setError("Please select an option to continue")
      return
    }
    if (!phoneNumber.trim()) {
      setError("Phone number is required")
      return
    }

    setLoading(true)

    const res = await fetch("/api/onboarding", {
      method: "POST",
      body: JSON.stringify({ role, phoneNumber }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      setLoading(false)
      return
    }

    await update({ role })
    router.push("/landing")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <AuthLogo />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900">
              Welcome to Rentiful
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us how you&apos;d like to use the platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("tenant")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-300",
                role === "tenant"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              )}
            >
              <User className={cn("w-6 h-6", role === "tenant" ? "text-white" : "text-secondary-500")} />
              <div>
                <p className="font-semibold text-sm">I&apos;m looking for a rental</p>
                <p className={cn("text-xs mt-1", role === "tenant" ? "text-white/70" : "text-muted-foreground")}>
                  Search and apply for properties
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("manager")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-300",
                role === "manager"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              )}
            >
              <Building2 className={cn("w-6 h-6", role === "manager" ? "text-white" : "text-secondary-500")} />
              <div>
                <p className="font-semibold text-sm">I&apos;m listing a property</p>
                <p className={cn("text-xs mt-1", role === "manager" ? "text-white/70" : "text-muted-foreground")}>
                  Manage properties and tenants
                </p>
              </div>
            </button>
          </div>

          <div className="space-y-1.5 mb-6">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <Button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-gray-900 text-white hover:bg-secondary-500 transition-colors duration-300 rounded-full"
          >
            {loading ? "Setting up..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}