"use client";

import Link from "next/link";

import { useUser } from "../../hook/api/auth";
import { Button } from "../ui/button";
import { HERO_FORM } from "./demo-data";
import { InteractiveFormDemo } from "./form-preview";

export function HeroSection() {
  const { user } = useUser();
  const createHref = user ? "/create" : "/auth/signup";

  return (
    <section className="relative flex min-h-[calc(100dvh-4.25rem)] flex-col justify-center overflow-hidden border-b border-[var(--atelier-line)]">
      <div className="landing-container grid w-full items-center gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-xl">
          <h1 className="font-display text-[2.65rem] leading-[1.05] tracking-tight text-[var(--atelier-ink)] sm:text-6xl lg:text-[3.85rem]">
            Forms people actually want to fill out.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--atelier-ink-soft)] sm:text-xl">
            Create beautiful forms that feel like part of your brand, not another
            boring questionnaire.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={createHref}>
              <Button size="lg">Create your first form</Button>
            </Link>
            <a href="#examples">
              <Button size="lg" variant="secondary">
                Explore examples
              </Button>
            </a>
          </div>
        </div>

        <div className="landing-reveal relative w-full max-w-xl justify-self-stretch lg:max-w-none lg:justify-self-end">
          <InteractiveFormDemo form={HERO_FORM} />
          <p className="mt-4 text-sm text-[var(--atelier-ink-muted)] lg:text-right">
            Try it — pick a rating, write a note, finish the form.
          </p>
        </div>
      </div>
    </section>
  );
}
