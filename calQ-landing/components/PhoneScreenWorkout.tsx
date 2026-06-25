"use client";

const exercises = [
  { name: "Bench Press", sets: "4 × 10", done: true },
  { name: "Shoulder Press", sets: "3 × 12", done: true },
  { name: "Cable Fly", sets: "3 × 15", done: true },
  { name: "Lateral Raise", sets: "3 × 15", done: false },
  { name: "Tricep Pushdown", sets: "3 × 12", done: false },
];

export default function PhoneScreenWorkout() {
  const completedCount = exercises.filter((e) => e.done).length;
  const completedPct = Math.round((completedCount / exercises.length) * 100);

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
        <p className="text-[11px] text-gray-400 font-medium">Today&apos;s Workout</p>
        <h2 className="text-lg font-semibold text-[#202A36]">Push Day</h2>
      </div>

      {/* Timer + Progress */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-gray-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-gray-400 font-medium mb-1">Duration</p>
          <p className="text-xl font-bold text-[#202A36] tabular-nums">42:15</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-gray-400 font-medium mb-1">Completed</p>
          <p className="text-xl font-bold text-[#202A36]">{completedPct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-[#202A36] rounded-full transition-all"
          style={{ width: `${completedPct}%` }}
        />
      </div>

      {/* Exercise list */}
      <div className="space-y-2.5 flex-1">
        {exercises.map((ex) => (
          <div
            key={ex.name}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
              ex.done ? "bg-gray-50" : "bg-white border border-gray-100"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                ex.done
                  ? "bg-[#202A36] border-[#202A36]"
                  : "border-gray-300"
              }`}
            >
              {ex.done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${ex.done ? "text-gray-400 line-through" : "text-[#202A36]"}`}>
                {ex.name}
              </p>
              <p className="text-[10px] text-gray-400">{ex.sets}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
