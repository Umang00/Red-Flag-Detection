/**
 * AI Configuration for Red Flag Detector
 * Centralized configuration for model settings, prompts, and API parameters
 */

/**
 * Gemini Model Configuration
 */
export const AI_CONFIG = {
  /**
   * Model identifiers
   * Note: Gemini 2.5 Flash is not yet available in the public API as of Jan 2025.
   * Using Gemini 2.0 Flash (experimental) which is the latest stable version.
   * Update to "gemini-2.5-flash" or "models/gemini-2.5-flash" when available.
   */
  models: {
    // Main model for Red Flag analysis
    analysis: "gemini-2.5-flash",

    // Model for category detection (can use same or different)
    categoryDetection: "gemini-2.5-flash",

    // Reasoning model (for complex analysis, if needed)
    reasoning: "gemini-2.5-flash",
  },

  /**
   * Temperature settings
   * Lower = more consistent/deterministic
   * Higher = more creative/varied
   */
  temperature: {
    analysis: 0.7, // Balanced for analysis
    categoryDetection: 0.3, // Low for consistent classification
  },

  /**
   * Token limits
   * Note: Gemini 2.0 Flash supports up to 1M input tokens, 8K output tokens by default
   * Note: maxTokens parameter not supported in AI SDK v5 (uses model defaults)
   * Keeping this for documentation and future use if SDK adds support
   */
  maxTokens: {
    analysis: 2048, // Sufficient for detailed analysis (not currently enforced)
    categoryDetection: 256, // Short response needed (not currently enforced)
  },

  /**
   * Retry configuration
   */
  retry: {
    maxAttempts: 3,
    delays: [1000, 3000, 5000], // Exponential backoff in ms
  },

  /**
   * Category detection thresholds
   */
  categoryDetection: {
    confidenceThreshold: 0.7, // Minimum confidence to use detected category
    fallbackCategory: "general" as const,
  },

  /**
   * Rate limiting (enforced in API routes)
   */
  rateLimits: {
    dailyAnalyses: 2, // Free tier per user
    monthlyAnalyses: 10, // Free tier per user
    globalDailyLimit: 1400, // Buffer under Gemini's 1,500/day free tier
  },

  /**
   * Analysis response requirements
   */
  analysis: {
    minRedFlagScore: 0,
    maxRedFlagScore: 10,
    requiredFields: [
      "redFlagScore",
      "verdict",
      "criticalFlags",
      "warnings",
      "notices",
      "positives",
      "advice",
    ] as const,
  },
} as const;

/**
 * Helper to get model name for a specific use case
 */
export function getModelName(
  type: "analysis" | "categoryDetection" | "reasoning"
): string {
  return AI_CONFIG.models[type];
}

/**
 * Helper to get temperature for a specific use case
 */
export function getTemperature(type: "analysis" | "categoryDetection"): number {
  return AI_CONFIG.temperature[type];
}

/**
 * Helper to get max tokens for a specific use case
 */
export function getMaxTokens(type: "analysis" | "categoryDetection"): number {
  return AI_CONFIG.maxTokens[type];
}

/**
 * Type exports for type safety
 */
export type AIConfigType = typeof AI_CONFIG;
export type ModelType = keyof typeof AI_CONFIG.models;
