"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type BurndownPoint = {
  day: string;
  remaining: number;
  ideal: number | null;
};
export type Breakdown = {
  name: string;
  todo: number;
  inProgress: number;
  done: number;
};

const burndownConfig = {
  remaining: { label: "Remaining", color: "var(--chart-1)" },
  ideal: { label: "Ideal", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const stackConfig = {
  todo: { label: "To do", color: "var(--chart-2)" },
  inProgress: { label: "In progress", color: "var(--chart-4)" },
  done: { label: "Done", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function BurndownChart({ data }: { data: BurndownPoint[] }) {
  return (
    <ChartContainer config={burndownConfig} className="h-64">
      <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="remaining"
          type="stepAfter"
          stroke="var(--color-remaining)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="ideal"
          stroke="var(--color-ideal)"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}

export function BreakdownChart({
  data,
  height = 220,
}: {
  data: Breakdown[];
  height?: number;
}) {
  return (
    <ChartContainer config={stackConfig} style={{ height }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={96}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="todo"
          stackId="a"
          fill="var(--color-todo)"
          isAnimationActive={false}
        />
        <Bar
          dataKey="inProgress"
          stackId="a"
          fill="var(--color-inProgress)"
          isAnimationActive={false}
        />
        <Bar
          isAnimationActive={false}
          dataKey="done"
          stackId="a"
          fill="var(--color-done)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
