"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, ArrowUp, X
} from "lucide-react";
import dynamic from "next/dynamic";
import PhoneScreenDashboard from "./PhoneScreenDashboard";
import aiAnimation from "../public/assets/ai.json";

// Dynamic import for Lottie to prevent SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function PhoneScreenMeals() {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  
  const fullText = "today i ate 50 gm oats and 200 ml milk 1 banana and one scoop whey protein";

  useEffect(() => {
    const sequence = [
      1500, // 0: Dashboard (Pause before click)
      1000, // 1: AI Chat slides in (Empty state)
      3000, // 2: Typing prompt
      2000, // 3: Prompt sent (Loading skeleton)
      4000, // 4: Response shows
    ];

    let timer: NodeJS.Timeout;

    if (step === 2) {
      // Typewriter effect
      let charIndex = 0;
      setTypedText("");
      const typingInterval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setTypedText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          timer = setTimeout(() => setStep(3), 500);
        }
      }, 3000 / fullText.length); // complete in ~3 seconds

      return () => {
        clearInterval(typingInterval);
        clearTimeout(timer);
      };
    } else {
      timer = setTimeout(() => {
        setStep((prev) => (prev + 1) % 5);
      }, sequence[step]);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Reset typed text when cycling back
  useEffect(() => {
    if (step === 0 || step === 1) setTypedText("");
  }, [step]);

  const showAI = step >= 1;

  return (
    <div className="relative h-full w-full bg-white overflow-hidden rounded-[2.5rem] flex flex-col font-sans">
      
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

      {/* 
        =========================================
        BASE DASHBOARD (Visible in Step 0)
        =========================================
      */}
      <motion.div 
        animate={{ scale: showAI ? 0.95 : 1, opacity: showAI ? 0.4 : 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 bg-[#F8F9FA] flex flex-col pointer-events-none"
      >
        <PhoneScreenDashboard />
        
        {/* Simulate click on the AI button in the tab bar if step === 0 */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 1, duration: 0.3 }}
            className="absolute bottom-[20px] right-[40px] w-12 h-12 bg-black/10 rounded-full"
          />
        )}
      </motion.div>

      {/* 
        =========================================
        AI CHAT SCREEN (Visible in Steps 1-4)
        =========================================
      */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 z-50 bg-[#F8F9FA] flex flex-col"
          >
            {/* Header Removed as requested */}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 relative">
              
              {/* Empty State (Visible in Steps 1, 2) */}
              <AnimatePresence>
                {step <= 2 && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center px-6 pt-12"
                  >
                    <div className="w-[160px] h-[160px] mb-2 flex items-center justify-center">
                      <Lottie animationData={aiAnimation} loop={true} className="w-full h-full" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['I had 2 eggs and toast', 'A bowl of oatmeal with banana', 'Chicken breast with rice'].map((ex) => (
                        <div key={ex} className="bg-[#EEEEEE] rounded-[20px] px-4 py-2.5">
                          <span className="text-[13px] text-[#374151] font-medium">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Messages (Visible in Steps 3, 4) */}
              {step >= 3 && (
                <div className="flex flex-col justify-end min-h-full pb-4">
                  
                  {/* User Message */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10, originX: 1, originY: 1 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex justify-end mb-5"
                  >
                    <div className="bg-[#1C1C1E] rounded-[20px] rounded-br-[6px] px-4 py-3 max-w-[80%] shadow-sm">
                      <p className="text-white text-[15px] font-medium leading-[22px]">
                        {fullText}
                      </p>
                    </div>
                  </motion.div>

                  {/* Assistant Loading Skeleton (Visible in Step 3) */}
                  {step === 3 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start mb-4"
                    >
                      <div className="w-[32px] h-[32px] mr-2 mt-0.5 flex items-center justify-center overflow-hidden">
                        <Lottie animationData={aiAnimation} loop={true} className="w-full h-full" />
                      </div>
                      <div className="flex-1 max-w-[90%] px-1 pt-2">
                        <div className="h-[14px] bg-[#E5E7EB] rounded-[8px] mb-2.5 w-[70%] animate-[pulse_1.5s_ease-in-out_infinite]" />
                        <div className="h-[14px] bg-[#E5E7EB] rounded-[8px] mb-[10px] w-[90%] animate-[pulse_1.5s_ease-in-out_infinite]" />
                        <div className="flex flex-wrap justify-between mt-2">
                          <div className="w-[48%] h-[54px] bg-[#E5E7EB] rounded-[16px] mb-2 animate-[pulse_1.5s_ease-in-out_infinite]" />
                          <div className="w-[48%] h-[54px] bg-[#E5E7EB] rounded-[16px] mb-2 animate-[pulse_1.5s_ease-in-out_infinite]" />
                          <div className="w-[48%] h-[54px] bg-[#E5E7EB] rounded-[16px] mb-2 animate-[pulse_1.5s_ease-in-out_infinite]" />
                          <div className="w-[48%] h-[54px] bg-[#E5E7EB] rounded-[16px] mb-2 animate-[pulse_1.5s_ease-in-out_infinite]" />
                        </div>
                        <div className="h-[14px] bg-[#E5E7EB] rounded-[8px] mt-3 w-[50%] animate-[pulse_1.5s_ease-in-out_infinite]" />
                      </div>
                    </motion.div>
                  )}

                  {/* Assistant Response (Visible in Step 4) */}
                  {step === 4 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start mb-4"
                    >
                      <div className="w-[32px] h-[32px] mr-2 mt-0.5 flex items-center justify-center shrink-0">
                        <Lottie animationData={aiAnimation} loop={true} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] text-[#374151] leading-[22px] font-medium mb-3">
                          Here's what I found:
                        </p>
                        
                        {/* Food Cards List */}
                        <div className="mb-3 space-y-2">
                          {[
                            { name: 'Oats (50g)', cal: 190, c: 34, p: 6, f: 3 },
                            { name: 'Milk (200ml)', cal: 100, c: 10, p: 7, f: 4 },
                            { name: 'Banana (1)', cal: 105, c: 27, p: 1, f: 0 },
                            { name: 'Whey Protein (1 scoop)', cal: 120, c: 3, p: 25, f: 1 }
                          ].map(item => (
                            <div key={item.name} className="bg-white rounded-[16px] p-3 border border-gray-100 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-[#111] text-[14px]">{item.name}</span>
                                <X size={14} className="text-gray-400" />
                              </div>
                              <div className="flex justify-between">
                                <div className="flex items-center gap-1.5 bg-[#FAFAFA] rounded-xl px-2 py-1.5 w-[23%]">
                                  <img src="/assets/onboarding/burnfat.svg" className="w-4 h-4 opacity-70" alt="cal" />
                                  <span className="text-[12px] font-bold text-[#111]">{item.cal}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#FAFAFA] rounded-xl px-2 py-1.5 w-[23%]">
                                  <img src="/assets/onboarding/bread.svg" className="w-4 h-4 opacity-70" alt="carbs" />
                                  <span className="text-[12px] font-bold text-[#111]">{item.c}g</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#FAFAFA] rounded-xl px-2 py-1.5 w-[23%]">
                                  <img src="/assets/onboarding/chicken.svg" className="w-4 h-4 opacity-70" alt="protein" />
                                  <span className="text-[12px] font-bold text-[#111]">{item.p}g</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#FAFAFA] rounded-xl px-2 py-1.5 w-[23%]">
                                  <img src="/assets/onboarding/fats.svg" className="w-4 h-4 opacity-70" alt="fat" />
                                  <span className="text-[12px] font-bold text-[#111]">{item.f}g</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Combined Totals Card */}
                        <div className="bg-[#EEEEEE] rounded-[20px] p-4 mb-3">
                          <div className="mb-3.5">
                            <h3 className="text-[20px] font-extrabold text-[#111] tracking-[-0.3px]">Combined Totals</h3>
                          </div>
                          <div className="flex flex-wrap justify-between mb-3.5 gap-y-2">
                            <div className="w-[48%] flex items-center bg-[#F8F9FA] rounded-[16px] p-2.5">
                              <div className="w-[38px] h-[38px] rounded-[12px] bg-white flex justify-center items-center mr-2.5 shadow-sm">
                                <img src="/assets/onboarding/burnfat.svg" className="w-5 h-5" alt="Calories" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[12px] text-gray-500 font-medium leading-none">Calories</p>
                                <p className="text-[16px] font-extrabold text-[#111] mt-0.5">515</p>
                              </div>
                            </div>
                            <div className="w-[48%] flex items-center bg-[#F8F9FA] rounded-[16px] p-2.5">
                              <div className="w-[38px] h-[38px] rounded-[12px] bg-white flex justify-center items-center mr-2.5 shadow-sm">
                                <img src="/assets/onboarding/bread.svg" className="w-5 h-5" alt="Carbs" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[12px] text-gray-500 font-medium leading-none">Carbs</p>
                                <p className="text-[16px] font-extrabold text-[#111] mt-0.5">74g</p>
                              </div>
                            </div>
                            <div className="w-[48%] flex items-center bg-[#F8F9FA] rounded-[16px] p-2.5">
                              <div className="w-[38px] h-[38px] rounded-[12px] bg-white flex justify-center items-center mr-2.5 shadow-sm">
                                <img src="/assets/onboarding/chicken.svg" className="w-5 h-5" alt="Protein" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[12px] text-gray-500 font-medium leading-none">Protein</p>
                                <p className="text-[16px] font-extrabold text-[#111] mt-0.5">39g</p>
                              </div>
                            </div>
                            <div className="w-[48%] flex items-center bg-[#F8F9FA] rounded-[16px] p-2.5">
                              <div className="w-[38px] h-[38px] rounded-[12px] bg-white flex justify-center items-center mr-2.5 shadow-sm">
                                <img src="/assets/onboarding/fats.svg" className="w-5 h-5" alt="Fat" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[12px] text-gray-500 font-medium leading-none">Fats</p>
                                <p className="text-[16px] font-extrabold text-[#111] mt-0.5">8g</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="bg-[#F8F9FA] rounded-[12px] px-3.5 py-2.5">
                              <span className="text-[14px] font-bold text-[#111]">Breakfast</span>
                            </div>
                            <div className="bg-[#1C1C1E] rounded-[100px] px-6 py-3">
                              <span className="text-[14px] font-bold text-white">Log Food</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="px-4 pb-[110px] pt-2 bg-[#F8F9FA] relative z-20">
              <div className="flex items-end bg-[#EEEEEE] rounded-[24px] px-1.5 py-1.5">
                <div className="w-9 h-9 rounded-full bg-[#DCDCDC] flex items-center justify-center shrink-0">
                  <Plus size={20} className="text-[#6B7280]" strokeWidth={2} />
                </div>
                
                <div className="flex-1 min-h-[36px] flex items-center px-3">
                  <span className={`text-[15px] font-medium leading-[20px] ${typedText ? "text-[#111]" : "text-[#9CA3AF]"}`}>
                    {typedText || "Describe what you ate..."}
                    {step === 2 && <span className="animate-pulse">|</span>}
                  </span>
                </div>
                
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${typedText && step <= 2 ? 'bg-[#1C1C1E]' : 'bg-[#C4C4C4]'}`}>
                  <ArrowUp size={18} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Active Tab Bar */}
            <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-center pointer-events-auto">
              <div className="w-full flex items-center bg-white/75 backdrop-blur-md rounded-[30px] px-3 py-2 border border-white/90 shadow-2xl relative">
                
                {/* Home Tab */}
                <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <img src="/assets/dash/home.svg" className="w-[24px] h-[24px] opacity-40" alt="Home" />
                  <span className="text-[11px] text-gray-400 font-semibold">Home</span>
                </button>

                {/* Progress Tab */}
                <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <img src="/assets/dash/progress.svg" className="w-[24px] h-[24px] opacity-40" alt="Progress" />
                  <span className="text-[11px] text-gray-400 font-semibold">Progress</span>
                </button>

                {/* Plus button spacing spacer */}
                <div className="w-[60px]" />

                {/* Profile Tab */}
                <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <img src="/assets/dash/profile.svg" className="w-[24px] h-[24px] opacity-40" alt="Profile" />
                  <span className="text-[11px] text-gray-400 font-semibold">Profile</span>
                </button>

                {/* AI Tab (ACTIVE) */}
                <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
                  <img src="/assets/dash/describe.svg" className="w-[24px] h-[24px] opacity-100" alt="AI" />
                  <span className="text-[11px] text-black font-extrabold">AI</span>
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
