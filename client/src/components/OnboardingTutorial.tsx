import { useOnboarding } from "@/contexts/OnboardingContext";
import { tutorialSteps } from "@/lib/tutorialSteps";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

function TutorialVisual({ type }: { type: string }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-2xl border" style={{ background: "linear-gradient(135deg, var(--secondary), var(--surface-raised))", borderColor: "var(--border)" }}>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--auth-dot)", backgroundSize: "18px 18px" }} />
      <div className="absolute left-6 top-6 h-20 w-20 rounded-full" style={{ background: "oklch(0.78 0.16 85 / 0.22)", boxShadow: "0 0 40px oklch(0.78 0.16 85 / 0.25)" }} />
      <div className="absolute bottom-5 right-6 grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-8 w-12 rounded-lg border" style={{ background: item % 2 ? "var(--card)" : "oklch(0.78 0.16 85 / 0.18)", borderColor: "var(--border)" }} />
        ))}
      </div>
      <div className="absolute left-10 top-10 flex h-16 w-16 items-center justify-center rounded-full border-4" style={{ borderColor: "var(--gold)", background: "var(--card)" }}>
        <div className="h-5 w-5 rounded-full" style={{ background: "var(--gold)" }} />
      </div>
      <p className="absolute bottom-5 left-6 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gold)" }}>{type}</p>
    </div>
  );
}

export default function OnboardingTutorial() {
  const { open, completeTutorial } = useOnboarding();
  const [stepIndex, setStepIndex] = useState(0);
  const [location, navigate] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const step = tutorialSteps[stepIndex];
  const StepIcon = step.icon;
  const last = stepIndex === tutorialSteps.length - 1;
  const progress = Math.round(((stepIndex + 1) / tutorialSteps.length) * 100);

  const targetRect = useMemo(() => {
    if (!open || !step.targetSelector || typeof document === "undefined") return null;
    const element = document.querySelector(step.targetSelector);
    return element?.getBoundingClientRect() ?? null;
  }, [location, open, step.targetSelector, stepIndex]);

  useEffect(() => {
    if (open && step.route) navigate(step.route);
  }, [navigate, open, step.route, stepIndex]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const first = cardRef.current?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (window.confirm("Skip the tutorial?")) void completeTutorial();
      }
      if (event.key !== "Tab" || !cardRef.current) return;
      const focusables = Array.from(cardRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")).filter((node) => !node.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [completeTutorial, open]);

  useEffect(() => {
    if (!open) setStepIndex(0);
  }, [open]);

  if (!open) return null;

  const MotionDiv = reduceMotion ? "div" : motion.div;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      {targetRect && (
        <div
          className="pointer-events-none fixed rounded-2xl border-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.48)] transition-all duration-300"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            borderColor: "var(--gold)",
          }}
        />
      )}

      <div ref={cardRef} role="dialog" aria-modal="true" aria-label={step.title} className="relative z-10 w-full max-w-xl">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={step.id}
            {...(!reduceMotion
              ? {
                  initial: { opacity: 0, y: 16, scale: 0.98 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  exit: { opacity: 0, y: -12, scale: 0.98 },
                  transition: { duration: 0.22 },
                }
              : {})}
            className="rounded-3xl border p-5 shadow-2xl"
            style={{ background: "var(--auth-card-bg)", borderColor: "var(--auth-card-border)", boxShadow: "var(--auth-card-shadow)" }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "oklch(0.78 0.16 85 / 0.16)", color: "var(--gold)" }}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {stepIndex + 1} of {tutorialSteps.length}</p>
                  <h2 className="text-xl font-semibold">{step.title}</h2>
                </div>
              </div>
              <button onClick={() => void completeTutorial()} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Skip tutorial">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--secondary)" }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "var(--gold)" }} />
            </div>

            <TutorialVisual type={step.visualType} />
            <p className="mt-5 text-sm leading-6 text-muted-foreground">{step.description}</p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => void completeTutorial()} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                Skip tutorial
              </button>
              <div className="flex gap-2">
                <button disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40" style={{ borderColor: "var(--border)" }}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button onClick={() => (last ? void completeTutorial() : setStepIndex((current) => current + 1))} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}>
                  {last ? "Finish" : "Next"}
                  {last ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </MotionDiv>
        </AnimatePresence>
      </div>
    </div>
  );
}
