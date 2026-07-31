import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function TenantsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user?.role !== "tenant") redirect("/manager/dashboard")

  return <div>{children}</div>
}