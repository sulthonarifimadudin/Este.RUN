import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RunTracker } from '@/components/dashboard/run-tracker';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function TrackRunPage() {
    const mapImage = PlaceHolderImages.find((img) => img.id === 'map-route');

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">Track New Run</h1>
                <p className="text-muted-foreground">Start a new activity and watch your stats in real-time.</p>
            </div>
        </div>

        <RunTracker />

        <Card>
            <CardHeader>
                <CardTitle>Route Map</CardTitle>
                <CardDescription>Your running route will be displayed here live.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="aspect-[4/3] w-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {mapImage ? (
                        <Image 
                            src={mapImage.imageUrl} 
                            alt={mapImage.description}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover"
                            data-ai-hint={mapImage.imageHint}
                        />
                    ) : (
                        <p className="text-muted-foreground">Map will appear here</p>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
