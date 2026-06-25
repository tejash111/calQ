"use client";

const achievements = [
  { title: "Protein Master", desc: "Hit protein goal 7 days", icon: "🏆" },
  { title: "30 Day Streak", desc: "Logged 30 consecutive days", icon: "🔥" },
  { title: "Perfect Week", desc: "Met all goals for 7 days", icon: "⭐" },
];

const settings = [
  "Notifications",
  "Units & Preferences",
  "Connected Apps",
  "Privacy",
];

export default function PhoneScreenProfile() {
  return (
    <div className="h-full w-full bg-white flex flex-col px-5 pt-12 pb-4 overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 mb-4">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-gray-400 rounded-sm relative">
            <div className="absolute inset-[1px] right-[2px] bg-gray-400 rounded-[1px]" style={{ width: "70%" }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-5">
        <p className="text-[11px] text-gray-400 font-medium">Account</p>
        <h2 className="text-lg font-semibold text-[#202A36]">Profile</h2>
      </div>

      {/* Avatar + Info */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400">
          T
        </div>
        <div>
          <p className="text-sm font-semibold text-[#202A36]">Tejash</p>
          <p className="text-[10px] text-gray-400">Member since 2024</p>
        </div>
      </div>

      {/* Goal */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-5">
        <p className="text-[10px] text-gray-400 font-medium mb-1">Current Goal</p>
        <p className="text-sm font-bold text-[#202A36]">Lose 5 kg</p>
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#202A36] rounded-full" style={{ width: "60%" }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-gray-400">3 kg lost</span>
          <span className="text-[8px] text-gray-400">5 kg target</span>
        </div>
      </div>

      {/* Achievements */}
      <p className="text-xs font-semibold text-[#202A36] mb-2">Achievements</p>
      <div className="space-y-2 mb-5">
        {achievements.map((a) => (
          <div key={a.title} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-sm">
              {a.icon}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#202A36]">{a.title}</p>
              <p className="text-[9px] text-gray-400">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <p className="text-xs font-semibold text-[#202A36] mb-2">Settings</p>
      <div className="space-y-1 flex-1">
        {settings.map((s) => (
          <div key={s} className="flex items-center justify-between py-2 px-1">
            <span className="text-[11px] text-gray-500">{s}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 3L7.5 6L4.5 9" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
