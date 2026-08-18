export function LoadingSpinner({ size = 28 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-secondary-500 animate-spin"
      />
    </div>
  )
}