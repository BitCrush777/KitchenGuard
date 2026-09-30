"use client";

import React from "react";
import { NumberTicker } from "./NumberTicker";
import { cn } from "../../lib/utils";

interface AnimatedMetricProps {
  value: number;
  suffix?: string;
  className?: string;
  delay?: number;
}

export function AnimatedMetric({
  value,
  suffix = "",
  className,
  delay = 0.1,
}: AnimatedMetricProps) {
  return (
    <span className={cn("inline-flex items-baseline font-bold tracking-tight", className)}>
      <NumberTicker value={value} delay={delay} />
      {suffix && <span className="font-normal text-secondary ml-0.5">{suffix}</span>}
    </span>
  );
}
