import { ScoreRing } from "@/components/ui/score-ring";

// Dev playground for UI primitives (protected route).
const TestPage = () => {
  return (
    <div className="flex flex-wrap gap-6 p-6">
      {[0, 25, 50, 75, 100].map((value) => (
        <ScoreRing
          key={value}
          value={value}
          max={100}
          fromColor="var(--muted-foreground)"
          toColor="var(--primary)"
          label={`${value}%`}
        />
      ))}
    </div>
  );
};

export default TestPage;
