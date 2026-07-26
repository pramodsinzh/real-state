import Link from 'next/link'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook, faInstagram, faLinkedin, faTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons"
import Image from 'next/image'

const FooterSection = () => {
    return (
        <footer className='border-t border-gray-200 bg-gray-50 pt-16 pb-8'>
            <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-200">
                    {/* Logo / brand section */}
                    <div className='flex flex-col justify-center items-center'>
                        <Link
                            href='/'
                            className='group flex items-center gap-2 cursor-pointer'
                            scroll={false}
                        >
                            <Image
                                src="/logo.svg"
                                alt="Rentiful logo"
                                width={15}
                                height={15}
                                className="w-6 h-6 brightness-0 transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="text-base font-bold">
                                <span className="text-gray-900 transition-colors duration-300 group-hover:text-secondary-500">
                                    RENT
                                </span>
                                <span className="text-secondary-500 font-light transition-colors duration-300 group-hover:text-gray-900">
                                    IFUL
                                </span>
                            </div>
                        </Link>
                        <p className="mt-3 text-sm text-gray-500 max-w-xs text-center">
                            Helping you find the perfect rental property, wherever you are.
                        </p>
                        <div className="flex space-x-4 mt-5">
                            <a href="#" aria-label='Facebook' className='text-gray-400 transition-colors duration-300 hover:text-primary-700'>
                                <FontAwesomeIcon icon={faFacebook} className='h-5 w-5' />
                            </a>
                            <a href="#" aria-label='Instagram' className='text-gray-400 transition-colors duration-300 hover:text-primary-700'>
                                <FontAwesomeIcon icon={faInstagram} className='h-5 w-5' />
                            </a>
                            <a href="#" aria-label='Twitter' className='text-gray-400 transition-colors duration-300 hover:text-primary-700'>
                                <FontAwesomeIcon icon={faTwitter} className='h-5 w-5' />
                            </a>
                            <a href="#" aria-label='LinkedIn' className='text-gray-400 transition-colors duration-300 hover:text-primary-700'>
                                <FontAwesomeIcon icon={faLinkedin} className='h-5 w-5' />
                            </a>
                            <a href="#" aria-label='Youtube' className='text-gray-400 transition-colors duration-300 hover:text-primary-700'>
                                <FontAwesomeIcon icon={faYoutube} className='h-5 w-5' />
                            </a>
                        </div>
                    </div>

                    {/* Link sections */}
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-8 lg:col-span-3">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Company</h4>
                            <ul className='space-y-3 text-sm'>
                                <li>
                                    <Link href='/about' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">About Us</Link>
                                </li>
                                <li>
                                    <Link href='/contact' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">Contact Us</Link>
                                </li>
                                <li>
                                    <Link href='/faq' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">FAQ</Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Legal</h4>
                            <ul className='space-y-3 text-sm'>
                                <li>
                                    <Link href='/terms' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">Terms of Service</Link>
                                </li>
                                <li>
                                    <Link href='/privacy' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">Privacy Policy</Link>
                                </li>
                                <li>
                                    <Link href='/cookies' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">Cookie Policy</Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Get Started</h4>
                            <ul className='space-y-3 text-sm'>
                                <li>
                                    <Link href='/search' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">Search Properties</Link>
                                </li>
                                <li>
                                    <Link href='/signup' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">Sign Up</Link>
                                </li>
                                <li>
                                    <Link href='/signin' className="text-gray-500 transition-colors duration-300 hover:text-primary-700">Sign In</Link>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>

                <div className="pt-8 text-center text-sm text-gray-500">
                    Copyright {new Date().getFullYear()} RENTIFUL. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default FooterSection