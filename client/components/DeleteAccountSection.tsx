"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"

export function DeleteAccountSection() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const canDelete = confirmText.trim().toLowerCase() === "delete"

  async function handleDelete() {
    if (!canDelete) return

    setError("")
    setLoading(true)

    const res = await fetch("/api/account/delete", { method: "POST" })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Something went wrong")
      setLoading(false)
      return
    }

    await signOut({ callbackUrl: "/landing" })
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open)
    if (!open) {
      setConfirmText("")
      setError("")
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-red-100">
          <h2 className="text-sm font-semibold text-red-700">Delete account</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Permanently remove your account and all associated data.
          </p>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-gray-600 mb-4 max-w-md">
            This action cannot be undone. Your profile, favorites, and
            settings will be permanently deleted.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(true)}
            className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-300 rounded-full"
          >
            Delete my account
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-white rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Delete your account?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              This will permanently delete your account and all associated
              data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <label className="text-sm font-medium text-gray-700">
              Type <span className="font-bold text-gray-900">delete</span> to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              className="border-gray-200"
              autoComplete="off"
            />
          </div>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || loading}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 rounded-full"
            >
              {loading ? "Deleting..." : "Delete account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}