import { Clock, Footprints, TrendingUp, Zap } from 'lucide-react';
import { runs, getSummaryStats } from '@/lib/data';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentRunsChart } from '@/components/dashboard/recent-runs-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const stats = getSummaryStats();
  const recentRuns = runs.slice(0, 5);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Distance"
          value={`${stats.totalDistance} km`}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Total distance covered all time"
        />
        <StatsCard
          title="Total Runs"
          value={stats.totalRuns.toString()}
          icon={<Footprints className="h-4 w-4" />}
          description="Total number of runs logged"
        />
        <StatsCard
          title="Overall Avg. Pace"
          value={`${stats.overallAvgPace} /km`}
          icon={<Zap className="h-4 w-4" />}
          description="Your average pace per kilometer"
        />
        <StatsCard
          title="Last Run"
          value={recentRuns[0].distance.toFixed(1) + ' km'}
          icon={<Clock className="h-4 w-4" />}
          description={`on ${new Date(recentRuns[0].date).toLocaleDateString()}`}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your running distance over the last 7 runs.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <RecentRunsChart data={runs} />
            </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
            <CardDescription>Your 5 most recent runs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Distance</TableHead>
                        <TableHead className="text-right">Pace</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentRuns.map((run) => (
                        <TableRow key={run.id}>
                            <TableCell>
                                <div className="font-medium">{new Date(run.date).toLocaleDateString('en-us', {month: 'short', day: 'numeric'})}</div>
                            </TableCell>
                            <TableCell className="text-right">{run.distance.toFixed(2)} km</TableCell>
                            <TableCell className="text-right">{run.avgPace}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <div className="mt-4 flex items-center justify-end">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/history">
                        View All Runs <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
