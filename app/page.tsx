"use client";

import { Hero } from "@/components/hero";
import GradientBlinds from "@/components/GradientBlinds";
import { WhatIsSection } from "@/components/landing/what-is-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { InteractivePreviewSection } from "@/components/landing/interactive-preview-section";
import { WhyTeamsSection } from "@/components/landing/why-teams-section";
import { GetStartedSection } from "@/components/landing/get-started-section";
import { SponsorsSection } from "@/components/landing/sponsors-section";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section with GradientBlinds background */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <GradientBlinds
            gradientColors={["#FF9FFC", "#5227FF"]}
            angle={221}
            noise={0.05}
            blindCount={6}
            blindMinWidth={55}
            spotlightRadius={0.5}
            spotlightSoftness={1}
            spotlightOpacity={1}
            mouseDampening={0.5}
            distortAmount={26}
            shineDirection="left"
            mixBlendMode="lighten"
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Hero />
        </div>
      </div>

      {/* Rest of the sections */}
      <WhatIsSection />
      <HowItWorksSection />
      <InteractivePreviewSection />
      <WhyTeamsSection />
      <GetStartedSection />
      <SponsorsSection />
    </div>
  );
}
