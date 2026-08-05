"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ChangePasswordFormData, changePasswordSchema } from "@/lib/schemas"
import { Form } from "./ui/form"
import { CustomFormField } from "./FormField"
import { Button } from "./ui/button"

export function ChangePasswordForm() {
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    const handleSubmit = async (data: ChangePasswordFormData) => {
        setError("")
        setSuccess(false)
        setLoading(true)

        const res = await fetch("/api/account/change-password", {
            method: "POST",
            body: JSON.stringify(data),
        })

        setLoading(false)

        if (!res.ok) {
            const result = await res.json()
            setError(result.error ?? "Something went wrong")
            return
        }

        setSuccess(true)
        form.reset()
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                    Update your password to keep your account secure.
                </p>
            </div>

            <div className="px-6 py-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 max-w-sm">
                        <CustomFormField name="currentPassword" label="Current password" type="password" />
                        <CustomFormField name="newPassword" label="New password" type="password" />
                        <CustomFormField name="confirmNewPassword" label="Confirm new password" type="password" />

                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {success && (
                            <p className="text-sm text-green-600">Password updated successfully.</p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-700 text-white hover:bg-primary-800 transition-colors duration-300"
                        >
                            {loading ? "Updating..." : "Update password"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}