"use client";

import { useEffect } from "react";
import { Hero } from "@/components/hero";
import GradientBlinds from "@/components/GradientBlinds";
import { WhatIsSection } from "@/components/landing/what-is-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { InteractivePreviewSection } from "@/components/landing/interactive-preview-section";
import { WhyTeamsSection } from "@/components/landing/why-teams-section";
import { GetStartedSection } from "@/components/landing/get-started-section";
import { SponsorsSection } from "@/components/landing/sponsors-section";
import { ScrollIndicator } from "@/components/ScrollIndicator";

export default function HomePage() {
  useEffect(() => {
    // Hide default scrollbar on landing page
    document.body.classList.add("hide-scrollbar");
    document.documentElement.classList.add("hide-scrollbar");

    return () => {
      // Cleanup: remove class when component unmounts
      document.body.classList.remove("hide-scrollbar");
      document.documentElement.classList.remove("hide-scrollbar");
    };
  }, []);

  return (
    <div className="relative">
      {/* Apple Camera-style Scroll Indicator */}
      <ScrollIndicator />

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
