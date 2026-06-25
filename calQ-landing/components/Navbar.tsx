"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Story", href: "#story" },
  { label: "Pricing", href: "#pricing" },
  { label: "Benefits", href: "#benefits" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="text-2xl font-semibold text-[#202A36] tracking-tight">
          calQ
        </a>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-gray-900 hover:text-gray-700 transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          
          {/* App Badges */}
          <div className="flex items-center gap-3">
            <a href="#" className="bg-[#111111] hover:bg-black transition-colors rounded-[12px] flex items-center px-3 py-2 gap-2.5 h-[44px] min-w-[140px]">
              <img src="/apple.svg" alt="Apple" className="h-[20px] w-auto" />
              <div className="flex flex-col items-start justify-center">
                <span className="text-[9px] text-gray-300 font-medium leading-none">Get it for</span>
                <span className="text-[16px] font-semibold text-white leading-none mt-1">Apple</span>
              </div>
            </a>
            <a href="https://github.com/tejash111/calQ/releases/download/calQ-v1.0/calQ" className="bg-[#111111] hover:bg-black transition-colors rounded-[12px] flex items-center px-3 py-2 gap-2.5 h-[44px] min-w-[140px]">
              <img src="/android.svg" alt="Android" className="h-[20px] w-auto" />
              <div className="flex flex-col items-start justify-center">
                <span className="text-[9px] text-gray-300 font-medium leading-none">Get it for</span>
                <span className="text-[16px] font-semibold text-white leading-none mt-1">Android</span>
              </div>
            </a>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl rounded-b-2xl shadow-lg border-b border-[#E5E7EB]"
          >
            <ul className="flex flex-col py-4 px-8">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block py-3 text-gray-900 hover:text-gray-700 transition-colors text-base font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="py-4 mt-2 flex items-center justify-start gap-3 border-t border-gray-100">
                <a href="#" className="bg-[#111111] hover:bg-black transition-colors rounded-[12px] flex items-center px-3 py-2 gap-2.5 h-[44px] min-w-[140px]">
                  <img src="/apple.svg" alt="Apple" className="h-[20px] w-auto" />
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[9px] text-gray-300 font-medium leading-none">Get it for</span>
                    <span className="text-[16px] font-semibold text-white leading-none mt-1">Apple</span>
                  </div>
                </a>
                <a href="https://github.com/tejash111/calQ/releases/download/calQ-v1.0/calQ" className="bg-[#111111] hover:bg-black transition-colors rounded-[12px] flex items-center px-3 py-2 gap-2.5 h-[44px] min-w-[140px]">
                  <img src="/android.svg" alt="Android" className="h-[20px] w-auto" />
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[9px] text-gray-300 font-medium leading-none">Get it for</span>
                    <span className="text-[16px] font-semibold text-white leading-none mt-1">Android</span>
                  </div>
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
