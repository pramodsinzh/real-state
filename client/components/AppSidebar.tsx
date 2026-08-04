"use client"

import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "./ui/sidebar"
import { Building, FileText, Heart, Home, Menu, Settings, X } from "lucide-react"
import { NAVBAR_HEIGHT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import Link from "next/link"

const AppSidebar = ({ userType }: AppSidebarProps) => {
    const pathname = usePathname()
    const { toggleSidebar, open } = useSidebar()

    const navLinks =
        userType === "manager"
            ? [
                { icon: Building, label: "Properties", href: "/manager/properties" },
                { icon: FileText, label: "Applications", href: "/manager/applications" },
                { icon: Settings, label: "Settings", href: "/manager/settings" },
            ]
            : [
                { icon: Heart, label: "Favorites", href: "/tenants/favorites" },
                { icon: FileText, label: "Applications", href: "/tenants/applications" },
                { icon: Home, label: "Residences", href: "/tenants/residences" },
                { icon: Settings, label: "Settings", href: "/tenants/settings" },
            ]

    return (
        <Sidebar
            collapsible="icon"
            className="fixed left-0 bg-white border-r border-gray-200"
            style={{
                top: `${NAVBAR_HEIGHT}px`,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            }}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div
                            className={cn(
                                "flex min-h-[56px] w-full items-center pt-3 mb-3",
                                open ? "justify-between px-6" : "justify-center"
                            )}
                        >
                            {open ? (
                                <>
                                    <h1 className="text-lg font-bold text-gray-900">
                                        {userType === "manager" ? "Manager View" : "Renter View"}
                                    </h1>
                                    <button
                                        className="hover:bg-gray-100 p-2 rounded-md transition-colors duration-300"
                                        onClick={() => toggleSidebar()}
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="hover:bg-gray-100 p-2 rounded-md transition-colors duration-300"
                                    onClick={() => toggleSidebar()}
                                >
                                    <Menu className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3">
                <SidebarMenu className="gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href

                        return (
                            <SidebarMenuItem key={link.href}>
                                <Link
                                    href={link.href}
                                    scroll={false}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-300",
                                        isActive
                                            ? "bg-secondary-50 text-secondary-600"
                                            : "text-gray-600 hover:bg-gray-100",
                                        !open && "justify-center px-0"
                                    )}
                                >
                                    <link.icon
                                        className={cn(
                                            "h-5 w-5 shrink-0",
                                            isActive ? "text-secondary-600" : "text-gray-500"
                                        )}
                                    />
                                    {open && (
                                        <span
                                            className={cn(
                                                "text-sm font-medium",
                                                isActive ? "text-secondary-600" : "text-gray-600"
                                            )}
                                        >
                                            {link.label}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar