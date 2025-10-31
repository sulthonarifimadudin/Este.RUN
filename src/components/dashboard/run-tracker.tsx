'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Square, Pause } from 'lucide-react';

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function RunTracker() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0); // in km

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
        // Simulate distance increase, assuming a pace of ~5:30 min/km
        setDistance((d) => d + 1 / 330);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    if (!isActive) {
        setTime(0);
        setDistance(0);
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(true);
    // In a real app, you would save the run data here
  };

  const pace = distance > 0 ? time / distance : 0;
  const paceMinutes = Math.floor(pace / 60);
  const paceSeconds = Math.floor(pace % 60);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card className="lg:col-span-1 xl:col-span-1">
        <CardHeader>
          <CardTitle>Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-4xl font-bold tracking-tighter">
            {formatTime(time)}
          </p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1 xl:col-span-1">
        <CardHeader>
          <CardTitle>Distance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-4xl font-bold tracking-tighter">
            {distance.toFixed(2)} <span className="text-xl font-normal">km</span>
          </p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1 xl:col-span-1">
        <CardHeader>
          <CardTitle>Pace</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-4xl font-bold tracking-tighter">
            {paceMinutes}:{paceSeconds.toString().padStart(2, '0')}
            <span className="text-xl font-normal"> /km</span>
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 rounded-lg border bg-card p-6 md:col-span-2 lg:col-span-3 xl:col-span-1">
        {!isActive ? (
          <Button
            size="lg"
            onClick={handleStart}
            className="h-24 w-24 rounded-full"
            variant="default"
          >
            <Play className="h-10 w-10 fill-current" />
            <span className="sr-only">Start Run</span>
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={handlePauseResume}
              className="h-24 w-24 rounded-full"
            >
              {isPaused ? <Play className="h-10 w-10 fill-current" /> : <Pause className="h-10 w-10 fill-current" />}
              <span className="sr-only">{isPaused ? "Resume Run" : "Pause Run"}</span>
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStop}
              className="h-24 w-24 rounded-full"
            >
              <Square className="h-10 w-10 fill-current" />
              <span className="sr-only">Stop Run</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
