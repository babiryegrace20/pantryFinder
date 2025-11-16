import OpenAI from "openai";
import type { Donor, InventoryItem } from "@shared/schema";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export async function generateDonorNotification(
  pantryName: string,
  lowStockItems: InventoryItem[],
  donor: Donor,
  demandStats?: { category: string; requestCount: number }[]
): Promise<string> {
  const itemsList = lowStockItems
    .map(item => `- ${item.name} (${item.category}): ${item.quantity} ${item.unit} remaining`)
    .join("\n");

  const demandInfo = demandStats && demandStats.length > 0
    ? `\n\nRecent demand statistics:\n${demandStats.map(stat => `- ${stat.category}: ${stat.requestCount} requests`).join("\n")}`
    : "";

  const preferredCategories = donor.preferredCategories && donor.preferredCategories.length > 0
    ? `\n\nNote: This donor has previously donated ${donor.preferredCategories.join(", ")}.`
    : "";

  const prompt = `Generate a warm, personalized email notification to a food pantry donor about low inventory items.

Pantry: ${pantryName}
Donor: ${donor.name}${donor.organization ? ` (${donor.organization})` : ""}

Low inventory items:
${itemsList}${demandInfo}${preferredCategories}

Write a brief, compassionate email that:
1. Thanks them for their past support
2. Mentions specific items running low that match their interests
3. Provides context about recent demand
4. Keeps a respectful, dignity-first tone
5. Is concise (3-4 paragraphs max)

Return ONLY the email body text, no subject line.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 8192,
  });

  return response.choices[0]?.message?.content || "";
}
