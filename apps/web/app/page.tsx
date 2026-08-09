import { BrandSection } from "../components/landing/brand-section";
import { ExperienceModes } from "../components/landing/experience-modes";
import { FinalCta } from "../components/landing/final-cta";
import { HeroSection } from "../components/landing/hero";
import { InspirationGallery } from "../components/landing/inspiration-gallery";
import { PersonalityPicker } from "../components/landing/personality-picker";
import { PricingSection } from "../components/landing/pricing-section";
import { ProductStatement } from "../components/landing/product-statement";
import { PublicExperience } from "../components/landing/public-experience";
import { QualitySection } from "../components/landing/quality-section";
import { SiteFooter } from "../components/landing/site-footer";
import { SiteNav } from "../components/landing/site-nav";
import { TemplatesGallery } from "../components/landing/templates-gallery";
import { ThemeShowcase } from "../components/landing/theme-showcase";
import { VisualTransform } from "../components/landing/visual-transform";

export default function HomePage() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden text-[var(--atelier-ink)]">
      <SiteNav />
      <main>
        <HeroSection />
        <ProductStatement />
        <VisualTransform />
        <ThemeShowcase />
        <PersonalityPicker />
        <ExperienceModes />
        <PublicExperience />
        <TemplatesGallery />
        <InspirationGallery />
        <BrandSection />
        <QualitySection />
        <PricingSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
