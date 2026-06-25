"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneScreenDashboard from "./PhoneScreenDashboard";
import { Plus } from "lucide-react";

export default function PhoneScreenProgress({ staticMode = false }: { staticMode?: boolean }) {
  const [step, setStep] = useState(staticMode ? 1 : 0);

  useEffect(() => {
    if (staticMode) return;
    // Only animate once: Dashboard (0) -> Progress (1)
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, staticMode]);

  const showProgress = step === 1;

  const streakData = [
    { day: 'S', active: true },
    { day: 'M', active: true },
    { day: 'T', active: true },
    { day: 'W', active: true },
    { day: 'T', active: false },
    { day: 'F', active: false },
    { day: 'S', active: false },
  ];

  const caloriesData = [1850, 2100, 1950, 2050, 0, 0, 0];
  const maxCal = Math.max(...caloriesData, 2500);

  const proteinData = [140, 160, 150, 145, 0, 0, 0];
  const maxPro = Math.max(...proteinData, 200);

  return (
    <div className="relative h-full w-full bg-[#F8F9FA] overflow-hidden rounded-[2.5rem] flex flex-col font-sans">
      
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-end justify-between px-6 pb-2 z-[100] pointer-events-none">
        <span className="text-[12px] font-semibold text-black tracking-wider">9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="15" height="10" viewBox="0 0 15 10" fill="none" className="text-black">
            <rect x="0.5" y="0.5" width="14" height="9" rx="2.5" stroke="currentColor"/>
            <rect x="2" y="2" width="11" height="6" rx="1" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* BASE DASHBOARD */}
      <motion.div 
        animate={{ scale: showProgress ? 0.95 : 1, opacity: showProgress ? 0.4 : 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 bg-[#F8F9FA] flex flex-col pointer-events-none"
      >
        <PhoneScreenDashboard />
        
        {/* Simulate tap on Progress tab (2nd from left -> roughly left-[35%]) */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 1, duration: 0.3 }}
            className="absolute bottom-[20px] left-[32%] w-12 h-12 bg-black/10 rounded-full"
          />
        )}
      </motion.div>

      {/* PROGRESS SCREEN */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 z-50 bg-[#FFFFFF] flex flex-col"
          >
            <div className="flex-1 overflow-y-auto px-5 pt-[60px] pb-[110px] no-scrollbar">
              <h1 className="text-[28px] font-[800] text-[#000] mb-6 tracking-[-0.5px]">Progress</h1>
              
              <div className="flex gap-3 mb-6">
                {/* Streak Card */}
                <div className="flex-1 bg-[#F0F0F0] rounded-[24px] p-3 flex flex-col">
                  <img src="/assets/onboarding/burnfat.svg" className="w-7 h-7 mb-3" alt="Streak" />
                  <span className="text-[16px] font-[700] text-[#111] mb-4">Day Streak</span>
                  <div className="flex justify-between mt-auto">
                    {streakData.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${d.active ? 'bg-[#A3E635]' : 'bg-[#E5E7EB]'}`}>
                          {d.active && <span className="text-[11px] font-[800] text-[#000]">✓</span>}
                        </div>
                        <span className="text-[12px] text-[#6B7280] font-[600]">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weight Card */}
                <div className="flex-1 bg-[#F0F0F0] rounded-[24px] p-4 flex flex-col justify-between">
                  <span className="text-[16px] font-[700] text-[#111]">My Weight</span>
                  <div className="mt-4">
                    <span className="text-[32px] font-[800] text-[#111]">80.0</span>
                    <span className="text-[15px] text-[#6B7280] font-[600] ml-1">kg</span>
                  </div>
                </div>
              </div>

              {/* Calories Chart */}
              <div className="bg-[#F0F0F0] rounded-[24px] p-4 mb-8">
                <div className="flex items-center mb-6">
                  <img src="/assets/onboarding/burnfat.svg" className="w-6 h-6 mr-2" alt="Calories" />
                  <span className="text-[18px] font-[700] text-[#111]">Calories Consumed</span>
                </div>
                
                <div className="h-[160px] flex items-end justify-between px-1">
                  {caloriesData.map((val, i) => {
                    const heightPercent = val === 0 ? 5 : (val / maxCal) * 100;
                    return (
                      <div key={i} className="flex flex-col items-center w-[12%] h-full justify-end">
                        <span className="text-[10px] font-bold text-[#6B7280] mb-1">{val > 0 ? val : ''}</span>
                        <div className="w-full bg-[#A3E635] rounded-[4px] min-h-[4px]" style={{ height: `${heightPercent}%` }}></div>
                        <span className="text-[12px] font-[600] text-[#6B7280] mt-2">{streakData[i].day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Macros Breakdown */}
              <h2 className="text-[20px] font-[700] text-[#111] mb-4">Macro Breakdown</h2>
              
              <div className="flex gap-4 overflow-x-visible">
                {/* Protein Chart */}
                <div className="w-[85%] shrink-0 bg-[#F0F0F0] rounded-[24px] p-4">
                  <div className="flex items-center mb-6">
                    <img src="/assets/onboarding/chicken.svg" className="w-6 h-6 mr-2" alt="Protein" />
                    <span className="text-[16px] font-[700] text-[#111]">Protein (g)</span>
                  </div>
                  <div className="h-[120px] flex items-end justify-between px-1">
                    {proteinData.map((val, i) => {
                      const heightPercent = val === 0 ? 5 : (val / maxPro) * 100;
                      return (
                        <div key={i} className="flex flex-col items-center w-[12%] h-full justify-end">
                          <span className="text-[10px] font-bold text-[#6B7280] mb-1">{val > 0 ? val : ''}</span>
                          <div className="w-full bg-[#EF4444] rounded-[4px] min-h-[4px]" style={{ height: `${heightPercent}%` }}></div>
                          <span className="text-[12px] font-[600] text-[#6B7280] mt-2">{streakData[i].day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Carbs Chart Placeholder (Partially visible) */}
                <div className="w-[85%] shrink-0 bg-[#F0F0F0] rounded-[24px] p-4">
                  <div className="flex items-center mb-6">
                    <img src="/assets/onboarding/bread.svg" className="w-6 h-6 mr-2" alt="Carbs" />
                    <span className="text-[16px] font-[700] text-[#111]">Carbs (g)</span>
                  </div>
                  <div className="h-[120px] flex items-end justify-between px-1">
                    {proteinData.map((val, i) => (
                      <div key={i} className="flex flex-col items-center w-[12%] h-full justify-end">
                        <div className="w-full bg-[#F59E0B] rounded-[4px] min-h-[4px]" style={{ height: `${(val / maxPro) * 100 || 5}%` }}></div>
                        <span className="text-[12px] font-[600] text-[#6B7280] mt-2">{streakData[i].day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Active Tab Bar (Progress Tab Active) */}
            <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-center pointer-events-auto">
              <div className="w-full flex items-center bg-white/75 backdrop-blur-md rounded-[30px] px-3 py-2 border border-white/90 shadow-2xl relative">
                
                {/* Home Tab */}
                <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <img src="/assets/dash/home.svg" className="w-[24px] h-[24px] opacity-40" alt="Home" />
                  <span className="text-[11px] text-gray-400 font-semibold">Home</span>
                </button>

                {/* Progress Tab (ACTIVE) */}
                <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <img src="/assets/dash/progress.svg" className="w-[24px] h-[24px] opacity-100" alt="Progress" />
                  <span className="text-[11px] text-black font-extrabold">Progress</span>
                </button>

                {/* Plus button spacing spacer */}
                <div className="w-[60px]" />

                {/* Profile Tab */}
                <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <img src="/assets/dash/profile.svg" className="w-[24px] h-[24px] opacity-40" alt="Profile" />
                  <span className="text-[11px] text-gray-400 font-semibold">Profile</span>
                </button>

                {/* AI Tab */}
                <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <img src="/assets/dash/describe.svg" className="w-[24px] h-[24px] opacity-40" alt="AI" />
                  <span className="text-[11px] text-gray-400 font-semibold">AI</span>
                </button>

                {/* Floating Plus Action Button */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[calc(50%+16px)]">
                  <button className="w-[52px] h-[52px] rounded-full bg-[#A3E635] flex items-center justify-center shadow-lg shadow-[#A3E635]/40 active:scale-95 transition-all">
                    <Plus size={28} className="text-black stroke-[3.5]" />
                  </button>
                </div>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
