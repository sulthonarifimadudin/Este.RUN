'use server';

/**
 * @fileOverview A flow for generating personalized running tips based on user data and goals.
 *
 * - `getPersonalizedRunningTips` - A function that generates personalized running tips.
 * - `PersonalizedRunningTipsInput` - The input type for the `getPersonalizedRunningTips` function.
 * - `PersonalizedRunningTipsOutput` - The return type for the `getPersonalizedRunningTips` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRunningTipsInputSchema = z.object({
  historicalRunData: z
    .string()
    .describe('Historical running data of the user, including pace, distance, and time for each run.'),
  goals: z
    .string()
    .describe('User-specified running goals, such as improving pace or increasing distance.'),
});
export type PersonalizedRunningTipsInput = z.infer<typeof PersonalizedRunningTipsInputSchema>;

const PersonalizedRunningTipsOutputSchema = z.object({
  tips: z.string().describe('Personalized running tips based on historical data and goals.'),
});
export type PersonalizedRunningTipsOutput = z.infer<typeof PersonalizedRunningTipsOutputSchema>;

export async function getPersonalizedRunningTips(
  input: PersonalizedRunningTipsInput
): Promise<PersonalizedRunningTipsOutput> {
  return personalizedRunningTipsFlow(input);
}

const personalizedRunningTipsPrompt = ai.definePrompt({
  name: 'personalizedRunningTipsPrompt',
  input: {schema: PersonalizedRunningTipsInputSchema},
  output: {schema: PersonalizedRunningTipsOutputSchema},
  prompt: `You are a personal running coach. Provide personalized running tips to the user based on their historical running data and goals.

Historical Running Data: {{{historicalRunData}}}
Goals: {{{goals}}}

Tips:`,
});

const personalizedRunningTipsFlow = ai.defineFlow(
  {
    name: 'personalizedRunningTipsFlow',
    inputSchema: PersonalizedRunningTipsInputSchema,
    outputSchema: PersonalizedRunningTipsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRunningTipsPrompt(input);
    return output!;
  }
);
