import { useOnboarding } from "@/contexts/OnboardingContext";
import { tutorialSteps } from "@/lib/tutorialSteps";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

const SPOTLIGHT_PAD = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toSpotlightRect(rect: DOMRect): SpotlightRect {
  const top = Math.max(8, rect.top - SPOTLIGHT_PAD);
  const left = Math.max(8, rect.left - SPOTLIGHT_PAD);
  const width = Math.min(window.innerWidth - left - 8, rect.width + SPOTLIGHT_PAD * 2);
  const height = Math.min(window.innerHeight - top - 8, rect.height + SPOTLIGHT_PAD * 2);
  return { top, left, width, height, right: left + width, bottom: top + height };
}

function getCardStyle(rect: SpotlightRect | null): React.CSSProperties {
  const width = Math.min(520, window.innerWidth - 32);
  const estimatedHeight = 430;
  if (!rect) {
    return {
      position: "fixed",
      left: "50%",
      top: "50%",
      width,
      transform: "translate(-50%, -50%)",
    };
  }

  const gap = 24;
  const margin = 16;
  const rightSpace = window.innerWidth - rect.right;
  const leftSpace = rect.left;
  const bottomSpace = window.innerHeight - rect.bottom;
  const top = clamp(rect.top + rect.height / 2 - estimatedHeight / 2, margin, window.innerHeight - estimatedHeight - margin);

  if (rightSpace >= width + gap + margin) {
    return { position: "fixed", width, left: rect.right + gap, top };
  }
  if (leftSpace >= width + gap + margin) {
    return { position: "fixed", width, left: rect.left - width - gap, top };
  }

  const centeredLeft = clamp(rect.left + rect.width / 2 - width / 2, margin, window.innerWidth - width - margin);
  if (bottomSpace >= estimatedHeight + gap + margin) {
    return { position: "fixed", width, left: centeredLeft, top: rect.bottom + gap };
  }
  return {
    position: "fixed",
    width,
    left: centeredLeft,
    top: clamp(rect.top - estimatedHeight - gap, margin, window.innerHeight - estimatedHeight - margin),
  };
}

function Spotlight({ rect }: { rect: SpotlightRect | null }) {
  if (!rect) {
    return <div className="absolute inset-0 bg-black/72 backdrop-blur-md" />;
  }

  const dimStyle = { background: "oklch(0 0 0 / 0.70)", backdropFilter: "blur(6px)" };
  return (
    <>
      <div className="fixed left-0 right-0 top-0" style={{ ...dimStyle, height: rect.top }} />
      <div className="fixed left-0" style={{ ...dimStyle, top: rect.top, width: rect.left, height: rect.height }} />
      <div className="fixed right-0" style={{ ...dimStyle, top: rect.top, left: rect.right, height: rect.height }} />
      <div className="fixed bottom-0 left-0 right-0" style={{ ...dimStyle, top: rect.bottom }} />
      <motion.div
        className="pointer-events-none fixed rounded-2xl border-2"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          borderColor: "var(--gold)",
          boxShadow: "0 0 0 1px oklch(0.78 0.16 85 / 0.24), 0 0 34px oklch(0.78 0.16 85 / 0.55)",
        }}
        animate={{ opacity: [0.72, 1, 0.72], scale: [1, 1.015, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function MiniFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="mb-3 flex gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--gold)" }} />
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span className="h-2 w-2 rounded-full bg-muted" />
      </div>
      {children}
    </div>
  );
}

function TutorialVisual({ type }: { type: string }) {
  if (type === "prints") {
    return (
      <MiniFrame>
        <div className="space-y-2">
          {["Keyboard bracket", "Cable clip", "Drawer spacer"].map((name, index) => (
            <div key={name} className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
              <span className="text-xs font-medium">{name}</span>
              <span className="text-xs" style={{ color: "var(--gold)" }}>-{18 + index * 12}g</span>
            </div>
          ))}
        </div>
      </MiniFrame>
    );
  }

  if (type === "collections") {
    return (
      <MiniFrame>
        <div className="grid grid-cols-2 gap-2">
          {["Brand", "Material", "Storage", "Color"].map((label, index) => (
            <div key={label} className="rounded-xl border p-3" style={{ background: index === 0 ? "oklch(0.78 0.16 85 / 0.14)" : "var(--secondary)", borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold">{label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{index + 2} groups</p>
            </div>
          ))}
        </div>
      </MiniFrame>
    );
  }

  if (type === "settings") {
    return (
      <MiniFrame>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-medium">Theme</span>
            <span className="h-5 w-10 rounded-full p-0.5" style={{ background: "var(--gold)" }}><span className="block h-4 w-4 rounded-full bg-white ml-auto" /></span>
          </div>
          <div className="rounded-xl border p-3 text-xs text-muted-foreground" style={{ borderColor: "var(--border)" }}>Replay Tutorial</div>
        </div>
      </MiniFrame>
    );
  }

  return (
    <MiniFrame>
      <div className="grid grid-cols-[88px_1fr] gap-3">
        <div className="flex aspect-square items-center justify-center rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
          <div className="relative h-16 w-16 rounded-full border-[10px]" style={{ borderColor: "var(--gold)" }}>
            <div className="absolute inset-4 rounded-full" style={{ background: "var(--card)" }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 rounded-full" style={{ background: "var(--gold)" }} />
          <div className="h-3 w-full rounded-full bg-muted" />
          <div className="h-3 w-4/5 rounded-full bg-muted" />
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 rounded-full" style={{ background: "var(--gold)" }} />
          </div>
        </div>
      </div>
    </MiniFrame>
  );
}

export default function OnboardingTutorial() {
  const { open, completeTutorial } = useOnboarding();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [location, navigate] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const step = tutorialSteps[stepIndex];
  const StepIcon = step.icon;
  const last = stepIndex === tutorialSteps.length - 1;
  const progress = Math.round(((stepIndex + 1) / tutorialSteps.length) * 100);

  useEffect(() => {
    if (open && step.route && location !== step.route) navigate(step.route);
  }, [location, navigate, open, step.route, stepIndex]);

  useEffect(() => {
    if (!open) return;
    let frame = 0;

    function updateRect() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!step.targetSelector) {
          setSpotlightRect(null);
          return;
        }
        const element = document.querySelector(step.targetSelector);
        if (!element) {
          setSpotlightRect(null);
          return;
        }
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          setSpotlightRect(null);
          return;
        }
        setSpotlightRect(toSpotlightRect(rect));
      });
    }

    updateRect();
    const timer = window.setTimeout(updateRect, 120);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [location, open, step.targetSelector, stepIndex]);

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
    if (!open) {
      setStepIndex(0);
      setDirection(1);
      setSpotlightRect(null);
    }
  }, [open]);

  const cardStyle = useMemo(() => getCardStyle(spotlightRect), [spotlightRect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <Spotlight rect={spotlightRect} />

      <div ref={cardRef} role="dialog" aria-modal="true" aria-label={step.title} className="z-[92]" style={cardStyle}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            initial={reduceMotion ? false : { opacity: 0, x: direction * 24, scale: 0.97 }}
            animate={reduceMotion ? {} : { opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? {} : { opacity: 0, x: direction * -18, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="rounded-3xl border p-5 shadow-2xl"
            style={{ background: "var(--auth-card-bg)", borderColor: "var(--auth-card-border)", boxShadow: "var(--auth-card-shadow)" }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: "oklch(0.78 0.16 85 / 0.16)", color: "var(--gold)" }}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {stepIndex + 1} of {tutorialSteps.length}</p>
                  <h2 className="text-xl font-semibold">{step.title}</h2>
                </div>
              </div>
              <button onClick={() => void completeTutorial()} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Skip tutorial">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--secondary)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gold)" }}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.28 }}
              />
            </div>

            <TutorialVisual type={step.visualType} />
            <p className="mt-5 text-sm leading-6 text-muted-foreground">{step.description}</p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => void completeTutorial()} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  disabled={stepIndex === 0}
                  onClick={() => {
                    setDirection(-1);
                    setStepIndex((current) => Math.max(0, current - 1));
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40"
                  style={{ borderColor: "var(--border)" }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    if (last) {
                      void completeTutorial();
                      return;
                    }
                    setDirection(1);
                    setStepIndex((current) => current + 1);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
                  style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}
                >
                  {last ? "Finish" : "Next"}
                  {last ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
