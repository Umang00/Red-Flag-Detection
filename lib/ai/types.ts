/**
 * Red Flag Detector - TypeScript Types for AI Analysis
 */

import type { RedFlagCategory } from "./red-flag-prompts";

/**
 * Individual red flag item
 */
export type RedFlagItem = {
  category: string; // e.g., "Manipulation", "Communication Red Flag"
  evidence: string; // Exact quote or specific detail from content
  explanation: string; // Why this is concerning
  context?: string; // Optional additional context
};

/**
 * Complete analysis result from Gemini
 */
export type AnalysisResult = {
  redFlagScore: number; // 0-10 scale (0=no concerns, 10=major concerns)
  verdict: string; // Brief one-sentence verdict
  criticalFlags: RedFlagItem[]; // 🔴 Critical severity flags
  warnings: RedFlagItem[]; // 🟡 Medium severity flags
  notices: RedFlagItem[]; // 🟢 Minor concerns
  positives: RedFlagItem[]; // Good aspects (if any)
  advice: string; // Actionable recommendation
};

/**
 * Message format for Gemini API
 */
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string | MessageContent[];
};

/**
 * Multi-modal content (text + images)
 */
export type MessageContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

/**
 * Category detection result
 */
export type CategoryDetectionResult = {
  category: RedFlagCategory;
  confidence: number; // 0-1 scale
  reasoning?: string;
};

/**
 * Error types for retry logic
 */
export const ErrorType = {
  TRANSIENT: "transient" as const, // Retry (timeout, rate limit, 5xx)
  PERMANENT: "permanent" as const, // Don't retry (invalid input, 4xx)
  PARSING: "parsing" as const, // Failed to parse JSON response
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

/**
 * Analysis error
 */
export class AnalysisError extends Error {
  type: ErrorType;
  originalError?: Error;

  constructor(message: string, type: ErrorType, originalError?: Error) {
    super(message);
    this.name = "AnalysisError";
    this.type = type;
    this.originalError = originalError;
  }
}
