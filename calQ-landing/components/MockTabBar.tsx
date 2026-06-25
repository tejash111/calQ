import React from "react";
import { Plus } from "lucide-react";

export default function MockTabBar({ activeTab }: { activeTab: string }) {
  return (
    <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-auto">
      <div className="w-full flex items-center justify-between bg-white/75 backdrop-blur-md rounded-[30px] px-2 py-2 border border-white/90 shadow-2xl relative">
        <div className="flex w-[40%] justify-around">
          <button className="flex flex-col items-center justify-center gap-0.5">
            <img src="/assets/dash/home.svg" className={`w-[22px] h-[22px] ${activeTab === 'home' ? 'opacity-100' : 'opacity-40'}`} alt="Home" />
            <span className={`text-[10px] ${activeTab === 'home' ? 'text-black font-extrabold' : 'text-gray-400 font-semibold'}`}>Home</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-0.5">
            <img src="/assets/dash/progress.svg" className={`w-[22px] h-[22px] ${activeTab === 'progress' ? 'opacity-100' : 'opacity-40'}`} alt="Progress" />
            <span className={`text-[10px] ${activeTab === 'progress' ? 'text-black font-extrabold' : 'text-gray-400 font-semibold'}`}>Progress</span>
          </button>
        </div>

        <div className="w-[20%] flex justify-center relative">
          <div className="absolute -top-10">
            <button className="w-[52px] h-[52px] rounded-full bg-[#A3E635] flex items-center justify-center shadow-lg shadow-[#A3E635]/40 active:scale-95 transition-all">
              <Plus size={28} className="text-black stroke-[3.5]" />
            </button>
          </div>
        </div>

        <div className="flex w-[40%] justify-around">
          <button className="flex flex-col items-center justify-center gap-0.5">
            <img src="/assets/dash/profile.svg" className={`w-[22px] h-[22px] ${activeTab === 'profile' ? 'opacity-100' : 'opacity-40'}`} alt="Profile" />
            <span className={`text-[10px] ${activeTab === 'profile' ? 'text-black font-extrabold' : 'text-gray-400 font-semibold'}`}>Profile</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-0.5">
            <img src="/assets/dash/describe.svg" className={`w-[22px] h-[22px] ${activeTab === 'ai' ? 'opacity-100' : 'opacity-40'}`} alt="AI" />
            <span className={`text-[10px] ${activeTab === 'ai' ? 'text-black font-extrabold' : 'text-gray-400 font-semibold'}`}>AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
