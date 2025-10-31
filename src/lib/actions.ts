'use server';

import { getPersonalizedRunningTips } from '@/ai/flows/personalized-running-tips';
import { getHistoricalDataAsString } from '@/lib/data';
import { z } from 'zod';

const TipsSchema = z.object({
  goals: z.string().min(10, { message: "Please describe your goals in a bit more detail." }),
});

export type State = {
  message?: string | null;
  tips?: string | null;
  errors?: {
    goals?: string[];
  }
}

export async function getTipsAction(prevState: State | undefined, formData: FormData): Promise<State> {
  const validatedFields = TipsSchema.safeParse({
    goals: formData.get('goals'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to get tips. Please check your input.',
    }
  }

  const historicalRunData = getHistoricalDataAsString();

  try {
    const result = await getPersonalizedRunningTips({
      historicalRunData,
      goals: validatedFields.data.goals,
    });
    
    return { message: "Here are your personalized tips!", tips: result.tips };
  } catch (error) {
    console.error(error);
    return { message: "An unexpected error occurred. Please try again later." };
  }
}
