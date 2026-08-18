import { LoadingSpinner } from "./ui/loading-spinner"

const Loading = () => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-lg px-8 py-6">
        <LoadingSpinner size={28} />
        <span className="text-sm font-medium text-gray-700">Loading...</span>
      </div>
    </div>
  )
}

export default Loading