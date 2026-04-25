export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-xl font-bold text-foreground">About</h1>
        <p className="text-sm text-muted-foreground mt-0.5">The maker behind PLA Pantry</p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <img src="/Vishrut-Headshot.jpg" alt="Vishrut Sathyanarayanan" className="aspect-[4/5] w-full object-cover" />
          <div className="p-5">
            <h2 className="text-lg font-semibold">Vishrut Sathyanarayanan</h2>
            <p className="mt-1 text-sm text-muted-foreground">Designer, founder, and builder of PLA Pantry.</p>
          </div>
        </section>

        <section className="rounded-2xl border p-6 sm:p-8" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mb-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "oklch(0.78 0.16 85 / 0.12)", color: "var(--gold)" }}>
            PLA Pantry Founder
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Built for makers who want their workshop to feel organized.</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Vishrut Sathyanarayanan is a student at J.R. Tucker High School and the founder/CEO of Harbor Bespokes.
              His work sits at the intersection of 3D printing, robotics, engineering, entrepreneurship, and practical product design.
            </p>
            <p>
              PLA Pantry grew from a simple workshop problem: filament inventory gets messy fast. Spools move between printers,
              weights change, materials age, and the details that matter are easy to lose. The app is designed to make those
              details visible without slowing makers down.
            </p>
            <p>
              The goal is a calm, reliable inventory system for people building real things: a place to track materials, log
              prints, understand stock, and keep the next project moving.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
