import { LandingHeader, LandingSection } from "./section";

export function ProductStatement() {
  return (
    <LandingSection id="product" tone="soft">
      <LandingHeader
        align="center"
        title="A form is more than a list of questions."
        description="It's the moment someone interacts with your brand. Make that moment feel intentional."
        className="max-w-3xl"
      />
    </LandingSection>
  );
}
