"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  className?: string
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ className, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    // {
    //   id: "evaluations",
    //   label: "Evaluations",
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    //     </svg>
    //   ),
    //   href: "/dashboard",
    //   active: pathname === "/evaluations",
    // },
    // {
    //   id: "analytics",
    //   label: "Analytics",
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    //     </svg>
    //   ),
    //   href: "/dashboard",
    //   active: pathname === "/analytics",
    // },
    // {
    //   id: "settings",
    //   label: "Settings",
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   href: "/dashboard",
    //   active: pathname === "/settings",
    // },
  ]

  return (
    <div className={cn("pb-12 min-h-screen relative", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {/* Logo and Collapse Button */}
          <div className="mb-8 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E81784] to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {isOpen && (
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-[#E81784] to-purple-600 bg-clip-text text-transparent">
                    Mavic.ai
                  </h2>
                  <p className="text-xs text-muted-foreground">Content Evaluation</p>
                </div>
              )}
            </div>
            
            {/* Modern Collapse Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 hover:bg-primary/10 transition-colors"
              title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? (
                // Collapse icon (chevrons left)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                // Expand icon (chevrons right)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.id}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent group",
                  route.active
                    ? "bg-gradient-to-r from-[#E81784]/10 to-purple-500/10 text-primary border-l-4 border-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
                title={!isOpen ? route.label : undefined}
              >
                <span className={cn("transition-all", !isOpen && "mx-auto")}>
                  {route.icon}
                </span>
                {isOpen && <span>{route.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Collapsed state indicator */}
      {!isOpen && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="w-8 h-1 rounded-full bg-primary/20" />
        </div>
      )}
    </div>
  )
}
