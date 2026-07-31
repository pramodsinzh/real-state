import Image from "next/image"
import Link from "next/link"

export function AuthLogo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-1.5">
      <Image
        src="/logo.svg"
        alt="Rentiful logo"
        width={16}
        height={16}
        className="w-4 h-4 shrink-0 brightness-0 transition-transform duration-300 group-hover:scale-110"
      />
      <div className="text-base font-bold leading-none">
        <span className="text-gray-900 transition-colors duration-300 group-hover:text-secondary-500">
          RENT
        </span>
        <span className="text-secondary-500 font-light transition-colors duration-300 group-hover:text-gray-900">
          IFUL
        </span>
      </div>
    </Link>
  )
}