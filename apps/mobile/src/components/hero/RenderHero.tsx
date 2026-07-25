import { HeroSlider } from "@/components/hero/HeroSlider";
import { HighImpactHero } from "@/components/hero/HighImpactHero";
import { LowImpactHero } from "@/components/hero/LowImpactHero";
import { MediumImpactHero } from "@/components/hero/MediumImpactHero";

type HeroSlide = {
  id?: string | null;
  mediaUrl: string | null;
  heading: string | null;
  subheading: string | null;
  linkHref: string | null;
  linkLabel: string | null;
};

type Link = {
  href: string;
  label: string;
  appearance: string;
};

type HeroData =
  | {
      type: "heroSlider";
      slides: HeroSlide[];
    }
  | {
      type: "highImpact";
      richText: unknown;
      mediaUrl: string | null;
      links: Link[];
      featuredProduct: {
        title: string | null;
        slug: string | null;
        priceInINR: number | null;
        effectivePrice: number | null;
        discountPercent: number | null;
        imageUrl: string | null;
      } | null;
    }
  | {
      type: "mediumImpact";
      richText: unknown;
      mediaUrl: string | null;
      links: Link[];
      mediaCaption: unknown;
    }
  | {
      type: "lowImpact";
      richText: unknown;
    }
  | null;

export function RenderHero({ hero }: { hero: HeroData }) {
  if (!hero) return null;

  switch (hero.type) {
    case "heroSlider":
      return <HeroSlider slides={hero.slides} />;
    case "highImpact":
      return (
        <HighImpactHero
          richText={hero.richText}
          mediaUrl={hero.mediaUrl}
          links={hero.links}
          featuredProduct={hero.featuredProduct}
        />
      );
    case "mediumImpact":
      return (
        <MediumImpactHero
          richText={hero.richText}
          mediaUrl={hero.mediaUrl}
          links={hero.links}
          mediaCaption={hero.mediaCaption}
        />
      );
    case "lowImpact":
      return <LowImpactHero richText={hero.richText} />;
    default:
      return null;
  }
}
