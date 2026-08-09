"use client";

import Link from "next/link";

import { useUser } from "../../hook/api/auth";
import { Button } from "../ui/button";
import { LandingHeader, LandingSection } from "./section";

export function PricingSection() {
  const { user } = useUser();
  const createHref = user ? "/create" : "/auth/signup";

  return (
    <LandingSection id="pricing" tone="warm">
      <LandingHeader
        align="center"
        title="Start free. Plans soon."
        description="Create and publish forms today at no cost. Thoughtful pricing for teams and advanced needs is on the way — we'll keep it clear and fair."
      />
      <div className="mt-10 flex justify-center">
        <Link href={createHref}>
          <Button size="lg">Create your first form</Button>
        </Link>
      </div>
    </LandingSection>
  );
}
