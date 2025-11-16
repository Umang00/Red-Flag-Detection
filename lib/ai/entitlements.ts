import type { ChatModel } from "./models";

export type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel["id"][];
};

// All authenticated users have the same entitlements
// No guest mode - authentication required for all features
export const userEntitlements: Entitlements = {
  maxMessagesPerDay: 100,
  availableChatModelIds: ["chat-model", "chat-model-reasoning"],
};
