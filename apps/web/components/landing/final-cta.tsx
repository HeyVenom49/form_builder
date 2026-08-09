"use client";

import Link from "next/link";

import { useUser } from "../../hook/api/auth";
import { Button } from "../ui/button";
import { LandingHeader, LandingSection } from "./section";

export function FinalCta() {
  const { user } = useUser();
  const createHref = user ? "/create" : "/auth/signup";

  return (
    <LandingSection tone="soft" className="py-24 sm:py-28">
      <LandingHeader
        align="center"
        title="Your next form doesn't have to look like a form."
        description="Create something beautiful. Share it with the world."
        className="max-w-3xl"
      />
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href={createHref}>
          <Button size="lg">Create your first form</Button>
        </Link>
        <a href="#examples">
          <Button size="lg" variant="secondary">
            Explore examples
          </Button>
        </a>
      </div>
    </LandingSection>
  );
}
