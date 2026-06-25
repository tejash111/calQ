"use client";

import { motion } from "framer-motion";

interface FeatureSectionProps {
  title: string;
  description: string;
  isActive: boolean;
  index: number;
}

export default function FeatureSection({
  title,
  description,
  isActive,
  index,
}: FeatureSectionProps) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0.15,
        y: isActive ? 0 : 10,
        filter: isActive ? "blur(0px)" : "blur(2px)",
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`py-8 flex flex-col md:flex-row items-center w-full ${
        isLeft ? "justify-start" : "justify-end"
      }`}
    >
      <div className={`w-full md:w-[35%] ${isLeft ? "pr-4" : "pl-4"}`}>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-normal text-[#202A36] mb-4 tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-base md:text-lg text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
