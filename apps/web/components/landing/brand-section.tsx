"use client";

import { BRAND_EXAMPLES } from "./demo-data";
import { InteractiveFormDemo } from "./form-preview";
import { LandingHeader, LandingSection } from "./section";

export function BrandSection() {
  return (
    <LandingSection tone="default">
      <LandingHeader
        title="Your form should look like you."
        description="Different brands. Same interactivity — type, rate, and continue."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {BRAND_EXAMPLES.map((brand) => (
          <InteractiveFormDemo key={brand.id} form={brand} className="w-full" />
        ))}
      </div>
    </LandingSection>
  );
}
