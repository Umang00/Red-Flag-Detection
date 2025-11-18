import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Initialize Google AI provider with custom API key from environment
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": google("gemini-2.5-flash"),
        "chat-model-reasoning": wrapLanguageModel({
          model: google("gemini-2.5-flash"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": google("gemini-2.5-flash"),
        "artifact-model": google("gemini-2.5-flash"),
      },
    });
