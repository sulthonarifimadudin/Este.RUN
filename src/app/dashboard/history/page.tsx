import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { runs } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';

export default function HistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Run History</CardTitle>
        <CardDescription>A complete log of all your running activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Avg. Pace</TableHead>
              <TableHead className="text-right">Route</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium">
                  {new Date(run.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell>{run.distance.toFixed(2)} km</TableCell>
                <TableCell>
                  {Math.floor(run.time / 60)}m {run.time % 60}s
                </TableCell>
                <TableCell>{run.avgPace} /km</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Map className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Route for {new Date(run.date).toLocaleDateString()}</DialogTitle>
                        <DialogDescription>
                          A map of your run on this day.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <Image
                          src={run.routeImageUrl}
                          alt="Route map"
                          width={400}
                          height={300}
                          className="w-full rounded-md object-cover"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
