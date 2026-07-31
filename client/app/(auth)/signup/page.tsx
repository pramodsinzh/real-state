"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AuthLogo } from "@/components/auth/auth-logo"
import { signUpSchema } from "@/lib/validations/auth"
import { PasswordInput } from "@/components/auth/password-input"

type FieldErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword" | "phoneNumber", string>>

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "tenant" as "tenant" | "manager",
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)

  function validateField(field: keyof typeof form, value: string) {
    const result = signUpSchema.safeParse({ ...form, [field]: value })

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
    validateField(field, form[field] as string)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")

    const result = signUpSchema.safeParse(form)
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

    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setFormError(data.error ?? "Something went wrong")
      setLoading(false)
      return
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    router.push(form.role === "manager" ? "/manager/dashboard" : "/tenants/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <AuthLogo />
          </div>

          <p className="text-center text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-gray-900">Create an account.</span>{" "}
            Get started with Rentiful
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                placeholder="Choose a username"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
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
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                onBlur={() => handleBlur("phoneNumber")}
                aria-invalid={!!fieldErrors.phoneNumber}
              />
              {fieldErrors.phoneNumber && (
                <p className="text-xs text-red-500">{fieldErrors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                aria-invalid={!!fieldErrors.confirmPassword}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup
                value={form.role}
                onValueChange={(value) =>
                  setForm({ ...form, role: value as "tenant" | "manager" })
                }
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="tenant" id="role-tenant" />
                  <Label htmlFor="role-tenant" className="font-normal cursor-pointer">
                    Tenant
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="manager" id="role-manager" />
                  <Label htmlFor="role-manager" className="font-normal cursor-pointer">
                    Manager
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary-500 hover:bg-gray-900 transition-colors duration-300"
            >
              {loading ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-secondary-500 hover:text-gray-900 transition-colors duration-300 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}