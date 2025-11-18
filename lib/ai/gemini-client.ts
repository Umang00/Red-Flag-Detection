/**
 * Gemini Client Wrapper for Red Flag Analysis
 * Uses AI SDK v5 with Google Gemini 2.0 Flash
 */

import { generateText, streamText } from "ai";
import { AI_CONFIG } from "./config";
import { myProvider } from "./providers";
import type { RedFlagCategory } from "./red-flag-prompts";
import { getRedFlagPrompt } from "./red-flag-prompts";
import { AnalysisError, type AnalysisResult, ErrorType } from "./types";

// Regex patterns for parsing JSON responses (defined at module level for performance)
const ANALYSIS_JSON_BLOCK_PATTERN = /```json\s*\n?([\s\S]*?)\n?```/;
const ANALYSIS_JSON_OBJECT_PATTERN = /\{[\s\S]*"redFlagScore"[\s\S]*\}/;

/**
 * Parse JSON from Gemini response
 * Handles various formats: code blocks, raw JSON, mixed content
 */
function parseAnalysisJSON(content: string): AnalysisResult {
  try {
    // Try to extract JSON from code blocks first
    const jsonBlockMatch = content.match(ANALYSIS_JSON_BLOCK_PATTERN);
    if (jsonBlockMatch) {
      const parsed = JSON.parse(jsonBlockMatch[1]);
      return parsed as AnalysisResult;
    }

    // Try to find JSON object in the text
    const jsonMatch = content.match(ANALYSIS_JSON_OBJECT_PATTERN);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as AnalysisResult;
    }

    // Try parsing the whole content
    const parsed = JSON.parse(content);
    return parsed as AnalysisResult;
  } catch (error) {
    throw new AnalysisError(
      "Failed to parse analysis JSON from Gemini response",
      ErrorType.PARSING,
      error as Error
    );
  }
}

/**
 * Validate analysis result has required fields
 */
function validateAnalysisResult(result: AnalysisResult): void {
  if (typeof result.redFlagScore !== "number") {
    throw new AnalysisError(
      "Invalid analysis result: missing redFlagScore",
      ErrorType.PARSING
    );
  }
  if (typeof result.verdict !== "string") {
    throw new AnalysisError(
      "Invalid analysis result: missing verdict",
      ErrorType.PARSING
    );
  }
  if (!Array.isArray(result.criticalFlags)) {
    throw new AnalysisError(
      "Invalid analysis result: missing criticalFlags array",
      ErrorType.PARSING
    );
  }
}

/**
 * Analyze content with Gemini and return structured result
 */
export async function analyzeWithGemini(
  category: RedFlagCategory,
  userMessage: string,
  imageUrls: string[] = []
): Promise<AnalysisResult> {
  try {
    const systemPrompt = getRedFlagPrompt(category);

    // For now, use text-only content (multi-modal will be added in next phase)
    // Note: If imageUrls provided, mention them in the message
    let contentText = userMessage;
    if (imageUrls.length > 0) {
      contentText += `\n\n[Note: ${imageUrls.length} image(s) were uploaded for analysis]`;
    }

    // Call Gemini via AI SDK v5
    const { text } = await generateText({
      model: myProvider.languageModel("chat-model"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: contentText,
        },
      ],
      temperature: AI_CONFIG.temperature.analysis,
      // Note: maxTokens not supported in AI SDK v5 generateText
      // Gemini 2.0 Flash has 8K output token limit by default
    });

    // Parse and validate JSON response
    const analysisResult = parseAnalysisJSON(text);
    validateAnalysisResult(analysisResult);

    return analysisResult;
  } catch (error) {
    // Classify error type for retry logic
    if (error instanceof AnalysisError) {
      throw error;
    }

    // Check for rate limit errors
    const errorMessage = (error as Error).message?.toLowerCase() || "";
    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("429")
    ) {
      throw new AnalysisError(
        "Gemini API rate limit exceeded",
        ErrorType.TRANSIENT,
        error as Error
      );
    }

    // Check for timeout errors
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("timed out")
    ) {
      throw new AnalysisError(
        "Gemini API request timed out",
        ErrorType.TRANSIENT,
        error as Error
      );
    }

    // Check for server errors (5xx)
    if (errorMessage.includes("500") || errorMessage.includes("503")) {
      throw new AnalysisError(
        "Gemini API server error",
        ErrorType.TRANSIENT,
        error as Error
      );
    }

    // Check for invalid input errors (4xx)
    if (
      errorMessage.includes("400") ||
      errorMessage.includes("invalid") ||
      errorMessage.includes("bad request")
    ) {
      throw new AnalysisError(
        "Invalid input to Gemini API",
        ErrorType.PERMANENT,
        error as Error
      );
    }

    // Unknown error - treat as transient to allow retry
    throw new AnalysisError(
      `Gemini API error: ${errorMessage}`,
      ErrorType.TRANSIENT,
      error as Error
    );
  }
}

/**
 * Streaming version of analysis (for real-time UI updates)
 * Returns both JSON analysis and natural language explanation
 */
export function analyzeWithGeminiStream(
  category: RedFlagCategory,
  userMessage: string,
  imageUrls: string[] = []
) {
  try {
    const systemPrompt = getRedFlagPrompt(category);

    // For now, use text-only content (multi-modal will be added in next phase)
    let contentText = userMessage;
    if (imageUrls.length > 0) {
      contentText += `\n\n[Note: ${imageUrls.length} image(s) were uploaded for analysis]`;
    }

    // Stream response from Gemini
    const result = streamText({
      model: myProvider.languageModel("chat-model"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: contentText,
        },
      ],
      temperature: AI_CONFIG.temperature.analysis,
      // Note: maxTokens not supported in AI SDK v5 streamText
    });

    return result;
  } catch (error) {
    // Same error handling as non-streaming version
    if (error instanceof AnalysisError) {
      throw error;
    }

    const errorMessage = (error as Error).message?.toLowerCase() || "";
    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("429")
    ) {
      throw new AnalysisError(
        "Gemini API rate limit exceeded",
        ErrorType.TRANSIENT,
        error as Error
      );
    }

    throw new AnalysisError(
      `Gemini API error: ${errorMessage}`,
      ErrorType.TRANSIENT,
      error as Error
    );
  }
}

/**
 * Retry wrapper with exponential backoff
 * Only retries transient errors (rate limits, timeouts, 5xx)
 */
export async function analyzeWithRetry(
  category: RedFlagCategory,
  userMessage: string,
  imageUrls: string[] = [],
  maxRetries = AI_CONFIG.retry.maxAttempts
): Promise<AnalysisResult> {
  const delays = AI_CONFIG.retry.delays;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await analyzeWithGemini(category, userMessage, imageUrls);
    } catch (error) {
      if (error instanceof AnalysisError) {
        // Don't retry permanent errors
        if (error.type === ErrorType.PERMANENT) {
          console.error(
            "[Gemini] Permanent error, not retrying:",
            error.message
          );
          throw error;
        }

        // Don't retry parsing errors
        if (error.type === ErrorType.PARSING) {
          console.error("[Gemini] Parsing error, not retrying:", error.message);
          throw error;
        }

        // Retry transient errors
        if (attempt < maxRetries - 1) {
          const delay = delays[attempt];
          console.warn(
            `[Gemini] Transient error (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms:`,
            error.message
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // Final attempt failed
      console.error(
        "[Gemini] All retry attempts exhausted:",
        (error as Error).message
      );
      throw new AnalysisError(
        "AI temporarily unavailable. Please try again later.",
        ErrorType.TRANSIENT,
        error as Error
      );
    }
  }

  // Should never reach here, but TypeScript requires it
  throw new AnalysisError(
    "AI temporarily unavailable. Please try again later.",
    ErrorType.TRANSIENT
  );
}
