import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user?.role !== "landlord") redirect("/tenant/dashboard")

  return (
    <div>
      {/* landlord nav/sidebar goes here later */}
      {children}
    </div>
  )
}