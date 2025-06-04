import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { FaGithub, FaSeedling } from "react-icons/fa";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#f5e6d3]/60 backdrop-blur-sm border-b border-[#e6d5c3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Title with Icon */}
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FaSeedling className="text-green-600" />
            Chromion
          </h1>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/gin/2025-chromion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-600"
            >
              <FaGithub size={24} />
            </Link>
            <ConnectButton
              showBalance={false}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
