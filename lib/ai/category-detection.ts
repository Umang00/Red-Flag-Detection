/**
 * Automatic Category Detection for Red Flag Analysis
 * Uses Gemini to classify user content into the appropriate category
 */

import { generateText } from "ai";
import { AI_CONFIG } from "./config";
import { myProvider } from "./providers";
import type { RedFlagCategory } from "./red-flag-prompts";
import { categoryInfo } from "./red-flag-prompts";
import type { CategoryDetectionResult } from "./types";

const DETECTION_PROMPT = `You are a category classifier for the Red Flag Detector app.

Your task is to analyze user content and determine which category it belongs to:

**Categories:**
- **dating**: Dating profiles (Tinder, Bumble, Hinge), romantic bios, dating app screenshots
- **conversations**: Message threads, text conversations, DMs, chat logs between people
- **jobs**: Job postings, job descriptions, job offers, employment ads
- **housing**: Rental listings, roommate ads, housing posts, lease agreements
- **marketplace**: Product listings, sale ads (Facebook Marketplace, Craigslist, OfferUp)
- **general**: Unclear or doesn't fit other categories

**Instructions:**
1. Analyze the content and images (if provided)
2. Determine the most likely category
3. Assign a confidence score (0.0-1.0)
4. Provide brief reasoning

**Output Format (JSON only):**
{
  "category": "dating",
  "confidence": 0.95,
  "reasoning": "Profile contains dating app UI elements and romantic bio text"
}

**Examples:**

Input: "26M, love hiking and dogs. Swipe right if you want adventure!"
Output: {"category": "dating", "confidence": 0.98, "reasoning": "Age/gender format and 'swipe right' indicate dating profile"}

Input: "Looking for a rockstar ninja developer to join our family! 60hr weeks, equity only!"
Output: {"category": "jobs", "confidence": 0.95, "reasoning": "Job posting with problematic language and compensation"}

Input: "2BR apartment, $800/month, must wire first/last/deposit before viewing"
Output: {"category": "housing", "confidence": 0.97, "reasoning": "Rental listing with scam indicators"}

Input: "iPhone 15 Pro Max, brand new, $200! Must sell today! Cash only!"
Output: {"category": "marketplace", "confidence": 0.92, "reasoning": "Product listing with too-good-to-be-true pricing"}

Input: "Hey" "Wyd" "Nothing much" "Cool"
Output: {"category": "conversations", "confidence": 0.88, "reasoning": "Message exchange format"}

**Important:**
- If confidence < 0.7, use "general" category
- Base confidence on clarity of category indicators
- Consider both text content and image context (if images provided)

Now classify the following content:`;

/**
 * Detect category from user content
 */
export async function detectCategory(
  content: string,
  _imageUrls: string[] = []
): Promise<CategoryDetectionResult> {
  try {
    // For now, use text-only content (images can be added later with proper type)
    // _imageUrls parameter reserved for future multi-modal support
    const userMessage = content;

    // Call Gemini for classification
    const { text } = await generateText({
      model: myProvider.languageModel("chat-model"),
      system: DETECTION_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: AI_CONFIG.temperature.categoryDetection,
      // Note: maxTokens not supported in AI SDK v5
    });

    // Parse JSON response
    const result = parseDetectionResult(text);

    // Fallback to general if confidence too low
    if (result.confidence < AI_CONFIG.categoryDetection.confidenceThreshold) {
      return {
        category: AI_CONFIG.categoryDetection.fallbackCategory,
        confidence: result.confidence,
        reasoning: `Low confidence (${result.confidence.toFixed(2)}), using general category`,
      };
    }

    return result;
  } catch (error) {
    console.error("[Category Detection] Error:", (error as Error).message);

    // Fallback to general on error
    return {
      category: "general",
      confidence: 0.5,
      reasoning: "Error during detection, falling back to general category",
    };
  }
}

// Regex patterns for parsing JSON from AI responses (defined at module level)
const JSON_BLOCK_PATTERN = /```json\s*\n?([\s\S]*?)\n?```/;
const JSON_CATEGORY_PATTERN = /\{[\s\S]*"category"[\s\S]*\}/;

/**
 * Parse category detection JSON
 */
function parseDetectionResult(text: string): CategoryDetectionResult {
  try {
    // Try to extract JSON from code blocks
    const jsonBlockMatch = text.match(JSON_BLOCK_PATTERN);
    if (jsonBlockMatch) {
      const parsed = JSON.parse(jsonBlockMatch[1]);
      return validateDetectionResult(parsed);
    }

    // Try to find JSON object
    const jsonMatch = text.match(JSON_CATEGORY_PATTERN);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return validateDetectionResult(parsed);
    }

    // Try parsing whole text
    const parsed = JSON.parse(text);
    return validateDetectionResult(parsed);
  } catch (error) {
    console.error(
      "[Category Detection] Parse error:",
      (error as Error).message
    );
    // Return general category on parse error
    return {
      category: "general",
      confidence: 0.5,
      reasoning: "Failed to parse detection result",
    };
  }
}

/**
 * Validate and sanitize detection result
 */
function validateDetectionResult(
  parsed: Record<string, unknown>
): CategoryDetectionResult {
  const validCategories: RedFlagCategory[] = [
    "dating",
    "conversations",
    "jobs",
    "housing",
    "marketplace",
    "general",
  ];

  const category = parsed.category as string;
  const confidence = Number(parsed.confidence);

  // Validate category
  if (!validCategories.includes(category as RedFlagCategory)) {
    return {
      category: "general",
      confidence: 0.5,
      reasoning: `Invalid category "${category}", falling back to general`,
    };
  }

  // Validate confidence
  if (Number.isNaN(confidence) || confidence < 0 || confidence > 1) {
    return {
      category: category as RedFlagCategory,
      confidence: 0.5,
      reasoning: parsed.reasoning as string,
    };
  }

  return {
    category: category as RedFlagCategory,
    confidence,
    reasoning: parsed.reasoning as string,
  };
}

/**
 * Get category display information
 */
export function getCategoryInfo(category: RedFlagCategory) {
  return categoryInfo[category];
}

// Regex patterns for quick category detection (defined at module level for performance)
const DATING_PATTERNS = [
  /\b(tinder|bumble|hinge|dating|swipe|match|profile|bio)\b/,
  /\b(looking for|seeking|age|height|ft|cm)\b/,
  /\b(relationship|hookup|fwb|nsa)\b/,
];

const JOB_PATTERNS = [
  /\b(job|hiring|position|role|salary|compensation|benefits)\b/,
  /\b(company|employer|team|office|remote|hybrid)\b/,
  /\b(apply|resume|cv|experience|skills)\b/,
];

const HOUSING_PATTERNS = [
  /\b(rent|lease|apartment|room|roommate|landlord)\b/,
  /\b(br|bedroom|bath|utilities|deposit|tenant)\b/,
  /\b(furnished|unfurnished|pets|smoking)\b/,
];

const MARKETPLACE_PATTERNS = [
  /\b(selling|sale|price|obo|firm|cash|paypal|venmo)\b/,
  /\b(brand new|like new|used|condition|shipping)\b/,
  /\b(iphone|ps5|xbox|laptop|tv|furniture)\b/,
];

const MESSAGE_GREETING_PATTERN = /^(hey|hi|hello|sup|yo)\b/i;

/**
 * Simple keyword-based category detection (fast fallback)
 * Use this as a quick check before calling Gemini
 */
export function quickDetectCategory(content: string): RedFlagCategory | null {
  const lower = content.toLowerCase();

  // Dating keywords
  if (DATING_PATTERNS.some((pattern) => pattern.test(lower))) {
    return "dating";
  }

  // Job keywords
  if (JOB_PATTERNS.some((pattern) => pattern.test(lower))) {
    return "jobs";
  }

  // Housing keywords
  if (HOUSING_PATTERNS.some((pattern) => pattern.test(lower))) {
    return "housing";
  }

  // Marketplace keywords
  if (MARKETPLACE_PATTERNS.some((pattern) => pattern.test(lower))) {
    return "marketplace";
  }

  // Conversation patterns (harder to detect with keywords)
  const lines = content.split("\n");
  if (
    lines.length > 3 &&
    lines.some((line) => MESSAGE_GREETING_PATTERN.test(line.trim()))
  ) {
    return "conversations";
  }

  // Couldn't determine
  return null;
}
