const steps = [
  {
    title: "Create a project",
    text: "Name it, add a description and links to your repo or live site.",
  },
  {
    title: "Invite your team",
    text: "Share by email, pick a role, and everyone sees the same board.",
  },
  {
    title: "Plan and ship",
    text: "Break work into tasks, drag them across the board and keep docs close.",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((step, i) => (
        <li key={step.title} className="bg-card relative rounded-xl border p-6">
          <span className="bg-primary text-primary-foreground mb-4 flex size-8 items-center justify-center rounded-full font-mono text-sm shadow-[0_0_16px_var(--logo-glow)]">
            {i + 1}
          </span>
          <h3 className="font-semibold tracking-tight">{step.title}</h3>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            {step.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
