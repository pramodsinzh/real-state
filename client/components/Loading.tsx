import { LoadingSpinner } from "./ui/loading-spinner"
import { cn } from "@/lib/utils"

type LoadingProps = {
  /** Covers the viewport (layouts / route gates). Default overlays the nearest relative parent. */
  fullScreen?: boolean
  className?: string
  label?: string
}

const Loading = ({
  fullScreen = false,
  className,
  label = "Loading...",
}: LoadingProps) => {
  return (
    <div
      className={cn(
        "z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm",
        fullScreen ? "fixed inset-0" : "absolute inset-0",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-lg px-8 py-6">
        <LoadingSpinner size={28} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </div>
  )
}

export default Loading
