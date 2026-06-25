"use client";

import React from "react";
import { LogOut, Plus } from "lucide-react";
import MockTabBar from "./MockTabBar";

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
        />
      </svg>
      {children}
    </div>
  );
}

export default function PhoneScreenDashboard({ loggedFood }: { loggedFood?: any }) {
  const macros = [
    { label: "Protein", taken: 120, goal: 160, progress: 120 / 160, color: "#EF4444", iconPath: "/assets/onboarding/chicken.svg" },
    { label: "Carbs", taken: 180, goal: 300, progress: 180 / 300, color: "#F59E0B", iconPath: "/assets/onboarding/bread.svg" },
    { label: "Fat", taken: 54, goal: 80, progress: 54 / 80, color: "#3B82F6", iconPath: "/assets/onboarding/fats.svg" },
  ];

  const meals = [
    {
      category: "Breakfast",
      iconPath: "/assets/dashboard/breakfast.svg",
      kcal: 420 + (loggedFood?.kcal || 0),
      items: [
        { name: "Oatmeal with Berries", time: "08:15 AM", kcal: 320 },
        { name: "Hard Boiled Egg", time: "08:20 AM", kcal: 100 },
        ...(loggedFood ? [loggedFood] : []),
      ],
    },
    {
      category: "Lunch",
      iconPath: "/assets/dashboard/lunch.svg",
      kcal: 650,
      items: [
        { name: "Grilled Chicken Salad", time: "01:15 PM", kcal: 480 },
        { name: "Avocado", time: "01:20 PM", kcal: 170 },
      ],
    },
    {
      category: "Dinner",
      iconPath: "/assets/dashboard/dinner.svg",
      kcal: 380,
      items: [
        { name: "Baked Salmon", time: "07:30 PM", kcal: 380 },
      ],
    },
    {
      category: "Snacks",
      iconPath: "/assets/dashboard/snack.svg",
      kcal: 150,
      items: [
        { name: "Mixed Nuts", time: "04:00 PM", kcal: 150 },
      ],
    },
  ];

  const totalConsumed = meals.reduce((acc, m) => acc + m.kcal, 0);
  const totalRemaining = Math.max(0, 2000 - totalConsumed);
  const progressPercent = totalConsumed / 2000;

  const calories = { remaining: totalRemaining, total: 2000, progress: progressPercent };

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
    <div className="h-full w-full bg-[#F8F9FA] flex flex-col relative select-none overflow-hidden text-black font-sans">
      {/* ── STATUS BAR MOCK ────────────────────────────────────────────────── */}
      <div className="w-full h-11 px-6 pt-3 flex items-center justify-between text-[11px] font-bold text-black z-20 flex-shrink-0">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          {/* Signal */}
          <svg className="w-4 h-2.5" viewBox="0 0 16 10" fill="currentColor">
            <rect x="0" y="7" width="2" height="3" rx="0.5" />
            <rect x="3" y="5" width="2" height="5" rx="0.5" />
            <rect x="6" y="3" width="2" height="7" rx="0.5" />
            <rect x="9" y="1" width="2" height="9" rx="0.5" />
            <rect x="12" y="0" width="2" height="10" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          {/* Wifi */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0" />
          </svg>
          {/* Battery */}
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
              <p className="text-[32px] font-extrabold text-black tracking-tight leading-none">
                {calories.remaining}
                <span className="text-[14px] font-medium text-gray-500 ml-1">kcal</span>
              </p>
              <p className="text-[12px] text-gray-500 font-semibold mt-2.5">remaining today</p>
            </div>
            <CircularProgress progress={calories.progress} size={70} strokeWidth={4} color="#A3E635">
              <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center">
                <img src="/assets/onboarding/burnfat.svg" className="w-[24px] h-[24px]" alt="Burn Fat" />
              </div>
            </CircularProgress>
          </div>
        </div>

        {/* Macro Cards Row */}
        <div className="flex gap-2">
          {macros.map((m) => (
            <div key={m.label} className="flex-1 bg-[#F0F0F0] rounded-[16px] p-2 flex flex-col items-center gap-1">
              <CircularProgress progress={m.progress} size={48} strokeWidth={3.5} color={m.color}>
                <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center">
                  <img src={m.iconPath} className="w-[18px] h-[18px] object-contain" alt={m.label} />
                </div>
              </CircularProgress>
              <span className="text-[11px] text-gray-500 font-bold mt-1.5">{m.label}</span>
              <span className="text-[14px] font-extrabold mt-0.5" style={{ color: m.color }}>
                {m.taken}g
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">/ {m.goal}g</span>
            </div>
          ))}
        </div>

        {/* Today's Food Log Title */}
        <div className="flex justify-between items-center py-1">
          <h3 className="text-[16px] font-bold text-gray-700">Today&apos;s Food Log</h3>
        </div>

        {/* Meal Groups */}
        <div className="space-y-3">
          {meals.map((meal) => (
            <div key={meal.category} className="bg-[#F0F0F0] rounded-[20px] overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200/40">
                <div className="w-[26px] h-[26px] flex items-center justify-center">
                  <img src={meal.iconPath} className="w-[18px] h-[18px] object-contain" alt={meal.category} />
                </div>
                <span className="text-[15px] font-extrabold text-black flex-1">{meal.category}</span>
                <span className="text-[13px] text-gray-500 font-bold">{meal.kcal} kcal</span>
                <button className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500 hover:text-black transition-all">
                  <Plus size={16} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Food Items */}
              {meal.items.map((food, fIdx) => (
                <div key={fIdx} className="flex items-center gap-3.5 px-4 py-3 border-b last:border-0 border-gray-200/20">
                  <span className="text-[26px]">🍽️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-black truncate">{food.name}</p>
                    <p className="text-[12px] text-gray-400 font-medium mt-0.5">{food.time}</p>
                  </div>
                  <span className="text-[13px] font-extrabold text-gray-500">{food.kcal} kcal</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── FLOATING TAB BAR MOCK ─────────────────────────────────────────── */}
      <MockTabBar activeTab="home" />

      {/* Styles inline logic for hiding scrollbar */}
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
