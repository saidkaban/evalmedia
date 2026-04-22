import type { ModelInfo } from "@/providers/types";

/**
 * Curated set of image generation models available on fal.
 *
 * fal does not expose a public listing endpoint, so we hardcode a curated set.
 * Users running their own instance can edit this file to add or remove models.
 * Endpoint IDs are from https://fal.ai/models — verify there for new additions.
 */
export const FAL_IMAGE_MODELS: ModelInfo[] = [
  {
    id: "fal-ai/nano-banana-2",
    name: "Nano Banana 2",
    description: "Google's fast image model. Good default for speed.",
    mediaType: "image",
    providerId: "fal",
    tags: ["fast", "google"],
  },
  {
    id: "fal-ai/nano-banana-pro",
    name: "Nano Banana Pro",
    description: "Higher-fidelity variant of Nano Banana.",
    mediaType: "image",
    providerId: "fal",
    tags: ["google", "high-quality"],
  },
  {
    id: "fal-ai/nano-banana",
    name: "Nano Banana",
    description: "Original Nano Banana image model.",
    mediaType: "image",
    providerId: "fal",
    tags: ["google"],
  },
  {
    id: "fal-ai/flux/schnell",
    name: "FLUX Schnell",
    description: "Very fast FLUX variant, 1 to 4 steps.",
    mediaType: "image",
    providerId: "fal",
    tags: ["fast", "flux"],
  },
  {
    id: "fal-ai/flux/dev",
    name: "FLUX Dev",
    description: "Balanced FLUX model, good default for quality.",
    mediaType: "image",
    providerId: "fal",
    tags: ["flux"],
  },
  {
    id: "fal-ai/flux-pro/v1.1",
    name: "FLUX Pro 1.1",
    description: "Pro-tier FLUX with higher fidelity.",
    mediaType: "image",
    providerId: "fal",
    tags: ["flux", "high-quality"],
  },
  {
    id: "fal-ai/flux-2-pro",
    name: "FLUX 2 Pro",
    description: "Next-gen FLUX pro model.",
    mediaType: "image",
    providerId: "fal",
    tags: ["flux", "high-quality"],
  },
  {
    id: "openai/gpt-image-2",
    name: "GPT Image 2",
    description: "OpenAI's image generation model via fal.",
    mediaType: "image",
    providerId: "fal",
    tags: ["openai"],
  },
  {
    id: "fal-ai/recraft/v4/pro/text-to-image",
    name: "Recraft v4 Pro",
    description: "Design-focused generation with strong text rendering.",
    mediaType: "image",
    providerId: "fal",
    tags: ["design", "text-rendering"],
  },
];
