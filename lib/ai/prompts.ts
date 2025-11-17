import type { Geo } from "@vercel/functions";
import { getRedFlagPrompt, type RedFlagCategory } from "./red-flag-prompts";

export const regularPrompt =
  "You are a friendly assistant! Keep your responses concise and helpful.";

export type RequestHints = {
  latitude: Geo["latitude"];
  longitude: Geo["longitude"];
  city: Geo["city"];
  country: Geo["country"];
};

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const systemPrompt = ({
  requestHints,
  category,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
  category?: RedFlagCategory;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);

  // If category is provided, use Red Flag analysis prompt
  if (category && category !== "general") {
    const redFlagPrompt = getRedFlagPrompt(category);
    return `${redFlagPrompt}\n\n${requestPrompt}`;
  }

  // Default to general Red Flag analysis
  const redFlagPrompt = getRedFlagPrompt("general");
  return `${redFlagPrompt}\n\n${requestPrompt}`;
};

export const titlePrompt = `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`;
