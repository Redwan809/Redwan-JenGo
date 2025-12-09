'use server';
/**
 * @fileOverview Generates AI chat responses based on user input.
 *
 * - generateAIChatResponse - A function that generates AI responses.
 * - GenerateAIChatResponseInput - The input type for the generateAIChatResponse function.
 * - GenerateAIChatResponseOutput - The return type for the generateAIChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAIChatResponseInputSchema = z.object({
  message: z.string().describe('The user message to respond to.'),
});
export type GenerateAIChatResponseInput = z.infer<typeof GenerateAIChatResponseInputSchema>;

const GenerateAIChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI response to the user message.'),
});
export type GenerateAIChatResponseOutput = z.infer<typeof GenerateAIChatResponseOutputSchema>;

export async function generateAIChatResponse(input: GenerateAIChatResponseInput): Promise<GenerateAIChatResponseOutput> {
  return generateAIChatResponseFlow(input);
}

const generateAIChatResponsePrompt = ai.definePrompt({
  name: 'generateAIChatResponsePrompt',
  input: {schema: GenerateAIChatResponseInputSchema},
  output: {schema: GenerateAIChatResponseOutputSchema},
  prompt: `You are a helpful AI assistant. Respond to the following user message:

{{message}}`,
});

const generateAIChatResponseFlow = ai.defineFlow(
  {
    name: 'generateAIChatResponseFlow',
    inputSchema: GenerateAIChatResponseInputSchema,
    outputSchema: GenerateAIChatResponseOutputSchema,
  },
  async input => {
    const {output} = await generateAIChatResponsePrompt(input);
    return output!;
  }
);
