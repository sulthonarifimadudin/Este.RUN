export type Run = {
  id: string;
  date: string;
  distance: number; // in km
  time: number; // in seconds
  avgPace: string; // formatted as min/km
  routeImageUrl: string;
};

const runsData: Omit<Run, 'avgPace'>[] = [
  { id: '1', date: '2024-07-20', distance: 5.2, time: 1680, routeImageUrl: 'https://picsum.photos/seed/map1/400/300' },
  { id: '2', date: '2024-07-18', distance: 10.0, time: 3600, routeImageUrl: 'https://picsum.photos/seed/map2/400/300' },
  { id: '3', date: '2024-07-16', distance: 3.5, time: 1140, routeImageUrl: 'https://picsum.photos/seed/map3/400/300' },
  { id: '4', date: '2024-07-14', distance: 7.8, time: 2574, routeImageUrl: 'https://picsum.photos/seed/map4/400/300' },
  { id: '5', date: '2024-07-12', distance: 5.0, time: 1560, routeImageUrl: 'https://picsum.photos/seed/map5/400/300' },
  { id: '6', date: '2024-07-10', distance: 12.1, time: 4477, routeImageUrl: 'https://picsum.photos/seed/map6/400/300' },
  { id: '7', date: '2024-07-08', distance: 4.2, time: 1302, routeImageUrl: 'https://picsum.photos/seed/map7/400/300' },
  { id: '8', date: '2024-07-06', distance: 8.5, time: 2975, routeImageUrl: 'https://picsum.photos/seed/map8/400/300' },
];

const formatPace = (time: number, distance: number): string => {
  if (distance === 0) return '0:00';
  const paceInSecondsPerKm = time / distance;
  const minutes = Math.floor(paceInSecondsPerKm / 60);
  const seconds = Math.floor(paceInSecondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const runs: Run[] = runsData.map(run => ({
  ...run,
  avgPace: formatPace(run.time, run.distance),
}));

export const getSummaryStats = () => {
  const totalDistance = runs.reduce((acc, run) => acc + run.distance, 0);
  const totalTime = runs.reduce((acc, run) => acc + run.time, 0);
  const totalRuns = runs.length;
  const overallAvgPace = formatPace(totalTime, totalDistance);

  return {
    totalDistance: totalDistance.toFixed(2),
    totalRuns,
    overallAvgPace,
  };
};

export const getHistoricalDataAsString = (): string => {
    return runs
      .map(run => `Date: ${run.date}, Distance: ${run.distance}km, Time: ${Math.floor(run.time / 60)}m ${run.time % 60}s, Pace: ${run.avgPace}/km`)
      .join('\n');
}
