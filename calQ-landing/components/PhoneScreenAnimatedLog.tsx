"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, Plus, Minus, ArrowLeft,
  Camera as CameraIcon, ZapOff, X, ImageIcon
} from "lucide-react";

// Reusable Circular Progress Ring for Calories and Macros
function CircularProgress({
  progress,
  size,
  strokeWidth,
  color,
  children,
}: {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const boundedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - boundedProgress * circumference;

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} className="absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {children}
    </div>
  );
}

export default function PhoneScreenAnimatedLog() {
  const [step, setStep] = useState(0);

  // Auto-advance sequence
  useEffect(() => {
    const sequence = [
      1500, // 0: Dashboard
      1500, // 1: Modal open
      2000, // 2: Camera open
      2500, // 3: Scan Preview
      3500, // 4: Scan Results (NEW)
      3500, // 5: Dashboard with logged food
    ];

    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % 6);
    }, sequence[step]);

    return () => clearTimeout(timer);
  }, [step]);

  const calories = { remaining: step === 5 ? 1140 : 1540, total: 2000, progress: step === 5 ? 0.43 : 0.23 };
  const macros = [
    { label: "Protein", taken: step === 5 ? 146 : 120, goal: 160, progress: (step === 5 ? 146 : 120) / 160, color: "#EF4444", iconPath: "/assets/onboarding/chicken.svg" },
    { label: "Carbs", taken: step === 5 ? 186 : 180, goal: 300, progress: (step === 5 ? 186 : 180) / 300, color: "#F59E0B", iconPath: "/assets/onboarding/bread.svg" },
    { label: "Fat", taken: step === 5 ? 85 : 54, goal: 80, progress: (step === 5 ? 85 : 54) / 80, color: "#3B82F6", iconPath: "/assets/onboarding/fats.svg" },
  ];

  const days = [
    { letter: "S", date: 21, isToday: false, isFuture: false },
    { letter: "M", date: 22, isToday: false, isFuture: false },
    { letter: "T", date: 23, isToday: false, isFuture: false },
    { letter: "W", date: 24, isToday: false, isFuture: false },
    { letter: "T", date: 25, isToday: true, isFuture: false },
    { letter: "F", date: 26, isToday: false, isFuture: true },
    { letter: "S", date: 27, isToday: false, isFuture: true },
  ];

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none bg-[#F8F9FA] text-black font-sans"
    >
      {/* 
        =========================================
        BASE DASHBOARD (Visible in Step 0, 1, 5)
        =========================================
      */}
      <motion.div 
        className="absolute inset-0 flex flex-col"
        initial={false}
        animate={{
          scale: step === 1 ? 0.95 : 1, // Shrink slightly when modal opens
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ── STATUS BAR MOCK ────────────────────────────────────────────────── */}
        <div className="w-full h-11 px-6 pt-3 flex items-center justify-between text-[11px] font-bold text-black z-20 flex-shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-2.5" viewBox="0 0 16 10" fill="currentColor">
              <rect x="0" y="7" width="2" height="3" rx="0.5" />
              <rect x="3" y="5" width="2" height="5" rx="0.5" />
              <rect x="6" y="3" width="2" height="7" rx="0.5" />
              <rect x="9" y="1" width="2" height="9" rx="0.5" />
              <rect x="12" y="0" width="2" height="10" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </svg>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0" />
            </svg>
            <div className="w-5.5 h-2.5 border border-black rounded-[4px] p-[1px] flex items-center">
              <div className="h-full w-[80%] bg-black rounded-[2px]" />
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE DASHBOARD CONTENT ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-28 space-y-5 no-scrollbar scroll-smooth">
          
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-full bg-[#A3E635] flex items-center justify-center text-black font-extrabold text-[16px]">
                T
              </div>
              <div>
                <p className="text-[13px] text-gray-500 font-medium leading-none">Good morning! 👋</p>
                <h2 className="text-[18px] font-extrabold text-black mt-1 leading-tight">Tejash</h2>
              </div>
            </div>
            <button className="w-[42px] h-[42px] rounded-full bg-[#F0F0F0] flex items-center justify-center text-gray-500 hover:text-black transition-colors">
              <LogOut size={20} className="stroke-[2.2]" />
            </button>
          </div>

          {/* Weekly Calendar Component */}
          <div className="py-1">
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-[17px] font-extrabold text-black">June 2026</span>
            </div>
            <div className="flex justify-between gap-1">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl gap-1 transition-all ${
                    d.isToday ? "bg-[#F0F0F0]" : "bg-transparent"
                  } ${d.isFuture ? "opacity-30 pointer-events-none" : "opacity-100"}`}
                >
                  <span className={`text-[11px] font-semibold ${d.isToday ? "text-black" : "text-gray-400"}`}>
                    {d.letter}
                  </span>
                  <span className={`text-[15px] font-bold ${d.isToday ? "text-black" : "text-gray-400"}`}>
                    {String(d.date).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calories Card */}
          <div className="bg-[#F0F0F0] rounded-[20px] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[36px] font-extrabold text-black tracking-tight leading-none">
                  {calories.remaining}
                  <span className="text-[16px] font-medium text-gray-500 ml-1">kcal</span>
                </p>
                <p className="text-[13px] text-gray-500 font-semibold mt-2.5">remaining today</p>
              </div>
              <CircularProgress progress={calories.progress} size={90} strokeWidth={5} color="#A3E635">
                <div className="w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center">
                  <img src="/assets/onboarding/burnfat.svg" className="w-[28px] h-[28px]" alt="Burn Fat" />
                </div>
              </CircularProgress>
            </div>
          </div>

          {/* Macro Cards Row */}
          <div className="flex gap-2.5">
            {macros.map((m) => (
              <div key={m.label} className="flex-1 bg-[#F0F0F0] rounded-[18px] p-3 flex flex-col items-center gap-1">
                <CircularProgress progress={m.progress} size={60} strokeWidth={4} color={m.color}>
                  <div className="w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center">
                    <img src={m.iconPath} className="w-[22px] h-[22px] object-contain" alt={m.label} />
                  </div>
                </CircularProgress>
                <span className="text-[12px] text-gray-500 font-bold mt-2">{m.label}</span>
                <span className="text-[16px] font-extrabold mt-0.5" style={{ color: m.color }}>
                  {m.taken}g
                </span>
                <span className="text-[11px] text-gray-400 font-semibold">/ {m.goal}g</span>
              </div>
            ))}
          </div>

          {/* Today's Food Log Title */}
          <div className="flex justify-between items-center py-1">
            <h3 className="text-[16px] font-bold text-gray-700">Today&apos;s Food Log</h3>
          </div>

          {/* Meal Groups */}
          <div className="space-y-3">
            {/* Breakfast */}
            <div className="bg-[#F0F0F0] rounded-[20px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200/40">
                <div className="w-[26px] h-[26px] flex items-center justify-center">
                  <img src="/assets/dashboard/breakfast.svg" className="w-[18px] h-[18px] object-contain" alt="Breakfast" />
                </div>
                <span className="text-[15px] font-extrabold text-black flex-1">Breakfast</span>
                <span className="text-[13px] text-gray-500 font-bold">420 kcal</span>
                <button className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500">
                  <Plus size={16} className="stroke-[2.5]" />
                </button>
              </div>
              <div className="flex items-center gap-3.5 px-4 py-3 border-b last:border-0 border-gray-200/20">
                <span className="text-[26px]">🍽️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-black truncate">Oatmeal with Berries</p>
                  <p className="text-[12px] text-gray-400 font-medium mt-0.5">08:15 AM</p>
                </div>
                <span className="text-[13px] font-extrabold text-gray-500">320 kcal</span>
              </div>
              <div className="flex items-center gap-3.5 px-4 py-3 border-b last:border-0 border-gray-200/20">
                <span className="text-[26px]">🍽️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-black truncate">Hard Boiled Egg</p>
                  <p className="text-[12px] text-gray-400 font-medium mt-0.5">08:20 AM</p>
                </div>
                <span className="text-[13px] font-extrabold text-gray-500">100 kcal</span>
              </div>
            </div>

            {/* Snacks (Animated Entry) */}
            <AnimatePresence>
              {step === 5 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.9, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", scale: 1, marginTop: 12 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-[#F0F0F0] rounded-[20px] overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200/40">
                    <div className="w-[26px] h-[26px] flex items-center justify-center">
                      <img src="/assets/dashboard/snack.svg" className="w-[18px] h-[18px] object-contain" alt="Snacks" />
                    </div>
                    <span className="text-[15px] font-extrabold text-black flex-1">Snacks</span>
                    <span className="text-[13px] text-gray-500 font-bold">400 kcal</span>
                    <button className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500">
                      <Plus size={16} className="stroke-[2.5]" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3.5 px-4 py-3 border-b last:border-0 border-gray-200/20">
                    <span className="text-[26px]">🍽️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-black truncate">Scanned Food</p>
                      <p className="text-[12px] text-gray-400 font-medium mt-0.5">12:30 PM</p>
                    </div>
                    <span className="text-[13px] font-extrabold text-gray-500">400 kcal</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── FLOATING TAB BAR MOCK ─────────────────────────────────────────── */}
        <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-center pointer-events-auto">
          <div className="w-full flex items-center bg-white/75 backdrop-blur-md rounded-[30px] px-3 py-2 border border-white/90 shadow-2xl relative">
            <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
              <img src="/assets/dash/home.svg" className="w-[24px] h-[24px] opacity-100" alt="Home" />
              <span className="text-[11px] text-black font-extrabold">Home</span>
            </button>
            <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
              <img src="/assets/dash/progress.svg" className="w-[24px] h-[24px] opacity-40" alt="Progress" />
              <span className="text-[11px] text-gray-400 font-semibold">Progress</span>
            </button>
            <div className="w-[60px]" />
            <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
              <img src="/assets/dash/profile.svg" className="w-[24px] h-[24px] opacity-40" alt="Profile" />
              <span className="text-[11px] text-gray-400 font-semibold">Profile</span>
            </button>
            <button className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5">
              <img src="/assets/dash/describe.svg" className="w-[24px] h-[24px] opacity-40" alt="AI" />
              <span className="text-[11px] text-gray-400 font-semibold">AI</span>
            </button>

            {/* Floating Plus Action Button */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[calc(50%+16px)]">
              <motion.button 
                animate={{ 
                  scale: step === 1 ? 0.9 : 1,
                  rotate: step === 1 ? 45 : 0,
                  backgroundColor: step === 1 ? "#333" : "#A3E635"
                }}
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg shadow-[#A3E635]/40"
              >
                <Plus size={28} className={step === 1 ? "text-white stroke-[3.5]" : "text-black stroke-[3.5]"} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 
        =========================================
        MODAL BACKDROP & SHEET (Visible in Step 1)
        =========================================
      */}
      <AnimatePresence>
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-30 flex flex-col justify-end pb-[110px]"
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
                <div className="h-[110px] bg-[#F0F0F0] rounded-[24px] p-4 flex flex-col items-center justify-center gap-3">
                  <img src="/assets/dash/fooddb.svg" className="w-[32px] h-[32px]" alt="Food Database" />
                  <span className="text-[15px] font-semibold text-black">Food Database</span>
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], borderColor: ["transparent", "rgba(0,0,0,0.1)", "transparent"] }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="h-[110px] bg-[#F0F0F0] rounded-[24px] p-4 flex flex-col items-center justify-center gap-3 border-2 border-transparent"
                >
                  <img src="/assets/dash/scan.svg" className="w-[32px] h-[32px]" alt="Scan food" />
                  <span className="text-[15px] font-semibold text-black">Scan food</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        =========================================
        CAMERA UI (Visible in Step 2)
        =========================================
      */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-40 bg-black flex flex-col"
          >
            {/* Fake Camera Viewfinder with Apple image */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#111] overflow-hidden">
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "linear" }}
                src="/food.jpg" 
                alt="Food in camera"
                className="w-full h-full object-cover opacity-90"
              />
            </div>

            {/* Dark Overlays */}
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              <div className="flex-1 bg-black/40" />
              <div className="flex flex-row" style={{ height: '70vw' }}>
                <div className="flex-1 bg-black/40" />
                <div className="w-[70vw] h-[70vw] relative">
                  {/* Brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-[16px]" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-[16px]" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-[16px]" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-[16px]" />
                </div>
                <div className="flex-1 bg-black/40" />
              </div>
              <div className="flex-1 bg-black/40" />
            </div>

            {/* Top Bar */}
            <div className="absolute top-12 left-0 right-0 px-5 flex justify-between items-center">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <X size={24} className="text-white" />
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 pb-12 pt-6 flex flex-col items-center gap-8">
              {/* Tabs */}
              <div className="flex flex-row gap-3">
                <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full">
                  <CameraIcon size={18} className="text-black" />
                  <span className="text-[14px] font-semibold text-black">Scan Food</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-full">
                  <ImageIcon size={18} className="text-white/60" />
                  <span className="text-[14px] font-semibold text-white/60">Gallery</span>
                </div>
              </div>

              {/* Shutter row */}
              <div className="flex flex-row items-center justify-between w-full px-12">
                <div className="w-10 h-10 flex items-center justify-center">
                  <ZapOff size={22} className="text-white" />
                </div>
                
                {/* Shutter Button (Animates a 'click') */}
                <motion.div 
                  animate={{ scale: [1, 0.9, 1] }}
                  transition={{ delay: 1, duration: 0.3 }}
                  className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center p-[4px]"
                >
                  <div className="w-full h-full bg-white rounded-full" />
                </motion.div>

                <div className="w-10" /> {/* Spacer */}
              </div>
            </div>
            
            {/* Flash Effect */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 1.1, duration: 0.15 }}
              className="absolute inset-0 bg-white pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        =========================================
        SCAN PREVIEW UI (Visible in Step 3)
        =========================================
      */}
      <AnimatePresence>
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50 bg-black flex flex-col"
          >
            {/* Full Image */}
            <img 
              src="/food.jpg" 
              alt="Food Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            
            {/* Top Bar */}
            <div className="absolute top-12 left-5 z-10">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <X size={24} className="text-white" />
              </div>
            </div>

            {/* Bottom Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col justify-end">
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-[#F5F5F5]/95 backdrop-blur-xl rounded-[16px] overflow-hidden shadow-2xl"
              >
                <div className="p-4 h-[120px]">
                  <p className="text-[#A1A1AA] text-[15px]">
                    Add a note to your meal to help our algorithm with things it can't see. This step is optional.
                  </p>
                </div>
                <div className="p-2 pb-2">
                  <motion.div 
                    animate={{ scale: [1, 0.98, 1], backgroundColor: ["#333", "#000", "#333"] }}
                    transition={{ delay: 1.8, duration: 0.3 }}
                    className="w-full bg-[#333333] py-4 rounded-[10px] flex items-center justify-center"
                  >
                    <span className="text-white font-semibold text-[16px]">Analyze Food</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            {/* Scanning Effect Overlay */}
            <motion.div 
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
              className="absolute left-0 right-0 h-[2px] bg-white/50 shadow-[0_0_20px_rgba(255,255,255,1)] pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        =========================================
        SCAN RESULTS UI (Visible in Step 4)
        =========================================
      */}
      <AnimatePresence>
        {step === 4 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-[60] bg-[#F8F9FA] flex flex-col"
          >
            {/* Image Background Header */}
            <div className="relative h-[45%] w-full bg-[#E5E7EB]">
              <img 
                src="/food.jpg" 
                alt="Scanned Food"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-[60px] left-5 z-10">
                <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                  <ArrowLeft size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Scrollable Content (simulated) */}
            <div className="flex-1 overflow-y-auto mt-[-32px] no-scrollbar relative z-10">
              <div className="bg-white rounded-t-[32px] px-6 pt-8 pb-32 min-h-[60%]">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-4">
                    <h2 className="text-[26px] font-extrabold text-[#111] tracking-[-0.5px]">Scanned Food</h2>
                    <p className="text-[15px] text-gray-500 mt-1.5 font-medium">1 serving</p>
                  </div>
                  <div className="flex items-center bg-white border border-gray-200 rounded-full px-1.5 py-1.5 shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      <Minus size={18} className="text-[#111] stroke-[2.5]" />
                    </div>
                    <span className="text-[16px] font-bold text-[#111] mx-2 min-w-[28px] text-center">1</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      <Plus size={18} className="text-[#111] stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Macros Grid */}
                <div className="flex flex-wrap justify-between mb-6 gap-y-3">
                  <div className="w-[48%] flex items-center bg-[#FAFAFA] border border-[#F3F4F6] rounded-[20px] p-3">
                    <div className="w-10 h-10 rounded-[14px] bg-white flex justify-center items-center mr-2.5 shadow-sm">
                      <img src="/assets/onboarding/burnfat.svg" className="w-5 h-5" alt="Calories" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-gray-500 font-medium">Calories</p>
                      <p className="text-[16px] font-extrabold text-[#111]">400</p>
                    </div>
                  </div>
                  <div className="w-[48%] flex items-center bg-[#FAFAFA] border border-[#F3F4F6] rounded-[20px] p-3">
                    <div className="w-10 h-10 rounded-[14px] bg-white flex justify-center items-center mr-2.5 shadow-sm">
                      <img src="/assets/onboarding/bread.svg" className="w-5 h-5" alt="Carbs" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-gray-500 font-medium">Carbs</p>
                      <p className="text-[16px] font-extrabold text-[#111]">6g</p>
                    </div>
                  </div>
                  <div className="w-[48%] flex items-center bg-[#FAFAFA] border border-[#F3F4F6] rounded-[20px] p-3">
                    <div className="w-10 h-10 rounded-[14px] bg-white flex justify-center items-center mr-2.5 shadow-sm">
                      <img src="/assets/onboarding/chicken.svg" className="w-5 h-5" alt="Protein" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-gray-500 font-medium">Protein</p>
                      <p className="text-[16px] font-extrabold text-[#111]">26g</p>
                    </div>
                  </div>
                  <div className="w-[48%] flex items-center bg-[#FAFAFA] border border-[#F3F4F6] rounded-[20px] p-3">
                    <div className="w-10 h-10 rounded-[14px] bg-white flex justify-center items-center mr-2.5 shadow-sm">
                      <img src="/assets/onboarding/fats.svg" className="w-5 h-5" alt="Fat" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-gray-500 font-medium">Fat</p>
                      <p className="text-[16px] font-extrabold text-[#111]">31g</p>
                    </div>
                  </div>
                </div>

                {/* Micronutrients */}
                <div className="mt-2">
                  <h3 className="text-[18px] font-bold text-[#111] mb-4">Micronutrients</h3>
                  <div className="space-y-0">
                    <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
                      <span className="text-[15px] text-[#4B5563]">Fiber</span>
                      <span className="text-[15px] font-semibold text-[#111]">4.2g</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
                      <span className="text-[15px] text-[#4B5563]">Sugar</span>
                      <span className="text-[15px] font-semibold text-[#111]">1.5g</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
                      <span className="text-[15px] text-[#4B5563]">Sodium</span>
                      <span className="text-[15px] font-semibold text-[#111]">320mg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Floating Menu Bar */}
            <div className="absolute bottom-8 left-6 right-6 z-50">
              <div className="bg-white/85 backdrop-blur-md rounded-[24px] p-2 flex border border-white/90 shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
                {/* Meal Selector */}
                <div className="flex-1 flex justify-center items-center py-3.5 bg-[#F3F4F6] rounded-[16px] mr-2">
                  <span className="text-[#111] text-[16px] font-semibold">Lunch</span>
                </div>
                {/* Log Food Button */}
                <motion.div 
                  animate={{ scale: [1, 0.95, 1], backgroundColor: ["#A3E635", "#8BCC22", "#A3E635"] }}
                  transition={{ delay: 3, duration: 0.3 }}
                  className="flex-[1.5] bg-[#A3E635] rounded-[16px] flex justify-center items-center py-3.5 shadow-lg shadow-[#A3E635]/30"
                >
                  <span className="text-black text-[16px] font-bold">Log Food</span>
                </motion.div>
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
