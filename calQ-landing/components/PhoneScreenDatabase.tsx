"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneScreenDashboard from "./PhoneScreenDashboard";
import { ArrowLeft, Search, Plus, X, Minus, ChevronRight } from "lucide-react";

export default function PhoneScreenDatabase() {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  
  const fullText = "egg";

  useEffect(() => {
    const sequence = [
      1500, // 0: Dashboard (Pause before click plus)
      1500, // 1: Action Modal opens
      1000, // 2: Database screen opens (empty)
      1000, // 3: Typing "egg"
      1500, // 4: Results show
      2500, // 5: Food details (pause before clicking log)
      500,  // 6: Click Log Food
      3000, // 7: Back to dashboard with updated data
    ];

    let timer: NodeJS.Timeout;

    if (step === 3) {
      // Typewriter effect
      let charIndex = 0;
      setTypedText("");
      const typingInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          setTypedText(fullText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          timer = setTimeout(() => setStep(4), 500);
        }
      }, 150);

      return () => {
        clearInterval(typingInterval);
        clearTimeout(timer);
      };
    } else if (step === 7) {
      // Restart the animation after pausing on the updated dashboard
      timer = setTimeout(() => setStep(0), sequence[step]);
      return () => clearTimeout(timer);
    } else if (step < 7) {
      timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, sequence[step]);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Reset typed text when cycling back
  useEffect(() => {
    if (step <= 2) setTypedText("");
  }, [step]);

  const showModal = step >= 1 && step < 2;
  const showDatabase = step >= 2 && step < 7;
  const showDetail = step >= 5 && step < 7;
  const isDashboardUpdated = step >= 7;

  const loggedEgg = {
    name: "Egg",
    time: "08:30 AM",
    kcal: 78,
  };

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
        animate={{ scale: showDatabase ? 0.95 : 1, opacity: showDatabase ? 0.4 : 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 bg-[#F8F9FA] flex flex-col pointer-events-none"
      >
        <PhoneScreenDashboard loggedFood={isDashboardUpdated ? loggedEgg : null} />
        
        {/* Simulate tap on Plus button */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 1, duration: 0.3 }}
            className="absolute bottom-[20px] left-[50%] -translate-x-1/2 w-14 h-14 bg-black/20 rounded-full"
          />
        )}
      </motion.div>

      {/* ACTION MODAL (Step 1) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 flex flex-col items-center justify-end pb-[110px]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="px-5 w-full"
            >
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="h-[110px] bg-[#F0F0F0] rounded-[24px] p-4 flex flex-col items-center justify-center gap-3">
                  <img src="/assets/dash/dumbell.svg" className="w-[32px] h-[32px]" alt="Log exercise" />
                  <span className="text-[15px] font-semibold text-black">Log exercise</span>
                </div>
                <div className="h-[110px] bg-[#F0F0F0] rounded-[24px] p-4 flex flex-col items-center justify-center gap-3">
                  <img src="/assets/dash/describe.svg" className="w-[32px] h-[32px]" alt="Describe to AI" />
                  <span className="text-[15px] font-semibold text-black">Describe to AI</span>
                </div>
                <div className="h-[110px] bg-[#F0F0F0] rounded-[24px] p-4 flex flex-col items-center justify-center gap-3 relative">
                  <img src="/assets/dash/fooddb.svg" className="w-[32px] h-[32px]" alt="Food Database" />
                  <span className="text-[15px] font-semibold text-black">Food Database</span>
                  
                  {/* Simulate click on Food database */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ delay: 1, duration: 0.3 }}
                    className="absolute inset-0 bg-black/10 rounded-[24px]"
                  />
                </div>
                <div className="h-[110px] bg-[#F0F0F0] rounded-[24px] p-4 flex flex-col items-center justify-center gap-3">
                  <img src="/assets/dash/scan.svg" className="w-[32px] h-[32px]" alt="Scan food" />
                  <span className="text-[15px] font-semibold text-black">Scan food</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DATABASE SCREEN (Step 2, 3, 4) */}
      <AnimatePresence>
        {showDatabase && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: showDetail ? "-20%" : 0, opacity: showDetail ? 0.4 : 1, scale: showDetail ? 0.95 : 1 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 z-50 bg-[#F8F9FA] flex flex-col"
          >
            <div className="pt-14 px-5 pb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-5">
                <ArrowLeft size={24} color="#000" />
              </div>
              
              <div className="flex bg-[#E5E7EB] rounded-[20px] p-1 mb-5">
                <div className="flex-1 py-2.5 bg-white rounded-[16px] flex items-center justify-center shadow-sm">
                  <span className="text-[15px] font-[700] text-[#111]">Search</span>
                </div>
                <div className="flex-1 py-2.5 flex items-center justify-center">
                  <span className="text-[15px] font-[600] text-[#6B7280]">My Meals</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-[#F0F0F0] rounded-[20px] px-4 py-3 flex items-center gap-3">
                <Search size={20} color="#9CA3AF" />
                <span className={`text-[16px] font-[500] ${typedText ? "text-[#111]" : "text-[#9CA3AF]"}`}>
                  {typedText || "Search for a food..."}
                  {step === 3 && <span className="animate-pulse">|</span>}
                </span>
              </div>
            </div>

            <div className="flex-1 px-5 overflow-hidden">
              {step <= 3 && typedText.length < 3 && (
                <div className="flex flex-col items-center justify-center pt-20">
                  <span className="text-4xl mb-4">🔍</span>
                  <span className="text-[15px] text-[#6B7280] font-medium">Type at least 3 characters to search</span>
                </div>
              )}

              {step >= 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 relative">
                  {/* Result 1 (Clicked) */}
                  <div className="bg-white rounded-[20px] p-4 border border-gray-100 flex items-center justify-between relative overflow-hidden">
                    <div>
                      <h3 className="text-[17px] font-[700] text-[#111] mb-1">Egg</h3>
                      <div className="flex items-center text-[14px] text-[#6B7280] font-[500]">
                        <span>1 large</span>
                        <span className="mx-1.5 text-gray-300">•</span>
                        <span>78 kcal</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-[12px] bg-[#F8F9FA] flex items-center justify-center">
                      <Plus size={20} className="text-[#111]" />
                    </div>
                    {/* Simulate click on Egg */}
                    {step === 4 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ delay: 1, duration: 0.3 }}
                        className="absolute inset-0 bg-black/10"
                      />
                    )}
                  </div>

                  {/* Result 2 */}
                  <div className="bg-white rounded-[20px] p-4 border border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-[17px] font-[700] text-[#111] mb-1">Fried Egg</h3>
                      <div className="flex items-center text-[14px] text-[#6B7280] font-[500]">
                        <span>1 large</span>
                        <span className="mx-1.5 text-gray-300">•</span>
                        <span>90 kcal</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-[12px] bg-[#F8F9FA] flex items-center justify-center">
                      <Plus size={20} className="text-[#111]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOD DETAIL SCREEN (Step 5) */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 z-[60] bg-[#F8F9FA] flex flex-col"
          >
            <div className="pt-14 px-5 pb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ArrowLeft size={24} color="#111" strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar">
              
              <div className="flex items-end justify-between mb-8 mt-2">
                <div>
                  <h1 className="text-[28px] font-[800] text-[#111] leading-tight tracking-[-0.5px]">Egg</h1>
                  <span className="text-[16px] text-[#6B7280] font-[600]">1 large</span>
                </div>
                
                <div className="flex items-center bg-[#EEEEEE] rounded-full p-1.5">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Minus size={18} className="text-[#111]" strokeWidth={2.5} />
                  </div>
                  <span className="w-10 text-center text-[18px] font-[700] text-[#111]">1</span>
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Plus size={18} className="text-[#111]" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Macros Grid */}
              <div className="flex flex-wrap justify-between gap-y-3 mb-8">
                <div className="w-[48%] flex items-center bg-[#EEEEEE] rounded-[20px] p-3">
                  <div className="w-10 h-10 rounded-[12px] bg-white flex justify-center items-center mr-3 shadow-sm">
                    <img src="/assets/onboarding/burnfat.svg" className="w-5 h-5" alt="Calories" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#6B7280] font-[600]">Calories</p>
                    <p className="text-[18px] font-[800] text-[#111]">78</p>
                  </div>
                </div>
                <div className="w-[48%] flex items-center bg-[#EEEEEE] rounded-[20px] p-3">
                  <div className="w-10 h-10 rounded-[12px] bg-white flex justify-center items-center mr-3 shadow-sm">
                    <img src="/assets/onboarding/bread.svg" className="w-5 h-5" alt="Carbs" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#6B7280] font-[600]">Carbs</p>
                    <p className="text-[18px] font-[800] text-[#111]">0.6g</p>
                  </div>
                </div>
                <div className="w-[48%] flex items-center bg-[#EEEEEE] rounded-[20px] p-3">
                  <div className="w-10 h-10 rounded-[12px] bg-white flex justify-center items-center mr-3 shadow-sm">
                    <img src="/assets/onboarding/chicken.svg" className="w-5 h-5" alt="Protein" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#6B7280] font-[600]">Protein</p>
                    <p className="text-[18px] font-[800] text-[#111]">6.3g</p>
                  </div>
                </div>
                <div className="w-[48%] flex items-center bg-[#EEEEEE] rounded-[20px] p-3">
                  <div className="w-10 h-10 rounded-[12px] bg-white flex justify-center items-center mr-3 shadow-sm">
                    <img src="/assets/onboarding/fats.svg" className="w-5 h-5" alt="Fats" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#6B7280] font-[600]">Fats</p>
                    <p className="text-[18px] font-[800] text-[#111]">5.3g</p>
                  </div>
                </div>
              </div>

              {/* Micronutrients */}
              <div>
                <h2 className="text-[20px] font-[800] text-[#111] mb-4">Micronutrients</h2>
                <div className="bg-[#EEEEEE] rounded-[20px] px-5 py-2">
                  <div className="flex justify-between py-3 border-b border-gray-200/50">
                    <span className="text-[15px] font-[600] text-[#6B7280]">Fiber</span>
                    <span className="text-[15px] font-[700] text-[#111]">0g</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200/50">
                    <span className="text-[15px] font-[600] text-[#6B7280]">Sugar</span>
                    <span className="text-[15px] font-[700] text-[#111]">0.6g</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-[15px] font-[600] text-[#6B7280]">Sodium</span>
                    <span className="text-[15px] font-[700] text-[#111]">71mg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md pt-4 pb-8 px-5 border-t border-gray-100 flex justify-between items-center z-[70]">
              <div className="flex items-center gap-2 bg-[#F8F9FA] px-4 py-3 rounded-[16px]">
                <span className="text-[15px] font-[700] text-[#111]">Breakfast</span>
                <ChevronRight size={18} className="text-[#6B7280]" />
              </div>
              <div className="relative bg-[#1C1C1E] px-8 py-3 rounded-[100px] shadow-lg shadow-black/10 overflow-hidden">
                <span className="text-[15px] font-[700] text-white">Log Food</span>
                {/* Simulate click on Log Food */}
                {step === 6 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white"
                  />
                )}
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
