"use client";

import * as React from "react";
import { Legend as RechartsLegend, Tooltip as RechartsTooltip } from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("Chart components must render inside ChartContainer.");
  }

  return context;
}

function chartVariableStyle(config: ChartConfig) {
  const style: Record<string, string> = {};

  for (const [key, item] of Object.entries(config)) {
    if (!item.color) {
      continue;
    }

    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "");
    style[`--color-${safeKey}`] = item.color;
  }

  return style as React.CSSProperties;
}

export type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactElement;
};

export function ChartContainer({
  id,
  className,
  children,
  config,
  style,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        style={{ ...chartVariableStyle(config), ...style }}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/40 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid-angle-line]:stroke-border/35 [&_.recharts-polar-grid-concentric-circle]:stroke-border/35 [&_.recharts-polar-grid-concentric-polygon]:stroke-border/35 [&_.recharts-reference-line_line]:stroke-border [&_.recharts-legend-item-text]:text-foreground flex w-full min-w-0 justify-center overflow-hidden text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-transparent [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!w-full [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:!size-full",
          className,
        )}
        {...props}
      >
        {React.cloneElement(children, {
          responsive: true,
        } as Partial<typeof children.props>)}
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsTooltip;

function getPayloadConfig(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return config[key];
  }

  const record = payload as Record<string, unknown>;
  const nested =
    typeof record.payload === "object" && record.payload !== null
      ? (record.payload as Record<string, unknown>)
      : undefined;

  const value = record[key] ?? nested?.[key] ?? key;
  return config[String(value)] ?? config[key];
}

export type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    dataKey?: string | number;
    color?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  labelFormatter?: (
    label: string | number,
    payload: ChartTooltipContentProps["payload"],
  ) => React.ReactNode;
  formatter?: (
    value: number | string,
    name: string,
    item: NonNullable<ChartTooltipContentProps["payload"]>[number],
    index: number,
    payload: NonNullable<ChartTooltipContentProps["payload"]>,
  ) => React.ReactNode;
};

const RECHARTS_CONTENT_PROP_KEYS = new Set([
  "accessibilityLayer",
  "active",
  "activeIndex",
  "align",
  "allowEscapeViewBox",
  "animationDuration",
  "animationEasing",
  "axisId",
  "chartHeight",
  "chartWidth",
  "content",
  "contentStyle",
  "coordinate",
  "cursor",
  "defaultIndex",
  "filterNull",
  "formatter",
  "height",
  "hideIcon",
  "hideIndicator",
  "hideLabel",
  "iconSize",
  "iconType",
  "includeHidden",
  "inactiveColor",
  "indicator",
  "isAnimationActive",
  "itemSorter",
  "itemStyle",
  "label",
  "labelFormatter",
  "labelKey",
  "labelStyle",
  "layout",
  "margin",
  "nameKey",
  "offset",
  "payload",
  "payloadUniqBy",
  "portal",
  "position",
  "reverseDirection",
  "separator",
  "shared",
  "trigger",
  "useTranslate3d",
  "verticalAlign",
  "viewBox",
  "width",
  "wrapperStyle",
]);

function omitRechartsContentProps<T extends Record<string, unknown>>(
  props: T,
): Omit<T, never> {
  const next: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (RECHARTS_CONTENT_PROP_KEYS.has(key)) {
      continue;
    }

    next[key] = value;
  }

  return next as Omit<T, never>;
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelKey,
  nameKey,
  formatter,
  ...props
}: ChartTooltipContentProps) {
  const { config } = useChart();
  const domProps = omitRechartsContentProps(
    props as Record<string, unknown>,
  ) as React.ComponentProps<"div">;

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";
  const resolvedLabel = (() => {
    if (hideLabel || label === undefined) {
      return null;
    }

    if (labelFormatter) {
      return labelFormatter(label, payload);
    }

    if (labelKey) {
      const item = getPayloadConfig(config, payload[0], labelKey);
      return item?.label ?? label;
    }

    return label;
  })();

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
      {...domProps}
    >
      {!nestLabel && resolvedLabel !== null ? (
        <div className="font-medium">{resolvedLabel}</div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = String(nameKey ? item.payload?.[nameKey] : item.name);
          const itemConfig = getPayloadConfig(config, item, key);
          const indicatorColor =
            item.color ??
            (itemConfig?.color
              ? `var(--color-${key.replace(/[^a-zA-Z0-9_-]/g, "")})`
              : undefined);

          return (
            <div
              key={`${key}-${index}`}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter && item.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, payload)
              ) : (
                <>
                  {!hideIndicator ? (
                    <div
                      className={cn("shrink-0 rounded-[2px]", {
                        "size-2.5": indicator === "dot",
                        "h-2.5 w-1": indicator === "line",
                        "h-0 w-0 border-[1.5px] border-dashed bg-transparent":
                          indicator === "dashed",
                        "my-0.5": nestLabel && indicator === "dashed",
                      })}
                      style={
                        indicatorColor
                          ? {
                              backgroundColor:
                                indicator === "dashed"
                                  ? undefined
                                  : indicatorColor,
                              borderColor: indicatorColor,
                            }
                          : undefined
                      }
                    />
                  ) : null}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel && resolvedLabel !== null ? (
                        <div className="font-medium">{resolvedLabel}</div>
                      ) : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label ?? item.name}
                      </span>
                    </div>
                    {item.value !== undefined ? (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ChartLegend = RechartsLegend;

export type ChartLegendContentProps = React.ComponentProps<"div"> & {
  payload?: Array<{
    value?: string;
    dataKey?: string | number;
    color?: string;
    payload?: Record<string, unknown>;
  }>;
  verticalAlign?: "top" | "bottom";
  hideIcon?: boolean;
  nameKey?: string;
};

export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  ...props
}: ChartLegendContentProps) {
  const { config } = useChart();
  const domProps = omitRechartsContentProps(
    props as Record<string, unknown>,
  ) as React.ComponentProps<"div">;

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
      {...domProps}
    >
      {payload.map((item) => {
        const key = String(
          nameKey
            ? (item.payload?.[nameKey] ?? item.dataKey ?? item.value)
            : (item.value ?? item.dataKey),
        );
        const itemConfig = getPayloadConfig(config, item, key);

        return (
          <div
            key={key}
            className="[&>svg]:text-muted-foreground flex items-center gap-1.5"
          >
            {!hideIcon ? (
              <div
                className="size-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor:
                    item.color ??
                    (itemConfig?.color
                      ? `var(--color-${key.replace(/[^a-zA-Z0-9_-]/g, "")})`
                      : undefined),
                }}
              />
            ) : null}
            <span className="text-foreground">
              {itemConfig?.label ?? item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function chartColor(key: keyof ChartConfig | string, fallback: string) {
  const safeKey = String(key).replace(/[^a-zA-Z0-9_-]/g, "");
  return `var(--color-${safeKey}, ${fallback})`;
}
