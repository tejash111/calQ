"use client";

import { motion } from "framer-motion";
import PhoneScreenDashboard from "./PhoneScreenDashboard";
import PhoneScreenProgress from "./PhoneScreenProgress";

export default function FinalCTA() {
  return (
    <section className="pt-32 md:pt-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-[#F4F5F7] rounded-[40px] px-8 py-10 md:px-12 md:py-16 lg:px-16 lg:py-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative"
        >
          {/* Left Text Content */}
          <div className="w-full lg:w-[55%] z-10 relative">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#202A36] tracking-tight mb-6 leading-[1.1]">
              Your best self<br className="hidden md:block" /> starts today.
            </h2>
            <p className="text-base md:text-lg text-gray-500 max-w-md mb-10 leading-relaxed">
              Join thousands of people who track smarter and train better with calQ. It's free to get started.
            </p>

            {/* App Store Badges */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            </div>
          </div>

          {/* Right Images Content */}
          <div className="w-full lg:w-[45%] h-[350px] lg:h-[400px] relative mt-12 lg:mt-0">
            {/* Image 1 (Dashboard) */}
            <motion.div 
              initial={{ opacity: 0, x: 50, rotate: 0 }}
              whileInView={{ opacity: 1, x: 0, rotate: -4 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="absolute right-0 top-[-60px] lg:top-[-80px] w-[220px] md:w-[260px] h-[400px] lg:h-[480px] bg-white rounded-[28px] overflow-hidden shadow-2xl border-4 border-white pointer-events-none origin-bottom-right z-20"
            >
              <div className="scale-[0.7] origin-top-left w-[143%] h-[143%]">
                <PhoneScreenDashboard />
              </div>
            </motion.div>

            {/* Image 2 (Progress) */}
            <motion.div 
              initial={{ opacity: 0, x: 50, rotate: 0 }}
              whileInView={{ opacity: 1, x: 0, rotate: 6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
              className="absolute right-[30px] md:right-[80px] top-[60px] lg:top-[80px] w-[220px] md:w-[260px] h-[400px] lg:h-[480px] bg-white rounded-[28px] overflow-hidden shadow-2xl border-4 border-white pointer-events-none origin-top-left z-10"
            >
              <div className="scale-[0.7] origin-top-left w-[143%] h-[143%]">
                <PhoneScreenProgress staticMode={true} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full mt-24 md:mt-32 overflow-hidden flex justify-center items-end pointer-events-none select-none">
        <h1 className="text-[25vw] md:text-[28vw] font-black text-[#F8F9FA] leading-none tracking-tighter text-center mb-[-4vw] md:mb-[-5vw]">
          calQ
        </h1>
      </div>
    </section>
  );
}
