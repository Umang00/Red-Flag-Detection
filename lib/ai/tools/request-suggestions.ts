import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";

type RequestSuggestionsProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: "Request suggestions (not implemented)",
    inputSchema: z.object({
      documentId: z.string().describe("The ID of the document"),
    }),
    execute: async () => {
      return {
        error: "Suggestions feature is not available",
      };
    },
  });
