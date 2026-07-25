import { NAVBAR_HEIGHT } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full h-full py-3 px-4 sm:px-8 bg-primary-700 text-white">
        <div className="flex items-center gap-4 md:gap-5">
          <Link href="/" className="group cursor-pointer" scroll={false}>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Rentful logo"
                width={24}
                height={24}
                className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="text-xl font-bold">
                <span className="text-white transition-colors duration-300 group-hover:text-secondary-500">
                  RENT
                </span>
                <span className="text-secondary-500 font-light transition-colors duration-300 group-hover:text-white">
                  IFUL
                </span>
              </div>
            </div>
          </Link>
        </div>

        <p className="text-primary-200 hidden lg:block">
          Discover your perfect rental apartment with our advanced search
        </p>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/signin">
            <Button
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white hover:text-primary-700 hover:border-white rounded-lg transition-all duration-300 px-3 sm:px-4"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="secondary"
              className="bg-secondary-600 text-white border-secondary-600 hover:bg-transparent hover:text-secondary-600 hover:border-secondary-600 rounded-lg transition-all duration-300 px-3 sm:px-4"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;