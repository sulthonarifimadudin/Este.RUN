'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getTipsAction, type State } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot, Loader2, Sparkles } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
         <Sparkles className="mr-2 h-4 w-4" />
          Get Tips
        </>
      )}
    </Button>
  );
}


export default function TipsPage() {
    const initialState = { message: null, tips: null, errors: {} };
    const [state, dispatch] = useFormState<State, FormData>(getTipsAction, initialState);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <form action={dispatch}>
          <CardHeader>
            <CardTitle>Personalized Running Tips</CardTitle>
            <CardDescription>
              Describe your running goals below. Our AI coach will analyze your
              historical data and provide personalized tips to help you improve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="goals">My Running Goals</Label>
              <Textarea
                id="goals"
                name="goals"
                placeholder="e.g., 'I want to run my first 10k in under an hour' or 'I want to improve my stamina for longer runs'."
                className="min-h-[120px]"
              />
               {state?.errors?.goals && (
                <p className="text-sm text-destructive">{state.errors.goals.join(', ')}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> AI Coach Response
          </CardTitle>
          <CardDescription>
            Your personalized tips will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
            {state?.tips ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border bg-muted p-4">
                    {state.tips}
                </div>
            ) : (
                <div className="flex h-full items-center justify-center rounded-md border border-dashed bg-muted/50 p-4">
                    <p className="text-center text-muted-foreground">
                        Submit your goals to get started.
                    </p>
                </div>
            )}
        </CardContent>
         {state?.message && !state.tips && (
            <CardFooter>
                <p className="text-sm text-destructive">{state.message}</p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
