"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLogo } from "@/components/auth/auth-logo"
import { signInSchema } from "@/lib/validations/auth"
import { PasswordInput } from "@/components/auth/password-input"

type FieldErrors = Partial<Record<"email" | "password", string>>

export default function SignInPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)

  function validateField(field: keyof typeof form, value: string) {
    const result = signInSchema.safeParse({ ...form, [field]: value })

    if (result.success) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      return
    }

    const issue = result.error.issues.find((i) => i.path[0] === field)
    setFieldErrors((prev) => ({ ...prev, [field]: issue?.message }))
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleBlur(field: keyof typeof form) {
    validateField(field, form[field])
  }

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")

    const result = signInSchema.safeParse(form)
    if (!result.success) {
      const errors: FieldErrors = {}
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FieldErrors
        if (!errors[key]) errors[key] = issue.message
      })
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setFormError("Invalid email or password")
      return
    }

    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <AuthLogo />
          </div>

          <p className="text-center text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-gray-900">Welcome back.</span>{" "}
            Sign in to continue
          </p>

          <form onSubmit={handleCredentialsLogin} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary-500 hover:bg-gray-900 transition-colors duration-300"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full transition-colors duration-300 hover:bg-gray-50"
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-secondary-500 hover:text-gray-900 transition-colors duration-300 font-medium hover:underline"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}