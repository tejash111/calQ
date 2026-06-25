"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="flex flex-col justify-center h-full max-w-xl">
      {/* Small label removed */}

      {/* Main heading */}
      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-6xl md:text-7xl lg:text-8xl font-normal text-[#202A36] leading-[0.9] tracking-tight"
        >
          Track Smarter.
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-6xl md:text-7xl lg:text-8xl font-normal text-[#202A36] leading-[0.9] tracking-tight -mt-1 md:-mt-2 lg:-mt-3"
        >
          Train Better.
        </motion.h1>
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-base md:text-lg text-gray-500 max-w-md mb-8 leading-relaxed"
      >
        Everything you need to track calories,
        protein, workouts and your progress
        inside one beautifully simple app.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="flex items-center gap-4"
      >
        <a href="#" className="bg-[#111111] hover:bg-black transition-colors rounded-[14px] flex items-center px-4 py-2.5 gap-3 h-[54px] min-w-[160px]">
          <img src="/apple.svg" alt="Apple" className="h-[26px] w-auto" />
          <div className="flex flex-col items-start justify-center">
            <span className="text-[11px] text-gray-300 font-medium leading-none">Get it for</span>
            <span className="text-[20px] font-semibold text-white leading-none mt-1">Apple</span>
          </div>
        </a>
        <a href="https://github.com/tejash111/calQ/releases/download/calQ-v1.0/calQ" className="bg-[#111111] hover:bg-black transition-colors rounded-[14px] flex items-center px-4 py-2.5 gap-3 h-[54px] min-w-[160px]">
          <img src="/android.svg" alt="Android" className="h-[26px] w-auto" />
          <div className="flex flex-col items-start justify-center">
            <span className="text-[11px] text-gray-300 font-medium leading-none">Get it for</span>
            <span className="text-[20px] font-semibold text-white leading-none mt-1">Android</span>
          </div>
        </a>
      </motion.div>
    </div>
  );
}
