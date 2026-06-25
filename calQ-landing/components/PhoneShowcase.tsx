"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PhoneFrame from "./PhoneFrame";
import Hero from "./Hero";
import FeatureSection from "./FeatureSection";
import PhoneScreenDashboard from "./PhoneScreenDashboard";
import PhoneScreenAnimatedLog from "./PhoneScreenAnimatedLog";
import PhoneScreenMeals from "./PhoneScreenMeals";
import PhoneScreenProgress from "./PhoneScreenProgress";
import PhoneScreenDatabase from "./PhoneScreenDatabase";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    label: "Nutrition",
    title: "Log Food Instantly with Camera",
    description:
      "Simply point, snap, and let AI do the rest. Our intelligent camera instantly recognizes your meal and calculates precise macros—no manual entry required.",
  },
  {
    label: "AI Logging",
    title: "Add Food with AI",
    description:
      "Simply tell our AI what you ate, and it instantly calculates your macros and logs your meal. No more searching or manual entry.",
  },
  {
    label: "Analytics",
    title: "Visual Progress",
    description:
      "Watch your body transform. Track weight, body fat, and streaks with beautiful charts that keep you motivated.",
  },
  {
    label: "Database",
    title: "Extensive Food Database",
    description:
      "Search thousands of foods instantly. Get detailed macronutrient breakdowns and log your meals with pinpoint accuracy.",
  },
];

export default function PhoneShowcase() {
  const heroRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [activeScreen, setActiveScreen] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const phone = phoneRef.current;
    const hero = heroRef.current;
    const showcase = showcaseRef.current;
    const container = phoneContainerRef.current;
    if (!phone || !hero || !showcase || !container) return;

    // Calculate offset: push phone to the right side (hero layout)
    const rightOffset = window.innerWidth * 0.22;

    const ctx = gsap.context(() => {
      // Initial state: phone offset to the right, slightly scaled down
      gsap.set(phone, { x: rightOffset, scale: 0.92 });
      gsap.set(container, { opacity: 1 });

      // ── Phase 1 ──────────────────────────────────────────────
      // Hero scroll: phone glides from right → center
      gsap.to(phone, {
        x: 0,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      // ── Phase 2 ──────────────────────────────────────────────
      // Showcase scroll: track progress → swap active screen
      ScrollTrigger.create({
        trigger: showcase,
        start: "top center",
        end: "bottom bottom",
        onUpdate: (self) => {
          const idx = Math.min(
            Math.floor(self.progress * features.length),
            features.length - 1
          );
          const newScreen = idx + 1;
          if (newScreen !== activeRef.current) {
            activeRef.current = newScreen;
            setActiveScreen(newScreen);
          }
        },
        onLeaveBack: () => {
          activeRef.current = 0;
          setActiveScreen(0);
        },
      });

      // ── Phase 3 ──────────────────────────────────────────────
      // Fade phone out as showcase ends (entering CTA section)
      gsap.to(container, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: showcase,
          start: "bottom bottom",
          end: "bottom 30%",
          scrub: true,
        },
      });

      // ── Idle float ───────────────────────────────────────────
      // Subtle floating animation for a premium feel
      gsap.to(phone, {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5,
      });
    });

    return () => ctx.revert();
  }, [isMobile]);

  // ═══════════════════════════════════════════════════════════
  // Mobile: simple stacked layout, no scroll animations
  // ═══════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div className="px-6">
        {/* Mobile Hero */}
        <section className="min-h-screen flex flex-col justify-center pt-24 pb-12">
          <Hero />
          <div className="mt-12 mx-auto w-[280px]">
            <PhoneFrame activeScreen={0} className="w-full">
              <PhoneScreenDashboard />
              <PhoneScreenAnimatedLog />
              <PhoneScreenMeals />
              <PhoneScreenProgress />
              <PhoneScreenDatabase />
            </PhoneFrame>
          </div>
        </section>

        {/* Mobile Features */}
        {features.map((f, i) => {
          const screens = [
            <PhoneScreenAnimatedLog key="d" />,
            <PhoneScreenMeals key="m" />,
            <PhoneScreenProgress key="p" />,
            <PhoneScreenDatabase key="d" />,
          ];
          return (
            <section key={f.title} className="py-20">
              <div className="mb-8">
                <h3 className="text-3xl font-normal text-[#202A36] mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-base text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
              <div className="mx-auto w-[280px]">
                <PhoneFrame activeScreen={0} className="w-full">
                  {[screens[i]]}
                </PhoneFrame>
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Desktop: full GSAP scroll animation experience
  // ═══════════════════════════════════════════════════════════
  return (
    <div>
      {/* ── Fixed phone overlay ─────────────────────────────── */}
      {/* Phone lives in its own fixed layer, decoupled from    */}
      {/* the scroll flow. GSAP controls its x position.        */}
      <div
        ref={phoneContainerRef}
        className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center translate-y-10"
      >
        <div
          ref={phoneRef}
          className="w-[325px] lg:w-[365px] will-change-transform"
        >
          <PhoneFrame activeScreen={activeScreen} className="w-full">
            <PhoneScreenDashboard />
            <PhoneScreenAnimatedLog />
            <PhoneScreenMeals />
            <PhoneScreenProgress />
            <PhoneScreenDatabase />
          </PhoneFrame>
        </div>
      </div>

      {/* ── Hero Section ────────────────────────────────────── */}
      {/* Text on the left; the fixed phone appears on the      */}
      {/* right because of the GSAP x offset.                   */}
      <section ref={heroRef} className="h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-xl">
            <Hero />
          </div>
        </div>
      </section>

      {/* ── Feature Showcase ────────────────────────────────── */}
      {/* Phone stays fixed & centered while these sections     */}
      {/* scroll past. Feature text on the left side only.      */}
      <section
        ref={showcaseRef}
        style={{ height: `${features.length * 100}vh` }}
      >
        <div className="max-w-7xl mx-auto px-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="h-screen flex items-center"
            >
              <div className="w-full">
                <FeatureSection
                  title={feature.title}
                  description={feature.description}
                  isActive={activeScreen === index + 1}
                  index={index}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
