"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { ImpactPhrase, WhyNow } from "./WhyNow";
import { ExperienceGrid } from "./ExperienceGrid";
import { JourneyTimeline } from "./JourneyTimeline";
import { FieldExperience } from "./FieldExperience";
import { Speakers } from "./Speakers";
import { Cases, WhatYouTake, Deliverables } from "./Cases";
import { Investment, Corporate } from "./Investment";
import { FAQ } from "./FAQ";
import { LeadForm } from "./LeadForm";
import { FinalCTA, Footer, MobileBar } from "./FinalCTA";

export function HomePage() {
  const [form, setForm] = useState(false);
  const open = () => setForm(true);
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 bg-white text-black p-2">
        Pular para o conteúdo
      </a>
      <Navbar onCta={open} />
      <main id="conteudo">
        <Hero onCta={open} />
        <ImpactPhrase />
        <WhyNow />
        <ExperienceGrid />
        <JourneyTimeline />
        <FieldExperience />
        <Speakers />
        <Cases />
        <WhatYouTake />
        <Deliverables />
        <Investment onCta={open} />
        <Corporate onCta={open} />
        <FAQ />
        <FinalCTA onCta={open} />
      </main>
      <Footer />
      <MobileBar onCta={open} />
      <LeadForm open={form} onClose={() => setForm(false)} />
    </>
  );
}
