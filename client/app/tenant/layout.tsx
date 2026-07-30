import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user?.role !== "tenant") redirect("/landlord/dashboard")

  return (
    <div>
      {/* tenant nav/sidebar goes here later */}
      {children}
    </div>
  )
}