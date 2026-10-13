/**
 * Product feature flags. Flip a flag to ship a feature; code stays in place.
 * - aiAssistant: project chat (needs OPENAI_API_KEY when enabled).
 */
export const features = {
  aiAssistant: false,
} as const;
