import React from "react";

import { HighImpactHero } from "@/heros/HighImpact";
import { HeroSlider } from "@/heros/HeroSlider";
import { LowImpactHero } from "@/heros/LowImpact";
import { MediumImpactHero } from "@/heros/MediumImpact";
import type { Page } from "@/payload-types";

const heroes = {
  highImpact: HighImpactHero,
  heroSlider: HeroSlider,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
};

export const RenderHero: React.FC<Page["hero"]> = (props) => {
  const { type } = props || {};

  if (!type || type === "none") return null;

  const HeroToRender = heroes[type];

  if (!HeroToRender) return null;

  return <HeroToRender {...props} />;
};
