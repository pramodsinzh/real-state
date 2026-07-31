"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const { update } = useSession()
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")

  async function handleSelect(role: "tenant" | "manager") {
    if (!phoneNumber) {
      setError("Phone number is required")
      return
    }

    const res = await fetch("/api/onboarding", {
      method: "POST",
      body: JSON.stringify({ role, phoneNumber }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      return
    }

    await update({ role })
    router.push(role === "manager" ? "/manager/dashboard" : "/tenants/dashboard")
  }

  return (
    <div>
      <h1>How will you use RENTIFUL?</h1>
      <input
        type="tel"
        placeholder="Phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      {error && <p>{error}</p>}
      <button onClick={() => handleSelect("tenant")}>I&apos;m looking for a rental</button>
      <button onClick={() => handleSelect("manager")}>I&apos;m listing a property</button>
    </div>
  )
}