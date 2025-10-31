'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Run } from '@/lib/data';

const chartConfig = {
  distance: {
    label: 'Distance (km)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

type RecentRunsChartProps = {
  data: Run[];
};

export function RecentRunsChart({ data }: RecentRunsChartProps) {
  const chartData = data
    .slice(0, 7)
    .reverse()
    .map((run) => ({
      date: new Date(run.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      distance: run.distance,
    }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="km" />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="distance" fill="var(--color-distance)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
