import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart, Bot, Map, Zap } from 'lucide-react';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-runner');
const featureImages = {
  track: PlaceHolderImages.find((img) => img.id === 'feature-track'),
  history: PlaceHolderImages.find((img) => img.id === 'feature-history'),
  ai: PlaceHolderImages.find((img) => img.id === 'feature-ai'),
};

export default function Home() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: 'Live Run Tracking',
      description: 'Track your pace, distance, and time in real-time with our intuitive interface.',
      image: featureImages.track,
    },
    {
      icon: <BarChart className="h-8 w-8 text-accent" />,
      title: 'Historical Analysis',
      description: 'Dive deep into your past runs to see your progress and analyze performance trends.',
      image: featureImages.history,
    },
    {
      icon: <Bot className="h-8 w-8 text-accent" />,
      title: 'Personalized AI Tips',
      description: "Get AI-driven insights and personalized tips to crush your running goals.",
      image: featureImages.ai,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container relative">
          <div className="relative z-10 grid grid-cols-1 gap-8 py-20 md:grid-cols-2 lg:py-32">
            <div className="flex flex-col items-start justify-center">
              <h1 className="font-headline text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
                Your Personal Running Companion
              </h1>
              <p className="mt-4 max-w-lg text-lg text-muted-foreground">
                Track your runs, map your routes, and achieve your goals with AI-powered insights. RunMapper is here to elevate every step of your journey.
              </p>
              <div className="mt-8 flex gap-4">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={1200}
                  height={800}
                  className="rounded-xl shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                  priority
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted/50 py-20 lg:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Features Designed for Runners
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to stay motivated and run smarter.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col overflow-hidden text-center">
                  {feature.image && (
                    <Image
                      src={feature.image.imageUrl}
                      alt={feature.image.description}
                      width={400}
                      height={300}
                      className="h-48 w-full object-cover"
                      data-ai-hint={feature.image.imageHint}
                    />
                  )}
                  <CardHeader className="items-center">
                    {feature.icon}
                    <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <p className="text-sm text-muted-foreground">&copy; 2024 RunMapper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
